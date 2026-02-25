import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('Invalid email format'),

  password: z
    .string()
    .regex(
      /^(?=.*\d)[A-Za-z\d]{6,20}$/,
      'Invalid password format'
    ),
});

export const registerSchema = z.object({
  email: z
    .email('Invalid email format'),

  password: z
    .string()
    .regex(
      /^(?=.*\d)[A-Za-z\d]{6,20}$/,
      'Password must be 6-20 chars, contain Latin letters only, and include AT LEAST one number'
    ),

  username: z
    .string()
    .regex(
      /^[A-Za-z0-9\s]{2,}$/,
      'Name must be gt 2 chars and contain Latin letters only'
    ),
});
