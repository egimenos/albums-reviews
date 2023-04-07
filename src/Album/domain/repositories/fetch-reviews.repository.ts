export type Response = {
  completed: number;
};

export interface FetchReviewsRepository {
  fetchReviews(): Promise<Response>;
}
