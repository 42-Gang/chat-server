import { Namespace } from "socket.io";
import { TypeOf } from "zod";
import { friendAddMessage, friendBlockMessage } from "./messages.schema.js";
import ChatManager from "../chat.manager.js";

export async function handleFriendAddEvent(
    message: TypeOf<typeof friendAddMessage>,
    namespace: Namespace,
    chatManager: ChatManager,
) {
    console.log(`Friend added: ${message}`);
    const { userAId, userBId } = message;

    const parsedUserAId = Number(userAId);
    const parsedUserBId = Number(userBId);

    const room = await chatManager.createChatRoom(parsedUserAId, parsedUserBId);

    chatManager.addParticipantsToRoom(namespace, room.id, parsedUserAId, parsedUserBId);
}


export async function handleFriendBlockEvent(
    message: TypeOf<typeof friendBlockMessage>,
    namespace: Namespace,
    chatManager: ChatManager,
) {
    const { fromUserId, toUserId } = message;

    const blockerId = Number(fromUserId);
    const blockedId = Number(toUserId);

    if (message.eventType === "BLOCKED") {
        console.log(`Friend blocked: ${message}`);
        await chatManager.leaveDirectMessageRoom(namespace, blockerId, blockedId);
        return;
    } 
    if (message.eventType === "UNBLOCKED") {
        console.log(`Friend unblocked: ${message}`);
        await chatManager.joinDirectMessageRoom(namespace, blockerId, blockedId);
        return;
    }
    console.error(`Unknown block status: ${message.eventType}`);
    return;
}