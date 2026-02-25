import { type FC } from 'react';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { getAll } from '../../../services/fetch/item.service.ts';
import type { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import PreloaderComponent from '../../components/shared/PreloaderComponent.tsx';
import ErrorComponent from '../../components/error/ErrorComponent.tsx';

const ItemsPage: FC = () => {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
    sellerId: NumberParam,
  });

  const { data, loading, error } = useFetch(
    () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as ItemSortField | undefined,
        sortDirection: query.sortDirection as 'ASC' | 'DESC' | undefined,
        search: query.search ?? undefined,
        sellerId: query.sellerId ?? undefined
      }),
    [query],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  if (loading) return <PreloaderComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return <ErrorComponent error="no data" />;
  if (data.data.length <= 0) return <ErrorComponent error="no data" />;

  return (
    <>
      <ItemsComponent items={data.data} />;
      <PaginationComponent
        page={query.page}
        pageCount={data.pageCount}
        onChange={handlePageChange}
      />
    </>
  );
};

export default ItemsPage;