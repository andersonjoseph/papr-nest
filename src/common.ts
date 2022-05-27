import { PaprModel } from './types';
import { PAPR_REPOSITORY } from './papr.constants';

export const getPaprRepositoryToken = (paprModel: PaprModel): string =>
  `${PAPR_REPOSITORY}_${paprModel.name}`;
