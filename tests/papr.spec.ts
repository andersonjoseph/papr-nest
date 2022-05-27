import { Test } from '@nestjs/testing';
import { ObjectId, Binary, MongoClient } from 'mongodb';
import Papr, { VALIDATION_LEVEL, VALIDATION_ACTIONS } from 'papr';
import Photo from './src/photo/photo.model';
import { Field, Model, PaprModelConstructable, PaprModule } from '../src';
import { SCHEMA_KEY } from '../src/papr.constants';

enum TEST_ENUM {
  FOO = 'foo',
  BAR = 'bar',
}

function getSchema(target: PaprModelConstructable) {
  return Reflect.getMetadata(SCHEMA_KEY, target.prototype);
}

describe('PaprModule', () => {
  describe('.forRoot', () => {
    let mongoClient: MongoClient;
    let papr: Papr;

    let paprSpy: Record<string, unknown>;

    beforeEach(async () => {
      mongoClient = new MongoClient('mongodb://localhost:12345/test');
      jest.spyOn(mongoClient, 'connect').mockImplementation(() => {
        return {
          db: (): void => {
            return;
          },
        };
      });

      papr = new Papr();
      paprSpy = {
        updateSchemas: jest.spyOn(papr, 'updateSchemas').mockImplementation(),
        model: jest.spyOn(papr, 'model').mockImplementation(),
      };

      jest.clearAllMocks();
    });

    it('Should compile the module correctly', async () => {
      const paprModule = await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: [],

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprModule).toBeDefined();
    });

    it('Should not update mongo schemas when models is empty', async () => {
      await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: [],

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprSpy.model).not.toBeCalled();
      expect(paprSpy.updateSchemas).not.toBeCalled();
    });

    it('Should load mongo schemas provided via Array', async () => {
      await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: [Photo],

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprSpy.model).toBeCalledWith('Photo', getSchema(Photo));
      expect(paprSpy.updateSchemas).toBeCalled();
    });

    it('Should load mongo schemas provided via glob ', async () => {
      await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: 'tests/src/photo/photo.model.ts',

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprSpy.model).toBeCalledWith('Photo', getSchema(Photo));
      expect(paprSpy.updateSchemas).toBeCalled();
    });

    it('Should not update mongo schemas glob does not found any models', async () => {
      await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: 'tests/src/photo/user.model.ts',

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprSpy.model).not.toBeCalled();
      expect(paprSpy.updateSchemas).not.toBeCalled();
    });
  });

  describe('Papr Schema', () => {
    test('simple', () => {
      @Model()
      class C {
        @Field({ required: true })
        bar: number;

        @Field()
        foo: boolean;
      }

      const value = getSchema(C);

      expect(value).toEqual({
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            bsonType: 'objectId',
          },
          bar: {
            type: 'number',
          },
          foo: {
            type: 'boolean',
          },
        },
        required: ['_id', 'bar'],
        type: 'object',
      });
    });

    test('with defaults', () => {
      @Model({ defaults: { foo: true } })
      class C {
        @Field({ required: true })
        bar: number;

        @Field()
        foo: boolean;
      }
      const value = getSchema(C);

      expect(value).toEqual({
        $defaults: { foo: true },
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            bsonType: 'objectId',
          },
          bar: {
            type: 'number',
          },
          foo: {
            type: 'boolean',
          },
        },
        required: ['_id', 'bar'],
        type: 'object',
      });
    });

    test('with timestamps', () => {
      @Model({ timestamps: true })
      class C {
        @Field()
        foo: boolean;
      }

      const value = getSchema(C);

      expect(value).toEqual({
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            bsonType: 'objectId',
          },
          createdAt: {
            bsonType: 'date',
          },
          foo: {
            type: 'boolean',
          },
          updatedAt: {
            bsonType: 'date',
          },
        },
        required: ['_id', 'createdAt', 'updatedAt'],
        type: 'object',
      });
    });

    test('with string IDs', () => {
      @Model()
      class C {
        @Field({ required: true })
        _id: string;

        @Field({ required: true })
        foo: number;
      }

      const value = getSchema(C);

      expect(value).toEqual({
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            type: 'string',
          },
          foo: {
            type: 'number',
          },
        },
        required: ['_id', 'foo'],
        type: 'object',
      });
    });

    test('with number IDs', () => {
      @Model()
      class C {
        @Field({ required: true })
        _id: number;

        @Field({ required: true })
        foo: string;
      }

      const value = getSchema(C);

      expect(value).toEqual({
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            type: 'number',
          },
          foo: {
            type: 'string',
          },
        },
        required: ['_id', 'foo'],
        type: 'object',
      });
    });

    test('full', () => {
      class Obj1 {
        @Field()
        foo: number;
      }

      @Model({
        defaults: { stringOptional: 'foo' },
        timestamps: true,
        validationAction: VALIDATION_ACTIONS.WARN,
        validationLevel: VALIDATION_LEVEL.MODERATE,
      })
      class C {
        @Field({ type: 'any' })
        anyOptional?: any;

        @Field({ required: true, type: 'any' })
        anyRequired: any;

        @Field({ type: 'array', item: { type: 'object', object: Obj1 } })
        arrayOfObjects: Array<{ foo: Obj1 }>;

        @Field({ type: 'array', item: { type: 'number' } })
        arrayOptional?: Array<number>;

        @Field({ required: true, type: 'array', item: { type: 'number' } })
        arrayRequired: Array<number>;

        @Field()
        binaryOptional?: Binary;

        @Field({ required: true })
        binaryRequired: Binary;

        @Field()
        booleanOptional?: boolean;

        @Field({ required: true })
        booleanRequired: boolean;

        @Field()
        dateOptional?: Date;

        @Field({ required: true })
        dateRequired: Date;

        @Field({ type: 'enum', values: [...Object.values(TEST_ENUM), null] })
        enumOptional?: TEST_ENUM;

        @Field({
          type: 'enum',
          values: [...Object.values(TEST_ENUM)],
          required: true,
        })
        enumRequired: TEST_ENUM;

        @Field()
        numberOptional?: number;

        @Field({ required: true })
        numberRequired: number;

        @Field({ type: 'objectGeneric', value: { type: 'number' } })
        objectGenericOptional?: { [key: string]: number };

        @Field({
          required: true,
          type: 'objectGeneric',
          value: { type: 'number' },
          pattern: 'abc.+',
        })
        objectGenericRequired: { [key: string]: number };

        @Field({ type: 'objectId' })
        objectIdOptional?: ObjectId;

        @Field({ required: true, type: 'objectId' })
        objectIdRequired: ObjectId;

        @Field({ type: 'object', object: Obj1 })
        objectOptional?: Obj1;

        @Field({ required: true, type: 'object', object: Obj1 })
        objectRequired: Obj1;

        @Field()
        stringOptional?: string;

        @Field({ required: true })
        stringRequired: string;
      }

      const value = getSchema(C);

      expect(value).toMatchObject({
        $defaults: { stringOptional: 'foo' },
        $validationAction: 'warn',
        $validationLevel: 'moderate',
        additionalProperties: false,
        properties: {
          __v: {
            type: 'number',
          },
          _id: {
            bsonType: 'objectId',
          },
          anyOptional: {
            bsonType: [
              'array',
              'binData',
              'bool',
              'date',
              'null',
              'number',
              'object',
              'objectId',
              'string',
            ],
          },
          anyRequired: {
            bsonType: [
              'array',
              'binData',
              'bool',
              'date',
              'null',
              'number',
              'object',
              'objectId',
              'string',
            ],
          },
          arrayOfObjects: {
            items: {
              additionalProperties: false,
              properties: {
                foo: {
                  type: 'number',
                },
              },
              type: 'object',
            },
            type: 'array',
          },
          arrayOptional: {
            items: {
              type: 'number',
            },
            type: 'array',
          },
          arrayRequired: {
            items: {
              type: 'number',
            },
            type: 'array',
          },
          binaryOptional: {
            bsonType: 'binData',
          },
          binaryRequired: {
            bsonType: 'binData',
          },
          booleanOptional: {
            type: 'boolean',
          },
          booleanRequired: {
            type: 'boolean',
          },
          createdAt: {
            bsonType: 'date',
          },
          dateOptional: {
            bsonType: 'date',
          },
          dateRequired: {
            bsonType: 'date',
          },
          enumOptional: {
            enum: ['foo', 'bar', null],
          },
          enumRequired: {
            enum: ['foo', 'bar'],
          },
          numberOptional: {
            type: 'number',
          },
          numberRequired: {
            type: 'number',
          },
          objectGenericOptional: {
            additionalProperties: false,
            patternProperties: {
              '.+': {
                type: 'number',
              },
            },
            type: 'object',
          },
          objectGenericRequired: {
            additionalProperties: false,
            patternProperties: {
              'abc.+': {
                type: 'number',
              },
            },
            type: 'object',
          },

          objectIdOptional: {
            bsonType: 'objectId',
          },
          objectIdRequired: {
            bsonType: 'objectId',
          },
          objectOptional: {
            additionalProperties: false,
            properties: {
              foo: {
                type: 'number',
              },
            },
            type: 'object',
          },
          objectRequired: {
            additionalProperties: false,
            properties: {
              foo: {
                type: 'number',
              },
            },
            type: 'object',
          },
          stringOptional: {
            type: 'string',
          },
          stringRequired: {
            type: 'string',
          },
          updatedAt: {
            bsonType: 'date',
          },
        },
        required: [
          '_id',
          'anyRequired',
          'arrayRequired',
          'binaryRequired',
          'booleanRequired',
          'dateRequired',
          'enumRequired',
          'numberRequired',
          'objectGenericRequired',
          'objectIdRequired',
          'objectRequired',
          'stringRequired',
          'createdAt',
          'updatedAt',
        ],
        type: 'object',
      });
    });
  });
});
