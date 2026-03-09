import { type FC, useState } from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { getAll } from '../../../services/fetch/user.service.ts';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { UserSortField } from '../../../models/enums/UserSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import { Box } from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';
import { createOpenModal } from '../../../helpers/createOpenModal.ts';
import type { UpdateUserDto } from '../../../models/user/UpdateUserDto.ts';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import { softDelete, update } from '../../../services/fetch/admin.service.ts';

const UsersPage: FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedUser, setSelectedUser] = useState<UserAdminView | null>(null);

  const openUserModal = createOpenModal<UserAdminView>(setActiveModal, setSelectedUser);
  const openUpdateModal = (user: UserAdminView) => openUserModal('updateUser', user);
  const openDeleteModal = (user: UserAdminView) => openUserModal('deleteUser', user);
  const closeModal = () => setActiveModal(null);

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const { paginatedData, loading, error, refetch } = useFetch(
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

  const onUpdateUser = async (dto: UpdateUserDto) => {
    if (!selectedUser) return;
    await update(selectedUser.id, dto);
    await refetch();
  };

  const onDeleteUser = async () => {
    if (!selectedUser) return;
    await softDelete(selectedUser.id);
    await refetch();
  };

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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
            <UsersComponent
              users={paginatedData.data}
              openDeleteModal={openDeleteModal}
              openUpdateModal={openUpdateModal}
            />
            <PaginationComponent
              page={paginatedData.page}
              pageCount={paginatedData.pageCount}
              onChange={handlePageChange}

            />
          </>
        }
      </DataStateComponent>

      <UpdateUserModal
        open={activeModal === 'updateUser'}
        closeModal={closeModal}
        onUpdateUser={onUpdateUser}
        selectedUser={selectedUser}
      />

      <ConfirmDeleteModal
        open={activeModal === 'deleteUser'}
        closeModal={closeModal}
        onDelete={onDeleteUser}
      />

    </Box>
  );
};

export default UsersPage;