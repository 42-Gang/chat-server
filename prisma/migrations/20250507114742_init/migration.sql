/*
  Warnings:

  - You are about to drop the column `time` on the `chat_message` table. All the data in the column will be lost.
  - Added the required column `timestamp` to the `chat_message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat_message` DROP COLUMN `time`,
    ADD COLUMN `timestamp` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `chat_join_list` ADD CONSTRAINT `chat_join_list_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `chat_room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
