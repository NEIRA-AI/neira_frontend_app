import axios from "axios";

import {
  getAccessToken,
  refreshAccessToken,
} from "@/shared/api/auth-interceptors";

export const conversationStreamUrl = "/api/v1/conversations/stream";

export class ConversationStreamSessionEnded extends Error {}

function requestWithToken(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string,
  workspaceId: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Neira-Workspace-Id", workspaceId);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

export async function fetchConversationStream(
  input: RequestInfo | URL,
  init: RequestInit = {},
  workspaceId: string,
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new ConversationStreamSessionEnded();

  const response = await requestWithToken(input, init, token, workspaceId);
  if (response.status !== 401) return response;

  const currentToken = getAccessToken();
  if (!currentToken) throw new ConversationStreamSessionEnded();
  if (currentToken !== token) {
    return requestWithToken(input, init, currentToken, workspaceId);
  }

  try {
    await refreshAccessToken();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new ConversationStreamSessionEnded();
    }
    throw error;
  }

  if (init.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const refreshedToken = getAccessToken();
  if (!refreshedToken) throw new ConversationStreamSessionEnded();
  return requestWithToken(input, init, refreshedToken, workspaceId);
}
