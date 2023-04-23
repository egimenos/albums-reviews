import { Inject, Injectable } from '@nestjs/common';
import { ALBUM_SYMBOLS } from '../infraestructure/IoC/symbols';
import { AlbumRepository } from 'src/Album/domain/repositories/album.repository';
import { CreateAlbumDto } from '../domain/dtos/album.dtos';
import { Album } from '../domain/entities/album.entity';

@Injectable()
export class CreateAlbumUseCase {
  constructor(
    @Inject(ALBUM_SYMBOLS.ALBUM_REPOSITORY)
    protected albumRepository: AlbumRepository,
  ) {}

  async run(createAlbumDto: CreateAlbumDto): Promise<Album> {
    return await this.albumRepository.create(createAlbumDto);
  }
}
