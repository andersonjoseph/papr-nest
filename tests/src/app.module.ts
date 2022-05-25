import { Module } from '@nestjs/common';
import { PaprModule } from '../../src';
import { Photo } from './photo/photo.model';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    PaprModule.forRoot({
      connectionString: '',
      models: [Photo],
    }),
    PhotoModule,
  ],
})
export class ApplicationModule {}
