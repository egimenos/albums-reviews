export type Response = {
  pages: number;
  message: string;
};

export interface FetchReviewsRepository {
  fetchReviews({
    firstFetching,
  }: {
    firstFetching?: boolean;
  }): Promise<Response>;
}
