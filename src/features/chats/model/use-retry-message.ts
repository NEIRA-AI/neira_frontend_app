import { useMutation, useQueryClient } from "@tanstack/react-query";

import { conversationsQueryKey, retryMessage } from "../api/conversations-api";

export function useRetryMessage(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => retryMessage(conversationId, messageId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(workspaceId),
      }),
  });
}
