import { gotClient } from '../../../plugins/http.client.js';
import { getLogger } from '../../../plugins/logger.js';

export async function checkBlockStatus(userAId: number, userBId: number): Promise<boolean> {
  try {
    const friendStatus = await gotClient.request<{
      data: { status: 'BLOCKED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' };
    }>({
      method: 'GET',
      url: `http://${process.env.USER_SERVER_URL}/api/v1/friends/status?userId=${userAId}&friendId=${userBId}`,
      headers: {
        'X-Authenticated': 'true',
        'X-User-Id': userAId.toString(),
      },
    });
    if (friendStatus.body.data.status === 'BLOCKED') return true;
    return false;
  } catch (e) {
    getLogger().warn({ err: e, userAId, userBId }, 'checkBlockStatus failed');
    return false;
  }
}

export async function getUserNick(userId: number): Promise<string | undefined> {
  try {
    const friendStatus = await gotClient.request<{
      data: {
        nickname: string;
        avatar: string;
      };
    }>({
      method: 'GET',
      url: `http://${process.env.USER_SERVER_URL}/api/v1/users/${userId}`,
      headers: {
        'X-Authenticated': 'true',
        'X-User-Id': userId.toString(),
      },
    });
    return friendStatus.body.data.nickname;
  } catch (e) {
    getLogger().warn({ err: e, userId }, 'getUserNick failed');
    return undefined;
  }
}
