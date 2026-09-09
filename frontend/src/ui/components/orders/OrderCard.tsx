import {type FC} from 'react';
import {Box, Card, CardContent, Chip, IconButton, Link, Stack, Typography} from "@mui/material";
import type {OrderView} from "../../../models/order/OrderView.ts";
import {useAuth} from "../../../store/helpers/useAuth.ts";
import OrderControllers from "../buttons/OrderControllers.tsx";
import {Link as RouterLink} from "react-router";
import {routes} from "../../../routes/routes.ts";
import SendIcon from "@mui/icons-material/Send";

interface Props {
    order: OrderView;
    confirmOrder: (publicId: string) => Promise<void>;
    rejectOrder: (publicId: string) => Promise<void>;
}

const OrderCard: FC<Props> = ({
                                  order,
                                  confirmOrder,
                                  rejectOrder,
                              }) => {
    const {user: loggedUser} = useAuth();
    const isOwner = loggedUser?.publicId === order.seller.publicId;

    return (
        <Card
            sx={{
                borderRadius: 3,
                height: '100%',
                border: '1px solid #e5e7eb',
                transition: '0.2s',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                },
            }}
        >
            <CardContent sx={{p: 2.5}}>
                <Stack spacing={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            Order #{order.publicId}
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
                    <Stack spacing={1}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{width: 65}}
                            >
                                Item
                            </Typography>

                            <Link
                                component={RouterLink}
                                to={routes.items.buildById(order.item.publicId)}
                                underline="hover"
                                color="secondary"
                                fontWeight={600}
                            >
                                {order.item.name}
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{width: 65}}
                            >
                                {isOwner ? 'Buyer' : 'Seller'}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <Typography fontWeight={600}>
                                    {isOwner
                                        ? order.buyer.username
                                        : order.seller.username}
                                </Typography>

                                <IconButton
                                    component={RouterLink}
                                    color="secondary"
                                    to={
                                        isOwner
                                            ? routes.chats.buildById(order.buyer.publicId)
                                            : routes.chats.buildById(order.seller.publicId)
                                    }
                                    size="small"
                                >
                                    <SendIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{width: 65}}
                            >
                                Amount
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {order.amount}
                            </Typography>
                        </Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {new Date(order.createdAt).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </Typography>
                    </Stack>
                    {isOwner && order.status === 'PENDING' && (
                        <OrderControllers
                            orderId={order.publicId}
                            confirmOrder={confirmOrder}
                            rejectOrder={rejectOrder}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default OrderCard;