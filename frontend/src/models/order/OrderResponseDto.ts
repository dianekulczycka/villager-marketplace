import type {OrderStatus} from "../enums/OrderStatus.ts";

export interface OrderResponseDto {
    publicId: string;
    amount: number;
    status: OrderStatus;
    seller: { publicId: string };
    buyer: { publicId: string };
    item: { publicId: string };
    createdAt: Date;
}