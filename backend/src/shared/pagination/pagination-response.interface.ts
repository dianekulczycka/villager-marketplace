export interface PaginationResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  nextPage: number | null;
  prevPage: number | null;
}
