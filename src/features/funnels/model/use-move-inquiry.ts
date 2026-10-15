import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import {
  funnelInquiriesQueryKey,
  moveInquiryToStatus,
  type InquiryPage,
} from "../api/inquiries-api";

type MoveInquiryInput = {
  funnelId: string;
  inquiryId: string;
  statusId: string;
  statusName: string;
};

type InquiryPages = InfiniteData<InquiryPage, string | null>;

export function useMoveInquiry(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, statusId }: MoveInquiryInput) =>
      moveInquiryToStatus({ inquiryId, statusId }),
    onMutate: async (input: MoveInquiryInput) => {
      const key = funnelInquiriesQueryKey(workspaceId, input.funnelId);
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

      return { key, previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["private", "inquiries", workspaceId],
      });
    },
  });
}
