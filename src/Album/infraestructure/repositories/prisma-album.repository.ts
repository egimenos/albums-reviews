import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Album } from 'src/Album/domain/entities/album.entity';
import { PrismaRepository } from 'src/Shared/infraestructure/database/PrismaRepository';
import { AlbumRepository } from '../../../../dist/Album/domain/repositories/album.repository';

@Injectable()
export class PrismaAlbumRepository
  extends PrismaRepository
  implements AlbumRepository
{
  private repository: Prisma.AlbumDelegate<Prisma.RejectPerOperation>;

  constructor() {
    super();
    this.repository = this.getClient().album;
  }

  async create(album: Album): Promise<Album> {
    const createdAlbum = await this.repository.create({
      data: album,
    });
    return createdAlbum;
  }

  async findByName(name: string): Promise<Album | null> {
    const album: Album | null = await this.repository.findUnique({
      where: { name },
    });
    return album;
  }
}
