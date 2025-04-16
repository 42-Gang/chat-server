import { z } from 'zod';

export const requestMessageSchema = z.object({
  roomId: z.preprocess((val) => Number(val), z.number()),
  contents: z.string().min(1).max(1000),
});

export const responseMessageSchema = requestMessageSchema.extend({
  userId: z.number(),
  time: z.string().datetime(),
});

export type ResponseMessage = z.infer<typeof responseMessageSchema>;
