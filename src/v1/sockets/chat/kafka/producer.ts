import { TOPICS } from './constants.js';
import { producer } from '../../../../plugins/kafka.js';
import { ResponseMessage } from '../chat.schema.js';
import { getLogger } from '../../../../plugins/logger.js';

export async function sendChat(chat: ResponseMessage) {
  getLogger().info(
    { roomId: chat.roomId, messageId: chat.messageId },
    'sending chat event to Kafka',
  );

  await producer.send({
    topic: TOPICS.CHAT,
    messages: [
      {
        key: String(chat.roomId),
        value: JSON.stringify({
          userId: chat.userId,
          nickname: chat.nickname,
          timestamp: chat.timestamp,
          messageId: chat.messageId,
          contents: chat.contents,
          roomId: chat.roomId,
          eventType: 'SEND',
        }),
      },
    ],
  });
}
