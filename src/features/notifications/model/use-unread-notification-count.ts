import { useQuery } from "@tanstack/react-query";

import {
  getUnreadNotificationCount,
  unreadNotificationCountQueryKey,
} from "../api/notifications-api";

export function useUnreadNotificationCount(userId: string) {
  return useQuery({
    queryKey: unreadNotificationCountQueryKey(userId),
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(userId),
  });
}
