import { api, publicApi } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type InvitationPreview =
  components["schemas"]["InvitationPublicResponse"];

export async function fetchInvitation(
  token: string,
): Promise<InvitationPreview> {
  const { data } = await publicApi.get<InvitationPreview>(
    `/invitations/${encodeURIComponent(token)}`,
  );
  return data;
}

export async function acceptInvitation(token: string): Promise<void> {
  await api.post(`/invitations/${encodeURIComponent(token)}/accept`);
}

export async function declineInvitation(token: string): Promise<void> {
  await api.post(`/invitations/${encodeURIComponent(token)}/decline`);
}
