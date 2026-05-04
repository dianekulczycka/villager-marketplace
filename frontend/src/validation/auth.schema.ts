import {z} from 'zod';
import {hasSwearWords} from './swear-words.filter.ts';

export const loginSchema = z.object({
    email: z
        .email('Invalid email format'),

    password: z
        .string()
        .min(6, "Invalid password format")
});


export const registerSchema = z
    .object({
        email: z.email('Invalid email format'),

        password: z
            .string()
            .regex(/^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,20}$/, {
                message:
                    'Password must be 6-20 chars and include one number and one letter',
            }),

        repeatPassword: z.string().min(1, 'Repeat password'),

        username: z
            .string()
            .regex(/^[A-Za-z0-9\s]{2,}$/, 'Name must be gt 2 chars')
            .refine((v) => !hasSwearWords(v), {
                message: 'Bad language used',
            }),
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: "Passwords don't match",
        path: ['repeatPassword'],
    });

export const recoverySchema = z.object(
    {
        actionType: z.enum(['UNBAN', 'UNDELETE']),
        email: z
            .email('Invalid email format'),
        text: z
            .string()
            .refine((v) => !hasSwearWords(v), {
                message: 'Bad language used',
            }),
    },
);