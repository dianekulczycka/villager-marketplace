import {useAuth} from '../../../store/helpers/useAuth.ts';
import React, {type FC, useEffect} from 'react';
import type {UpdateItem} from '../../../models/item/UpdateItem.ts';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {updateItemSchema} from '../../../validation/item.schema.ts';
import {Backdrop, Box, Button, Modal, TextField, Typography} from '@mui/material';
import type {ItemView} from '../../../models/item/ItemView.ts';
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    open: boolean;
    closeModal: () => void;
    updateItem: (dto: UpdateItem) => Promise<void>;
    selectedItem: ItemView | null;
}

interface UpdateItemForm {
    price: number;
    count: number;
    description?: string;
}

const UpdateItemModal: FC<Props> = ({
                                        open,
                                        closeModal,
                                        updateItem,
                                        selectedItem,
                                    }) => {
    const {user} = useAuth();
    const {fetch, isMutating} = useMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<UpdateItemForm>({
        resolver: zodResolver(updateItemSchema),
    });

    useEffect(() => {
        if (open && selectedItem) {
            reset({
                price: selectedItem.price,
                count: selectedItem.count,
                description: '',
            });
        }
    }, [open, selectedItem, reset]);

    const onClose = () => {
        reset();
        closeModal();
    };

    const handleUpdateItem: SubmitHandler<UpdateItemForm> = data => {
        return fetch(
            () => updateItem({
                ...data,
                description: data.description?.trim() || undefined,
            }),
            "Item updated",
            onClose,
        );
    };

    if (isMutating) return <PreloaderComponent/>
    if (!selectedItem || !user) return null;

    return (
        <Modal
            disableScrollLock
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.1)',
                    },
                },
            }}
            open={open}
            onClose={closeModal}
        >
            <Box
                component="form"
                onSubmit={handleSubmit(handleUpdateItem)}
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
                    update post
                </Typography>

                <TextField
                    label="price"
                    type="number"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    {...register('price', {
                        setValueAs: (v) =>
                            v === '' ? undefined : Number(v),
                    })}
                />

                <TextField
                    label="count"
                    type="number"
                    error={!!errors.count}
                    helperText={errors.count?.message}
                    {...register('count', {
                        setValueAs: (v) =>
                            v === '' ? undefined : Number(v),
                    })}
                />

                <TextField
                    label="description"
                    multiline
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    {...register('description')}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    send
                </Button>

                <Button
                    onClick={closeModal}
                    sx={{textTransform: 'none'}}
                >
                    cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default UpdateItemModal;