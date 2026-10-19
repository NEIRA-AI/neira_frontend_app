import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { contactInquiriesQueryPrefix } from "@/features/contacts";
import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import { funnelsQueryKey } from "../api/funnels-api";
import {
  funnelInquiriesQueryPrefix,
  getInquiry,
  type InquiryPage,
  type InquirySummary,
} from "../api/inquiries-api";

function activeInquiryCards(
  queryClient: QueryClient,
  workspaceId: string,
  inquiryId: string,
) {
  return queryClient.getQueryCache().findAll({
    queryKey: ["private", "inquiries", workspaceId],
    predicate: (query) => {
      if (query.getObserversCount() === 0) return false;
      const data = query.state.data as InfiniteData<InquiryPage> | undefined;
      return Boolean(
        data?.pages.some((page) =>
          page.items.some((item) => item.id === inquiryId),
        ),
      );
    },
  });
}

function sameInquiryLocation(current: InquirySummary, updated: InquirySummary) {
  return (
    current.contact_id === updated.contact_id &&
    current.funnel_id === updated.funnel_id &&
    current.status_id === updated.status_id &&
    current.state === updated.state
  );
}

export async function refreshInquiryActivity(
  queryClient: QueryClient,
  workspaceId: string,
  inquiryId: string,
  invalidate: QueueRealtimeInvalidation,
  signal: AbortSignal,
  recentlyCreated?: { funnelId?: string; contactId?: string },
) {
  if (activeInquiryCards(queryClient, workspaceId, inquiryId).length === 0) {
    // A create may still be refetching its list when the next message lands.
    // Re-read only those active lists once so the first card has a fresh preview.
    if (recentlyCreated?.funnelId) {
      for (const board of queryClient.getQueryCache().findAll({
        queryKey: funnelInquiriesQueryPrefix(
          workspaceId,
          recentlyCreated.funnelId,
        ),
      })) {
        if (board.getObserversCount() > 0 && board.queryKey[4] !== "closed") {
          invalidate(board.queryKey, true);
        }
      }
    }
    if (recentlyCreated?.contactId) {
      for (const query of queryClient.getQueryCache().findAll({
        queryKey: contactInquiriesQueryPrefix(
          workspaceId,
          recentlyCreated.contactId,
        ),
      })) {
        if (query.getObserversCount() > 0) invalidate(query.queryKey, true);
      }
    }
    return;
  }

  let updated: InquirySummary;
  try {
    updated = await getInquiry(inquiryId, workspaceId, signal);
  } catch {
    if (signal.aborted) return;
    for (const query of activeInquiryCards(
      queryClient,
      workspaceId,
      inquiryId,
    )) {
      invalidate(query.queryKey, true);
    }
    return;
  }
  if (signal.aborted) return;

  for (const query of activeInquiryCards(queryClient, workspaceId, inquiryId)) {
    const key = query.queryKey;
    const data = queryClient.getQueryData<InfiniteData<InquiryPage>>(key);
    const current = data?.pages
      .flatMap((page) => page.items)
      .find((item) => item.id === inquiryId);
    if (!current) continue;
    if (!sameInquiryLocation(current, updated)) {
      invalidate(key, true);
      continue;
    }
    if (query.state.fetchStatus === "fetching") {
      // An older list request could otherwise overwrite the fresh detail.
      invalidate(key, true);
      continue;
    }
    queryClient.setQueryData<InfiniteData<InquiryPage>>(key, (previous) =>
      previous
        ? {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === inquiryId ? updated : item,
              ),
            })),
          }
        : previous,
    );
  }
}

export function handleFunnelRealtimeChange(
  change: RealtimeChange,
  workspaceId: string,
  invalidate: QueueRealtimeInvalidation,
  queryClient: QueryClient,
  scheduleActivity: (inquiryId: string) => void,
) {
  if (change.kind === "funnel.changed") {
    invalidate(funnelsQueryKey(workspaceId), true);
    // Status labels are also projected into inquiry details.
    invalidate(["private", "inquiries", workspaceId]);
    return;
  }
  if (change.kind === "contact.changed") {
    // Board cards project the current contact name into inquiry summaries.
    if (!change.contact_id) {
      invalidate(["private", "inquiries", workspaceId]);
      return;
    }
    for (const query of queryClient.getQueryCache().findAll({
      queryKey: ["private", "inquiries", workspaceId],
    })) {
      if (query.queryKey[3] === "contact" || query.getObserversCount() === 0)
        continue;
      const data = query.state.data as InfiniteData<InquiryPage> | undefined;
      if (
        !data ||
        data.pages.some((page) =>
          page.items.some(
            (inquiry) => inquiry.contact_id === change.contact_id,
          ),
        )
      ) {
        invalidate(query.queryKey, true);
      }
    }
    return;
  }
  if (change.kind !== "inquiry.changed") return;

  if (change.action === "activity" && change.inquiry_id) {
    scheduleActivity(change.inquiry_id);
    return;
  }

  if (change.funnel_id) {
    invalidate(funnelInquiriesQueryPrefix(workspaceId, change.funnel_id));
  } else {
    invalidate(["private", "inquiries", workspaceId]);
  }
  if (change.contact_id) {
    invalidate(contactInquiriesQueryPrefix(workspaceId, change.contact_id));
  }
}
