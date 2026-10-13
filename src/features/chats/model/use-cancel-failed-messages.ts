import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelAllFailedMessages,
  cancelFailedMessage,
  conversationsQueryKey,
} from "../api/conversations-api";

export function useCancelFailedMessages(
  workspaceId: string,
  conversationId: string,
) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: conversationsQueryKey(workspaceId),
    });

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
