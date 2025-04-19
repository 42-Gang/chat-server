import { Namespace, Socket } from 'socket.io';
import { dependencies } from './chat.dependencies.js';
import { ResponseMessage } from './chat.schema.js';
import { ChatRoom, ChatRoomType } from '@prisma/client';
import { checkBlockStatus } from './chat.client.js';

export default class ChatManager {
  constructor() {}

  async createChatRoom(userAId: number, userBId: number) : Promise<ChatRoom>{
    const room = await dependencies.chatRoomRepository.create({
      type: 'PRIVATE',
      members: {
        create: [
          {
            userId: userAId,
          },
          {
            userId: userBId,
          }
        ]
      }
    });

    return room;
  }

  async joinPersonalRoom(socket: Socket, userId: number) {
    socket.join(`user:${userId}`);
  }

  async joinChatRooms(socket: Socket, userId: number) {
    const chatRooms = await dependencies.chatJoinListRepository.findManyByUserId(userId);
    if (chatRooms) {
      chatRooms.forEach((room) => {
        const isValid = this.validateRoom(userId, room.roomId);
        if (!isValid) return;
        socket.join(`room:${room.roomId}`);
      });
    }
  }

  async validateRoom(userId: number, roomId: number) {
    const [roomType, members] = await Promise.all([
      dependencies.chatRoomRepository.getRoomType(roomId),
      dependencies.chatJoinListRepository.findManyByRoomId(roomId),
    ]);

    if (roomType === ChatRoomType.GROUP) return true;

    const otherUser = members.find((m) => m.userId !== userId);
    if (!otherUser) throw new Error('1:1 채팅방에 다른 유저가 존재하지 않습니다');

    console.log('otherUser', otherUser);
    const isBlocked = await checkBlockStatus(userId, otherUser.userId);
    if (isBlocked) return false;
    return true;
  }

  async saveMessage(data: ResponseMessage) {
    await dependencies.chatMessageRepository.create({
      roomId: data.roomId,
      userId: data.userId,
      contents: data.contents,
      time: data.time,
    });
  }

  async leaveDirectMessageRoom(
    namespace: Namespace,
    userAId: number,
    userBId: number,
  ) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsLeave(`room:${roomId}`);
    console.log(`🟡 ${userAId} left room:${roomId}`);
  }

  async joinDirectMessageRoom(
    namespace: Namespace,
    userAId: number,
    userBId: number,
  ) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsJoin(`room:${roomId}`);
    console.log(`🟡 ${userAId} join room:${roomId}`);
  }

  async addParticipantsToRoom(
    namespace: Namespace, 
    roomId: number, 
    ...userIds: number[]
  ) {
    userIds.forEach((userId) => {
      const userSocket = namespace.in(`user:${userId}`);
      userSocket?.socketsJoin(`room:${roomId}`);
    })
  }
}
