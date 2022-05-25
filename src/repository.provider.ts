import { Provider } from '@nestjs/common';
import Papr from 'papr';
import { PaprModel } from '.';
import { getPaprRepositoryToken } from './common';
import { PAPR_CONNECTION } from './papr.constants';

export function createRepositoryProvider(model: PaprModel): Provider {
  return {
    provide: getPaprRepositoryToken(model),
    useFactory: (papr: Papr) => papr.models.get(model.name),
    inject: [PAPR_CONNECTION],
  };
}
