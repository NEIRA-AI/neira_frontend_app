import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth";
import { getAccessToken } from "@/shared/api/auth-interceptors";

import {
  fetchNotificationStream,
  notificationStreamUrl,
  NotificationStreamSessionEnded,
} from "../api/notification-stream";

const privateQueryKey = ["private"] as const;
const maxRetryDelayMs = 30_000;

class RetryNotificationStream extends Error {}

function retryDelay(attempt: number): number {
  const base = Math.min(maxRetryDelayMs, 3_000 * 2 ** Math.min(attempt, 4));
  return Math.min(maxRetryDelayMs, base + Math.floor(Math.random() * 750));
}

export function NotificationStream() {
  const { status, user, refreshCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const refreshUserRef = useRef(refreshCurrentUser);
  const userId = status === "authenticated" ? user?.id : null;

  useEffect(() => {
    refreshUserRef.current = refreshCurrentUser;
  }, [refreshCurrentUser]);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    let active = true;
    let syncRequested = false;
    let syncing = false;
    let retryAttempt = 0;
    let connectedAt = 0;

    async function syncFromServer() {
      if (!active || !getAccessToken()) return;
      syncRequested = true;
      if (syncing) return;
      syncing = true;

      while (active && syncRequested && getAccessToken()) {
        syncRequested = false;
        try {
          await refreshUserRef.current();
        } catch {
          // Another event or reconnect will retry the durable state fetch.
        }
        if (!active || !getAccessToken()) break;
        try {
          await queryClient.invalidateQueries({ queryKey: privateQueryKey });
        } catch {
          // Query consumers retain their own loading and error states.
        }
      }
      syncing = false;
    }

    void fetchEventSource(notificationStreamUrl, {
      signal: controller.signal,
      headers: { accept: EventStreamContentType },
      fetch: fetchNotificationStream,
      async onopen(response) {
        if (response.status === 401 || response.status === 403) {
          throw new NotificationStreamSessionEnded();
        }
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw new NotificationStreamSessionEnded();
        }
        if (!response.ok) throw new RetryNotificationStream();
        if (
          !response.headers
            .get("content-type")
            ?.startsWith(EventStreamContentType)
        ) {
          throw new NotificationStreamSessionEnded();
        }
        connectedAt = Date.now();
      },
      onmessage(message) {
        if (message.event === "connected" || message.event === "invalidation") {
          void syncFromServer();
        }
      },
      onclose() {
        // The backend intentionally closes each stream after 60 seconds.
        throw new RetryNotificationStream();
      },
      onerror(error) {
        if (error instanceof NotificationStreamSessionEnded) throw error;
        if (connectedAt && Date.now() - connectedAt >= 30_000) {
          retryAttempt = 0;
        }
        connectedAt = 0;
        return retryDelay(retryAttempt++);
      },
    }).catch(() => {
      // Auth state and query errors are handled by their existing providers.
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [queryClient, userId]);

  return null;
}
