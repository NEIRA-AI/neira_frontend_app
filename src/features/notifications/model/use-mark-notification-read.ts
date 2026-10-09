import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  markNotificationRead,
  notificationsQueryKey,
  type NotificationScope,
} from "../api/notifications-api";

export function useMarkNotificationRead(
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, scope),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId, scope, workspaceId),
      }),
  });
}
