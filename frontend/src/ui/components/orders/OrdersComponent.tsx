import {type FC} from 'react';
import {Box} from "@mui/material";
import type {OrderResponseDto} from "../../../models/order/OrderResponseDto.ts";
import OrderCard from "./OrderCard.tsx";

interface Props {
    orders: OrderResponseDto[];
    confirmOrder: (id: number) => Promise<void>;
    rejectOrder: (id: number) => Promise<void>;
}

const OrdersComponent: FC<Props> = ({orders, rejectOrder, confirmOrder}) => {
    return (
        <Box
            sx={{
                width: '66%',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 3,
            }}>
            {
                orders.map((order) => (
                    <OrderCard
                        confirmOrder={confirmOrder}
                        rejectOrder={rejectOrder}
                        key={order.id}
                        order={order}
                    />))
            }
        </Box>
    );
};

export default OrdersComponent;