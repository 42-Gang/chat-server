import { Namespace } from "socket.io";
import { socketMiddleware } from "../utils/middleware.js";
import { handleConnection } from "./connection.handler.js";
import ChatService from "./chat.service.js";

export default async function chatNamespace(namespace: Namespace) {
  namespace.use(socketMiddleware);

  const chatService = new ChatService();
  namespace.on('connection', (socket) =>
    handleConnection(socket, namespace, chatService),
  );
}
//채팅 보내기 전에 채팅방에 포함된 사용자인지 확인하는 로직 추가