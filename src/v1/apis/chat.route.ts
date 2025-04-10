import { FastifyInstance } from 'fastify';

import ChatController from './chat.controller.js';
import {
  getMessagesParamsSchema,
  getMessagesResponseSchema,
} from './schemas/getMessages.schema.js';
import { addRoutes, Route } from '../../plugins/router.js';

export default async function chatRoutes(fastify: FastifyInstance) {
  const chatController: ChatController = fastify.diContainer.resolve('chatController');
  const routes: Array<Route> = [
    {
      method: 'GET',
      url: '/:roomId/messages',
      handler: chatController.loadMessages,
      options: {
        schema: {
          tags: ['chat'],
          description: '메세지 불러오기',
          params: getMessagesParamsSchema,
          response: {
            200: getMessagesResponseSchema,
          },
        },
        auth: true,
      },
    },
  ];
  await addRoutes(fastify, routes);
}
