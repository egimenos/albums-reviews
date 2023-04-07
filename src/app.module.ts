import { Module } from '@nestjs/common';
import { AlbumModule } from './Album/Album.module';

@Module({
  imports: [AlbumModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
