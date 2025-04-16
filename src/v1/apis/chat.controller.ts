import { FastifyReply, FastifyRequest } from 'fastify';
import ChatService from './chat.service.js';
import { getMessagesParamsSchema } from './schemas/getMessages.schema.js';

export default class ChatController {
  constructor(private readonly chatService: ChatService) {}

  loadMessages = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = getMessagesParamsSchema.parse(request.params);
    const result = await this.chatService.loadMessages(params.roomId, request.userId);
    reply.code(200).send(result);
  };
}
