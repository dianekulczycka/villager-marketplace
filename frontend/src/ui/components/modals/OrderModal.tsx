import React, {type FC} from "react";
import {Backdrop, Box, Button, Modal, TextField} from "@mui/material";
import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {OrderReq} from "../../../models/order/OrderReq.ts";
import {orderSchema} from "../../../validation/order.schema.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    open: boolean;
    closeModal: () => void;
    order: (data: OrderReq) => Promise<void>;
    itemCount: number;
}

const OrderModal: FC<Props> = ({open, closeModal, order, itemCount}) => {
    const {fetch, isMutating} = useMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<OrderReq>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            amount: 1,
        },
    });

    const onClose = () => {
        reset();
        closeModal();
    };

    const handleOrder: SubmitHandler<OrderReq> = data => {
        if (data.amount > itemCount) {
            showError(new Error(`Only ${itemCount} available`));
            return;
        }

        return fetch(
            () => order(data),
            "Order created",
            onClose,
        );
    };


    if (isMutating) return <PreloaderComponent/>

    return (
        <Modal disableScrollLock
               slots={{backdrop: Backdrop}}
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
                onSubmit={handleSubmit(handleOrder)}
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
            </Box>
        </Modal>
    );
};

export default OrderModal;