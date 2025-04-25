import { Prisma, PrismaClient, ChatRoom, ChatRoomType } from '@prisma/client';
import ChatRoomRepositoryInterface from '../interfaces/chatRoom.repository.interface.js';

export default class ChatRoomRepositoryPrisma implements ChatRoomRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.ChatRoomCreateInput): Promise<ChatRoom> {
    return this.prisma.chatRoom.create({ data });
  }

  delete(id: number): Promise<ChatRoom> {
    return this.prisma.chatRoom.delete({ where: { id } });
  }

  findAll(): Promise<ChatRoom[]> {
    return this.prisma.chatRoom.findMany();
  }

  findById(id: number): Promise<ChatRoom | null> {
    return this.prisma.chatRoom.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.ChatRoomUpdateInput): Promise<ChatRoom> {
    return this.prisma.chatRoom.update({ where: { id }, data });
  }

  async getRoomType(id: number): Promise<ChatRoomType> {
    const room = await this.prisma.chatRoom.findUniqueOrThrow({
      where: { id },
      select: { type: true },
    });
    return room.type;
  }

  async getPrivateRoomByUserIds(userAId: number, userBId: number): Promise<number | null> {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'PRIVATE',
        AND: [
          { members: { some: { userId: userAId } } },
          { members: { some: { userId: userBId } } },
        ],
      },
      select: { id: true },
    });
    return room?.id ?? null;
  }
}
