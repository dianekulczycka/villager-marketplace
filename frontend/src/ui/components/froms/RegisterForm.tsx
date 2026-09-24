import React, {type FC} from 'react';
import {useForm} from 'react-hook-form';
import {Link} from 'react-router';
import {zodResolver} from '@hookform/resolvers/zod';
import {alpha, Box, Button, TextField, Typography} from '@mui/material';
import type {RegisterReq} from '../../../models/auth/RegisterReq.ts';
import {registerSchema} from '../../../validation/auth.schema.ts';
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import PreloaderComponent from "../shared/PreloaderComponent.tsx";
import InfoSnackbar from "../shared/InfoSnackbar.tsx";

interface Props {
    onRegister: (data: RegisterReq) => Promise<void>;
}

const RegisterForm: FC<Props> = ({onRegister}) => {
    const {fetch, isMutating, ...snackbar} = useMutation();

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<RegisterReq & { repeatPassword: string }>({
        resolver: zodResolver(registerSchema),
    });

    const handleRegister = (
        data: RegisterReq,
    ): Promise<void> => {
        return fetch(
            () => {
                return onRegister(data);
            }
        );
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
                onSubmit={handleSubmit(handleRegister)}
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

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />

        </Box>
    );
};

export default RegisterForm;