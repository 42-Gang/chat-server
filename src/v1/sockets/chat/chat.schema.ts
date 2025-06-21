import { z } from 'zod';

export const requestMessageSchema = z.object({
  roomId: z.number(),
  contents: z.string().min(1).max(1000),
});

export const responseMessageSchema = requestMessageSchema.extend({
  userId: z.number(),
  messageId: z.number(),
  timestamp: z.string(),
  nickname: z.string(),
});

export type RequestMessage = z.infer<typeof requestMessageSchema>;
export type ResponseMessage = z.infer<typeof responseMessageSchema>;