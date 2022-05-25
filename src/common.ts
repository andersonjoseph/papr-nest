import { PaprModel, SchemaType } from './interfaces';
import { PAPR_REPOSITORY } from './papr.constants';

export function createModel<T extends SchemaType>(
  name: string,
  modelSchema: T,
): PaprModel<T> {
  return {
    name,
    schema: modelSchema,
  };
}

export const getPaprRepositoryToken = (paprModel: PaprModel): string =>
  `${PAPR_REPOSITORY}_${paprModel.name}`;
