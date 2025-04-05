import { Prisma, ChatJoinList } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatJoinListRepositoryInterface
  extends BaseRepositoryInterface<
    ChatJoinList,
    Prisma.ChatJoinListCreateInput,
    Prisma.ChatJoinListUpdateInput
  > {
  findByRoomId(room_id: number): Promise<ChatJoinList[]>;
}
