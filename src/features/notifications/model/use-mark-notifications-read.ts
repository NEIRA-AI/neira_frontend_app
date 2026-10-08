import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  markNotificationsRead,
  notificationsQueryKey,
} from "../api/notifications-api";

export function useMarkNotificationsRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsRead,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId),
      }),
  });
}
