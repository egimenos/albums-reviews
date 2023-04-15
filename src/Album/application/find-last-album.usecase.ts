import { Inject, Injectable } from '@nestjs/common';
import { ALBUM_SYMBOLS } from '../infraestructure/IoC/symbols';
import { AlbumRepository } from 'src/Album/domain/repositories/album.repository';
import { Album } from '../domain/entities/album.entity';

@Injectable()
export class FindLastAlbumUseCase {
  constructor(
    @Inject(ALBUM_SYMBOLS.ALBUM_REPOSITORY)
    protected albumRepository: AlbumRepository,
  ) {}

  async run(): Promise<Album> {
    return this.albumRepository.findLast();
  }
}
