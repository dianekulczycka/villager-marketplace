import { type FC, useState } from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { getAll } from '../../../services/fetch/user.service.ts';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { UserSortField } from '../../../models/enums/UserSortField.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import { Box } from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';
import { createOpenModal } from '../../../helpers/createOpenModal.ts';
import type { UpdateUserDto } from '../../../models/user/UpdateUserDto.ts';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import {
  ban,
  demote,
  hardDelete,
  promote,
  restore,
  softDelete,
  unban,
  unflag,
  update,
} from '../../../services/fetch/admin.service.ts';
import { useQuery } from '@tanstack/react-query';

const UsersPage: FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedUser, setSelectedUser] = useState<UserAdminView | null>(null);

  const openUserModal = createOpenModal<UserAdminView>(setActiveModal, setSelectedUser);
  const openUpdateModal = (user: UserAdminView) => openUserModal('updateUser', user);
  const openDeleteModal = (user: UserAdminView) => openUserModal('deleteUser', user);
  const openHardDeleteModal = (user: UserAdminView) => openUserModal('hardDeleteUser', user);
  const closeModal = () => setActiveModal(null);

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'users',
      query.page,
      query.perPage,
      query.sortBy,
      query.sortDirection,
      query.search,
    ],
    queryFn: () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as UserSortField | undefined,
        sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
        search: query.search ?? undefined,
      }),
  });

  const updateUser = async (dto: UpdateUserDto) => {
    if (!selectedUser) return;
    await update(selectedUser.id, dto);
    await refetch();
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    await softDelete(selectedUser.id);
    await refetch();
  };

  const hardDeleteUser = async () => {
    if (!selectedUser) return;
    await hardDelete(selectedUser.id);
    await refetch();
  };

  const toggleBan = async (user: UserAdminView) => {
    await (user.isBanned ? unban(user.id) : ban(user.id));
    await refetch();
  };

  const togglePromote = async (user: UserAdminView) => {
    await (user.role !== 'MANAGER'
      ? promote(user.id)
      : demote(user.id));
    await refetch();
  };

  const unflagUser = async (user: UserAdminView) => {
    if (user.isFlagged) await unflag(user.id);
    await refetch();
  };

  const restoreUser = async (user: UserAdminView) => {
    if (user.isDeleted) await restore(user.id);
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
        data={data}
        error={error}
        loading={isLoading}
        isEmpty={data?.data.length === 0}>
        {data &&
          <>
            <UsersComponent
              users={data.data}
              openDeleteModal={openDeleteModal}
              openHardDeleteModal={openHardDeleteModal}
              openUpdateModal={openUpdateModal}
              toggleBan={toggleBan}
              togglePromote={togglePromote}
              unflagUser={unflagUser}
              restoreUser={restoreUser}
            />
            <PaginationComponent
              page={data.page}
              pageCount={data.pageCount}
              onChange={handlePageChange}

            />
          </>
        }
      </DataStateComponent>

      <UpdateUserModal
        open={activeModal === 'updateUser'}
        closeModal={closeModal}
        onUpdateUser={updateUser}
        selectedUser={selectedUser}
      />

      <ConfirmDeleteModal
        open={activeModal === 'deleteUser' || activeModal === 'hardDeleteUser'}
        closeModal={closeModal}
        onDelete={
          activeModal === 'deleteUser'
            ? deleteUser
            : hardDeleteUser
        }
      />

    </Box>
  );
};

export default UsersPage;