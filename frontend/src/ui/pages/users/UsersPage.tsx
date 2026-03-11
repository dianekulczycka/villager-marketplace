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

  const toggleBan = async () => {
    if (!selectedUser) return;
    await (selectedUser.isBanned
      ? unban(selectedUser.id)
      : ban(selectedUser.id));
    await refetch();
  };

  const togglePromote = async () => {
    if (!selectedUser) return;
    await (selectedUser.role !== 'MANAGER'
      ? promote(selectedUser.id)
      : demote(selectedUser.id));
    await refetch();
  };

  const unflagUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.isFlagged) await unflag(selectedUser.id);
  };

  const restoreUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.isDeleted) await restore(selectedUser.id);
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
              openHardDeleteModal={openHardDeleteModal}
              openUpdateModal={openUpdateModal}
              toggleBan={toggleBan}
              togglePromote={togglePromote}
              unflagUser={unflagUser}
              restoreUser={restoreUser}
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