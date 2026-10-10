import { useInfiniteQuery } from "@tanstack/react-query";

import {
  funnelInquiriesQueryKey,
  listFunnelInquiries,
} from "../api/inquiries-api";

export function useListFunnelInquiries(workspaceId: string, funnelId: string) {
  return useInfiniteQuery({
    queryKey: funnelInquiriesQueryKey(workspaceId, funnelId),
    queryFn: ({ pageParam }) => listFunnelInquiries(funnelId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && funnelId),
  });
}
