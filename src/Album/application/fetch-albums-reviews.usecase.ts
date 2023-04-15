import { Inject, Injectable } from '@nestjs/common';
import { ALBUM_SYMBOLS } from '../infraestructure/IoC/symbols';

import {
  FetchReviewsRepository,
  Response as FetchReviewsResponse,
} from '../domain/repositories/fetch-reviews.repository';

@Injectable()
export class FetchAlbumsReviewsUseCase {
  constructor(
    @Inject(ALBUM_SYMBOLS.FETCH_REVIEWS_REPOSITORY)
    protected reviewsRepository: FetchReviewsRepository,
  ) {}

  async run(firstFetching?: boolean): Promise<FetchReviewsResponse> {
    return this.reviewsRepository.fetchReviews({
      firstFetching: firstFetching ?? true,
    });
  }
}
