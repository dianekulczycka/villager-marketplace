import {type FC, useState} from "react";
import {NumberParam, StringParam, useQueryParams, withDefault} from "use-query-params";
import {useQuery} from "@tanstack/react-query";
import {Box, MenuItem, Select} from "@mui/material";
import SortSearchComponent from "../../components/shared/SortSearchComponent.tsx";
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import DataStateComponent from "../../components/shared/DataStateComponent.tsx";
import {PaginationComponent} from "../../components/shared/PaginationComponent.tsx";
import {OrderSortField} from "../../../models/enums/OrderSortField.ts";
import {confirm, getMyBuyingOrders, getMySellingOrders, reject} from "../../../services/fetch/order.service.ts";
import OrdersComponent from "../../components/orders/OrdersComponent.tsx";
import {useAuth} from "../../../store/helpers/useAuth.ts";
import {useMutationHandler} from "../../../helpers/handleMutation.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";

type OrderMode = "SELL" | "BUY";

const OrdersPage: FC = () => {
    const {user: loggedUser} = useAuth();

    const [displayMode, setDisplayMode] = useState<OrderMode>("BUY");

    const searchFields = displayMode === "BUY" ? Object.values(OrderSortField).filter(
        (field) => field !== OrderSortField.BUYER_ID,
    ) : Object.values(OrderSortField).filter(
        (field) => field !== OrderSortField.SELLER_ID,
    );

    const [query, setQuery] = useQueryParams({
        page: withDefault(NumberParam, 1),
        perPage: withDefault(NumberParam, 12),
        sortBy: StringParam,
        sortDirection: StringParam,
        search: StringParam,
    });

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: [
            'orders',
            displayMode,
            query.page,
            query.perPage,
            query.sortBy,
            query.sortDirection,
            query.search,
        ],
        queryFn: () =>
            displayMode === "BUY" ?
                getMyBuyingOrders({
                    page: query.page,
                    perPage: query.perPage,
                    sortBy: query.sortBy as OrderSortField | undefined,
                    sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                    search: query.search ?? undefined,
                }) :
                getMySellingOrders({
                    page: query.page,
                    perPage: query.perPage,
                    sortBy: query.sortBy as OrderSortField | undefined,
                    sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                    search: query.search ?? undefined,
                }),
    });

    const {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    const handlePageChange = (newPage: number) => {
        setQuery({page: newPage});
    };

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