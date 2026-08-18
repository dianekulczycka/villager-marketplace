import {useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {NumberParam, StringParam, useQueryParams, withDefault} from 'use-query-params';

export type PaginationQuery = {
    page: number;
    perPage: number;
    sortBy?: string | null;
    sortDirection?: string | null;
    search?: string | null;
    sellerId?: string | null;
};

export function usePaginatedQuery<T>(
    queryKey: string,
    queryFn: (query: PaginationQuery) => Promise<T>,
    extraQueryKey: unknown[] = [],
    perPage = 8,
    options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
    const [query, setQuery] = useQueryParams({
        page: withDefault(NumberParam, 1),
        perPage: withDefault(NumberParam, perPage),
        sortBy: StringParam,
        sortDirection: StringParam,
        search: StringParam,
        sellerId: StringParam,
    });

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<T>({
        queryKey: [
            queryKey,
            ...extraQueryKey,
            query.page,
            query.perPage,
            query.sortBy,
            query.sortDirection,
            query.search,
            query.sellerId,
        ],
        queryFn: () => queryFn(query),
        ...options,
    });

    const handlePageChange = (newPage: number) => {
        setQuery({page: newPage});
    };

    return {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    };
}