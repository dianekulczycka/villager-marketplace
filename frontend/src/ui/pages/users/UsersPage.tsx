import { type FC } from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { getAll } from '../../../services/fetch/user.service.ts';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import type { UserSortField } from '../../../models/enums/UserSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import ErrorComponent from '../../components/error/ErrorComponent.tsx';
import PreloaderComponent from '../../components/shared/PreloaderComponent.tsx';

const UsersPage: FC = () => {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 12),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const { data, loading, error } = useFetch(
    () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as UserSortField | undefined,
        sortDirection: query.sortDirection as 'ASC' | 'DESC' | undefined,
        search: query.search ?? undefined,
      }),
    [query],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  if (loading) return <PreloaderComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return <ErrorComponent error="no data" />;

  return (
    <>
      <UsersComponent users={data.data} />
      <PaginationComponent
        page={data.page}
        pageCount={data.pageCount}
        onChange={handlePageChange}
      />
    </>
  );
};

export default UsersPage;