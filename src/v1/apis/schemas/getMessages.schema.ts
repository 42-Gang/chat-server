import { z } from 'zod';
import { createResponseSchema } from '../../common/schema/core.schema.js';
import { chatMessageSchema } from './chat.schema.js';

export const getMessagesResponseSchema = createResponseSchema(
  z.object({
    chatHistory: z.array(chatMessageSchema),
  }),
);

export const getMessagesParamsSchema = z.object({
  roomId: z.preprocess((val) => Number(val), z.number()).default(150),
});
