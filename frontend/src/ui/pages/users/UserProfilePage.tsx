import { type FC } from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import ErrorComponent from '../../components/error/ErrorComponent.tsx';
import { useFetch } from '../../../hooks/useFetch.ts';
import { getMy } from '../../../services/fetch/item.service.ts';
import PreloaderComponent from '../../components/shared/PreloaderComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import type { ItemSortField } from '../../../models/enums/ItemSortField.ts';

const UserProfilePage: FC = () => {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const { user, loadUser } = useAuth();

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const { data, loading, error } = useFetch(
    () =>
      getMy({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as ItemSortField | undefined,
        sortDirection: query.sortDirection as 'ASC' | 'DESC' | undefined,
        search: query.search ?? undefined,
      }),
    [query],
  );

  console.log(data);

  if (!user) return <ErrorComponent error="no user" />;
  if (loading) return <PreloaderComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return;

  return (
    <>
      <UserProfileComponent user={user} loadUser={loadUser} items={data} />;
      <PaginationComponent
        page={query.page}
        pageCount={data.pageCount}
        onChange={handlePageChange}
      />
    </>
  );
};

export default UserProfilePage;