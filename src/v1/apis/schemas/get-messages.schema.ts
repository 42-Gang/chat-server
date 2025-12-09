import { z } from 'zod';
import { createResponseSchema } from '../../common/schema/core.schema.js';
import { chatMessageSchema } from './chat.schema.js';

export const getMessagesResponseSchema = createResponseSchema(
  z.object({
    chatHistory: z.array(chatMessageSchema),
  }),
);

export const getMessagesParamsSchema = z.object({
  roomId: z.preprocess((val) => Number(val), z.number()),
});

export const getMessagesQuerySchema = z.object({
  nextCursor: z.preprocess((val) => Number(val), z.number()).optional(),
  limit: z.preprocess((val) => Number(val), z.number()).default(20),
});
