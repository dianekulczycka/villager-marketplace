import { type SubmitHandler, useForm } from 'react-hook-form';
import { type FC, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Backdrop, Box, Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import ErrorComponent from '../error/ErrorComponent.tsx';
import type { RecoverReq } from '../../../models/auth/RecoverReq.ts';
import { recoverySchema } from '../../../validation/auth.schema.ts';

interface Props {
  open: boolean;
  closeModal: () => void;
  onRecover: SubmitHandler<RecoverReq>;
}

const RecoverModal: FC<Props> = ({ open, closeModal, onRecover }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  }
    = useForm<RecoverReq>({ resolver: zodResolver(recoverySchema) });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit: SubmitHandler<RecoverReq> = async (data) => {
    try {
      await onRecover(data);
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <Modal slots={{ backdrop: Backdrop }}
           slotProps={{
             backdrop: {
               sx: {
                 bgcolor: 'rgba(0,0,0,0.1)',
               },
             },
           }}
           open={open}
           onClose={closeModal}>
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
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          send
        </Button>

        <Button onClick={closeModal} sx={{ textTransform: 'none' }}>
          cancel
        </Button>

        {error && <ErrorComponent error={error} />}

      </Box>
    </Modal>
  );
};

export default RecoverModal;