import { FastifyReply, FastifyRequest } from "fastify";
import ChatService from "./chat.service.js";
import { getMessagesResponseSchema } from "./schemas/getMessages.schema.js";

export default class ChatController {
    constructor(private readonly chatService: ChatService) {}

    loadMessages = async (request: FastifyRequest, reply: FastifyReply) => {
        const params = getMessagesResponseSchema.parse(request.params);
        const result = await this.chatService.loadMessages()
    }
}