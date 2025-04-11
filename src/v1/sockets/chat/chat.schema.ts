import { z } from 'zod';

export const messageSchema = z.object({
  roomId: z.preprocess((val) => Number(val), z.number()),
  contents: z.string().min(1).max(1000),
});
