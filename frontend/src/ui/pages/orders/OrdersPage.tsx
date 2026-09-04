import {type FC, useState} from "react";
import {Box, MenuItem, Select} from "@mui/material";
import SortSearchComponent from "../../components/shared/SortSearchComponent.tsx";
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import DataStateComponent from "../../components/shared/DataStateComponent.tsx";
import {PaginationComponent} from "../../components/shared/PaginationComponent.tsx";
import {OrderSortField} from "../../../models/enums/OrderSortField.ts";
import {getMyBuyingOrders, getMySellingOrders} from "../../../services/fetch/order.service.ts";
import OrdersComponent from "../../components/orders/OrdersComponent.tsx";
import {useAuth} from "../../../store/helpers/useAuth.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {usePaginatedQuery} from "../../../hooks/shared/usePaginatedQuery.ts";
import type {PaginationView} from "../../../models/pagiantion/PaginationView.ts";
import type {OrderView} from "../../../models/order/OrderView.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import {useOrderActions} from "../../../hooks/actions/useOrderActions.ts";

type OrderMode = "SELL" | "BUY";

const OrdersPage: FC = () => {
    const {user: loggedUser} = useAuth();
    const {confirmOrder, rejectOrder} = useOrderActions();

    const [displayMode, setDisplayMode] =
        useState<OrderMode>('BUY');

    const searchFields =
        displayMode === 'BUY'
            ? Object.values(OrderSortField).filter(
                field => field !== OrderSortField.BUYER_ID,
            )
            : Object.values(OrderSortField).filter(
                field => field !== OrderSortField.SELLER_ID,
            );

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationView<OrderView>>(
        'orders',
        query => {
            const params = {
                page: query.page,
                perPage: query.perPage,
                sortBy:
                    query.sortBy as
                        | OrderSortField
                        | undefined,
                sortDirection:
                    query.sortDirection as
                        | 'asc'
                        | 'desc'
                        | undefined,
                search: query.search ?? undefined,
            };

            return displayMode === 'BUY'
                ? getMyBuyingOrders(params)
                : getMySellingOrders(params);
        },
        [displayMode],
    );

    const {fetch, isMutating, ...snackbar} = useMutation(refetch);

    const handleConfirmOrder = (publicId: string): Promise<void> =>
        fetch(
            () => confirmOrder(publicId),
            'Order confirmed!',
        );

    const handleRejectOrder = (publicId: string): Promise<void> =>
        fetch(
            () => rejectOrder(publicId),
            'Order rejected!',
        );

    const handleDisplayModeChange = (
        mode: OrderMode,
    ) => {
        setDisplayMode(mode);
        setQuery({page: 1});
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '75%',
                    justifyContent: 'center',
                }}
            >
                {loggedUser?.role === 'SELLER' && (
                    <Select
                        sx={{backgroundColor: '#ffffff'}}
                        size="small"
                        value={displayMode}
                        onChange={e => handleDisplayModeChange(e.target.value as OrderMode)}
                    >
                        <MenuItem value="BUY">
                            Buying
                        </MenuItem>
                        <MenuItem value="SELL">
                            Selling
                        </MenuItem>
                    </Select>
                )}

                <SortSearchComponent
                    query={query as QueryParams<OrderSortField>}
                    setQuery={setQuery}
                    fields={searchFields}
                />
            </Box>

            <DataStateComponent
                data={data}
                error={error}
                loading={isLoading || isMutating}
                isEmpty={data?.data.length === 0}
            >
                {data && (
                    <>
                        <OrdersComponent
                            confirmOrder={handleConfirmOrder}
                            rejectOrder={handleRejectOrder}
                            orders={data.data}
                        />

                        <PaginationComponent
                            page={data.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </DataStateComponent>

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </Box>
    );
};

export default OrdersPage;