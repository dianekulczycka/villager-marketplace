import { z } from 'zod';
import { SellerTypes } from '../models/enums/SellerType.ts';
import { hasSwearWords } from './swear-words.filter.ts';

export const becomeSellerSchema = z.object({
  sellerType: z.enum(SellerTypes),
});

export const updateUserSchema = z.object(
  {
    username: z
      .string()
      .regex(
        /^[A-Za-z0-9\s]{2,}$/,
        'Name must be gt 2 chars and contain Latin letters only',
      )
      .refine((v) => !hasSwearWords(v), {
        message: 'Bad language used',
      }),
  },
);