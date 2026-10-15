import { useInfiniteQuery } from "@tanstack/react-query";

import {
  getMessageRevisions,
  messageRevisionsQueryKey,
} from "../api/conversations-api";

export function useMessageRevisions(
  workspaceId: string,
  conversationId: string,
  messageId: string,
  open: boolean,
) {
  return useInfiniteQuery({
    queryKey: messageRevisionsQueryKey(workspaceId, conversationId, messageId),
    queryFn: ({ pageParam }) =>
      getMessageRevisions(conversationId, messageId, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: open && Boolean(workspaceId && conversationId && messageId),
    staleTime: 60_000,
  });
}
