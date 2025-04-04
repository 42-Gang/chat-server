import ChatRoomRepositoryInterface from "../storage/database/interfaces/chatRoom.repository.interface.js";
import ChatJoinListRepositoryInterface from "../storage/database/prisma/chatJoinList.repository.js";
import ChatMessageRepositoryInterface from "../storage/database/prisma/chatMessage.repository.js";

export default class ChatService {
    constructor(
        private readonly ChatJoinListRepository: ChatJoinListRepositoryInterface,
        private readonly ChatMessageRepository: ChatMessageRepositoryInterface,
        private readonly ChatRoomRepository: ChatRoomRepositoryInterface
    ) {}
    
    async getMessages(userId: string, chatId: string) {
        const messages = await this.chatRepository.getMessages(userId, chatId);
        return messages;
    }
}