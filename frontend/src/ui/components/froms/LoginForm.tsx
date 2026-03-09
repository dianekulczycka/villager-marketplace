import { type FC, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, TextField, Typography } from '@mui/material';
import type { LoginReq } from '../../../models/auth/LoginReq.ts';
import { loginSchema } from '../../../validation/auth.schema.ts';
import ErrorComponent from '../error/ErrorComponent.tsx';
import ActionButton from '../buttons/ActionButton.tsx';

interface Props {
  onLogin: (data: LoginReq) => Promise<void>;
  openModal: () => void;
}

const LoginForm: FC<Props> = ({ onLogin, openModal }) => {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginReq>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginReq> = async (data) => {
    try {
      await onLogin(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <Box sx={(theme) => ({
      p: 4,
      borderRadius: 3,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      backdropFilter: 'blur(8px)',
      boxShadow: theme.shadows[6],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    })}>
      <Typography variant="h5"> Log in </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
        <TextField
          label="Email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button variant="outlined" type="submit">Log in</Button>
      </form>

      <Typography variant="caption"> Don't have an account? <Link to="/auth/register"> Register </Link></Typography>
      <ActionButton action="Restore" actionHandler={openModal} />

      {error && <ErrorComponent error={error} />}

    </Box>
  );
};

export default LoginForm;