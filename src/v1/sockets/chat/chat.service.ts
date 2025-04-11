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

    async joinPersonalRoom(socket: Socket, userId: number) {
      socket.join(`user:${userId}`);
      // redis에 저장하는 로직 추가
    }

    async joinChatRooms(socket: Socket, userId: number) {
        const chatRooms = await dependencies.chatJoinListRepository.findManyByUserId(userId);
        if (chatRooms) {
          chatRooms.forEach((room) => {
            socket.join(`room:${room.roomId}`);
          });
        }
        //redis에 저장하는 로직 추가
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
