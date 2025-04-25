import { Namespace } from 'socket.io';
import { socketMiddleware } from '../utils/middleware.js';
import { handleConnection } from './connection.handler.js';
import ChatManager from './chat.manager.js';
import { startConsumer } from './kafka/consumer.js';

export default async function chatNamespace(namespace: Namespace) {
  namespace.use(socketMiddleware);

  const chatManager = new ChatManager();
  startConsumer(namespace, chatManager);

  namespace.on('connection', (socket) => handleConnection(socket, chatManager));
}
