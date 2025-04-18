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
    const { userAId, userBId } = message;

    const blockerId = Number(userAId);
    const blockedId = Number(userBId);

    if (message.status === "BLOCKED") {
        console.log(`Friend blocked: ${message}`);
        await chatManager.leaveDirectMessageRoom(namespace, blockerId, blockedId);
        return;
    } 
    if (message.status === "UNBLOCKED") {
        console.log(`Friend unblocked: ${message}`);
        await chatManager.joinDirectMessageRoom(namespace, blockerId, blockedId);
        return;
    }
    console.error(`Unknown block status: ${message.status}`);
    return;
}