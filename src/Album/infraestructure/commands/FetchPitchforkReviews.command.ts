import {
  type Response as FetchedReviewsResponse,
  FetchReviewsRepository,
} from 'src/Album/domain/repositories/fetch-reviews.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { ALBUM_SYMBOLS } from '../IoC/symbols';
import { CreateAlbumUseCase } from 'src/Album/application/create-album.usecase';
import { Album } from 'src/Album/domain/entities/album.entity';

const baseUrl = 'https://pitchfork.com';
@Injectable()
export class FetchPitchforkReviewsCommand implements FetchReviewsRepository {
  constructor(
    @Inject(ALBUM_SYMBOLS.CREATE_ALBUM_USECASE)
    protected createAlbumUseCase: CreateAlbumUseCase,
  ) {}
  async fetchReviews({
    firstFetching = false,
  }: { firstFetching?: boolean } = {}): Promise<FetchedReviewsResponse> {
    if (firstFetching) {
      return this.fetchAllReviews();
    }

    return this.fetchLastReviews();
  }

  private async fetchAllReviews() {
    let page = 1;
    let completed = 0;
    let completedPages = 0;

    while (true) {
      const url = baseUrl + `/reviews/albums/?page=${page}`;
      const { html, code } = await this.fetchHTML(url);

      if (code === 404 || page >= 4000) {
        break;
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

    return { completed, pages: completedPages };
  }

  private fetchLastReviews() {
    return { completed: 100 };
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
  ): Promise<void> {
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
    } catch (error) {
      Logger.error(`Error fetching review ${error}`);
    }
  }
}
