import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha, Box, Button, TextField, Typography } from '@mui/material';
import { loginSchema } from '../../../../validation/auth.schema.ts';
import type { LoginReq } from '../../../../models/auth/LoginReq.ts';
import { useAuth } from '../../../../store/helpers/useAuth.ts';
import { login } from '../../../../services/fetch/auth.service.ts';
import { getMe } from '../../../../services/fetch/user.service.ts';
import ErrorComponent from '../../error/ErrorComponent.tsx';
import { routes } from '../../../../routes/routes.ts';

const LoginForm: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginReq>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginReq) => {
    try {
      await login(data);
      const me = await getMe();
      setUser(me);
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
      {error && <ErrorComponent error={error} />}
    </Box>
  );
};

export default LoginForm;