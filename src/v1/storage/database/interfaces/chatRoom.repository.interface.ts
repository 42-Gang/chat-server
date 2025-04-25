import { Prisma, ChatRoom, ChatRoomType } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatRoomRepositoryInterface
  extends BaseRepositoryInterface<
    ChatRoom,
    Prisma.ChatRoomCreateInput,
    Prisma.ChatRoomUpdateInput
  > {
  getRoomType(id: number): Promise<ChatRoomType>;
  getPrivateRoomByUserIds(userAId: number, userBId: number): Promise<number | null>;
}
