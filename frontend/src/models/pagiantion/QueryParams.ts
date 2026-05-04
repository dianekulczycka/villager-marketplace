export interface QueryParams<T> {
  page?: number | null;
  perPage?: number | null;
  sortBy?: T | null;
  sortDirection?: 'asc' | 'desc' | null;
  search?: string | null;
}