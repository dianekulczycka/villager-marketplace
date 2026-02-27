import { z } from 'zod';
import { SellerTypes } from '../models/enums/SellerType.ts';

export const becomeSellerSchema = z.object({
  sellerType: z.enum(SellerTypes),
});