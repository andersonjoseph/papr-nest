import { MongoClient, ObjectId } from 'mongodb';
import Papr, { Model, BaseSchema } from 'papr';

export type SchemaType = [BaseSchema, Partial<Record<string, unknown>>];

type WithId<T> = {
  _id: ObjectId | string | number;
} & T;

export type PaprModel = {
  [key: string]: any;
};

export type PaprModelConstructable = PaprModel & { new (): any };

export type PaprRepository<T extends PaprModel> = Model<WithId<T>, object>;

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
