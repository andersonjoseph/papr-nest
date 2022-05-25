import { Test } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import Papr from 'papr';
import { PaprModule } from '../../src';
import Photo from '../src/photo/photo.model';

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

      expect(paprSpy.model).toBeCalledWith(Photo.name, Photo.schema);
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

      expect(paprSpy.model).toBeCalledWith(Photo.name, Photo.schema);
      expect(paprSpy.updateSchemas).toBeCalled();
    });

    it('Should not update mongo schemas glob does not found any models', async () => {
      await Test.createTestingModule({
        imports: [
          PaprModule.forRoot({
            models: 'test/fixtures/user.model.ts',

            mongoClient,
            papr,
          }),
        ],
      }).compile();

      expect(paprSpy.model).not.toBeCalled();
      expect(paprSpy.updateSchemas).not.toBeCalled();
    });
  });
});
