import {type FC} from 'react';
import {Box, Card, CardContent, Chip, Stack, Typography} from "@mui/material";
import type {OrderResponseDto} from "../../../models/order/OrderResponseDto.ts";
import {useAuth} from "../../../store/helpers/useAuth.ts";
import OrderControllers from "../buttons/OrderControllers.tsx";

interface Props {
    order: OrderResponseDto;
    confirmOrder: (publicId: string) => Promise<void>;
    rejectOrder: (publicId: string) => Promise<void>;
}

const OrderCard: FC<Props> = ({order, confirmOrder, rejectOrder}) => {
    const {user: loggedUser} = useAuth();
    const isOwner = loggedUser?.publicId === order.seller.publicId;

    return (
        <Card
            sx={{
                borderRadius: 3,
                transition: '0.2s',
                height: '100%',
                border: '1px solid #e5e7eb',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                },
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography fontWeight={700}>
                        Order {order.publicId}
                    </Typography>

                    <Chip
                        label={order.status}
                        color={
                            order.status === 'CONFIRMED'
                                ? 'success'
                                : order.status === 'REJECTED'
                                    ? 'error'
                                    : 'warning'
                        }
                        size="small"
                    />
                </Box>

                <Stack spacing={0.5}>
                    <Typography variant="body2">
                        Item ID: {order.publicId}
                    </Typography>

                    <Typography variant="body2">
                        Amount: {order.amount}
                    </Typography>

                    <Typography variant="body2">
                        Buyer ID: {order.buyer.publicId}
                    </Typography>

                    <Typography variant="body2">
                        Seller ID: {order.seller.publicId}
                    </Typography>
                </Stack>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {new Date(order.createdAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </Typography>

                {isOwner && order.status === 'PENDING' && (
                    <OrderControllers
                        orderId={order.publicId}
                        confirmOrder={confirmOrder}
                        rejectOrder={rejectOrder}
                    />
                )}
            </CardContent>
        </Card>
    );
}

export default OrderCard;