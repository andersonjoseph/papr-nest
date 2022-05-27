import { schema } from 'papr';
import { SCHEMA_KEY } from '../papr.constants';

type Constructor = new (...args: any[]) => any;
type ModelOptions = Parameters<typeof schema>[1];

export function Model(options?: ModelOptions) {
  return function (target: Constructor) {
    let schemaObject = Reflect.getMetadata(SCHEMA_KEY, target.prototype);
    schemaObject = schema(schemaObject, options);

    Reflect.defineMetadata(SCHEMA_KEY, schemaObject, target.prototype);

    return target;
  };
}
