import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()),
  nickname: z.string(),
  timestamp: z.date(),
  message: z.string().min(1).max(200),
});
