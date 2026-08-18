import {type FC, useState} from "react";
import {Box, MenuItem, Select} from "@mui/material";
import SortSearchComponent from "../../components/shared/SortSearchComponent.tsx";
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import DataStateComponent from "../../components/shared/DataStateComponent.tsx";
import {PaginationComponent} from "../../components/shared/PaginationComponent.tsx";
import {OrderSortField} from "../../../models/enums/OrderSortField.ts";
import {confirm, getMyBuyingOrders, getMySellingOrders, reject} from "../../../services/fetch/order.service.ts";
import OrdersComponent from "../../components/orders/OrdersComponent.tsx";
import {useAuth} from "../../../store/helpers/useAuth.ts";
import {useMutationHandler} from "../../../hooks/useMutationHandler.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {usePaginatedQuery} from "../../../hooks/usePaginatedQuery.ts";
import type {PaginationRes} from "../../../models/pagiantion/PaginationRes.ts";
import type {OrderResponseDto} from "../../../models/order/OrderResponseDto.ts";

type OrderMode = "SELL" | "BUY";

const OrdersPage: FC = () => {
    const {user: loggedUser} = useAuth();

    const [displayMode, setDisplayMode] = useState<OrderMode>("BUY");

    const searchFields = displayMode === "BUY" ? Object.values(OrderSortField).filter(
        (field) => field !== OrderSortField.BUYER_ID,
    ) : Object.values(OrderSortField).filter(
        (field) => field !== OrderSortField.SELLER_ID,
    );

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationRes<OrderResponseDto>>(
        'orders',
        (query) => {
            const params = {
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as OrderSortField | undefined,
                sortDirection:
                    query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            };
            return displayMode === 'BUY'
                ? getMyBuyingOrders(params)
                : getMySellingOrders(params);
        },
        [displayMode]
    );

    const {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    const confirmOrder = async (publicId: string) => {
        await handleMutation(
            async () => {
                await confirm(publicId);
            },
            'Order confirmed!',
        );
    };

    const rejectOrder = async (publicId: string) => {
        await handleMutation(
            async () => {
                await reject(publicId);
            },
            'Order rejected!',
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: "75%",
                justifyContent: "center"
            }}>
                {
                    loggedUser?.role === "SELLER" && <Select
                        sx={{backgroundColor: '#ffffff'}}
                        size="small"
                        value={displayMode}
                        onChange={(e) => setDisplayMode(e.target.value as 'BUY' | 'SELL')}
                    >
                        <MenuItem value="BUY">
                            Buying
                        </MenuItem>
                        <MenuItem value="SELL">
                            Selling
                        </MenuItem>

                    </Select>
                }

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
                isEmpty={data?.data.length === 0}>
                {data &&
                    <>
                        <OrdersComponent
                            confirmOrder={confirmOrder}
                            rejectOrder={rejectOrder}
                            orders={data.data}
                        />
                        <PaginationComponent
                            page={query.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                }
            </DataStateComponent>

            <InfoSnackbar
                open={openSnackbar}
                setOpen={setOpenSnackbar}
                text={snackbarText}
                status={snackbarStatus}
            />
        </Box>
    );
};

export default OrdersPage;