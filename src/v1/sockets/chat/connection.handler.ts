import { Socket } from 'socket.io';
import ChatManager from './chat.manager.js';
import { requestMessageSchema, ResponseMessage, responseMessageSchema } from './chat.schema.js';
import { dependencies } from './chat.dependencies.js';
import { ForbiddenException } from '../../../v1/common/exceptions/core.error.js';
import { checkBlockStatus, getUserNick } from './chat.client.js';
import { ChatRoomType } from '@prisma/client';
import { sendChat } from './kafka/producer.js'; 

export async function handleConnection(socket: Socket, chatManager: ChatManager) {
  try {
    const userId = socket.data.userId;
    console.log(`🟢 [/chat] Connected: ${socket.id}, ${userId}`);

    await chatManager.joinPersonalRoom(socket, userId);
    await chatManager.joinChatRooms(socket, userId);

    socket.on('message', (payload) => handleIncomingMessage({socket, chatManager, userId, payload}));

    socket.on('disconnect', async () => {
      console.log(`🔴 [/status] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}

type HandleIncomingMessageParams = {
  socket: Socket;
  chatManager: ChatManager;
  userId: number;
  payload: unknown;
};

async function handleIncomingMessage({socket, chatManager, userId, payload}: HandleIncomingMessageParams) {
  try {
    const { messageData, roomType, otherUserId } = await validateIncomingMessage(userId, payload);

    socket.to(`room:${messageData.roomId}`).emit('message', messageData);

    if (roomType === ChatRoomType.PRIVATE && otherUserId !== undefined) {
      const isBlocked = await checkBlockStatus(otherUserId, userId);
      if (isBlocked) return;
    }

    await chatManager.saveMessage(messageData);
    await sendChat(messageData);
    console.log('✅ Kafka 이벤트 전송 완료:', messageData);

  } catch (e) {
    console.error('❌ 메시지 처리 실패:', e);
    socket.emit('error_message', { message: '메시지 포맷 오류 또는 권한 문제' });
  }
}

async function validateIncomingMessage(userId: number, payload: unknown): Promise<{
  messageData: ResponseMessage;
  roomType: ChatRoomType;
  otherUserId?: number;
}> {
  const { roomId, contents } = requestMessageSchema.parse(payload);

  const messageData: ResponseMessage = responseMessageSchema.parse({
    roomId,
    userId: userId,
    nickname: await getUserNick(userId),
    contents,
    timestamp: new Date().toISOString(),
  });

  const [roomType, members] = await Promise.all([
    dependencies.chatRoomRepository.getRoomType(roomId),
    dependencies.chatJoinListRepository.findManyByRoomId(roomId),
  ]);

  const isUserInRoom = members.some((member) => member.userId === userId);
  if (!isUserInRoom) {
    throw new ForbiddenException('이 채팅방에 참여하지 않은 사용자입니다');
  }

  let otherUserId: number | undefined = undefined;
  if (roomType === ChatRoomType.PRIVATE) {
    otherUserId = members.find((join) => join.userId !== userId)?.userId;
    if (!otherUserId) {
      throw new Error('상대방을 찾을 수 없습니다 (1:1 채팅방 아님)');
    }
  }

  return { messageData, roomType, otherUserId };
}