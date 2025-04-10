import { z } from 'zod';

export const chatRoomSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()),
  type: z.enum(['PRIVATE', 'GROUP']),
});

export const chatJoinListSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()),
  room_id: z.preprocess((val) => Number(val), z.number()),
  user_id: z.preprocess((val) => Number(val), z.number()),
});

export const joinRoomSchema = z.object({
  roomId: z.string(),
});

export const messageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
});
