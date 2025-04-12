import { Socket } from 'socket.io';
import ChatService from './chat.service.js';
import { requestMessageSchema, ResponseMessage, responseMessageSchema } from './chat.schema.js';
import { dependencies } from './chat.dependencies.js';
import { ForbiddenException } from '../../../v1/common/exceptions/core.error.js';

export async function handleConnection(
  socket: Socket,
  chatService: ChatService,
) {
  try {
    const userId = socket.data.userId;
    console.log(`🟢 [/chat] Connected: ${socket.id}, ${userId}`);

    await joinPersonalRoom(socket, userId);
    await joinChatRooms(socket, userId);
    
    socket.on('message', (payload) =>
      handleIncomingMessage(socket, chatService, userId, payload)
    );
    
    socket.on('disconnect', async () => {
      console.log(`🔴 [/status] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}

async function handleIncomingMessage(
  socket: Socket,
  chatService: ChatService,
  userId: number,
  payload: unknown
) {
  try {
    const parsed = requestMessageSchema.parse(payload);
    const { roomId, contents } = parsed;

    const messageData: ResponseMessage = responseMessageSchema.parse({
      roomId,
      userId,
      contents,
      time: new Date().toISOString(),
    });

    const isJoined = await dependencies.chatJoinListRepository.findByUserIdAndRoomId(
      userId,
      roomId
    );

    if (!isJoined) {
      throw new ForbiddenException('채팅방에 포함되어있지 않는 사용자입니다.');
    }

    await chatService.saveMessage(messageData);

    socket.to(`room:${roomId}`).emit('message', messageData);

    // TODO: Kafka로 메시지 전송
  } catch (e) {
    console.error('❌ 메시지 처리 실패:', e);
    socket.emit('error_message', { message: '메시지 포맷 오류 또는 권한 문제' });
  }
}

async function joinPersonalRoom(socket: Socket, userId: number) {
  socket.join(`user:${userId}`);
  // redis에 저장하는 로직 추가
}

async function joinChatRooms(socket: Socket, userId: number) {
    const chatRooms = await dependencies.chatJoinListRepository.findManyByUserId(userId);
    if (chatRooms) {
      chatRooms.forEach((room) => {
        socket.join(`room:${room.roomId}`);
      });
    }
    //redis에 저장하는 로직 추가
}