import { useInfiniteQuery } from "@tanstack/react-query";

import { contactsQueryKey, listContacts } from "../api/contacts-api";

export function useListContacts(workspaceId: string) {
  return useInfiniteQuery({
    queryKey: contactsQueryKey(workspaceId),
    queryFn: ({ pageParam }) => listContacts(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId),
  });
}
