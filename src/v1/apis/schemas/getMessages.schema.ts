import { z } from 'zod';
import { createResponseSchema } from '../../common/schema/core.schema.js';
import { chatMessageSchema } from './chat.schema.js';

export const getMessagesResponseSchema = createResponseSchema(
  z.object({
    chat_history: z.array(chatMessageSchema),
  }),
);

export const getMessagesParamsSchema = z.object({
  room_id: z.preprocess((val) => Number(val), z.number()).default(150),
});
