export interface QueryParams<T> {
  page?: number;
  perPage?: number;
  sortBy?: T;
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
}