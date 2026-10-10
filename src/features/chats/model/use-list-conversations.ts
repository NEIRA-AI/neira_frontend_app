import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  conversationQueryKey,
  conversationsQueryKey,
  getConversation,
  listConversations,
} from "../api/conversations-api";

export function useListConversations(workspaceId: string) {
  return useInfiniteQuery({
    queryKey: conversationsQueryKey(workspaceId),
    queryFn: ({ pageParam }) => listConversations(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: Boolean(workspaceId),
  });
}

export function useConversation(workspaceId: string, id: string) {
  return useQuery({
    queryKey: conversationQueryKey(workspaceId, id),
    queryFn: () => getConversation(id),
    enabled: Boolean(workspaceId && id),
  });
}
