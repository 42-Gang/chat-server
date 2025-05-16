import { Socket } from 'socket.io';
import ChatManager from './chat.manager.js';
import { RequestMessage, responseMessageSchema } from './chat.schema.js';
import { dependencies } from './chat.dependencies.js';
import { ForbiddenException, NotFoundException } from '../../../v1/common/exceptions/core.error.js';
import { checkBlockStatus, getUserNick } from './chat.client.js';
import { ChatRoomType } from '@prisma/client';
import { sendChat } from './kafka/producer.js';

export async function handleConnection(socket: Socket, chatManager: ChatManager) {
  try {
    const userId = socket.data.userId;
    console.log(`🟢 [/chat] Connected: ${socket.id}, ${userId}`);

    await chatManager.joinPersonalRoom(socket, userId);
    await chatManager.joinChatRooms(socket, userId);

    socket.on('message', (payload) =>
      handleIncomingMessage({
        socket,
        chatManager,
        userId,
        payload,
      }),
    );

    socket.on('disconnect', async () => {
      console.log(`🔴 [/chat] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}

type HandleIncomingMessageParams = {
  socket: Socket;
  chatManager: ChatManager;
  userId: number;
  payload: RequestMessage;
};

async function handleIncomingMessage({
  socket,
  chatManager,
  userId,
  payload,
}: HandleIncomingMessageParams) {
  try {
    const { roomType, otherUserId } = await validateIncomingMessage(userId, payload);

    if (roomType === ChatRoomType.PRIVATE && otherUserId !== undefined) {
      const isBlocked = await checkBlockStatus(otherUserId, userId);
      const isBlockedBy = await checkBlockStatus(userId, otherUserId);
      if (isBlocked || isBlockedBy) return;
    }

    const messageData = await chatManager.saveMessage(userId, payload);
    console.log('메시지 저장 완료:', messageData);
    const nickname = await getUserNick(userId);
    if (!nickname) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다');
    }

    const messageToSend = responseMessageSchema.parse({
      roomId: messageData.roomId,
      userId: messageData.userId,
      messageId: messageData.id,
      contents: messageData.contents,
      nickname: nickname,
      timestamp: messageData.timestamp.toISOString(),
    });

    socket.to(`room:${messageToSend.roomId}`).emit('message', messageToSend);

    await sendChat(messageToSend);
    console.log('✅ Kafka 이벤트 전송 완료:', messageToSend);
  } catch (e) {
    console.error('❌ 메시지 처리 실패:', e);
    socket.emit('error', { error: '메시지 보내기 실패' });
  }
}

async function validateIncomingMessage(
  userId: number,
  payload: RequestMessage,
): Promise<{
  roomType: ChatRoomType;
  otherUserId?: number;
}> {
  const [roomType, members] = await Promise.all([
    dependencies.chatRoomRepository.getRoomType(payload.roomId),
    dependencies.chatJoinListRepository.findManyByRoomId(payload.roomId),
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

  return { roomType, otherUserId };
}
