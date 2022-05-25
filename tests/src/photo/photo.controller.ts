import { Controller, Get, Post } from '@nestjs/common';
import { PaprRepositoryResult } from '../../../src/';
import { Photo } from './photo.model';
import { PhotoService } from './photo.service';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get()
  findAll(): Promise<PaprRepositoryResult<typeof Photo>[]> {
    return this.photoService.findAll();
  }

  @Post()
  create(): Promise<PaprRepositoryResult<typeof Photo>> {
    return this.photoService.create();
  }
}
