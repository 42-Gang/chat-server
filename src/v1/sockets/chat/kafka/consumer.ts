import { GROUP_IDS, TOPICS } from "./constants.js";
import { kafka } from "../../../../plugins/kafka.js";
import { Namespace } from "socket.io";
import { handleFriendAddEvent, handleFriendBlockEvent } from "./consumer.handler.js";
import ChatManager from "../chat.manager.js";

const consumer = kafka.consumer({ groupId: GROUP_IDS.FRIEND, sessionTimeout: 10000 });

export async function startConsumer(
    namespace: Namespace,
    chatManager: ChatManager,
) {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.FRIEND_ADD, fromBeginning: true });
    await consumer.subscribe({ topic: TOPICS.FRIEND_BLOCK, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (!message.value) {
                return console.warn(`Null message value for topic ${topic}`);
            }

            const parsedMessage = JSON.parse(message.value.toString());
            
            if (topic === TOPICS.FRIEND_ADD) {
                handleFriendAddEvent(parsedMessage, namespace, chatManager);
                return;
            }
            if (topic === TOPICS.FRIEND_BLOCK) {
                handleFriendBlockEvent(parsedMessage, namespace, chatManager);
                return;
            }
        },
    });
}
