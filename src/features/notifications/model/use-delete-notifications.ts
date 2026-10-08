import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotifications,
  notificationsQueryKey,
} from "../api/notifications-api";

export function useDeleteNotifications(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotifications,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId),
      }),
  });
}
