// import ChatRoomRepositoryInterface from "../storage/database/interfaces/chatRoom.repository.interface.js";
// import ChatJoinListRepositoryInterface from "../storage/database/prisma/chatJoinList.repository.js";
import ChatMessageRepositoryInterface from "../storage/database/prisma/chatMessage.repository.js";

import { ChatMessage } from "@prisma/client";
import { STATUS } from "../common/constants/status.js";

export default class ChatService {
    constructor(
        // private readonly chatJoinListRepository: ChatJoinListRepositoryInterface,
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
    
    async loadMessages(roomId: number) {
        const messages = await this.chatMessageRepository.findByRoomId(roomId);
        const response = messages.map((item) => this.messagesToResponse(item));

        return {
            status: STATUS.SUCCESS,
            data: {
                chat_history: response,
            },
        };
        
        // const messages = [
        //     {
        //       id: 1,
        //       nickname: '유저A',
        //       time: new Date("2024-04-05T12:00:00.000Z"),
        //       message: '안녕하세요~',
        //     },
        //     {
        //       id: 2,
        //       nickname: 'user123',
        //       time: new Date("2024-04-05T12:00:00.000Z"),
        //       message: '반갑습니다!',
        //     },
        //     {
        //       id: 3,
        //       nickname: '테스터',
        //       time: new Date("2024-04-05T12:00:00.000Z"),
        //       message: '채팅방 테스트 중입니다.',
        //     },
        //   ];
    }
}