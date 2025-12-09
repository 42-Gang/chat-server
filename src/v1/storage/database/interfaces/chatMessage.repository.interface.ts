import { Prisma, ChatMessage } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatMessageRepositoryInterface
  extends BaseRepositoryInterface<
    ChatMessage,
    Prisma.ChatMessageCreateInput,
    Prisma.ChatMessageUpdateInput
  > {
  findManyByRoomId(args: {
    roomId: number;
    cursor: number | undefined;
    limit: number;
  }): Promise<{ messages: ChatMessage[]; hasNext: boolean; nextCursor: number | undefined }>;
}
