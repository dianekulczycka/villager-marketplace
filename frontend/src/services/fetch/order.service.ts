import type {PaginationView} from "../../models/pagiantion/PaginationView.ts";
import {api} from "../api.config.ts";
import {endpoints} from "../api.endpoints.ts";
import type {OrderRequestDto} from "../../models/order/OrderRequestDto.ts";
import type {OrderView} from "../../models/order/OrderView.ts";
import type {OrderQueryParams} from "../../models/order/OrderQueryParams.ts";

export const order = async (itemPublicId: string, dto: OrderRequestDto): Promise<OrderView> => {
    return api.post(endpoints.orders.order(itemPublicId), dto);
};

export const getMyBuyingOrders = async (
    params?: OrderQueryParams,
): Promise<PaginationView<OrderView>> => {
    const {data} = await api.get(endpoints.orders.buying, {params});
    return data;
};

export const getMySellingOrders = async (
    params?: OrderQueryParams,
): Promise<PaginationView<OrderView>> => {
    const {data} = await api.get(endpoints.orders.selling, {params});
    return data;
};

export const confirm = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.orders.confirm(publicId));
};

export const reject = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.orders.reject(publicId));
};