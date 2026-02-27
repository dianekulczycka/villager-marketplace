import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, TextField, Typography } from '@mui/material';
import type { RegisterReq } from '../../../models/auth/RegisterReq.ts';
import { registerSchema } from '../../../validation/auth.schema.ts';
import ErrorComponent from '../error/ErrorComponent.tsx';

interface Props {
  onRegister: (data: RegisterReq) => Promise<void>;
  error: string | null;
}

const RegisterForm: FC<Props> = ({ onRegister, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterReq>({
    resolver: zodResolver(registerSchema),
  });

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
      <Typography variant="h5"> Register </Typography>
      <form
        onSubmit={handleSubmit(onRegister)}
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
        <TextField
          label="Username"
          type="username"
          fullWidth
          {...register('username')}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
        <Button variant="outlined" type="submit">Register</Button>
      </form>

      <Typography variant="caption"> Have an account? <Link to="/auth/login"> Log in </Link></Typography>

      {error && <ErrorComponent error={error} />}

    </Box>
  );
};

export default RegisterForm;