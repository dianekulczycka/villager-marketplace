import { type FC } from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import { getMy } from '../../../services/fetch/item.service.ts';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import type { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import type { SubmitHandler } from 'react-hook-form';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import { becomeSeller } from '../../../services/fetch/user.service.ts';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';

const UserProfilePage: FC = () => {
  const { user, loadUser } = useAuth();
  const isSeller = user?.role === 'SELLER';

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const { paginatedData, loading, error } = useFetch(
    () =>
      isSeller
        ? getMy({
          page: query.page,
          perPage: query.perPage,
          sortBy: query.sortBy as ItemSortField | undefined,
          sortDirection: query.sortDirection as 'ASC' | 'DESC' | undefined,
          search: query.search ?? undefined,
        })
        : Promise.resolve(null),
    [query, isSeller],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const onBecomeSeller: SubmitHandler<BecomeSellerDto> = async (data) => {
    await becomeSeller(data);
    loadUser();
  };

  const onCreateItem: SubmitHandler<CreateItemDto> = async (data) => {
    console.log(data);
  };

  if (!user) return;


  return (
    <>
      <UserProfileComponent
        user={user}
        onBecomeSeller={onBecomeSeller}
        onCreateItem={onCreateItem}
      />
      {isSeller && (
        <DataStateComponent
          loading={loading}
          error={error}
          data={paginatedData}
          isEmpty={paginatedData?.data.length === 0}
        >
          {
            paginatedData &&
            <>
              <ItemsComponent items={paginatedData.data} />
              <PaginationComponent
                page={query.page}
                pageCount={paginatedData!.pageCount}
                onChange={handlePageChange}
              />
            </>
          }
        </DataStateComponent>
      )}
    </>
  );
};

export default UserProfilePage;