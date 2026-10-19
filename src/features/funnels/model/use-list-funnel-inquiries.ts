import { useInfiniteQuery } from "@tanstack/react-query";

import {
  funnelInquiriesQueryKey,
  listFunnelInquiries,
  type InquiryFilter,
} from "../api/inquiries-api";

export function useListFunnelInquiries(
  workspaceId: string,
  funnelId: string,
  filter: InquiryFilter,
) {
  return useInfiniteQuery({
    queryKey: funnelInquiriesQueryKey(workspaceId, funnelId, filter),
    queryFn: ({ pageParam }) =>
      listFunnelInquiries(funnelId, pageParam, filter),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && funnelId),
  });
}
