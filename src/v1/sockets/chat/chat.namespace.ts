import { Namespace } from 'socket.io';
import { socketMiddleware } from '../utils/middleware.js';
import { handleConnection } from './connection.handler.js';
import ChatManager from './chat.manager.js';

export default async function chatNamespace(namespace: Namespace) {
  namespace.use(socketMiddleware);

  const chatManager = new ChatManager();
  namespace.on('connection', (socket) => handleConnection(socket, chatManager));
}
