import {type FC} from 'react';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import {PaginationComponent} from '../../components/shared/PaginationComponent.tsx';
import {getAll} from '../../../services/fetch/item.service.ts';
import {ItemSortField} from '../../../models/enums/ItemSortField.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import {Box} from '@mui/material';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useItemActions} from "../../../hooks/actions/useItemActions.ts";
import type {UpdateItemDto} from "../../../models/item/UpdateItemDto.ts";
import {useModal} from "../../../hooks/shared/useModal.ts";
import {usePaginatedQuery} from "../../../hooks/shared/usePaginatedQuery.ts";
import type {PaginationView} from "../../../models/pagiantion/PaginationView.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";

const ItemsPage: FC = () => {
    const {
        activeModal,
        selected: selectedItem,
        openModal,
        closeModal,
    } = useModal<ItemAdminView>();

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationView<ItemAdminView>>(
        'items',
        query =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ItemSortField | undefined,
                sortDirection:
                    query.sortDirection as
                        | 'asc'
                        | 'desc'
                        | undefined,
                search: query.search ?? undefined,
                sellerId: query.sellerId ?? undefined,
            }),
    );

    const {fetch, isMutating, ...snackbar} = useMutation(refetch);

    const {updateItem, deleteItem} = useItemActions();

    const openUpdateItemModal = (item: ItemAdminView) =>
        openModal('updateItem', item);

    const openDeleteItemModal = (item: ItemAdminView) =>
        openModal('deleteItem', item);

    const handleUpdateItem = (dto: UpdateItemDto): Promise<void> => {
        if (!selectedItem) return Promise.resolve();

        return fetch(
            () => updateItem(selectedItem.publicId, dto),
            'Item updated!',
            closeModal,
        );
    };

    const handleDeleteItem = (): Promise<void> => {
        if (!selectedItem) return Promise.resolve();

        return fetch(
            () => deleteItem(selectedItem.publicId),
            'Item deleted!',
            closeModal,
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <SortSearchComponent
                query={query as QueryParams<ItemSortField>}
                setQuery={setQuery}
                fields={Object.values(ItemSortField)}
            />

            <DataStateComponent
                data={data}
                error={error}
                emptyMessage={"No items found"}
                loading={isLoading || isMutating}
                isEmpty={data?.data.length === 0}
            >
                {data && (
                    <>
                        <ItemsComponent
                            items={data.data}
                            openUpdateModal={openUpdateItemModal}
                            openDeleteModal={openDeleteItemModal}
                        />

                        <PaginationComponent
                            page={data.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </DataStateComponent>

            <UpdateItemModal
                open={activeModal === 'updateItem'}
                closeModal={closeModal}
                updateItem={handleUpdateItem}
                selectedItem={selectedItem}
            />

            <ConfirmDeleteModal
                open={activeModal === 'deleteItem'}
                closeModal={closeModal}
                deleteEntity={handleDeleteItem}
            />

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </Box>
    );
};

export default ItemsPage;