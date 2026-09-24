import {type FC} from 'react';
import {useForm} from 'react-hook-form';
import {Link} from 'react-router';
import {zodResolver} from '@hookform/resolvers/zod';
import {alpha, Box, Button, TextField, Typography} from '@mui/material';
import type {LoginReq} from '../../../models/auth/LoginReq.ts';
import {loginSchema} from '../../../validation/auth.schema.ts';
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    handleLogin: (data: LoginReq) => Promise<void>;
    openModal: () => void;
    isMutating: boolean;
}

const LoginForm: FC<Props> = ({openModal, handleLogin, isMutating}) => {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginReq>({
        resolver: zodResolver(loginSchema),
    });

    if (isMutating) return <PreloaderComponent/>

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
                onSubmit={handleSubmit(handleLogin)}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
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

                <Button
                    variant="contained"
                    color="secondary"
                    type="submit"
                >
                    Log in
                </Button>
            </form>

            <Typography variant="caption">
                Don't have an account?{' '}
                <Link to="/auth/register">Register</Link>
            </Typography>

            <Button
                variant="outlined"
                sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 3,
                }}
                onClick={openModal}
            >
                Restore account
            </Button>
        </Box>
    );
};

export default LoginForm;