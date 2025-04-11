import { Prisma, ChatJoinList } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatJoinListRepositoryInterface
  extends BaseRepositoryInterface<
    ChatJoinList,
    Prisma.ChatJoinListCreateInput,
    Prisma.ChatJoinListUpdateInput
  > {
  findManyByRoomId(roomId: number): Promise<ChatJoinList[]>;//findMany로 명시
  findManyByUserId(userId: number): Promise<ChatJoinList[]>;
}
