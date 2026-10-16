import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelAllFailedMessages,
  cancelFailedMessage,
  conversationQueryKey,
  conversationsQueryKey,
  messagesQueryKey,
} from "../api/conversations-api";

export function useCancelFailedMessages(
  workspaceId: string,
  conversationId: string,
) {
  const queryClient = useQueryClient();
  const invalidate = () => {
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
  };

  const cancelOne = useMutation({
    mutationFn: (messageId: string) =>
      cancelFailedMessage(conversationId, messageId),
    onSettled: invalidate,
  });
  const cancelAll = useMutation({
    mutationFn: () => cancelAllFailedMessages(conversationId),
    onSettled: invalidate,
  });

  return { cancelOne, cancelAll };
}
