import Fastify, { FastifyInstance } from 'fastify';
import { getPinoOptions } from './plugins/logger.js';

export function createServer() {
  return Fastify({
    logger: getLoggerOptions(),
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: 'all',
      },
    },
  });
}

export function getLoggerOptions() {
  if (process.env.NODE_ENV === 'dev') {
    return {
      ...getPinoOptions(),
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    };
  }
  return {
    ...getPinoOptions(),
  };
}

export async function startServer(server: FastifyInstance) {
  try {
    await server.listen({ port: Number(process.env.FASTIFY_PORT) || 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
