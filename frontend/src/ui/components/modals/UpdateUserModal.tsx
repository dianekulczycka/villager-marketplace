import { type FC, useEffect, useState } from 'react';
import type { UpdateUserDto } from '../../../models/user/UpdateUserDto.ts';
import type { UserSelfView } from '../../../models/user/UserSelfView.ts';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema } from '../../../validation/user.schema.ts';
import { Backdrop, Box, Button, Modal, TextField, Typography } from '@mui/material';
import ErrorComponent from '../error/ErrorComponent.tsx';


interface Props {
  open: boolean;
  closeModal: () => void;
  onUpdateUser: (dto: UpdateUserDto) => Promise<void>;
  selectedUser: UserSelfView | UserAdminView | null;
}

const UpdateUserModal: FC<Props> = ({ open, closeModal, onUpdateUser, selectedUser }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserDto>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (open && selectedUser) {
      reset({
        username: selectedUser.username,
      });
    }
  }, [open, selectedUser, reset]);

  if (!selectedUser) return null;

  const onSubmit: SubmitHandler<UpdateUserDto> = async (data) => {
    try {
      await onUpdateUser(data);
      reset();
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
          update user
        </Typography>

        <TextField
          label="username"
          multiline
          error={!!errors.username}
          helperText={errors.username?.message}
          {...register('username')}
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

export default UpdateUserModal;