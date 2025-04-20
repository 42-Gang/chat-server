import { z } from "zod";

export const friendAddMessage = z.object({
    userAId: z.string(),
    userBId: z.string(),
    eventType: z.enum(['ADDED']),
    timestamp: z.string().optional(),
  });
  
  export const friendBlockMessage = z.object({
    fromUserId: z.string(),
    toUserId: z.string(),
    eventType: z.enum(['BLOCKED', 'UNBLOCKED']),
    timestamp: z.string().optional(),
  });
  