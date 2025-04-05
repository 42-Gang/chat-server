import { BaseCacheInterface } from './base.cache.interface.js';
import { ChatMessage } from '@prisma/client';

export interface UserCacheInterface extends BaseCacheInterface<ChatMessage> {
  getUserById(userId: number): Promise<ChatMessage | null>;

  setUserById(userId: number, user: ChatMessage, ttlSeconds?: number): Promise<void>;

  deleteUserById(userId: number): Promise<void>;
}
