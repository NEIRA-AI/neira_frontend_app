import { useInfiniteQuery } from "@tanstack/react-query";

import {
  listNotifications,
  notificationListQueryKey,
  type NotificationListParams,
} from "../api/notifications-api";

export function useListNotifications(
  userId: string,
  params: NotificationListParams,
) {
  return useInfiniteQuery({
    queryKey: notificationListQueryKey(userId, params),
    queryFn: ({ pageParam }) =>
      listNotifications({ ...params, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(userId),
  });
}
