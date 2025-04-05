// import ChatRoomRepositoryInterface from "../storage/database/interfaces/chatRoom.repository.interface.js";
import ChatJoinListRepositoryInterface from "../storage/database/prisma/chatJoinList.repository.js";
import ChatMessageRepositoryInterface from "../storage/database/prisma/chatMessage.repository.js";

import { ChatMessage } from "@prisma/client";
import { STATUS } from "../common/constants/status.js";
import { UnAuthorizedException } from "../common/exceptions/core.error.js";

export default class ChatService {
    constructor(
        private readonly chatJoinListRepository: ChatJoinListRepositoryInterface,
        private readonly chatMessageRepository: ChatMessageRepositoryInterface,
        // private readonly chatRoomRepository: ChatRoomRepositoryInterface
    ) {}
    private messagesToResponse(messages: ChatMessage) {
        return {
          id: messages.id,
          nickname: "test",
          time: new Date(messages.time),
          message: messages.contents,
        };
      }
    
    async loadMessages(roomId: number, userId: number | undefined) {
        const messages = await this.chatMessageRepository.findByRoomId(roomId);
        const members = await this.chatJoinListRepository.findByRoomId(roomId);

        console.log("userId", userId);
        console.log("members", members);

        if (!members.some((user) => user.user_id === userId))
            throw new UnAuthorizedException("사용자가 포함된 채팅방이 아닙니다.");

        if (messages.length === 0)
            return ;

        const response = messages.map((item) => this.messagesToResponse(item));
        return {
            status: STATUS.SUCCESS,
            data: {
                chat_history: response,
            },
        };
    }
}