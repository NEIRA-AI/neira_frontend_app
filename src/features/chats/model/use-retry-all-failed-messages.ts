import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  conversationQueryKey,
  conversationsQueryKey,
  listFailedMessageIds,
  messagesQueryKey,
  retryMessage,
} from "../api/conversations-api";

import { persistedSendStatus } from "./use-send-message";

export type RetryAllProgress = {
  done: number;
  total: number;
  succeeded: number;
};

export type RetryAllResult = RetryAllProgress & {
  stopped: boolean;
};

async function failedMessageSnapshot(
  conversationId: string,
): Promise<string[]> {
  const ids: string[] = [];
  const seen = new Set<string>();
  let cursor: string | null = null;
  do {
    const page = await listFailedMessageIds(conversationId, cursor);
    for (const id of page.items) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    if (page.next_cursor !== null && page.next_cursor === cursor) {
      throw new Error("Failed-message pagination did not advance");
    }
    cursor = page.next_cursor;
  } while (cursor);
  return ids;
}

export function useRetryAllFailedMessages(
  workspaceId: string,
  conversationId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      onProgress: (progress: RetryAllProgress) => void,
    ): Promise<RetryAllResult> => {
      // Capture IDs before sending: a successful retry changes message order.
      const ids = await failedMessageSnapshot(conversationId);
      const progress: RetryAllProgress = {
        done: 0,
        total: ids.length,
        succeeded: 0,
      };
      onProgress({ ...progress });
      for (const id of ids) {
        try {
          const message = await retryMessage(conversationId, id);
          if (message.delivery_status === "sent") {
            progress.succeeded += 1;
          } else if (message.delivery_status !== "failed") {
            progress.done += 1;
            onProgress({ ...progress });
            return { ...progress, stopped: true };
          }
        } catch (failure) {
          if (persistedSendStatus(failure, id) !== "failed") {
            progress.done += 1;
            onProgress({ ...progress });
            return { ...progress, stopped: true };
          }
        }
        progress.done += 1;
        onProgress({ ...progress });
      }
      return { ...progress, stopped: false };
    },
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
