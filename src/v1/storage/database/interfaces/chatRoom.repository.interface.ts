import { Prisma, ChatRoom } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface ChatRoomRepositoryInterface
  extends BaseRepositoryInterface<
    ChatRoom,
    Prisma.ChatRoomCreateInput,
    Prisma.ChatRoomUpdateInput
  > {}
