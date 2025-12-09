import ChatMessageRepositoryInterface from '../storage/database/prisma/chatMessage.repository.js';

import { STATUS } from '../common/constants/status.js';
import { NotFoundException, UnAuthorizedException } from '../common/exceptions/core.error.js';
import { TypeOf } from 'zod';
import { getDmRoomIdQuerySchema } from './schemas/get-room-id.schema.js';
import { getUserNick } from '../sockets/chat/chat.client.js';
import { FastifyBaseLogger } from 'fastify';
import ChatRoomRepositoryPrisma from '../storage/database/prisma/chatRoom.repository.js';

export default class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepositoryInterface,
    private readonly chatRoomRepository: ChatRoomRepositoryPrisma,
    private readonly logger: FastifyBaseLogger,
  ) {}

  async loadMessages(
    roomId: number,
    userId: number | undefined,
    cursor: number | undefined,
    limit: number,
  ) {
    const roomWithMembers = await this.chatRoomRepository.findByIdJoinMembers(roomId);
    if (!roomWithMembers) throw new NotFoundException('채팅방이 존재하지 않습니다.');

    const chatJoinList = roomWithMembers.members;
    if (!chatJoinList || !chatJoinList.some((user) => user.userId === userId)) {
      throw new UnAuthorizedException('사용자가 포함된 채팅방이 아닙니다.');
    }

    const { messages, hasNext, nextCursor } = await this.chatMessageRepository.findManyByRoomId({
      roomId,
      cursor,
      limit,
    });
    if (!messages) {
      throw new NotFoundException('채팅 메시지가 존재하지 않습니다.');
    }

    const members: Record<number, string> = Object.fromEntries(
      await Promise.all(
        chatJoinList.map(async (item): Promise<[number, string]> => {
          const nickname = await getUserNick(item.userId);
          if (!nickname) {
            this.logger.error(`Failed to fetch nickname for userId: ${item.userId}`);
            return [item.userId, 'unknown'];
          }
          return [item.userId, nickname];
        }),
      ),
    );

    const response = messages.map((message) => {
      return {
        id: message.id,
        nickname: members[message.userId],
        timestamp: new Date(message.timestamp),
        message: message.contents,
      };
    });

    return {
      status: STATUS.SUCCESS,
      data: {
        chatHistory: response,
        hasNext,
        nextCursor,
      },
    };
  }

  async getRoomId(users: TypeOf<typeof getDmRoomIdQuerySchema>) {
    const roomId = await this.chatRoomRepository.getPrivateRoomByUserIds(
      users.userId,
      users.friendId,
    );

    if (!roomId) {
      throw new NotFoundException('채팅방이 존재하지 않습니다.');
    }
    return {
      status: STATUS.SUCCESS,
      data: {
        roomId: roomId,
      },
    };
  }
}
