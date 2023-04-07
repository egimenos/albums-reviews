import {
  type Response as FetchedReviewsResponse,
  FetchReviewsRepository,
} from 'src/Album/domain/repositories/fetch-reviews.repository';
export class FetchPitchforkReviewsCommand implements FetchReviewsRepository {
  async fetchReviews(): Promise<FetchedReviewsResponse> {
    return { completed: 100 };
  }
}
