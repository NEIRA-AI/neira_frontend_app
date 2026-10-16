import { useInfiniteQuery } from "@tanstack/react-query";

import { contactListQueryKey, listContacts } from "../api/contacts-api";

export function useListContacts(workspaceId: string, search: string) {
  return useInfiniteQuery({
    queryKey: contactListQueryKey(workspaceId, search),
    queryFn: ({ pageParam }) => listContacts(pageParam, search),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId),
  });
}
