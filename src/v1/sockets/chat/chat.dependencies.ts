import prisma from "src/plugins/prisma.js";
import ChatJoinListRepositoryInterface from "src/v1/storage/database/interfaces/chatJoinList.repository.interface.js";
import ChatMessageRepositoryInterface from "src/v1/storage/database/interfaces/chatMessage.repository.interface.js";
import ChatRoomRepositoryInterface from "src/v1/storage/database/interfaces/chatRoom.repository.interface.js";
import ChatJoinListRepositoryPrisma from "src/v1/storage/database/prisma/chatJoinList.repository.js";
import ChatMessageRepositoryPrisma from "src/v1/storage/database/prisma/chatMessage.repository.js";
import ChatRoomRepositoryPrisma from "src/v1/storage/database/prisma/chatRoom.repository.js";

export const dependencies: {
    chatJoinListRepository: ChatJoinListRepositoryInterface;
    chatMessageRepository: ChatMessageRepositoryInterface;
    chatRoomRepository: ChatRoomRepositoryInterface;
} = {
    chatJoinListRepository: new ChatJoinListRepositoryPrisma(prisma),
    chatMessageRepository: new ChatMessageRepositoryPrisma(prisma),
    chatRoomRepository: new ChatRoomRepositoryPrisma(prisma),
};