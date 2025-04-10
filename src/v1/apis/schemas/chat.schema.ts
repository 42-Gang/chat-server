import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()),
  nickname: z.string().min(2).max(8),
  time: z.date(),
  message: z.string().min(1).max(200),
});

//채팅룸의 모든 메세지 로드 (GET)
//내가 속한 모든 채팅룸 리스트 로드 (GET)
//채팅룸에 속한 유저 리스트 로드 (GET)
