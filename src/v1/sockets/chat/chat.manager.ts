import { Namespace, Socket } from 'socket.io';
import { dependencies } from './chat.dependencies.js';
import { RequestMessage } from './chat.schema.js';
import { ChatRoom, ChatRoomType } from '@prisma/client';
import { checkBlockStatus } from './chat.client.js';
import { getLogger } from '../../../plugins/logger.js';

export default class ChatManager {
  constructor() {}

  //TODO: repository 안에 넣을 수 있는 함수
  async createChatRoom(userAId: number, userBId: number): Promise<ChatRoom> {
    return dependencies.chatRoomRepository.create({
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
  }

  //TODO: 'user:${userId}' 상수화
  async joinPersonalRoom(socket: Socket, userId: number) {
    socket.join(`user:${userId}`);
  }

  async joinChatRooms(socket: Socket, userId: number) {
    const chatRooms = await dependencies.chatJoinListRepository.findManyByUserId(userId);
    if (!chatRooms || chatRooms.length === 0) {
      getLogger().debug({ userId }, 'No chat rooms found for user');
      return;
    }
    await Promise.all(
      chatRooms.map(async (room) => {
        const isValid = await this.isChatRoomAccessible(userId, room.roomId);
        if (isValid) {
          socket.join(`room:${room.roomId}`);
        }
      }),
    );
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
    return !isBlocked;
  }

  //TODO: 바로 return
  async saveMessage(userId: number, payload: RequestMessage) {
    return dependencies.chatMessageRepository.create({
      roomId: payload.roomId,
      userId: userId,
      contents: payload.contents,
      timestamp: new Date(),
    });
  }

  async leaveDirectMessageRoom(namespace: Namespace, userAId: number, userBId: number) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsLeave(`room:${roomId}`);
    getLogger().info({ userId: userAId, roomId }, 'left room');
  }

  async joinDirectMessageRoom(namespace: Namespace, userAId: number, userBId: number) {
    const userSocketA = namespace.in(`user:${userAId}`);
    const roomId = await dependencies.chatRoomRepository.getPrivateRoomByUserIds(userAId, userBId);

    userSocketA?.socketsJoin(`room:${roomId}`);
    getLogger().info({ userId: userAId, roomId }, 'join room');
  }

  async addParticipantsToRoom(namespace: Namespace, roomId: number, ...userIds: number[]) {
    userIds.forEach((userId) => {
      const userSocket = namespace.in(`user:${userId}`);
      userSocket?.socketsJoin(`room:${roomId}`);
    });
  }
}
