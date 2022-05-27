import { types } from 'papr';
import { PaprModelConstructable } from '../types';
import { SCHEMA_KEY } from '../papr.constants';

type Types = keyof typeof types;
type SpecialTypes =
  | 'array'
  | 'number'
  | 'object'
  | 'objectGeneric'
  | 'string'
  | 'enum';
type GenericTypes = Exclude<keyof typeof types, SpecialTypes>;

type FieldOptions =
  | ({
      type?: GenericTypes;
    } & Parameters<typeof types[GenericTypes]>[0])
  | ({
      type: 'array';
      item: FieldOptions;
    } & Parameters<typeof types['array']>[1])
  | ({
      type: 'number';
    } & Parameters<typeof types['number']>[0])
  | ({
      type: 'object';
      object: PaprModelConstructable;
    } & Parameters<typeof types['object']>[1])
  | ({
      type: 'objectGeneric';
      value: FieldOptions;
      pattern?: Parameters<typeof types['objectGeneric']>[1];
    } & Parameters<typeof types['objectGeneric']>[2])
  | ({
      type: 'string';
    } & Parameters<typeof types['string']>[0])
  | ({
      type: 'enum';
      values: unknown[];
    } & Parameters<typeof types['enum']>[1]);

function getTypePropertyType(target: any, propertyKey: string) {
  const type = Reflect.getMetadata('design:type', target, propertyKey);
  return type.name.toLowerCase();
}

function getPaprType(options: FieldOptions) {
  switch (options.type) {
    case 'array':
      if (!options.item.type)
        throw new Error('Type of array items must be specified');

      const arrayType = getPaprType(options.item);
      return types[options.type](arrayType, { ...options });

    case 'object':
      const properties = Reflect.getMetadata(
        SCHEMA_KEY,
        options.object.prototype,
      );
      return types[options.type](properties, { ...options });

    case 'objectGeneric':
      const value = getPaprType(options.value);
      return types[options.type](value, options.pattern, {
        ...options,
        type: 'object',
      });

    case 'enum':
      return types[options.type](options.values, { ...options });

    case 'string':
      return types[options.type]({ ...options });

    case 'number':
      return types[options.type]({ ...options });

    case 'any':
      return types['any'](options);

    default:
      if (!options.type)
        throw new Error('Could not determine the type for the property');
      return types[options.type]({ ...options });
  }
}

export function Field(options: FieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const schema = Reflect.getMetadata(SCHEMA_KEY, target) ?? {};

    options.type =
      options?.type ?? (getTypePropertyType(target, propertyKey) as Types);

    //console.log(propertyKey, options.type);

    if (options.type === 'object' && !options.object) {
      throw new Error(
        'Could not determine the type for the property, defining it explicitly within the decorator could help',
      );
    }

    schema[propertyKey] = getPaprType(options);

    Reflect.defineMetadata(SCHEMA_KEY, schema, target);
  };
}
