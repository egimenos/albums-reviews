import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Album } from 'src/Album/domain/entities/album.entity';
import { AlbumRepository } from 'src/Album/domain/repositories/album.repository';
import { PrismaRepository } from 'src/Shared/infraestructure/database/PrismaRepository';

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

  async findLast(): Promise<Album | null> {
    const album = await this.repository.findFirst({
      orderBy: {
        reviewDate: 'desc',
      },
    });

    return album;
  }

  async create(album: Album): Promise<Album> {
    const { name, score, reviewDate, genres, artist, link } = album;

    const createdAlbum = await this.repository.upsert({
      where: {
        name_artist_reviewDate: {
          name,
          artist,
          reviewDate,
        },
      },
      update: {
        score,
        genres,
        link,
      },
      create: {
        name,
        score,
        reviewDate,
        genres,
        artist,
        link,
      },
    });
    return createdAlbum;
  }
  async findByName(name: string): Promise<Album | null> {
    // Attempt to find an exact match
    let album: Album | null = await this.repository.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (!album && name.length >= 4) {
      // search to avoid partial words matches
      const regex = `%(^|[^a-zA-Z0-9])${name}([^a-zA-Z0-9]|$)%`;

      const results: Album[] = await this.getClient().$queryRaw`
      SELECT * FROM "Album" WHERE "name" SIMILAR TO ${regex}
    `;

      album = results.length > 0 ? results[0] : null;
    }

    return album;
  }
}
