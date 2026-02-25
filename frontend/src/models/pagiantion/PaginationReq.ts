export interface PaginationReq {
  page?: number;
  perPage?: number;
  sortDirection?: 'ASC' | 'DESC'
  search?: string,
}