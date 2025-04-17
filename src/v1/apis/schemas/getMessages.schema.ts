import { z } from 'zod';
import { createResponseSchema } from '../../common/schema/core.schema.js';
import { chatMessageSchema } from './chat.schema.js';

export const getMessagesParamsSchema = z.object({
  roomId: z.preprocess((val) => Number(val), z.number()),
});

export const getMessagesSuccessSchema = createResponseSchema(
  z.object({
    chatHistory: z.array(chatMessageSchema),
  }),
);

export const roomNotFoundSchema = z.object({
  status: z.literal('ERROR'),
  message: z.literal('채팅방이 존재하지 않습니다.'),
}).describe('Room Not Found');

export const messageNotFoundSchema = z.object({
  status: z.literal('ERROR'),
  message: z.literal('채팅 메세지가 존재하지 않습니다.'),
}).describe('Message Not Found');


// export const roomNotFoundSchema = createResponseSchema(
//   z.object({
//     error: z.object({
//       field: z.literal(404),
//       message: z.literal('채팅방이 존재하지 않습니다.'),
//     }),

//   }),
// ).describe('Room Not Found');

