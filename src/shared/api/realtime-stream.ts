import axios from "axios";

import { getAccessToken, refreshAccessToken } from "./auth-interceptors";
import { parseRealtimeState, type RealtimeState } from "../realtime/types";

export const realtimeStreamUrl = "/api/v1/events/stream";
const realtimeStateUrl = "/api/v1/events/state";

export class RealtimeStreamSessionEnded extends Error {}

function requestWithToken(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string,
  workspaceId: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (workspaceId) headers.set("X-Neira-Workspace-Id", workspaceId);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

export async function fetchRealtimeStream(
  input: RequestInfo | URL,
  init: RequestInit = {},
  workspaceId: string | null,
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new RealtimeStreamSessionEnded();

  const response = await requestWithToken(input, init, token, workspaceId);
  if (response.status !== 401) return response;

  const currentToken = getAccessToken();
  if (!currentToken) throw new RealtimeStreamSessionEnded();
  if (currentToken !== token) {
    return requestWithToken(input, init, currentToken, workspaceId);
  }

  try {
    await refreshAccessToken();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new RealtimeStreamSessionEnded();
    }
    throw error;
  }

  if (init.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const refreshedToken = getAccessToken();
  if (!refreshedToken) throw new RealtimeStreamSessionEnded();
  return requestWithToken(input, init, refreshedToken, workspaceId);
}

export async function getRealtimeState(
  workspaceId: string | null,
  signal: AbortSignal,
): Promise<RealtimeState> {
  const response = await fetchRealtimeStream(
    realtimeStateUrl,
    { headers: { accept: "application/json" }, signal },
    workspaceId,
  );
  if (!response.ok) throw new Error("Realtime state is unavailable");
  const state = parseRealtimeState(await response.json());
  if (!state) throw new Error("Invalid realtime state");
  return state;
}
