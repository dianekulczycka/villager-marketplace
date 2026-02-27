import { type FC } from 'react';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { getAll } from '../../../services/fetch/item.service.ts';
import type { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';

const ItemsPage: FC = () => {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
    sellerId: NumberParam,
  });

  const { paginatedData, loading, error } = useFetch(
    () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as ItemSortField | undefined,
        sortDirection: query.sortDirection as 'ASC' | 'DESC' | undefined,
        search: query.search ?? undefined,
        sellerId: query.sellerId ?? undefined,
      }),
    [query],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  return (
    <DataStateComponent
      data={paginatedData}
      error={error}
      loading={loading}
      isEmpty={paginatedData?.data.length === 0}>
      {paginatedData &&
        <>
          <ItemsComponent items={paginatedData.data} />;
          <PaginationComponent
            page={query.page}
            pageCount={paginatedData.pageCount}
            onChange={handlePageChange}
          />
        </>
      }
    </DataStateComponent>
  );
};

export default ItemsPage;