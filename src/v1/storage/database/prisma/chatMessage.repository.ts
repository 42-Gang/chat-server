import { Prisma, PrismaClient, ChatMessage } from '@prisma/client';
import ChatMessageRepositoryInterface from '../interfaces/chatMessage.repository.interface.js';

export default class ChatMessageRepositoryPrisma implements ChatMessageRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.ChatMessageCreateInput): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({ data });
  }

  delete(id: number): Promise<ChatMessage> {
    return this.prisma.chatMessage.delete({ where: { id } });
  }

  findAll(): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany();
  }

  findById(id: number): Promise<ChatMessage | null> {
    return this.prisma.chatMessage.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.ChatMessageUpdateInput): Promise<ChatMessage> {
    return this.prisma.chatMessage.update({ where: { id }, data });
  }

  findByRoomId(room_id: number): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({ where: { room_id }, orderBy: { time: 'asc' } });
  }
}
