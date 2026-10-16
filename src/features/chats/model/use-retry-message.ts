import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  conversationQueryKey,
  conversationsQueryKey,
  messagesQueryKey,
  retryMessage,
} from "../api/conversations-api";

export function useRetryMessage(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => retryMessage(conversationId, messageId),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(workspaceId),
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKey(workspaceId, conversationId),
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKey(workspaceId, conversationId),
        exact: true,
      });
    },
  });
}
