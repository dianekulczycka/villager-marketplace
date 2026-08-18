import {z} from "zod";

export const messageSchema = z.object({
    body: z
        .string()
        .trim()
        .min(1, 'Cannot send empty message')
        .max(255, 'Message cannot be longer than 255 characters'),
});
