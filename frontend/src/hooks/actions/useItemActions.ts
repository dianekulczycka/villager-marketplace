import type {CreateItem} from "../../models/item/CreateItem.ts";
import type {UpdateItem} from "../../models/item/UpdateItem.ts";
import {create, softDelete, update} from "../../services/fetch/item.service.ts";
import type {OrderReq} from "../../models/order/OrderReq.ts";
import {order} from "../../services/fetch/order.service.ts";

export const useItemActions = () => {
    const createItem = async (data: CreateItem) => await create({
        ...data,
        description: data.description?.trim() || undefined,
    });
    const updateItem = async (publicId: string, dto: UpdateItem) => await update(publicId, dto);
    const deleteItem = async (publicId: string, password: string) => await softDelete(publicId, password);
    const orderItem = (publicId: string, dto: OrderReq) => order(publicId, dto);

    return {createItem, updateItem, deleteItem, orderItem};
};