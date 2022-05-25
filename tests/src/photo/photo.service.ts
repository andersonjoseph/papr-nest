import { Inject, Injectable } from '@nestjs/common';
import {
  getPaprRepositoryToken,
  PaprRepository,
  PaprRepositoryResult,
} from '../../../src';
import { Photo } from './photo.model';

@Injectable()
export class PhotoService {
  constructor(
    @Inject(getPaprRepositoryToken(Photo))
    private readonly photoRepository: PaprRepository<typeof Photo>,
  ) {}
  async findAll(): Promise<PaprRepositoryResult<typeof Photo>[]> {
    return await this.photoRepository.find({});
  }

  async create(): Promise<PaprRepositoryResult<typeof Photo>> {
    const newPhoto = await this.photoRepository.insertOne({
      name: 'Nest',
      description: 'Is great!',
      views: 6000,
    });

    return newPhoto;
  }
}
