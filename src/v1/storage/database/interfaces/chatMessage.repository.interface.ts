import { Prisma, ChatMessage } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatMessageRepositoryInterface
  extends BaseRepositoryInterface<ChatMessage, Prisma.ChatMessageCreateInput, Prisma.ChatMessageUpdateInput> {
  findByRoomId(room_id: number): Promise<ChatMessage[]>;
}
