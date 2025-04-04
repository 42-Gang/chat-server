import { z } from 'zod';
import { createResponseSchema } from 'src/v1/common/schema/core.schema.js';
import { chatMessageSchema } from 'src/v1/apis/schemas/chat.schema.js';

export const getMessagesResponseSchema = createResponseSchema(z.object({
    chat_history: z.array(chatMessageSchema),
}));

export const getMessagesParamsSchema = z.object({
    room_id: z.preprocess((val) => Number(val), z.number()).default(150),
  });