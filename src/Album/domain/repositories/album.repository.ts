import { Album } from 'src/Album/domain/entities/album.entity';

export interface AlbumRepository {
  create(album: Album): Promise<Album>;
  findByName(name: string): Promise<Album | null>;
  findLast(): Promise<Album | null>;
}
