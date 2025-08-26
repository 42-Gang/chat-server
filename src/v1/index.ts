import { FastifyInstance } from 'fastify';

import chatRoutes from './apis/chat.route.js';
import { context, trace } from '@opentelemetry/api';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, _) => {
    const span = trace.getSpan(context.active());
    if (!span) return;

    span.updateName(`${request.method} ${request.url}`);
  });

  fastify.register(chatRoutes, { prefix: '/chat' });
}
