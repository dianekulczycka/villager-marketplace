import { z } from 'zod';

export const orderSchema = z.object({
    amount: z.number().min(1).max(64),
});