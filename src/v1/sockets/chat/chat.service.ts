import { Socket } from "socket.io";
import { dependencies } from "./chat.dependencies.js";
import { ResponseMessage } from "./chat.schema.js";

export default class ChatService {
    constructor() {}

    async createChatRoom(userAId: number, userBId: number) {
      const room = await dependencies.chatRoomRepository.create({ 
        type: 'PRIVATE',
      });

      await dependencies.chatJoinListRepository.create({ 
        roomId: room.id,
        userId: userAId,
      });
      await dependencies.chatJoinListRepository.create({ 
        roomId: room.id,
        userId: userBId,
      });
      
      return room;
    }

    async saveMessage(data : ResponseMessage) {
      await dependencies.chatMessageRepository.create({
        roomId: data.roomId,
        userId: data.userId,
        contents: data.contents,
        time: data.time,
      })
    }

    async leaveRoom(socket: Socket, roomId: number) {
      socket.leave(`room:${roomId}`);
      console.log(`🟡 ${socket.id} left room:${roomId}`);
    }
}
