import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import { contactInquiriesQueryPrefix } from "@/features/contacts";

import {
  funnelInquiriesQueryKey,
  funnelInquiriesQueryPrefix,
  moveInquiryToStatus,
  type InquiryFilter,
  type InquiryPage,
} from "../api/inquiries-api";

type MoveInquiryInput = {
  funnelId: string;
  inquiryId: string;
  statusId: string;
  statusName: string;
  expectedRevision: number;
  filter: InquiryFilter;
};

type InquiryPages = InfiniteData<InquiryPage, string | null>;

export function useMoveInquiry(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, statusId, expectedRevision }: MoveInquiryInput) =>
      moveInquiryToStatus({ inquiryId, statusId, expectedRevision }),
    onMutate: async (input: MoveInquiryInput) => {
      const key = funnelInquiriesQueryKey(
        workspaceId,
        input.funnelId,
        input.filter,
      );
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InquiryPages>(key);
      const currentInquiry = previous?.pages
        .flatMap((page) => page.items)
        .find((inquiry) => inquiry.id === input.inquiryId);

      if (currentInquiry && currentInquiry.status_id !== input.statusId) {
        queryClient.setQueryData<InquiryPages>(key, (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page, index) => ({
              ...page,
              items: page.items.map((inquiry) =>
                inquiry.id === input.inquiryId
                  ? {
                      ...inquiry,
                      status_id: input.statusId,
                      status_name: input.statusName,
                    }
                  : inquiry,
              ),
              status_counts:
                index === 0
                  ? {
                      ...page.status_counts,
                      [currentInquiry.status_id]: Math.max(
                        0,
                        (page.status_counts[currentInquiry.status_id] ?? 0) - 1,
                      ),
                      [input.statusId]:
                        (page.status_counts[input.statusId] ?? 0) + 1,
                    }
                  : page.status_counts,
            })),
          };
        });
      }

      return { key, previous, contactId: currentInquiry?.contact_id };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _error, input, context) => {
      void queryClient.invalidateQueries({
        queryKey: funnelInquiriesQueryPrefix(workspaceId, input.funnelId),
      });
      if (context?.contactId) {
        void queryClient.invalidateQueries({
          queryKey: contactInquiriesQueryPrefix(workspaceId, context.contactId),
        });
      }
    },
  });
}
