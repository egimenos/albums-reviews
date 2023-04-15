import {
  type Response as FetchedReviewsResponse,
  FetchReviewsRepository,
  Response as FetchReviewsResponse,
} from 'src/Album/domain/repositories/fetch-reviews.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { ALBUM_SYMBOLS } from '../IoC/symbols';
import { CreateAlbumUseCase } from 'src/Album/application/create-album.usecase';
import { FindLastAlbumUseCase } from 'src/Album/application/find-last-album.usecase';
import { Album } from 'src/Album/domain/entities/album.entity';
import { isBefore } from 'date-fns';

const baseUrl = 'https://pitchfork.com';
@Injectable()
export class FetchPitchforkReviewsCommand implements FetchReviewsRepository {
  constructor(
    @Inject(ALBUM_SYMBOLS.CREATE_ALBUM_USECASE)
    protected createAlbumUseCase: CreateAlbumUseCase,
    @Inject(ALBUM_SYMBOLS.FIND_LAST_ALBUM_USECASE)
    protected findLastAlbumUseCase: FindLastAlbumUseCase,
  ) {}
  async fetchReviews({
    firstFetching = false,
  }: { firstFetching?: boolean } = {}): Promise<FetchedReviewsResponse> {
    if (firstFetching) {
      return this.fetchAllReviews();
    }

    return this.fetchLastReviews();
  }

  private async fetchAllReviews(): Promise<FetchReviewsResponse> {
    Logger.log('Starting fetching all reviews');

    let page = 1;
    let completed = 0;
    let completedPages = 0;
    let keepFetching = true;

    while (keepFetching) {
      const url = baseUrl + `/reviews/albums/?page=${page}`;
      const { html, code } = await this.fetchHTML(url);

      if (code === 404 || page >= 4000) {
        keepFetching = false;
        return {
          completed,
          pages: completedPages,
          message: 'Finished succesfully',
        };
      }

      if (html) {
        const $ = cheerio.load(html);
        const albumNodes = $('div.review');

        albumNodes.each((_index, element) => {
          this.processReview(element, $);
          completed = completed + 1;
        });
      }

      page = page + 1;
      completedPages = completedPages + 1;
    }
  }

  private async fetchLastReviews(): Promise<FetchReviewsResponse> {
    Logger.log('Starting fetching last reviews');

    let page = 1;
    let completed = 0;
    let completedPages = 0;
    let keepFetching = true;

    const lastAlbum = await this.findLastAlbumUseCase.run();

    Logger.log(lastAlbum.reviewDate, 'LastAlbumReviewDate');

    if (!lastAlbum) {
      return {
        completed,
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
          completed,
          pages: completedPages,
          message: 'completed succesfully',
        };
      }

      if (html) {
        const $ = cheerio.load(html);
        const albumNodes = $('div.review');

        albumNodes.each(async (_index, element) => {
          const reviewDate = await this.processReview(element, $);

          if (isBefore(reviewDate, lastReviewDate)) {
            keepFetching = false;
            return;
          }

          completed = completed + 1;
        });
      }

      page = page + 1;
      completedPages = completedPages + 1;
    }
    return {
      completed,
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

  private async processReview(
    reviewElement: cheerio.Element,
    $: cheerio.Root,
  ): Promise<Date> {
    try {
      const review = $(reviewElement);

      const relativeLink = review.find('a.review__link').attr('href');
      const link = baseUrl + relativeLink;

      const albumTitle = review.find('h2.review__title-album').text();

      const genres = [];
      review.find('ul.genre-list li a').each((_genreIndex, genreElement) => {
        genres.push($(genreElement).text());
      });
      const publicationDate = review.find('time.pub-date').attr('datetime');

      const artist = review
        .find('ul.artist-list.review__title-artist li')
        .text();

      // fetch detail page

      const { html: reviewDetailHTML } = await this.fetchHTML(link);
      const review$ = cheerio.load(reviewDetailHTML);
      const score = review$('div[class*="ScoreCircle"] p').text();

      const album: Album = {
        name: albumTitle,
        score: parseFloat(score),
        reviewDate: new Date(publicationDate),
        genres: genres.join('-'),
        link: link,
        artist,
      };
      Logger.log(album);

      await this.createAlbumUseCase.run(album);
      return album.reviewDate;
    } catch (error) {
      Logger.error(`Error fetching review ${error}`);
    }
  }
}
