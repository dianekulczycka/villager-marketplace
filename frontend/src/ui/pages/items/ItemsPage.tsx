import { type FC, useState } from 'react';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import { PaginationComponent } from '../../components/shared/PaginationComponent.tsx';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';
import { getAll, softDelete as itemSoftDelete, update as itemUpdate } from '../../../services/fetch/item.service.ts';
import { ItemSortField } from '../../../models/enums/ItemSortField.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import { Box } from '@mui/material';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { UpdateItemDto } from '../../../models/item/UpdateItemDto.ts';
import { createOpenModal } from '../../../helpers/createOpenModal.ts';
import type { ItemAdminView } from '../../../models/item/ItemAdminView.ts';

const ItemsPage: FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedItem, setSelectedItem] = useState<ItemAdminView | null>(null);
  const openItemModal = createOpenModal<ItemAdminView>(setActiveModal, setSelectedItem);

  const openUpdateItemModal = (item: ItemAdminView) => openItemModal('updateItem', item);
  const openDeleteItemModal = (item: ItemAdminView) => openItemModal('deleteItem', item);
  const closeModal = () => setActiveModal(null);

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    perPage: withDefault(NumberParam, 8),
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
    sellerId: NumberParam,
  });

  const { paginatedData, loading, error, refetch } = useFetch(
    () =>
      getAll({
        page: query.page,
        perPage: query.perPage,
        sortBy: query.sortBy as ItemSortField | undefined,
        sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
        search: query.search ?? undefined,
        sellerId: query.sellerId ?? undefined,
      }),
    [query],
  );

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const onUpdateItem = async (dto: UpdateItemDto) => {
    if (!selectedItem) return;
    await itemUpdate(selectedItem.id, dto);
    await refetch();
  };

  const onDeleteItem = async () => {
    if (!selectedItem) return;
    await itemSoftDelete(selectedItem.id);
    await refetch();
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <SortSearchComponent
        fields={Object.values(ItemSortField)}
      />
      <DataStateComponent
        data={paginatedData}
        error={error}
        loading={loading}
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
              pageCount={paginatedData.pageCount}
              onChange={handlePageChange}
            />
          </>
        }
      </DataStateComponent>

      <UpdateItemModal
        open={activeModal === 'updateItem'}
        closeModal={closeModal}
        onUpdateItem={onUpdateItem}
        selectedItem={selectedItem} />
      <ConfirmDeleteModal
        open={activeModal === 'deleteItem'}
        closeModal={closeModal}
        onDelete={onDeleteItem}
      />

    </Box>
  );
};

export default ItemsPage;