import { Module } from '@nestjs/common';
import { ALBUM_SYMBOLS } from './infraestructure/IoC/symbols';
import { PrismaAlbumRepository } from './infraestructure/repositories/prisma-album.repository';
import { CreateAlbumUseCase } from './application/create-album.usecase';
import { FindByNameAlbumUseCase } from './application/find-album.usecase';
import { AlbumsController } from './infraestructure/controllers/albums.controller';

@Module({
  imports: [],
  controllers: [AlbumsController],
  providers: [
    {
      provide: ALBUM_SYMBOLS.ALBUM_REPOSITORY,
      useClass: PrismaAlbumRepository,
    },
    {
      provide: ALBUM_SYMBOLS.CREATE_ALBUM_USECASE,
      useClass: CreateAlbumUseCase,
    },
    {
      provide: ALBUM_SYMBOLS.FIND_BY_NAME_ALBUM_USECASE,
      useClass: FindByNameAlbumUseCase,
    },
  ],
})
export class AlbumModule {}
