import type {OrderStatus} from "../enums/OrderStatus.ts";
import type {UserPublicView} from "../user/UserPublicView.ts";
import type {ItemView} from "../item/ItemView.ts";

export interface OrderView {
    publicId: string;
    amount: number;
    status: OrderStatus;
    seller: Pick<UserPublicView, "publicId" | "username">
    buyer: Pick<UserPublicView, "publicId" | "username">
    item: Pick<ItemView, "publicId" | "name">
    createdAt: string;
}