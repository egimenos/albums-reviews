import {
  type Response as FetchedReviewsResponse,
  FetchReviewsRepository,
  Response as FetchReviewsResponse,
} from 'src/Album/domain/repositories/fetch-reviews.repository';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ALBUM_SYMBOLS } from '../IoC/symbols';
import { CreateAlbumUseCase } from 'src/Album/application/create-album.usecase';
import { FindLastAlbumUseCase } from 'src/Album/application/find-last-album.usecase';
import { Album } from 'src/Album/domain/entities/album.entity';
import { isBefore } from 'date-fns';
import { Cron } from '@nestjs/schedule';
import { JSDOM, VirtualConsole } from 'jsdom';

const baseUrl = 'https://pitchfork.com';
@Injectable()
export class FetchPitchforkReviewsCommand implements FetchReviewsRepository {
  private virtualConsole: VirtualConsole;
  constructor(
    @Inject(ALBUM_SYMBOLS.CREATE_ALBUM_USECASE)
    protected createAlbumUseCase: CreateAlbumUseCase,
    @Inject(ALBUM_SYMBOLS.FIND_LAST_ALBUM_USECASE)
    protected findLastAlbumUseCase: FindLastAlbumUseCase,
  ) {
    // needed to avoid verbose css not able to parse errors from jsdom
    this.virtualConsole = new VirtualConsole();
    this.virtualConsole.sendTo(console, { omitJSDOMErrors: true });
    this.virtualConsole.on('jsdomError', (err) => {
      if (err.message !== 'Could not parse CSS stylesheet') {
        console.error(err);
      }
    });
  }

  @Cron('0 2 * * *')
  async fetchReviews({
    firstFetching = false,
  }: { firstFetching?: boolean } = {}): Promise<FetchedReviewsResponse> {
    if (firstFetching) {
      return this.fetchAllReviews();
    }

    Logger.log('Executing Cron job to fetch last reviews');
    return this.fetchLastReviews();
  }

  private async fetchAllReviews(): Promise<FetchReviewsResponse> {
    Logger.log('Starting fetching all reviews');

    let page = 1;
    let completedPages = 0;
    let keepFetching = true;

    while (keepFetching && page <= 4000) {
      const url = baseUrl + `/reviews/albums/?page=${page}`;
      const { html, code } = await this.fetchHTML(url);

      if (code === 404 || page >= 4000) {
        keepFetching = false;
        return {
          pages: completedPages,
          message: 'Finished succesfully',
        };
      }

      if (html) {
        const dom = new JSDOM(html, {
          virtualConsole: this.virtualConsole,
        });
        const doc = dom.window.document;
        this.processPage(doc);
        dom.window.close();
      }

      page = page + 1;
      completedPages = completedPages + 1;
    }
  }

  private async fetchLastReviews(): Promise<FetchReviewsResponse> {
    Logger.log('Starting fetching last reviews');

    let page = 1;
    let completedPages = 0;
    let keepFetching = true;

    const lastAlbum = await this.findLastAlbumUseCase.run();

    Logger.log(lastAlbum.reviewDate, 'LastAlbumReviewDate');

    if (!lastAlbum) {
      return {
        pages: completedPages,
        message: 'no last album found',
      };
    }

    const lastReviewDate = lastAlbum.reviewDate;

    while (keepFetching) {
      const url = baseUrl + `/reviews/albums/?page=${page}`;
      const { html, code } = await this.fetchHTML(url);

      if (code === 404 || page >= 10) {
        // it is highly unlike to have more than 10 pages between executions
        keepFetching = false;
        return {
          pages: completedPages,
          message: 'completed succesfully',
        };
      }

      if (html) {
        const dom = new JSDOM(html, {
          url,
          virtualConsole: this.virtualConsole,
        });
        const doc = dom.window.document;
        const albumNodes = doc.querySelectorAll('div.review');

        const pagePublicationDate = albumNodes[0]
          .querySelector('time.pub-date')
          .getAttribute('datetime');

        if (isBefore(new Date(pagePublicationDate), lastReviewDate)) {
          keepFetching = false;
          break;
        }

        this.processPage(doc);
        dom.window.close();
      }

      page = page + 1;
      completedPages = completedPages + 1;
    }
    return {
      pages: completedPages,
      message: 'completed succesfully',
    };
  }

  private async fetchHTML(
    url: string,
  ): Promise<{ html: string; code: number }> {
    try {
      const response: AxiosResponse<string> = await axios.get(url);
      return { html: response.data, code: response.status };
    } catch (error: unknown) {
      Logger.error(
        `Error fetching HTML: ${error} ${url}`,
        'FetchPitchforkReviewsCommand',
      );
      if (error instanceof AxiosError) {
        return { html: null, code: error.response?.status || 500 };
      }

      return { html: null, code: 500 };
    }
  }

  private async processPage(doc: Document) {
    const albumNodes = doc.querySelectorAll('div.review');

    for (const element of albumNodes) {
      const reviewLink = element
        .querySelector('a.review__link')
        .getAttribute('href');

      const genres = [];
      element.querySelectorAll('ul.genre-list li a').forEach((genreElement) => {
        genres.push(genreElement.textContent);
      });

      const publicationDate = element
        .querySelector('time.pub-date')
        .getAttribute('datetime');

      const artist = element.querySelector(
        'ul.artist-list.review__title-artist li',
      ).textContent;

      const albums = await this.processReview(reviewLink, {
        reviewDate: new Date(publicationDate),
        genres: genres.join('-'),
        artist,
      });

      Logger.log(JSON.stringify(albums, null, 2));

      albums.forEach((album) => {
        this.createAlbumUseCase.run(album);
      });
    }
  }

  private async processReview(
    relativeLink: string,
    commonData: Pick<Album, 'artist' | 'genres' | 'reviewDate'>,
  ): Promise<Album[]> {
    const albums: Album[] = [];
    try {
      const link = baseUrl + relativeLink;

      // fetch detail page
      const { html } = await this.fetchHTML(link);

      if (!html) {
        throw new NotFoundException();
      }

      const dom = new JSDOM(html, {
        url: link,
        virtualConsole: this.virtualConsole,
      });
      const doc = dom.window.document;

      const albumPicker = doc.querySelector('.album-picker');

      if (!albumPicker) {
        const albumTitle = doc.querySelector(
          'h1[data-testid="ContentHeaderHed"]',
        ).textContent;

        const score = doc.querySelector(
          'div[class*="ScoreCircle"] p',
        ).textContent;

        albums.push({
          ...commonData,
          name: albumTitle,
          score: parseFloat(score),
          link,
        });
      }

      // this is a special review page with element album-picker
      if (albumPicker) {
        const variants = doc.querySelectorAll('.single-album-tombstone');

        for (const variant of variants) {
          const albumTitle = variant.querySelector(
            '.single-album-tombstone__review-title',
          ).textContent;

          const score = variant.querySelector('.score').textContent;

          const album: Album = {
            ...commonData,
            name: albumTitle,
            score: parseFloat(score),
            link,
          };

          albums.push(album);
        }
      }
      dom.window.close();
      return albums;
    } catch (error) {
      Logger.error(`Error fetching review ${error}`);
    }
  }
}
