import { useInfiniteQuery } from "@tanstack/react-query";

import {
  listNotifications,
  notificationListQueryKey,
  type NotificationListParams,
  type NotificationScope,
} from "../api/notifications-api";

export function useListNotifications(
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
  params: NotificationListParams,
) {
  return useInfiniteQuery({
    queryKey: notificationListQueryKey(userId, scope, workspaceId, params),
    queryFn: ({ pageParam }) =>
      listNotifications({ ...params, cursor: pageParam }, scope),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(userId) && (scope === "personal" || Boolean(workspaceId)),
  });
}
