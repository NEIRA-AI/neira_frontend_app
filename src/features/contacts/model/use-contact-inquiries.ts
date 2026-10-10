import { useInfiniteQuery } from "@tanstack/react-query";

import {
  contactInquiriesQueryKey,
  listContactInquiries,
} from "../api/contacts-api";

export function useContactInquiries(workspaceId: string, contactId: string) {
  return useInfiniteQuery({
    queryKey: contactInquiriesQueryKey(workspaceId, contactId),
    queryFn: ({ pageParam }) => listContactInquiries(contactId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && contactId),
  });
}
