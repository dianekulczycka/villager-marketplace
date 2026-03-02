export interface QueryParams<T> {
  page?: number;
  perPage?: number;
  sortBy?: T;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}