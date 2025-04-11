import { z } from 'zod';

export const chatJoinListSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()),
  roomId: z.preprocess((val) => Number(val), z.number()),
  userId: z.preprocess((val) => Number(val), z.number()),
});


export const joinRoomSchema = z.object({
  id: z.string(),
});
