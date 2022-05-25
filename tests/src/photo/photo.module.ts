import { Module } from '@nestjs/common';
import { PaprModule } from '../../../src/';
import { PhotoController } from './photo.controller';
import Photo from './photo.model';
import { PhotoService } from './photo.service';

@Module({
  controllers: [PhotoController],
  providers: [PhotoService],
  imports: [PaprModule.forFeature(Photo)],
})
export class PhotoModule {}
