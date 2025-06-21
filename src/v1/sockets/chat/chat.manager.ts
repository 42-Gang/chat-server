import { Namespace, Socket } from 'socket.io';
import { dependencies } from './chat.dependencies.js';
import { RequestMessage } from './chat.schema.js';
import { ChatRoom, ChatRoomType } from '@prisma/client';
import { checkBlockStatus } from './chat.client.js';

export default class ChatManager {
  constructor() {}

  //TODO: repository 안에 넣을 수 있는 함수
  async createChatRoom(userAId: number, userBId: number): Promise<ChatRoom> {
    const room = await dependencies.chatRoomRepository.create({
      type: 'PRIVATE',
      members: {
        create: [
          {
            userId: userAId,
          },
          {
            userId: userBId,
          },
        ],
      },
    });

    return room;
  }

  //TODO: 'user:${userId}' 상수화
  async joinPersonalRoom(socket: Socket, userId: number) {
    socket.join(`user:${userId}`);
  }

  async joinChatRooms(socket: Socket, userId: number) {
    const chatRooms = await dependencies.chatJoinListRepository.findManyByUserId(userId);
    if (!chatRooms || chatRooms.length === 0) {
      console.log(`No chat rooms found for user ${userId}`);
      return;
    }
    for (const room of chatRooms) {
      const isValid = await this.isChatRoomAccessible(userId, room.roomId);
      if (!isValid) continue;
      socket.join(`room:${room.roomId}`);
    }
  }

  async isChatRoomAccessible(userId: number, roomId: number) {
    const [roomType, members] = await Promise.all([
      dependencies.chatRoomRepository.getRoomType(roomId),
      dependencies.chatJoinListRepository.findManyByRoomId(roomId),
    ]);

    if (roomType === ChatRoomType.GROUP) return true;

    const otherUser = members.find((m) => m.userId !== userId);
    if (!otherUser) throw new Error('1:1 채팅방에 다른 유저가 존재하지 않습니다');

    const isBlocked = await checkBlockStatus(userId, otherUser.userId);
    if (isBlocked) return false;
    const isOtherUserBlocked = await checkBlockStatus(otherUser.userId, userId);
    if (isOtherUserBlocked) return false;
    return true;
  }

  //TODO: 바로 return
  async saveMessage(userId: number, payload: RequestMessage) {
    const message = await dependencies.chatMessageRepository.create({
      roomId: payload.roomId,
      userId: userId,
      contents: payload.contents,
      timestamp: new Date(),
    });

    return message;
  }

  async leaveDirectMessageRoom(namespace: Namespace, userAId: number, userBId: number) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsLeave(`room:${roomId}`);
    console.log(`🟡 ${userAId} left room:${roomId}`);
  }

  async joinDirectMessageRoom(namespace: Namespace, userAId: number, userBId: number) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsJoin(`room:${roomId}`);
    console.log(`🟡 ${userAId} join room:${roomId}`);
  }

  async addParticipantsToRoom(namespace: Namespace, roomId: number, ...userIds: number[]) {
    userIds.forEach((userId) => {
      const userSocket = namespace.in(`user:${userId}`);
      userSocket?.socketsJoin(`room:${roomId}`);
    });
  }
}
