import {type FC} from 'react';
import {Backdrop, Box, Button, Modal, TextField, Typography} from '@mui/material';
import {useFormSubmit} from "../../../hooks/shared/useFormSubmit.ts";
import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {passwordSchema} from "../../../validation/auth.schema.ts";

interface Props {
    open: boolean;
    closeModal: () => void;
    deleteEntity: (password: string) => Promise<void>;
}

const ConfirmDeleteModal: FC<Props> = ({
                                           open,
                                           closeModal,
                                           deleteEntity,
                                       }) => {
    const {submit} = useFormSubmit();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<{ password: string }>({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit: SubmitHandler<{ password: string }> = (data) => {
        reset();
        closeModal();
        void submit(() => deleteEntity(data.password));
    };

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

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
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
                </form>
            </Box>
        </Modal>
    );
};

export default ConfirmDeleteModal;