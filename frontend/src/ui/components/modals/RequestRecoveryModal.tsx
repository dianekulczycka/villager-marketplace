import {useForm} from 'react-hook-form';
import {type FC} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Backdrop, Box, Button, MenuItem, Modal, TextField, Typography} from '@mui/material';
import type {RecoverReq} from '../../../models/auth/RecoverReq.ts';
import {recoverySchema} from '../../../validation/auth.schema.ts';
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    open: boolean;
    isMutating: boolean;
    closeModal: () => void;
    handleRequestRecovery: (data: RecoverReq) => Promise<void>;
}

const RequestRecoveryModal: FC<Props> = ({open, isMutating, closeModal, handleRequestRecovery}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<RecoverReq>({
        resolver: zodResolver(recoverySchema),
    });

    const onClose = () => {
        reset();
        closeModal();
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
                onSubmit={handleSubmit(handleRequestRecovery)}
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
                    recovery request
                </Typography>

                <TextField
                    select
                    label="action type"
                    {...register('actionType')}
                    fullWidth
                >
                    <MenuItem value="UNDELETE">undelete</MenuItem>
                    <MenuItem value="UNBAN">unban</MenuItem>
                </TextField>

                <TextField
                    label="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
                />

                <TextField
                    label="describe your request"
                    multiline
                    error={!!errors.text}
                    helperText={errors.text?.message}
                    {...register('text')}
                />

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

export default RequestRecoveryModal;