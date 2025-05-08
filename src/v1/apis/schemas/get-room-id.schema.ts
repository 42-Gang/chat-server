import { createResponseSchema } from "src/v1/common/schema/core.schema.js";
import { z } from "zod";

export const getDmRoomIdQuerySchema = z.object({
    userId: z.preprocess((val) => Number(val), z.number()),
    friendId: z.preprocess((val) => Number(val), z.number())
})

export const getDmRoomIdResponseSchema = createResponseSchema(
  z.object({
    roomId: z.preprocess((val) => Number(val), z.number()),
  }),
);