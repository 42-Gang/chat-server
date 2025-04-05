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

export const chatMessageSchema = z.object({
    id: z.preprocess((val) => Number(val), z.number()),
    nickname: z.string().min(2).max(8),
    time: z.date(),
    message: z.string().min(1).max(200),
});

//채팅룸의 모든 메세지 로드 (GET)
//내가 속한 모든 채팅룸 리스트 로드 (GET)
//채팅룸에 속한 유저 리스트 로드 (GET)