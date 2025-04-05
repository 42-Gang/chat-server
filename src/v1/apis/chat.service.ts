import ChatRoomRepositoryInterface from '../storage/database/interfaces/chatRoom.repository.interface.js';
import ChatJoinListRepositoryInterface from '../storage/database/prisma/chatJoinList.repository.js';
import ChatMessageRepositoryInterface from '../storage/database/prisma/chatMessage.repository.js';

import { ChatMessage } from '@prisma/client';
import { STATUS } from '../common/constants/status.js';
import { NotFoundException, UnAuthorizedException } from '../common/exceptions/core.error.js';

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
    if (!rooms) throw new NotFoundException('채팅방이 존재하지 않습니다.');

    const members = await this.chatJoinListRepository.findByRoomId(roomId);
    if (!members || !members.some((user) => user.user_id === userId)) {
      throw new UnAuthorizedException('사용자가 포함된 채팅방이 아닙니다.');
    }

    const messages = await this.chatMessageRepository.findByRoomId(roomId);
    if (!messages) {
      throw new NotFoundException('채팅 메시지가 존재하지 않습니다.');
    }

    const response = messages.map((item) => this.messagesToResponse(item));
    return {
      status: STATUS.SUCCESS,
      data: {
        chat_history: response,
      },
    };
  }
}
