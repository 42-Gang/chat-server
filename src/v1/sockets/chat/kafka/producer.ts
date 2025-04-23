
import { TOPICS } from './constants.js';
import { producer } from '../../../../plugins/kafka.js';
import { ResponseMessage } from '../chat.schema.js';
import { nextTick } from 'process';
import { timeStamp } from 'console';

export async function sendChat(chat: ResponseMessage) {
  console.log(`Sending chat event to Kafka`);

  await producer.send({
    topic: TOPICS.CHAT,
    messages: [{ 
      key:  String(chat.roomId),
      value: JSON.stringify({ 
        userId: chat.userId,
        nickname: chat.nickname,
        timestamp: chat.timestamp,
        contents: chat.contents,
        roomId: chat.roomId,
        eventType: 'SEND',
     }) }],
  });
}
  