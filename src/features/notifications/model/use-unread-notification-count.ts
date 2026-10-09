import { useQuery } from "@tanstack/react-query";

import {
  getUnreadNotificationCount,
  unreadNotificationCountQueryKey,
  type NotificationScope,
} from "../api/notifications-api";

export function useUnreadNotificationCount(
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) {
  return useQuery({
    queryKey: unreadNotificationCountQueryKey(userId, scope, workspaceId),
    queryFn: () => getUnreadNotificationCount(scope),
    enabled: Boolean(userId) && (scope === "personal" || Boolean(workspaceId)),
  });
}
