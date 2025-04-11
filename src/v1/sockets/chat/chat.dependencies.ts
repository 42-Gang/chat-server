import prisma from "../../../plugins/prisma.js";
import ChatJoinListRepositoryInterface from "../../storage/database/interfaces/chatJoinList.repository.interface.js";
import ChatMessageRepositoryInterface from "../../storage/database/interfaces/chatMessage.repository.interface.js";
import ChatRoomRepositoryInterface from "../../storage/database/interfaces/chatRoom.repository.interface.js";
import ChatJoinListRepositoryPrisma from "../../storage/database/prisma/chatJoinList.repository.js";
import ChatMessageRepositoryPrisma from "../../storage/database/prisma/chatMessage.repository.js";
import ChatRoomRepositoryPrisma from "../../storage/database/prisma/chatRoom.repository.js";

export const dependencies: {
    chatJoinListRepository: ChatJoinListRepositoryInterface;
    chatMessageRepository: ChatMessageRepositoryInterface;
    chatRoomRepository: ChatRoomRepositoryInterface;
} = {
    chatJoinListRepository: new ChatJoinListRepositoryPrisma(prisma),
    chatMessageRepository: new ChatMessageRepositoryPrisma(prisma),
    chatRoomRepository: new ChatRoomRepositoryPrisma(prisma),
};