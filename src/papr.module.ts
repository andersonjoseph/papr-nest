import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PaprOptions } from '.';
import { PaprCoreModule } from './PaprCore.module';
import { createRepositoryProvider } from './repository.provider';
import { PaprModel } from '.';

@Module({})
export class PaprModule {
  static forRoot(options: PaprOptions): DynamicModule {
    return {
      module: PaprModule,
      imports: [PaprCoreModule.forRoot(options)],
    };
  }

  static forFeature(models: PaprModel | PaprModel[]): DynamicModule {
    let providers: Provider<unknown>[];

    if (models instanceof Array)
      providers = models.map((schema) => createRepositoryProvider(schema));
    else providers = [createRepositoryProvider(models)];

    return {
      module: PaprModule,
      providers: providers,
      exports: providers,
    };
  }
}
