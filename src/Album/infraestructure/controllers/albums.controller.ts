import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ALBUM_SYMBOLS } from '../IoC/symbols';
import { CreateAlbumUseCase } from 'src/Album/application/create-album.usecase';
import { CreateAlbumDto } from 'src/Album/domain/dtos/album.dtos';
import { Album } from 'src/Album/domain/entities/album.entity';
import { FindByNameAlbumUseCase } from 'src/Album/application/find-album.usecase';

@Controller('albums')
export class AlbumsController {
  constructor(
    @Inject(ALBUM_SYMBOLS.CREATE_ALBUM_USECASE)
    protected createAlbumUsecase: CreateAlbumUseCase,
    @Inject(ALBUM_SYMBOLS.FIND_BY_NAME_ALBUM_USECASE)
    protected findByNameAlbumUseCase: FindByNameAlbumUseCase,
  ) {}

  @Post()
  create(@Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    return this.createAlbumUsecase.run(createAlbumDto);
  }

  @Get('/:name')
  findByName(@Param('name') name: string): Promise<Album | null> {
    return this.findByNameAlbumUseCase.run(name);
  }
}
