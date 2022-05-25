import { types, schema } from 'papr';
import { createModel } from '../../../src';

const photoSchema = schema({
  name: types.string(),
  description: types.string(),
  views: types.number(),
});

export const Photo = createModel('photos', photoSchema);
export default Photo;
