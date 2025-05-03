import { AUTH_EVENTS, FRIEND_EVENTS, GROUP_IDS, TOPICS } from './constants.js';
import { kafka } from '../../../../plugins/kafka.js';
import { Namespace } from 'socket.io';
import {
  handleFriendAddEvent,
  handleFriendBlockEvent,
  handleFriendUnblockEvent,
  handleUserLogout,
} from './consumer.handler.js';
import ChatManager from '../chat.manager.js';

const consumer = kafka.consumer({ groupId: GROUP_IDS.FRIEND, sessionTimeout: 10000 });

export async function startConsumer(namespace: Namespace, chatManager: ChatManager) {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.FRIEND, fromBeginning: false });
  await consumer.subscribe({ topic: TOPICS.AUTH, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return console.warn(`Null message value for topic ${topic}`);
      }

      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log('parsedMessage', parsedMessage);

        if (parsedMessage.eventType === FRIEND_EVENTS.ADDED) {
          await handleFriendAddEvent(parsedMessage, namespace, chatManager);
          return;
        }
        if (parsedMessage.eventType === FRIEND_EVENTS.BLOCK) {
          await handleFriendBlockEvent(parsedMessage, namespace, chatManager);
          return;
        }
        if (parsedMessage.eventType === FRIEND_EVENTS.UNBLOCK) {
          await handleFriendUnblockEvent(parsedMessage, namespace, chatManager);
          return;
        }
        if (parsedMessage.eventType === AUTH_EVENTS.LOGOUT) {
          await handleUserLogout(parsedMessage, namespace);
          return;
        }
      } catch (error) {
        console.error(
          `❌ Error handling message from topic ${topic}:`,
          error,
          'Raw message:',
          message.value.toString(),
        );
      }
    },
  });
}
