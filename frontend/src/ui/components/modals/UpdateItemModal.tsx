import { useAuth } from '../../../store/helpers/useAuth.ts';
import { type FC, useEffect, useMemo, useState } from 'react';
import type { UpdateItemDto } from '../../../models/item/UpdateItemDto.ts';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { ItemName } from '../../../models/enums/ItemName.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateItemSchema } from '../../../validation/item.schema.ts';
import { Backdrop, Box, Button, Modal, TextField, Typography } from '@mui/material';
import ErrorComponent from '../error/ErrorComponent.tsx';
import type { ItemView } from '../../../models/item/ItemView.ts';

interface Props {
  open: boolean;
  closeModal: () => void;
  onUpdateItem: (id: number, dto: UpdateItemDto) => Promise<void>;
  item: ItemView;
}

const UpdateItemModal: FC<Props> = ({ open, closeModal, onUpdateItem, item }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<UpdateItemDto>(() => ({
    name: item?.name as ItemName | undefined,
    price: item?.price,
    count: item?.count,
    description: '',
  }), [item]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  }
    = useForm<UpdateItemDto>({
    resolver: zodResolver(updateItemSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset, defaultValues]);


  const onSubmit: SubmitHandler<UpdateItemDto> = async (data) => {
    try {
      const payload = {
        ...data,
        description: data.description?.trim() || undefined,
      };
      await onUpdateItem(item.id, payload);
      reset();
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  if (!user) return null;

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
          update post
        </Typography>

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

export default UpdateItemModal;