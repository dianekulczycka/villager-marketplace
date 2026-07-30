import type {PaginationRes} from "../../models/pagiantion/PaginationRes.ts";
import {api} from "../api.config.ts";
import {endpoints} from "../api.endpoints.ts";
import type {OrderRequestDto} from "../../models/order/OrderRequestDto.ts";
import type {OrderResponseDto} from "../../models/order/OrderResponseDto.ts";
import type {OrderQueryParams} from "../../models/order/OrderQueryParams.ts";

export const order = async (itemPublicId: string, dto: OrderRequestDto): Promise<OrderResponseDto> => {
    return api.post(endpoints.orders.order(itemPublicId), dto);
};

export const getMyBuyingOrders = async (
    params?: OrderQueryParams,
): Promise<PaginationRes<OrderResponseDto>> => {
    const {data} = await api.get(endpoints.orders.buying, {params});
    return data;
};

export const getMySellingOrders = async (
    params?: OrderQueryParams,
): Promise<PaginationRes<OrderResponseDto>> => {
    const {data} = await api.get(endpoints.orders.selling, {params});
    return data;
};

export const confirm = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.orders.confirm(publicId));
};

export const reject = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.orders.reject(publicId));
};