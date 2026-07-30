import {type FC, useState} from 'react';
import ItemsComponent from '../../components/item/ItemsComponent.tsx';
import {PaginationComponent} from '../../components/shared/PaginationComponent.tsx';
import {NumberParam, StringParam, useQueryParams, withDefault} from 'use-query-params';
import {getAll, softDelete as itemSoftDelete, update as itemUpdate} from '../../../services/fetch/item.service.ts';
import {ItemSortField} from '../../../models/enums/ItemSortField.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import {Box} from '@mui/material';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import type {ActiveModal} from '../../../models/item/ActiveModal.ts';
import type {UpdateItemDto} from '../../../models/item/UpdateItemDto.ts';
import {createOpenModal} from '../../../helpers/createOpenModal.ts';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import {useQuery} from '@tanstack/react-query';
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import {useMutationHandler} from "../../../helpers/handleMutation.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";

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
        sellerId: StringParam,
    });

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'items',
            query.page,
            query.perPage,
            query.sortBy,
            query.sortDirection,
            query.search,
            query.sellerId
        ],
        queryFn: () =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ItemSortField | undefined,
                sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
                sellerId: query.sellerId ?? undefined,
            }),
    });

    const {
        isLoading: isUpdatingItem,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    const handlePageChange = (newPage: number) => {
        setQuery({page: newPage});
    };

    const updateItem = async (dto: UpdateItemDto) => {
        if (!selectedItem) return;
        await handleMutation(
            async () => {
                await itemUpdate(selectedItem.publicId, dto);
            }, 'Item updated');
    };

    const deleteItem = async () => {
        if (!selectedItem) return;
        await handleMutation(
            async () => {
                await itemSoftDelete(selectedItem.publicId);
            }, 'Item deleted');
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
                loading={isLoading || isUpdatingItem}
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
                updateItem={updateItem}
                selectedItem={selectedItem}
            />
            <ConfirmDeleteModal
                open={activeModal === 'deleteItem'}
                closeModal={closeModal}
                deleteEntity={deleteItem}
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