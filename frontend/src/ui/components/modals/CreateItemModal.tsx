import { type FC, useEffect, useState } from 'react';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItemSchema } from '../../../validation/item.schema.ts';
import { Backdrop, Box, Button, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { allowedItemsPerSeller } from '../../../models/enums/AllowedItemsPerSeller.ts';
import ErrorComponent from '../error/ErrorComponent.tsx';

interface Props {
  open: boolean;
  closeModal: () => void;
  onCreateItem: SubmitHandler<CreateItemDto>;
}

const CreateItemModal: FC<Props> = ({ open, closeModal, onCreateItem }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  }
    = useForm<CreateItemDto>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: undefined,
      price: undefined,
      count: undefined,
      description: '',
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit: SubmitHandler<CreateItemDto> = async (data) => {
    try {
      await onCreateItem(data);
      reset();
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  if (!user) return null;
  if (!user?.sellerType) return null;

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
          create post
        </Typography>

        <TextField
          select
          label="name"
          {...register('name')}
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
        >
          {Object.values(allowedItemsPerSeller[user.sellerType]).map((i) => (
            <MenuItem key={i} value={i}>
              {i.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="price"
          type="number"
          error={!!errors.price}
          helperText={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
        <TextField
          label="count"
          type="number"
          error={!!errors.count}
          helperText={errors.count?.message}
          {...register('count', { valueAsNumber: true })}
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

export default CreateItemModal;