import { MongoClient } from 'mongodb';
import Papr, { Model, BaseSchema } from 'papr';

export type SchemaType = [BaseSchema, Partial<Record<string, unknown>>];

export interface PaprModel<T extends SchemaType = SchemaType> {
  name: string;
  schema: T;
}

export type PaprRepository<T extends PaprModel> = Model<T['schema'][0], object>;
export type PaprRepositoryResult<T extends PaprModel> = T['schema'][0];

type BasePaprOptions = {
  models: PaprModel[] | string;
  retries?: number;
  retryDelay?: number;
  papr?: Papr;
};

export type PaprOptions = (
  | {
      mongoClient: MongoClient;
    }
  | {
      connectionString: string;
    }
) &
  BasePaprOptions;

export type ImportedPaprModel = {
  default: PaprModel | undefined;
};
