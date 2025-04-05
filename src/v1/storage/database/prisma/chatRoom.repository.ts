import { Prisma, PrismaClient, ChatRoom } from '@prisma/client';
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
}
