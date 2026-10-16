import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type InquirySummary = components["schemas"]["InquirySummary"];
export type InquiryPage = components["schemas"]["InquiryPage"];

export const funnelInquiriesQueryKey = (
  workspaceId: string,
  funnelId: string,
) => ["private", "inquiries", workspaceId, funnelId, "open"] as const;

export async function listFunnelInquiries(
  funnelId: string,
  cursor: string | null,
): Promise<InquiryPage> {
  const { data } = await api.get<InquiryPage>("/inquiries", {
    params: { funnel_id: funnelId, state: "open", limit: 50, cursor },
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
