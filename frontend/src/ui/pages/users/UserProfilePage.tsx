import { type FC, useState } from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import {
  getMy,
  post,
  softDelete as itemSoftDelete,
  update as itemUpdate,
} from '../../../services/fetch/item.service.ts';
import { becomeSeller, softDelete, update } from '../../../services/fetch/user.service.ts';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import { Box } from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';
import type { UpdateItemDto } from '../../../models/item/UpdateItemDto.ts';
import { createOpenModal } from '../../../helpers/createOpenModal.ts';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import CreateItemModal from '../../components/modals/CreateItemModal.tsx';
import BecomeSellerModal from '../../components/modals/BecomeSellerModal.tsx';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import type { UpdateUserDto } from '../../../models/user/UpdateUserDto.ts';
import type { ItemAdminView } from '../../../models/item/ItemAdminView.ts';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';

const UserProfilePage: FC = () => {
  const { user, loadUser } = useAuth();
  const userRole = user?.role;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedItem, setSelectedItem] = useState<ItemAdminView | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAdminView | null>(null);

  const openItemModal = createOpenModal<ItemAdminView>(setActiveModal, setSelectedItem);
  const openUserModal = createOpenModal<UserAdminView>(setActiveModal, setSelectedUser);

  const openBecomeModal = () => openItemModal('become');
  const openCreateModal = () => openItemModal('create');
  const openUpdateItemModal = (item: ItemAdminView) => openItemModal('updateItem', item);
  const openDeleteItemModal = (item: ItemAdminView) => openItemModal('deleteItem', item);
  const openUpdateUserModal = (user: UserAdminView) => openUserModal('updateUser', user);
  const openDeleteUserModal = (user: UserAdminView) => openUserModal('deleteUser', user);

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
      userRole === 'SELLER'
        ? getMy({
          page: query.page,
          perPage: query.perPage,
          sortBy: query.sortBy as ItemSortField | undefined,
          sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
          search: query.search ?? undefined,
        })
        : Promise.resolve(null),
    [query, userRole],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const onBecomeSeller = async (data: BecomeSellerDto) => {
    await becomeSeller(data);
    loadUser();
  };

  const onCreateItem = async (data: CreateItemDto) => {
    await post({ ...data, description: data.description?.trim() || undefined });
    await refetch();
  };

  const onUpdateItem = async (dto: UpdateItemDto) => {
    if (!selectedItem) return;
    await itemUpdate(selectedItem.id, dto);
    await refetch();
  };

  const onUpdateUser = async (dto: UpdateUserDto) => {
    if (!selectedUser) return;
    await update(dto);
    loadUser();
  };

  const onDeleteItem = async () => {
    if (!selectedItem) return;
    await itemSoftDelete(selectedItem.id);
    await refetch();
  };

  const onDeleteUser = async () => {
    if (!selectedUser) return;
    await softDelete();
    await refetch();
  };

  if (!user) return null;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <UserProfileComponent
        user={user}
        openBecomeModal={openBecomeModal}
        openCreateModal={openCreateModal}
        openUpdateUserModal={openUpdateUserModal}
        openDeleteUserModal={openDeleteUserModal}
      />
      {userRole === 'SELLER' && (
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
                <ItemsComponent
                  items={paginatedData.data}
                  openUpdateModal={openUpdateItemModal}
                  openDeleteModal={openDeleteItemModal}
                />
                <PaginationComponent
                  page={query.page}
                  pageCount={paginatedData!.pageCount}
                  onChange={handlePageChange} />
              </>
            }
          </DataStateComponent>
        </>
      )}

      <UpdateUserModal
        open={activeModal === 'updateUser'}
        closeModal={closeModal}
        onUpdateUser={onUpdateUser}
        selectedUser={selectedUser}
      />

      <ConfirmDeleteModal
        open={activeModal === 'deleteItem' || activeModal === 'deleteUser'}
        closeModal={closeModal}
        onDelete={activeModal === 'deleteItem' ? onDeleteItem : onDeleteUser}
      />

      {userRole === 'SELLER' && (
        <>
          <CreateItemModal
            open={activeModal === 'create'}
            closeModal={closeModal}
            onCreateItem={onCreateItem} />
          <UpdateItemModal
            open={activeModal === 'updateItem'}
            closeModal={closeModal}
            onUpdateItem={onUpdateItem}
            selectedItem={selectedItem} />
        </>
      )}

      {userRole === 'BUYER' && (
        <BecomeSellerModal
          open={activeModal === 'become'}
          closeModal={closeModal}
          onBecomeSeller={onBecomeSeller}
        />
      )}

    </Box>
  );
};

export default UserProfilePage;