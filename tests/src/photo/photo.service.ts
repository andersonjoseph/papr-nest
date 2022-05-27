import { Inject, Injectable } from '@nestjs/common';
import { getPaprRepositoryToken, PaprRepository } from '../../../src';
import Photo from './photo.model';

@Injectable()
export class PhotoService {
  constructor(
    @Inject(getPaprRepositoryToken(Photo))
    private readonly photoRepository: PaprRepository<Photo>,
  ) {}
  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find({});
  }

  async create(): Promise<Photo> {
    const newPhoto = await this.photoRepository.insertOne({
      name: 'Nest',
      description: 'Is great!',
      views: 6000,
    });

    return newPhoto;
  }
}
