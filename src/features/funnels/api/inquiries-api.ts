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
