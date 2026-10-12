import { useInfiniteQuery } from "@tanstack/react-query";

import {
  contactInquiriesQueryKey,
  listContactInquiries,
} from "../api/contacts-api";

export function useContactInquiries(
  workspaceId: string,
  contactId: string,
  limit = 50,
) {
  return useInfiniteQuery({
    queryKey: contactInquiriesQueryKey(workspaceId, contactId, limit),
    queryFn: ({ pageParam }) =>
      listContactInquiries(contactId, pageParam, limit),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && contactId),
  });
}
