import { type FC } from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { getAll } from '../../../services/fetch/user.service.ts';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { UserSortField } from '../../../models/enums/UserSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import { Box } from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';

const UsersPage: FC = () => {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const { paginatedData, loading, error } = useFetch(
    () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as UserSortField | undefined,
        sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
        search: query.search ?? undefined,
      }),
    [query],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: "column",
      alignItems: "center"
    }}>
      <SortSearchComponent
        fields={Object.values(UserSortField)}
      />
      <DataStateComponent
        data={paginatedData}
        error={error}
        loading={loading}
        isEmpty={paginatedData?.data.length === 0}>
        {paginatedData &&
          <>
            <UsersComponent users={paginatedData.data} />
            <PaginationComponent
              page={paginatedData.page}
              pageCount={paginatedData.pageCount}
              onChange={handlePageChange}

            />
          </>
        }
      </DataStateComponent>
    </Box>
  );
};

export default UsersPage;