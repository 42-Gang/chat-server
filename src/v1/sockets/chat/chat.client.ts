import { gotClient } from '../../../plugins/http.client.js';

export async function checkBlockStatus(userAId: number, userBId: number): Promise<boolean> {
  try {
    const friendStatus = await gotClient.request<{
      data: { status: 'BLOCKED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' };
    }>({
      method: 'GET',
      url: `http://localhost:8080/api/v1/friends/status?user_id=${userAId}&friend_id=${userBId}`,
      headers: {
        'X-Authenticated': 'true',
        'X-User-Id': userAId.toString(),
      },
    });
    if (friendStatus.body.data.status === 'BLOCKED') return true;
    return false;
  } catch (e) {
    console.error('Error checking block status:', e);
    console.error('User A ID:', userAId);
    console.error('User B ID:', userBId);
    return false;
  }
}

export async function getUserNick(userId: number): Promise<string | undefined> {
  try {
    const friendStatus = await gotClient.request<{
      data: {
        nickname: string,
        avatar: string,
      };
    }>({
      method: 'GET',
      url: `http://localhost:8080/api/v1/users/${userId}`,
      headers: {
        'X-Authenticated': 'true',
        'X-User-Id': userId.toString(),
      },
    });
    return friendStatus.body.data.nickname;
  } catch (e) {
    console.error('Error getting user nickname', e);
    console.error('User ID:', userId);
    return undefined;
  }
}
