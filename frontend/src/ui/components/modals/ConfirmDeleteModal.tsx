import React, {type FC} from 'react';
import {Backdrop, Box, Button, Modal, TextField, Typography} from '@mui/material';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {passwordSchema} from "../../../validation/auth.schema.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    open: boolean;
    closeModal: () => void;
    deleteEntity: (password: string) => Promise<void>;
}

interface FormData {
    password: string;
}

const ConfirmDeleteModal: FC<Props> = ({
                                           open,
                                           closeModal,
                                           deleteEntity,
                                       }) => {
    const {fetch, isMutating} = useMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<FormData>({
        resolver: zodResolver(passwordSchema),
    });

    const onClose = () => {
        reset();
        closeModal();
    };

    const handleConfirmDelete = (
        data: FormData,
    ): Promise<void> => {
        return fetch(
            async () => deleteEntity(data.password),
            "Deletion successful",
            onClose,
        );
    };

    if (isMutating) return <PreloaderComponent/>

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
                onSubmit={handleSubmit(handleConfirmDelete)}
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
                    enter your password to continue
                </Typography>

                <TextField
                    label="password"
                    type="password"
                    fullWidth
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
                    delete
                </Button>

                <Button
                    type="button"
                    onClick={closeModal}
                    sx={{textTransform: 'none'}}
                >
                    cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default ConfirmDeleteModal;