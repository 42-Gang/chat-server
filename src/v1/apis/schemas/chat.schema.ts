import { z } from 'zod';

export const chatRoomSchema = z.object({
    id: z.preprocess((val) => Number(val), z.number()),
    type: z.enum(['PRIVATE', 'GROUP']),
})

export const chatMessageSchema = z.object({
    id: z.preprocess((val) => Number(val), z.number()),
    nickname: z.string().min(2).max(8),
    time: z.date(),
    message: z.string().min(1).max(200),
});
