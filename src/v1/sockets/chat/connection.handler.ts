import { Namespace, Socket } from 'socket.io';
import ChatManager from './chat.manager.js';
import { RequestMessage, responseMessageSchema } from './chat.schema.js';
import { dependencies } from './chat.dependencies.js';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../common/exceptions/core.error.js';
import { checkBlockStatus, getUserNick } from './chat.client.js';
import { ChatRoomType } from '@prisma/client';
import { sendChat } from './kafka/producer.js';
import { getLogger } from '../../../plugins/logger.js';
import { trace } from '@opentelemetry/api';

const TRACER_NAME = 'chat-service';

export async function handleConnection(
  socket: Socket,
  chatManager: ChatManager,
  namespace: Namespace,
) {
  try {
    const userId = socket.data.userId;
    getLogger().info({ sid: socket.id, userId }, '[/chat] connected');

    const tracer = trace.getTracer(TRACER_NAME);
    await tracer.startActiveSpan('socket.connection', async (span) => {
      try {
        await chatManager.joinPersonalRoom(socket, userId);
        await chatManager.joinChatRooms(socket, userId);
      } finally {
        span.end();
      }
    });

    socket.on('message', async (payload) => {
      const tracer = trace.getTracer(TRACER_NAME);
      await tracer.startActiveSpan('socket.message', async (span) => {
        try {
          await handleIncomingMessage({ socket, chatManager, userId, payload, namespace });
        } catch (err) {
          getLogger().error({ err, sid: socket.id }, 'message handler error');
        } finally {
          span.end();
        }
      });
    });

    socket.on('disconnect', async () => {
      getLogger().info({ sid: socket.id }, '[/chat] disconnected');
    });
  } catch (error) {
    getLogger().error({ err: error, sid: socket.id }, 'connection handler error');
  }
}

type HandleIncomingMessageParams = {
  socket: Socket;
  chatManager: ChatManager;
  userId: number;
  payload: RequestMessage;
  namespace: Namespace;
};

//TODO : 너무 길다
async function handleIncomingMessage({
  socket,
  chatManager,
  userId,
  payload,
  namespace,
}: HandleIncomingMessageParams) {
  try {
    const { roomType, otherUserId } = await validateIncomingMessage(userId, payload);

    if (roomType === ChatRoomType.PRIVATE && otherUserId !== undefined) {
      const isBlocked = await checkBlockStatus(otherUserId, userId);
      const isBlockedBy = await checkBlockStatus(userId, otherUserId);
      if (isBlocked || isBlockedBy) return;
    }

    const messageData = await chatManager.saveMessage(userId, payload);
    getLogger().info({ messageId: messageData.id, roomId: messageData.roomId }, 'message saved');

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

    namespace.to(`room:${messageToSend.roomId}`).emit('message', messageToSend);

    await sendChat(messageToSend);
    getLogger().info(
      { roomId: messageToSend.roomId, messageId: messageToSend.messageId },
      'kafka event sent',
    );
  } catch (e) {
    getLogger().error({ err: e, sid: socket.id }, 'message handling failed');
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
  if (typeof payload !== 'object') {
    throw new BadRequestException('유효하지 않은 메시지 형식입니다');
  }

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
