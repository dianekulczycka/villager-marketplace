import type {FC} from "react";
import {Box, Button} from "@mui/material";

interface Props {
    confirmOrder: (publicId: string) => Promise<void>;
    rejectOrder: (publicId: string) => Promise<void>;
    orderId: string;
}

const OrderControllers: FC<Props> = ({
                                         confirmOrder,
                                         rejectOrder,
                                         orderId
                                     }) => {

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                mt: 1,
            }}
        >
            <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                onClick={() => confirmOrder(orderId)}
                sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                }}
            >
                CONFIRM
            </Button>

            <Button
                fullWidth
                variant="contained"
                color="error"
                size="small"
                onClick={() => rejectOrder(orderId)}
                sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                }}
            >
                REJECT
            </Button>
        </Box>
    );
};

export default OrderControllers;