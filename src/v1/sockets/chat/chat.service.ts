import { Socket } from "socket.io";
import { dependencies } from "./chat.dependencies.js";

export default class ChatService {
    constructor() {}

    /*친구 됐을 때*/
    async createChatRoom(userId: number) {
      const room = await dependencies.chatRoomRepository.create({ 
        type: 'PRIVATE',  
      });

      await dependencies.chatJoinListRepository.create({ 
        roomId: room.id,
        userId: userId,
      });
      return room;
    }

    /*로그인 했을 때*/
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
    } //로그인 했을 때 내가 속한 채팅방에 join

    async 
    // 채팅 받았을 때
    // 채팅 보낼 때
    //친구 됐을 때
    //블록 됐을 때

    

}
