import { z } from 'zod';
import { hasSwearWords } from './swear-words.filter.ts';

export const loginSchema = z.object({
  email: z
    .email('Invalid email format'),

  password: z
    .string()
});

export const registerSchema = z.object({
  email: z
    .email('Invalid email format'),

  password: z
    .string()
    .regex(
      /^(?=.*\d)[A-Za-z\d]{6,20}$/,
      'Password must be 6-20 chars, contain Latin letters only, and include AT LEAST one number',
    ),

  username: z
    .string()
    .regex(
      /^[A-Za-z0-9\s]{2,}$/,
      'Name must be gt 2 chars and contain Latin letters only',
    )
    .refine((v) => !hasSwearWords(v), {
      message: 'Bad language used',
    }),
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