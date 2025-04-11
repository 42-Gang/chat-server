import { Namespace, Socket } from 'socket.io';
import ChatService from './chat.service.js';

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
    await chatService.joinChatRooms(socket, userId);

    //kafka producer로 메시지 보내는 로직 추가
    socket.on('disconnect', async () => {
      console.log(`🔴 [/status] Disconnected: ${socket.id}`);
    });
  } catch (error) {
    console.error(`Error in connection handler: ${error}`);
  }
}
