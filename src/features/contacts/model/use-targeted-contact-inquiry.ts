import { useQuery } from "@tanstack/react-query";

import {
  getTargetedContactInquiry,
  targetedContactInquiryQueryKey,
} from "../api/contacts-api";

export function useTargetedContactInquiry(
  workspaceId: string,
  contactId: string,
  inquiryId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: targetedContactInquiryQueryKey(workspaceId, contactId, inquiryId),
    queryFn: ({ signal }) =>
      getTargetedContactInquiry(workspaceId, inquiryId, signal),
    enabled: enabled && Boolean(workspaceId && contactId && inquiryId),
  });
}
