export type Response = {
  completed: number;
};

export interface FetchReviewsRepository {
  fetchReviews({
    firstFetching,
  }: {
    firstFetching?: boolean;
  }): Promise<Response>;
}
