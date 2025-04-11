import { Namespace, Socket } from 'socket.io';
import ChatService from './chat.service.js';
import { requestMessageSchema, ResponseMessage, responseMessageSchema } from './chat.schema.js';
import { dependencies } from './chat.dependencies.js';
import { ForbiddenException } from 'src/v1/common/exceptions/core.error.js';

export async function handleConnection(
  socket: Socket,
  namespace: Namespace,
  chatService: ChatService,
) {
  try {
    const userId = socket.data.userId;
    console.log(`🟢 [/chat] Connected: ${socket.id}, ${userId}`);

    await chatService.joinPersonalRoom(socket, userId);
    await chatService.joinChatRooms(socket, userId);
    //함수 chatService 클래스에 두지 말고 분리하기
    
    setupChatHandlers(socket, chatService);
    
    socket.on('disconnect', async () => {
      console.log(`🔴 [/status] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}


export function setupChatHandlers(socket : Socket, chatService : ChatService) {
  const userId = socket.data.userId;

  socket.on('send_message', async (payload) => {
    try {
      const parsed = requestMessageSchema.parse(payload);
      const { roomId, contents } = parsed;
  
      const messageData: ResponseMessage = responseMessageSchema.parse({
        roomId,
        userId,
        contents,
        time: new Date().toISOString(),
      });

      if (!dependencies.chatJoinListRepository.findByUserIdAndRoomId(messageData.userId, messageData.roomId)) {
        throw new ForbiddenException("채팅방에 포함되어있지 않는 사용자입니다.");
      }

      //blocked되어있는 상태이면 저장하지 말기
      await chatService.saveMessage(messageData);
  
      socket.to(`room:${roomId}`).emit('receive_message', messageData);
      //kafka producer로 메시지 보내는 로직 추가
    } catch (e) {
      console.error('❌ 메시지 파싱 실패:', e);
      socket.emit('error_message', { message: '메시지 포맷 오류' });
    }
  });
}