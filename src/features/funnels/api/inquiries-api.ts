import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type InquirySummary = components["schemas"]["InquirySummary"];
export type InquiryPage = components["schemas"]["InquiryPage"];
export type InquiryFilter = "all" | "open" | "closed";

export const funnelInquiriesQueryPrefix = (
  workspaceId: string,
  funnelId: string,
) => ["private", "inquiries", workspaceId, funnelId] as const;

export const funnelInquiriesQueryKey = (
  workspaceId: string,
  funnelId: string,
  filter: InquiryFilter,
) => [...funnelInquiriesQueryPrefix(workspaceId, funnelId), filter] as const;

export async function listFunnelInquiries(
  funnelId: string,
  cursor: string | null,
  filter: InquiryFilter,
): Promise<InquiryPage> {
  const { data } = await api.get<InquiryPage>("/inquiries", {
    params: {
      funnel_id: funnelId,
      state: filter === "all" ? undefined : filter,
      limit: 50,
      cursor,
    },
    workspace: true,
  });
  return data;
}

export async function getInquiry(
  inquiryId: string,
  workspaceId: string,
  signal?: AbortSignal,
): Promise<InquirySummary> {
  const { data } = await api.get<InquirySummary>(
    `/inquiries/${encodeURIComponent(inquiryId)}`,
    { workspace: true, workspaceScopeId: workspaceId, signal },
  );
  return data;
}

export async function moveInquiryToStatus(input: {
  inquiryId: string;
  statusId: string;
  expectedRevision: number;
}): Promise<InquirySummary> {
  const payload: components["schemas"]["InquiryStatusUpdate"] = {
    status_id: input.statusId,
    expected_revision: input.expectedRevision,
  };
  const { data } = await api.patch<InquirySummary>(
    `/inquiries/${encodeURIComponent(input.inquiryId)}/status`,
    payload,
    { workspace: true },
  );
  return data;
}

export async function changeInquiryState(input: {
  inquiryId: string;
  state: "open" | "closed";
  expectedRevision: number;
}): Promise<InquirySummary> {
  const payload: components["schemas"]["InquiryStateUpdate"] = {
    state: input.state,
    expected_revision: input.expectedRevision,
  };
  const { data } = await api.patch<InquirySummary>(
    `/inquiries/${encodeURIComponent(input.inquiryId)}/state`,
    payload,
    { workspace: true },
  );
  return data;
}
