// import { GROUP_IDS, TOPICS } from "./constants.js";
// import { kafka } from "../../../../plugins/kafka.js";
// import { Namespace } from "socket.io";

// const consumer = kafka.consumer({ groupId: GROUP_IDS.STATUS, sessionTimeout: 10000 });

// export async function startConsumer(
//     namespace: Namespace,
// ) {
//     await consumer.connect();
//     await consumer.subscribe({ topic: TOPICS.USER_STATUS, fromBeginning: true });
//     await consumer.subscribe({ topic: TOPICS.FRIEND_ADD, fromBeginning: true });
//     await consumer.subscribe({ topic: TOPICS.FRIEND_BLOCK, fromBeginning: true });

//     await consumer.run({
//         eachMessage: async ({ topic, message }) => {
//             if (!message.value) {
//                 return console.warn(`Null message value for topic ${topic}`);
//             }

//             const parsedMessage = JSON.parse(message.value.toString());
//             if (topic === TOPICS.USER_STATUS) {
//                 //핸들러
//                 return;
//             }
//             if (topic === TOPICS.FRIEND_ADD) {
//                 //핸들러;
//                 return;
//             }
//             if (topic === TOPICS.FRIEND_BLOCK) {
//                 //핸들러
//                 return;
//             }
//         },
//     });
// }
