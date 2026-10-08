import axios from "axios";

import {
  getAccessToken,
  refreshAccessToken,
} from "@/shared/api/auth-interceptors";

export const notificationStreamUrl = "/api/v1/notifications/stream";

export class NotificationStreamSessionEnded extends Error {}

function requestWithToken(
  input: RequestInfo | URL,
  init: RequestInit,
  token: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

export async function fetchNotificationStream(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new NotificationStreamSessionEnded();

  const response = await requestWithToken(input, init, token);
  if (response.status !== 401) return response;

  const currentToken = getAccessToken();
  if (!currentToken) throw new NotificationStreamSessionEnded();
  if (currentToken !== token) {
    return requestWithToken(input, init, currentToken);
  }

  try {
    await refreshAccessToken();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new NotificationStreamSessionEnded();
    }
    throw error;
  }

  if (init.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const refreshedToken = getAccessToken();
  if (!refreshedToken) throw new NotificationStreamSessionEnded();
  return requestWithToken(input, init, refreshedToken);
}
