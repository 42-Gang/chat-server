import { z } from "zod";

export const friendAddMessage = z.object({
    userAId: z.number(),
    userBId: z.number(),
    eventType: z.enum(['ADDED']),
    timestamp: z.string(),
  });
  
  export const friendBlockMessage = z.object({
    fromUserId: z.number(),
    toUserId: z.number(),
    eventType: z.enum(['BLOCKED', 'UNBLOCKED']),
    timestamp: z.string(),
  });
  