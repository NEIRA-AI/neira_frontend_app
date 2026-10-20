import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import {
  contactQueryKey,
  contactsQueryKey,
  getContact,
  targetedContactInquiryQueryKey,
  targetedContactInquiryQueryPrefix,
  type ContactDetail,
  type ContactPage,
} from "../api/contacts-api";

export async function refreshContactActivity(
  queryClient: QueryClient,
  workspaceId: string,
  contactId: string,
  invalidate: QueueRealtimeInvalidation,
  signal: AbortSignal,
) {
  const detailKey = contactQueryKey(workspaceId, contactId);
  const detailQuery = queryClient.getQueryCache().find({
    queryKey: detailKey,
    exact: true,
  });
  const detailActive = Boolean(
    detailQuery && detailQuery.getObserversCount() > 0,
  );
  const originalDetail = detailQuery?.state.data;
  const listQueries = queryClient.getQueryCache().findAll({
    queryKey: [...contactsQueryKey(workspaceId), "list"],
    predicate: (query) =>
      query.getObserversCount() > 0 &&
      Boolean(
        (query.state.data as InfiniteData<ContactPage> | undefined)?.pages.some(
          (page) => page.items.some((item) => item.id === contactId),
        ),
      ),
  });
  if (!detailActive && listQueries.length === 0) return;

  let updated: ContactDetail;
  try {
    updated = await getContact(contactId, { workspaceId, signal });
  } catch {
    if (signal.aborted) return;
    if (detailActive) invalidate(detailKey, true);
    for (const query of listQueries) invalidate(query.queryKey, true);
    return;
  }
  if (signal.aborted || updated.id !== contactId) return;

  if (detailActive && detailQuery) {
    if (
      detailQuery.state.fetchStatus === "fetching" ||
      detailQuery.state.data !== originalDetail
    ) {
      invalidate(detailKey, true);
    } else {
      queryClient.setQueryData(detailKey, updated);
    }
  }
  for (const query of listQueries) {
    if (query.state.fetchStatus === "fetching") {
      invalidate(query.queryKey, true);
      continue;
    }
    queryClient.setQueryData<InfiniteData<ContactPage>>(
      query.queryKey,
      (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === contactId
                    ? { ...item, last_seen_at: updated.last_seen_at }
                    : item,
                ),
              })),
            }
          : old,
    );
  }
}

export function handleContactRealtimeChange(
  change: RealtimeChange,
  workspaceId: string,
  invalidate: QueueRealtimeInvalidation,
  scheduleActivity: (contactId: string) => void,
) {
  if (change.kind === "funnel.changed") {
    invalidate(["private", "contact-inquiry", workspaceId]);
    return;
  }
  if (change.kind === "inquiry.changed") {
    if (change.contact_id && change.inquiry_id) {
      invalidate(
        targetedContactInquiryQueryKey(
          workspaceId,
          change.contact_id,
          change.inquiry_id,
        ),
        true,
      );
    } else {
      invalidate(["private", "contact-inquiry", workspaceId]);
    }
    return;
  }
  if (change.kind !== "contact.changed") return;

  if (change.action === "activity" && change.contact_id) {
    scheduleActivity(change.contact_id);
    return;
  }

  invalidate([...contactsQueryKey(workspaceId), "list"]);
  if (change.contact_id) {
    invalidate(contactQueryKey(workspaceId, change.contact_id), true);
    invalidate(
      targetedContactInquiryQueryPrefix(workspaceId, change.contact_id),
    );
  } else {
    invalidate(contactsQueryKey(workspaceId));
    invalidate(["private", "contact-inquiry", workspaceId]);
  }
}
