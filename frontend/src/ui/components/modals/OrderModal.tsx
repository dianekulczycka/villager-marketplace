import {type FC, useState} from "react";
import {Backdrop, Box, Button, Modal, TextField} from "@mui/material";
import ErrorComponent from "../error/ErrorComponent.tsx";
import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {OrderRequestDto} from "../../../models/order/OrderRequestDto.ts";
import {orderSchema} from "../../../validation/order.schema.ts";

interface Props {
    open: boolean;
    closeModal: () => void;
    order: (data: OrderRequestDto) => Promise<void>;
    itemCount: number;
}

const OrderModal: FC<Props> = ({open, closeModal, order, itemCount}) => {
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    }
        = useForm<OrderRequestDto>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            amount: 1
        },
    });

    const onClose = () => {
        setError(null);
        reset();
        closeModal();
    };

    const onSubmit: SubmitHandler<OrderRequestDto> = async (data) => {
        if (data.amount > itemCount) {
            setError(`Only ${itemCount} available`);
            return;
        }

        try {
            await order(data);
            reset();
            onClose();
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }
    };

    return (
        <Modal slots={{backdrop: Backdrop}}
               slotProps={{
                   backdrop: {
                       sx: {
                           bgcolor: 'rgba(0,0,0,0.1)',
                       },
                   },
               }}
               open={open}
               onClose={onClose}>
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 360,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <TextField
                    label="amount"
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    {...register('amount', {valueAsNumber: true})}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{textTransform: 'none', fontWeight: 500}}
                >
                    buy
                </Button>
                <Button onClick={closeModal} sx={{textTransform: 'none'}}>
                    cancel
                </Button>
                {error && <ErrorComponent error={error}/>}
            </Box>
        </Modal>
    );
};

export default OrderModal;