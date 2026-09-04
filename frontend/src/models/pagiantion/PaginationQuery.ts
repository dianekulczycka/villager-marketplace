export type PaginationQuery = {
    page: number;
    perPage: number;
    sortBy?: string | null;
    sortDirection?: string | null;
    search?: string | null;
    sellerId?: string | null;
};