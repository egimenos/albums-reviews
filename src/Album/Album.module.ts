import { Module } from '@nestjs/common';
import { ALBUM_SYMBOLS } from './infraestructure/IoC/symbols';
import { PrismaAlbumRepository } from './infraestructure/repositories/prisma-album.repository';
import { CreateAlbumUseCase } from './application/create-album.usecase';
import { FindByNameAlbumUseCase } from './application/find-album.usecase';
import { AlbumsController } from './infraestructure/controllers/albums.controller';
import { FetchPitchforkReviewsCommand } from './infraestructure/commands/FetchPitchforkReviews.command';
import { FetchAlbumsReviewsUseCase } from './application/fetch-albums-reviews.usecase';

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
    {
      provide: ALBUM_SYMBOLS.FETCH_ALBUM_REVIEWS_USE_CASE,
      useClass: FetchAlbumsReviewsUseCase,
    },
    {
      provide: ALBUM_SYMBOLS.FETCH_REVIEWS_REPOSITORY,
      useClass: FetchPitchforkReviewsCommand,
    },
  ],
})
export class AlbumModule {}
