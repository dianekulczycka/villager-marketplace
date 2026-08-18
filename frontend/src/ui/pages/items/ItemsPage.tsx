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
import {useMutationHandler} from "../../../hooks/useMutationHandler.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useItemActions} from "../../../hooks/useItemActions.ts";
import type {UpdateItemDto} from "../../../models/item/UpdateItemDto.ts";
import {useModalState} from "../../../hooks/useModalState.ts";
import {usePaginatedQuery} from "../../../hooks/usePaginatedQuery.ts";
import type {PaginationRes} from "../../../models/pagiantion/PaginationRes.ts";

const ItemsPage: FC = () => {
    const {
        activeModal,
        selected: selectedItem,
        openModal,
        closeModal,
    } = useModalState<ItemAdminView>();
    const openUpdateItemModal = (item: ItemAdminView) =>
        openModal('updateItem', item);

    const openDeleteItemModal = (item: ItemAdminView) =>
        openModal('deleteItem', item);

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationRes<ItemAdminView>>(
        'items',
        (query) =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ItemSortField | undefined,
                sortDirection:
                    query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
                sellerId: query.sellerId ?? undefined,
            }),
    );

    const {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    const {updateItem, deleteItem} = useItemActions(handleMutation);

    const handleUpdateItem = async (dto: UpdateItemDto) => {
        if (!selectedItem) return;
        await updateItem(selectedItem.publicId, dto);
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        await deleteItem(selectedItem.publicId);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <SortSearchComponent
                query={query as QueryParams<ItemSortField>}
                setQuery={setQuery}
                fields={Object.values(ItemSortField)}
            />
            <DataStateComponent
                data={data}
                error={error}
                loading={isLoading || isMutating}
                isEmpty={data?.data.length === 0}>
                {data &&
                    <>
                        <ItemsComponent
                            items={data.data}
                            openUpdateModal={openUpdateItemModal}
                            openDeleteModal={openDeleteItemModal}
                        />
                        <PaginationComponent
                            page={query.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                }
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
                open={openSnackbar}
                setOpen={setOpenSnackbar}
                text={snackbarText}
                status={snackbarStatus}
            />

        </Box>
    );
};

export default ItemsPage;