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

  async findManyByRoomId(args: {
    roomId: number;
    cursor: number | undefined;
    limit: number;
  }): Promise<{ messages: ChatMessage[]; hasNext: boolean; nextCursor: number | undefined }> {
    const { roomId, cursor, limit } = args;

    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId, id: { lt: cursor } },
      orderBy: { id: 'desc' },
      take: limit + 1,
    });

    const hasNext = limit < messages.length;
    let nextCursor: number | undefined;
    if (hasNext) {
      nextCursor = messages[messages.length - 1].id;
      messages.pop();
    }

    return { messages, hasNext, nextCursor };
  }
}
