import { type FC, useEffect, useState } from 'react';
import { Box, Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { SellerTypes } from '../../../models/enums/SellerType.ts';
import ErrorComponent from '../error/ErrorComponent.tsx';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { becomeSellerSchema } from '../../../validation/user.schema.ts';

interface Props {
  open: boolean;
  closeModal: () => void;
  onBecomeSeller: SubmitHandler<BecomeSellerDto>;
}

const BecomeSellerModal: FC<Props> = ({ open, closeModal, onBecomeSeller }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  }
    = useForm<BecomeSellerDto>({ resolver: zodResolver(becomeSellerSchema) });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit: SubmitHandler<BecomeSellerDto> = async (data) => {
    try {
      await onBecomeSeller(data);
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <Modal open={open} onClose={closeModal}>
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
          become seller
        </Typography>

        <TextField
          select
          label="seller type"
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

export default BecomeSellerModal;