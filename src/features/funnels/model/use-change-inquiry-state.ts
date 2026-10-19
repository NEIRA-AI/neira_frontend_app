import { useMutation, useQueryClient } from "@tanstack/react-query";

import { contactInquiriesQueryPrefix } from "@/features/contacts";

import {
  changeInquiryState,
  funnelInquiriesQueryPrefix,
} from "../api/inquiries-api";

type ChangeInquiryStateInput = {
  funnelId: string;
  contactId: string;
  inquiryId: string;
  state: "open" | "closed";
  expectedRevision: number;
};

export function useChangeInquiryState(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inquiryId,
      state,
      expectedRevision,
    }: ChangeInquiryStateInput) =>
      changeInquiryState({ inquiryId, state, expectedRevision }),
    onSuccess: async (_inquiry, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: funnelInquiriesQueryPrefix(workspaceId, input.funnelId),
        }),
        queryClient.invalidateQueries({
          queryKey: contactInquiriesQueryPrefix(workspaceId, input.contactId),
        }),
      ]);
    },
  });
}
