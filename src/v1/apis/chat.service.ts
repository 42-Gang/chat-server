import ChatRoomRepositoryInterface from '../storage/database/interfaces/chatRoom.repository.interface.js';
import ChatJoinListRepositoryInterface from '../storage/database/prisma/chatJoinList.repository.js';
import ChatMessageRepositoryInterface from '../storage/database/prisma/chatMessage.repository.js';

import { ChatMessage } from '@prisma/client';
import { STATUS } from '../common/constants/status.js';
import { NotFoundException, UnAuthorizedException } from '../common/exceptions/core.error.js';
import { ERROR_MESSAGES } from './constants/errorMessages.js';

export default class ChatService {
  constructor(
    private readonly chatJoinListRepository: ChatJoinListRepositoryInterface,
    private readonly chatMessageRepository: ChatMessageRepositoryInterface,
    private readonly chatRoomRepository: ChatRoomRepositoryInterface,
  ) {}
  private messagesToResponse(messages: ChatMessage) {
    return {
      id: messages.id,
      nickname: 'test',
      time: new Date(messages.time),
      message: messages.contents,
    };
  }

  async loadMessages(roomId: number, userId: number | undefined) {
    const rooms = await this.chatRoomRepository.findById(roomId);
    if (!rooms) throw new NotFoundException(ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND);

    const members = await this.chatJoinListRepository.findManyByRoomId(roomId);
    if (!members || !members.some((user) => user.userId === userId)) {
      throw new UnAuthorizedException(ERROR_MESSAGES.UNAUTHORIZED_CHAT_ROOM_ACCESS);
    }

    const messages = await this.chatMessageRepository.findManyByRoomId(roomId);
    if (!messages) {
      throw new NotFoundException(ERROR_MESSAGES.CHAT_MESSAGES_NOT_FOUND);
    }

    const response = messages.map((item) => this.messagesToResponse(item));
    return {
      status: STATUS.SUCCESS,
      data: {
        chatHistory: response,
      },
    };
  }
}
