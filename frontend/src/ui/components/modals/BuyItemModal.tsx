import {type FC, useState} from "react";
import {Backdrop, Box, Button, Modal, TextField} from "@mui/material";
import ErrorComponent from "../error/ErrorComponent.tsx";
import {type SubmitHandler, useForm} from "react-hook-form";
import type {BuyItemDto} from "../../../models/item/BuyItemDto.ts";
import {buyItemSchema} from "../../../validation/item.schema.ts";
import {zodResolver} from "@hookform/resolvers/zod";

interface Props {
    open: boolean;
    closeModal: () => void;
    onBuyItem: (data: BuyItemDto) => Promise<void>;
    itemCount: number;
}

const BuyItemModal: FC<Props> = ({open, closeModal, onBuyItem, itemCount}) => {
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    }
        = useForm<BuyItemDto>({
        resolver: zodResolver(buyItemSchema),
        defaultValues: {
            amount: 1
        },
    });

    const onClose = () => {
        setError(null);
        reset();
        closeModal();
    };

    const onSubmit: SubmitHandler<BuyItemDto> = async (data) => {
        if (data.amount > itemCount) {
            setError(`Only ${itemCount} available`);
            return;
        }

        try {
            await onBuyItem(data);
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

export default BuyItemModal;