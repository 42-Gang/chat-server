import { Prisma, PrismaClient, ChatJoinList } from '@prisma/client';
import ChatJoinListRepositoryInterface from '../interfaces/chatJoinList.repository.interface.js';

export default class ChatJoinListRepositoryPrisma implements ChatJoinListRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.ChatJoinListCreateInput): Promise<ChatJoinList> {
    return this.prisma.chatJoinList.create({ data });
  }

  delete(id: number): Promise<ChatJoinList> {
    return this.prisma.chatJoinList.delete({ where: { id } });
  }

  findAll(): Promise<ChatJoinList[]> {
    return this.prisma.chatJoinList.findMany();
  }

  findById(id: number): Promise<ChatJoinList | null> {
    return this.prisma.chatJoinList.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.ChatJoinListUpdateInput): Promise<ChatJoinList> {
    return this.prisma.chatJoinList.update({ where: { id }, data });
  }

  findManyByRoomId(roomId: number): Promise<ChatJoinList[]> {
    return this.prisma.chatJoinList.findMany({ where: { roomId } });
  }

  findManyByUserId(userId: number): Promise<ChatJoinList[]> {
    return this.prisma.chatJoinList.findMany({ where: { userId } });
  }
}
