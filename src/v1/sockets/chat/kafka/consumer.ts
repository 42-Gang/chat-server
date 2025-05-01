import { FRIEND_EVENTS, GROUP_IDS, TOPICS } from './constants.js';
import { kafka } from '../../../../plugins/kafka.js';
import { Namespace } from 'socket.io';
import {
  handleFriendAddEvent,
  handleFriendBlockEvent,
  handleFriendUnblockEvent,
} from './consumer.handler.js';
import ChatManager from '../chat.manager.js';

const consumer = kafka.consumer({ groupId: GROUP_IDS.FRIEND, sessionTimeout: 10000 });

export async function startConsumer(namespace: Namespace, chatManager: ChatManager) {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.FRIEND, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return console.warn(`Null message value for topic ${topic}`);
      }

      console.log('raw', message);
      // console.log('message', message.value.toString());

      const parsedMessage = JSON.parse(message.value.toString());

      console.log('parsedMessage', parsedMessage);

      if (parsedMessage.eventType === FRIEND_EVENTS.ADDED) {
        handleFriendAddEvent(parsedMessage, namespace, chatManager);
        return;
      }
      if (parsedMessage.eventType === FRIEND_EVENTS.BLOCK) {
        handleFriendBlockEvent(parsedMessage, namespace, chatManager);
        return;
      }
      if (parsedMessage.eventType === FRIEND_EVENTS.UNBLOCK) {
        handleFriendUnblockEvent(parsedMessage, namespace, chatManager);
        return;
      }
    },
  });
}
