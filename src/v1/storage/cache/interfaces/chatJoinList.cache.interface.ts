import { BaseCacheInterface } from './base.cache.interface.js';
import { ChatMessage } from '@prisma/client';

export interface chatJoinListCacheInterface extends BaseCacheInterface<ChatMessage> {
  getJoinListById(userId: number): Promise<ChatMessage | null>;

  setJoinListById(userId: number, user: ChatMessage, ttlSeconds?: number): Promise<void>;
}
