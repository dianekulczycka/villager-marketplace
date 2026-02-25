import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, TextField, Typography } from '@mui/material';
import type { RegisterReq } from '../../../../models/auth/RegisterReq.ts';
import { registerSchema } from '../../../../validation/auth.schema.ts';
import { signIn } from '../../../../services/fetch/auth.service.ts';
import ErrorComponent from '../../error/ErrorComponent.tsx';
import { routes } from '../../../../routes/routes.ts';

const RegisterForm: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterReq>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterReq) => {
    try {
      await signIn(data);
      navigate(routes.items.root);
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
      <Typography variant="h5"> Register </Typography>
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