import { gotClient } from "../../../plugins/http.client.js";

export async function checkBlockStatus(userAId: number, userBId: number): Promise<boolean> {
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
}