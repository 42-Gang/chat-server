import { Namespace, Socket } from 'socket.io';
import ChatService from './chat.service.js';
import { requestMessageSchema, ResponseMessage, responseMessageSchema } from './chat.schema.js';

export async function handleConnection(
  socket: Socket,
  namespace: Namespace,
  chatService: ChatService,
) {
  try {
    const userId = socket.data.userId;//왜 Number로 바꿔줘야 하지?
    console.log(`🟢 [/chat] Connected: ${socket.id}, ${userId}`);

    //유저 개개인의 룸에 join
    await chatService.joinPersonalRoom(socket, userId);

    // 유저가 포함된 채팅방을 찾아서 join
    await chatService.joinChatRooms(socket, userId);//함수 클래스에 두지 말고 ㅃㅐ기

    registerSocketEvents(socket, chatService);
    //kafka producer로 메시지 보내는 로직 추가
    socket.on('disconnect', async () => {
      console.log(`🔴 [/status] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}


export function registerSocketEvents(socket : Socket, chatService : ChatService) {
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
  
      await chatService.saveMessage(messageData);
  
      socket.to(`room:${roomId}`).emit('receive_message', messageData);
    } catch (e) {
      console.error('❌ 메시지 파싱 실패:', e);
      socket.emit('error_message', { message: '메시지 포맷 오류' });
    }
  });
}