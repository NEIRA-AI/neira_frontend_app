import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type SessionSummary = components["schemas"]["SessionSummary"];
export type SessionsResponse = components["schemas"]["SessionsResponse"];
export const sessionsQueryKey = ["private", "sessions"] as const;

export async function listSessions(): Promise<SessionsResponse> {
  const { data } = await api.get<SessionsResponse>("/auth/sessions");
  return data;
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/auth/sessions/${encodeURIComponent(id)}`);
}

export async function revokeOtherSessions(): Promise<void> {
  await api.post("/auth/sessions/revoke-others");
}
