import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  markNotificationRead,
  notificationsQueryKey,
} from "../api/notifications-api";

export function useMarkNotificationRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId),
      }),
  });
}
