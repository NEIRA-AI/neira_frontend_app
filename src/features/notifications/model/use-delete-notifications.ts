import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotifications,
  notificationsQueryKey,
  type NotificationScope,
} from "../api/notifications-api";

export function useDeleteNotifications(
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteNotifications(ids, scope),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId, scope, workspaceId),
      }),
  });
}
