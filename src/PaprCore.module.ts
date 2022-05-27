import {
  DynamicModule,
  Module,
  Provider,
  Inject,
  Global,
} from '@nestjs/common';
import { MongoClient, MongoError } from 'mongodb';
import Papr from 'papr';
import fg from 'fast-glob';
import * as path from 'path';
import { ImportedPaprModel, PaprOptions } from '.';
import { Logger } from '@nestjs/common';
import { PAPR_CONNECTION, PAPR_OPTIONS, SCHEMA_KEY } from './papr.constants';
import { PaprModel, PaprModelConstructable } from './types';

@Global()
@Module({})
export class PaprCoreModule {
  private readonly logger: Logger;
  private readonly retryDelay: number = 3000;
  private readonly retries: number;
  private currentTries = 0;
  private readonly mongoClient: MongoClient;
  private readonly papr: Papr;

  constructor(@Inject(PAPR_OPTIONS) private readonly options: PaprOptions) {
    this.logger = new Logger('PaprModule');
    this.retries = options.retries ?? 5;
    this.retries = options.retryDelay ?? 5;

    if ('mongoClient' in options) this.mongoClient = options.mongoClient;
    else this.mongoClient = new MongoClient(options.connectionString);

    this.papr = options.papr ?? new Papr();
  }

  private async mustRetry(err: unknown): Promise<boolean> {
    this.logger.error('Unable to connect to the database ' + err);

    if (err instanceof MongoError && this.currentTries++ < this.retries) {
      this.logger.warn(`retrying... ${this.currentTries}/${this.retries}`);

      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      return true;
    }
    return false;
  }

  private async loadPaprModelsFromFiles(): Promise<PaprModel[]> {
    const paprModelsGlob: string = this.options.models as string;

    const filenames = await fg(paprModelsGlob, { absolute: true });

    const importedPaprModels = await Promise.all(
      filenames.map<Promise<ImportedPaprModel>>((file) => {
        const relativePath = path.join('./..', path.relative('./src', file));

        const relativePathWithoutExt = relativePath.substring(
          0,
          relativePath.lastIndexOf('.'),
        );

        return import(relativePathWithoutExt);
      }),
    );

    const paprModels = importedPaprModels.map<PaprModel>(
      (importedPaprModel) => {
        if (!importedPaprModel.default) {
          throw Error('Model not exported as default');
        }
        return importedPaprModel.default;
      },
    );

    return paprModels;
  }

  private async loadPaprModels(): Promise<PaprModel[]> {
    return typeof this.options.models === 'string'
      ? await this.loadPaprModelsFromFiles()
      : this.options.models;
  }

  async createPaprConnection(): Promise<Papr> {
    let connection: MongoClient | undefined;
    try {
      connection = await this.mongoClient.connect();
    } catch (err) {
      const mustRetry = await this.mustRetry(err);

      if (mustRetry) await this.createPaprConnection();
      else throw err;
    }

    this.papr.initialize((connection as MongoClient).db());

    const paprModels =
      (await this.loadPaprModels()) as PaprModelConstructable[];
    if (paprModels.length === 0) {
      this.logger.warn('No models loaded');
      return this.papr;
    }

    paprModels.forEach((paprModel) => {
      new paprModel();

      const schema = Reflect.getMetadata(SCHEMA_KEY, paprModel.prototype);

      this.papr.model(paprModel.name, schema);
      this.logger.log(`Model ${paprModel.name} created`);
    });

    await this.papr.updateSchemas();

    this.logger.log('Papr connected succesfully');

    return this.papr;
  }

  static forRoot(options: PaprOptions): DynamicModule {
    const optionsProvider = {
      provide: PAPR_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider<Promise<Papr>> = {
      provide: PAPR_CONNECTION,
      useFactory: async () => {
        const handler = new PaprCoreModule(options);
        return await handler.createPaprConnection();
      },
    };

    return {
      module: PaprCoreModule,
      providers: [optionsProvider, connectionProvider],
      exports: [connectionProvider],
    };
  }
}
