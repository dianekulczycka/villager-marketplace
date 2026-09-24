import {type FC} from 'react';
import {useForm} from 'react-hook-form';
import {Link} from 'react-router';
import {zodResolver} from '@hookform/resolvers/zod';
import {alpha, Box, Button, TextField, Typography} from '@mui/material';
import type {RegisterReq} from '../../../models/auth/RegisterReq.ts';
import {registerSchema} from '../../../validation/auth.schema.ts';
import PreloaderComponent from "../shared/PreloaderComponent.tsx";

interface Props {
    handleRegister: (data: RegisterReq) => Promise<void>;
    isMutating: boolean;
}

type RegisterFormData = RegisterReq & {
    repeatPassword: string;
};

const RegisterForm: FC<Props> = ({handleRegister, isMutating}) => {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData): Promise<void> => {
        const registerData = Object.fromEntries(
            Object.entries(data).filter(([key]) => key !== 'repeatPassword'),
        ) as RegisterReq;
        return handleRegister(registerData);
    };

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
                    label="Username"
                    type="username"
                    fullWidth
                    {...register('username')}
                    error={!!errors.username}
                    helperText={errors.username?.message}
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
                    label="Repeat password"
                    type="password"
                    fullWidth
                    {...register('repeatPassword')}
                    error={!!errors.repeatPassword}
                    helperText={errors.repeatPassword?.message}
                />
                <Button variant="contained"
                        color="secondary" type="submit">Sign in</Button>
            </form>

            <Typography variant="caption"> Have an account? <Link to="/auth/login"> Log in </Link></Typography>
        </Box>
    );
};

export default RegisterForm;