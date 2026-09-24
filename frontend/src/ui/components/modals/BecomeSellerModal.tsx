import React, {type FC} from 'react';
import {Backdrop, Box, Button, MenuItem, Modal, TextField, Typography} from '@mui/material';
import {SellerTypes} from '../../../models/enums/SellerType.ts';
import {type SubmitHandler, useForm} from 'react-hook-form';
import type {BecomeSellerReq} from '../../../models/user/BecomeSellerReq.ts';
import {zodResolver} from '@hookform/resolvers/zod';
import {becomeSellerSchema} from '../../../validation/user.schema.ts';
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    open: boolean;
    closeModal: () => void;
    onBecomeSeller: SubmitHandler<BecomeSellerReq>;
}

const BecomeSellerModal: FC<Props> = ({open, closeModal, onBecomeSeller}) => {
    const {fetch, isMutating} = useMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<BecomeSellerReq>({
        resolver: zodResolver(becomeSellerSchema),
    });

    const onClose = () => {
        reset();
        closeModal();
    };

    const handleBecomeSeller = (
        data: BecomeSellerReq,
    ): Promise<void> => {
        return fetch(
            () => onBecomeSeller(data),
            "You are now a seller",
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
                onSubmit={handleSubmit(handleBecomeSeller)}
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
                <Typography variant="h6" fontWeight={600}>
                    become seller
                </Typography>

                <TextField
                    select
                    label="seller type"
                    error={!!errors.sellerType}
                    helperText={errors.sellerType?.message}
                    {...register('sellerType')}
                    fullWidth
                >
                    {Object.values(SellerTypes).map((i) => (
                        <MenuItem key={i} value={i}>
                            {i}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{textTransform: 'none', fontWeight: 500}}
                >
                    send
                </Button>

                <Button onClick={closeModal} sx={{textTransform: 'none'}}>
                    cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default BecomeSellerModal;