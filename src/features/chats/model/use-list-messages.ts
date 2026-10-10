import { useInfiniteQuery } from "@tanstack/react-query";

import { listMessages, messagesQueryKey } from "../api/conversations-api";

export function useListMessages(workspaceId: string, conversationId: string) {
  return useInfiniteQuery({
    queryKey: messagesQueryKey(workspaceId, conversationId),
    queryFn: ({ pageParam }) => listMessages(conversationId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && conversationId),
  });
}
