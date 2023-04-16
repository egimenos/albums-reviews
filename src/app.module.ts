import { Module } from '@nestjs/common';
import { AlbumModule } from './Album/Album.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AlbumModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
