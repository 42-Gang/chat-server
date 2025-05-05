import { Namespace } from 'socket.io';
import { TypeOf } from 'zod';
import { friendAddMessage, friendBlockMessage, logoutMessage } from './messages.schema.js';
import ChatManager from '../chat.manager.js';

export async function handleFriendAddEvent(
  message: TypeOf<typeof friendAddMessage>,
  namespace: Namespace,
  chatManager: ChatManager,
) {
  console.log(`Friend added: ${message}`);
  const { userAId, userBId } = message;

  const parsedUserAId = userAId;
  const parsedUserBId = userBId;

  const room = await chatManager.createChatRoom(parsedUserAId, parsedUserBId);

  chatManager.addParticipantsToRoom(namespace, room.id, parsedUserAId, parsedUserBId);
}

export async function handleFriendBlockEvent(
  message: TypeOf<typeof friendBlockMessage>,
  namespace: Namespace,
  chatManager: ChatManager,
) {
  const { fromUserId, toUserId } = message;

  const blockerId = fromUserId;
  const blockedId = toUserId;

  console.log(`Friend blocked: ${message}`);
  await chatManager.leaveDirectMessageRoom(namespace, blockerId, blockedId);
  return;
}

export async function handleFriendUnblockEvent(
  message: TypeOf<typeof friendBlockMessage>,
  namespace: Namespace,
  chatManager: ChatManager,
) {
  const { fromUserId, toUserId } = message;

  const blockerId = fromUserId;
  const blockedId = toUserId;

  console.log(`Friend unblocked: ${message}`);
  await chatManager.joinDirectMessageRoom(namespace, blockerId, blockedId);
  return;
}

export async function handleUserLogout(
  message: TypeOf<typeof logoutMessage>,
  namespace: Namespace,
) {
  const { userId } = message;

  console.log(`🔴 Logout: ${userId}`);

  namespace.to(`user:${userId}`).disconnectSockets();

  return;
}
