import { FastifyInstance } from 'fastify';

import chatRoutes from './apis/chat.route.js';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.register(chatRoutes);
}
//TODO 여기 고치기