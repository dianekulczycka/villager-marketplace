import type {CreateItemDto} from "../../models/item/CreateItemDto.ts";
import type {UpdateItemDto} from "../../models/item/UpdateItemDto.ts";
import {create, softDelete, update} from "../../services/fetch/item.service.ts";
import type {OrderRequestDto} from "../../models/order/OrderRequestDto.ts";
import {order} from "../../services/fetch/order.service.ts";

export const useItemActions = () => {
    const createItem = async (data: CreateItemDto) => await create({
        ...data,
        description: data.description?.trim() || undefined,
    });
    const updateItem = async (publicId: string, dto: UpdateItemDto) => await update(publicId, dto);
    const deleteItem = async (publicId: string, password: string) => await softDelete(publicId, password);
    const orderItem = (publicId: string, dto: OrderRequestDto) => order(publicId, dto);

    return {createItem, updateItem, deleteItem, orderItem};
};