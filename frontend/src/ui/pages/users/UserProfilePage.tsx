import { type FC, useState } from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import { getMy, post } from '../../../services/fetch/item.service.ts';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import type { SubmitHandler } from 'react-hook-form';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import { becomeSeller } from '../../../services/fetch/user.service.ts';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import { Box } from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';

const UserProfilePage: FC = () => {
  const { user, loadUser } = useAuth();
  const isSeller = user?.role === 'SELLER';
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const openBecomeModal = () => setActiveModal('become');
  const openCreateModal = () => setActiveModal('create');
  const closeModal = () => setActiveModal(null);

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
          sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
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
    await post({ ...data, description: data.description?.trim() || undefined});
  };

  if (!user) return;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <UserProfileComponent
        user={user}
        onBecomeSeller={onBecomeSeller}
        onCreateItem={onCreateItem}
        activeModal={activeModal}
        closeModal={closeModal}
        openBecomeModal={openBecomeModal}
        openCreateModal={openCreateModal}
      />
      {isSeller && (
        <>
          <SortSearchComponent
            fields={Object.values(ItemSortField)} />
          <DataStateComponent
            loading={loading}
            error={error}
            data={paginatedData}
            isEmpty={paginatedData?.data.length === 0}>
            {paginatedData &&
              <>
                <ItemsComponent items={paginatedData.data} />
                <PaginationComponent
                  page={query.page}
                  pageCount={paginatedData!.pageCount}
                  onChange={handlePageChange} />
              </>
            }
          </DataStateComponent>
        </>
      )}
    </Box>
  );
};

export default UserProfilePage;