import { z } from 'zod';
import { createResponseSchema } from '../../common/schema/core.schema.js';

export const getDmRoomIdQuerySchema = z.object({
  userId: z.preprocess((val) => Number(val), z.number()),
  friendId: z.preprocess((val) => Number(val), z.number()),
});

export const getDmRoomIdResponseSchema = createResponseSchema(
  z.object({
    roomId: z.preprocess((val) => Number(val), z.number()),
  }),
);
