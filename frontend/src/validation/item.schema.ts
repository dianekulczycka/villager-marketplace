import { z } from 'zod';
import { ItemName } from '../models/enums/ItemName.ts';

export const createItemSchema = z.object({
  name: z.enum(ItemName, { message: "Invalid input" }),
  price: z.number().min(1).max(1_000_000),
  count: z.number().min(1).max(64),
  description: z.string().min(2).max(255).optional().or(z.literal('')),
});

export const updateItemSchema = z.object({
  price: z.number().min(1).max(1_000_000),
  count: z.number().min(1).max(64),
  description: z.string().min(2).max(255).optional().or(z.literal('')),
});
