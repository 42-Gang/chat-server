import ChatRoomRepositoryInterface from '../storage/database/interfaces/chatRoom.repository.interface.js';
import ChatJoinListRepositoryInterface from '../storage/database/prisma/chatJoinList.repository.js';
import ChatMessageRepositoryInterface from '../storage/database/prisma/chatMessage.repository.js';

import { ChatMessage } from '@prisma/client';
import { STATUS } from '../common/constants/status.js';
import { NotFoundException, UnAuthorizedException } from '../common/exceptions/core.error.js';
import { TypeOf } from 'zod';
import { getDmRoomIdQuerySchema } from './schemas/get-room-id.schema.js';
import { getUserNick } from '../sockets/chat/chat.client.js';

export default class ChatService {
  constructor(
    private readonly chatJoinListRepository: ChatJoinListRepositoryInterface,
    private readonly chatMessageRepository: ChatMessageRepositoryInterface,
    private readonly chatRoomRepository: ChatRoomRepositoryInterface,
  ) {}

  private async messagesToResponse(messages: ChatMessage) {
    const nickname = await getUserNick(messages.userId);
    return {
      id: messages.id,
      nickname: nickname,
      timestamp: new Date(messages.timestamp),
      message: messages.contents,
    };
  }

  async loadMessages(roomId: number, userId: number | undefined) {
    const rooms = await this.chatRoomRepository.findById(roomId);
    if (!rooms) throw new NotFoundException('채팅방이 존재하지 않습니다.');

    const members = await this.chatJoinListRepository.findManyByRoomId(roomId);
    if (!members || !members.some((user) => user.userId === userId)) {
      throw new UnAuthorizedException('사용자가 포함된 채팅방이 아닙니다.');
    }

    const messages = await this.chatMessageRepository.findManyByRoomId(roomId);
    if (!messages) {
      throw new NotFoundException('채팅 메시지가 존재하지 않습니다.');
    }

    const response = messages.map((item) => this.messagesToResponse(item));
    return {
      status: STATUS.SUCCESS,
      data: {
        chatHistory: response,
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
