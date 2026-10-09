import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  markNotificationsRead,
  notificationsQueryKey,
  type NotificationScope,
} from "../api/notifications-api";

export function useMarkNotificationsRead(
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => markNotificationsRead(ids, scope),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId, scope, workspaceId),
      }),
  });
}
