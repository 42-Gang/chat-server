import { FastifyReply, FastifyRequest } from 'fastify';
import ChatService from './chat.service.js';
import { getMessagesParamsSchema } from './schemas/get-messages.schema.js';
import { getDmRoomIdQuerySchema } from './schemas/get-room-id.schema.js';

export default class ChatController {
  constructor(private readonly chatService: ChatService) {}

  loadMessages = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = getMessagesParamsSchema.parse(request.params);
    const result = await this.chatService.loadMessages(params.roomId, request.userId);
    reply.code(200).send(result);
  };

  getRoomId = async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = getDmRoomIdQuerySchema.parse(request.query);
    const result = await this.chatService.getRoomId(parsed);
    reply.status(200).send(result);
  }
}
