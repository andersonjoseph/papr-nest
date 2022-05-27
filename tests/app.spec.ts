import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import supertest from 'supertest';
import { Server } from 'http';
import { PhotoController } from './src/photo/photo.controller';
import { PhotoService } from './src/photo/photo.service';
import { getPaprRepositoryToken, PaprRepository } from '../src';
import Photo from './src/photo/photo.model';

const photoRepositoryMock = {
  insertOne: () => null,
};

describe('App e2e', () => {
  let server: Server;
  let app: INestApplication;

  function serviceFactory(photoRepository: PaprRepository<Photo>) {
    return new PhotoService(photoRepository);
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      controllers: [PhotoController],
      providers: [
        {
          provide: PhotoService,
          useFactory: serviceFactory,
          inject: [getPaprRepositoryToken(Photo)],
        },
        {
          provide: getPaprRepositoryToken(Photo),
          useValue: photoRepositoryMock,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created entity`, async () => {
    const res = await supertest(server).post('/photo');

    expect(res.status).toBe(201);
  });
});
