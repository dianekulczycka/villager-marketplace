import type {OrderStatus} from "../enums/OrderStatus.ts";

export interface OrderResponseDto {
    id: number;
    amount: number;
    status: OrderStatus;
    buyerId: number;
    sellerId: number;
    itemId: number;
    createdAt: Date;
    uuid: string;
}