import { FastifyInstance } from 'fastify';

import ChatController from './chat.controller.js';
import {
  getMessagesParamsSchema,
  getMessagesQuerySchema,
  getMessagesResponseSchema,
} from './schemas/get-messages.schema.js';
import { addRoutes, Route } from '../../plugins/router.js';
import { getDmRoomIdQuerySchema, getDmRoomIdResponseSchema } from './schemas/get-room-id.schema.js';

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
          querystring: getMessagesQuerySchema,
          response: {
            200: getMessagesResponseSchema,
          },
        },
        auth: true,
      },
    },
    {
      method: 'GET',
      url: '/room/dm',
      handler: chatController.getRoomId,
      options: {
        schema: {
          tags: ['chat'],
          description: '채팅룸 아이디 조회',
          querystring: getDmRoomIdQuerySchema,
          response: {
            200: getDmRoomIdResponseSchema,
          },
        },
        auth: true,
      },
    },
  ];
  await addRoutes(fastify, routes);
}
