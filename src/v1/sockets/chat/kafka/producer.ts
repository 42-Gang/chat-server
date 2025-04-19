
import { TOPICS } from './constants.js';
import { producer } from '../../../../plugins/kafka.js';
import { ResponseMessage } from '../chat.schema.js';

export async function sendChat(chat: ResponseMessage) {
  console.log(`Sending chat event to Kafka`);

  await producer.send({
    topic: TOPICS.CHAT_SEND,
    messages: [{ value: JSON.stringify({ chat }) }],
  });
}
