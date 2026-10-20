import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth";
import { handleChannelRealtimeChange } from "@/features/channels";
import { useChatRealtime } from "@/features/chats";
import {
  handleContactRealtimeChange,
  refreshContactActivity,
} from "@/features/contacts";
import {
  handleFunnelRealtimeChange,
  refreshInquiryActivity,
} from "@/features/funnels";
import { handleMemberRealtimeChange } from "@/features/members";
import { handleNoteRealtimeChange } from "@/features/notes";
import { handleNotificationRealtimeChange } from "@/features/notifications";
import {
  fetchRealtimeStream,
  getRealtimeState,
  realtimeStreamUrl,
  RealtimeStreamSessionEnded,
} from "@/shared/api/realtime-stream";
import { parseRealtimeState } from "@/shared/realtime/types";
import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
  RealtimeEnvelope,
} from "@/shared/realtime/types";

const retryLimitMs = 30_000;
const coalesceMs = 150;
const focusReconcileThrottleMs = 5_000;
const visibilityStateCheckThrottleMs = 5_000;
const streamHeartbeatTimeoutMs = 45_000;
const safetyReconcileIntervalMs = 15 * 60_000;
const workspaceQueryKinds = new Set([
  "channels",
  "contacts",
  "contact-inquiry",
  "conversations",
  "funnels",
  "inquiries",
  "notes",
  "workspace-members",
]);

class RetryRealtimeStream extends Error {}

function retryDelay(attempt: number): number {
  const base = Math.min(retryLimitMs, 3_000 * 2 ** Math.min(attempt, 4));
  // A shared Redis outage can interrupt every tab at once. Spread their
  // retries over a broad window before all clients reconcile active data.
  return Math.min(retryLimitMs, Math.floor(base * (0.5 + Math.random())));
}

function keyStartsWith(key: readonly unknown[], prefix: readonly unknown[]) {
  return (
    prefix.length <= key.length &&
    prefix.every(
      (part, index) => JSON.stringify(part) === JSON.stringify(key[index]),
    )
  );
}

function parseEnvelope(data: string): RealtimeEnvelope | null {
  try {
    const value: unknown = JSON.parse(data);
    if (!value || typeof value !== "object") return null;
    const envelope = value as Record<string, unknown>;
    if (
      (envelope.scope !== "user" && envelope.scope !== "workspace") ||
      !Array.isArray(envelope.changes) ||
      typeof envelope.version !== "number" ||
      !Number.isSafeInteger(envelope.version) ||
      envelope.version < 1 ||
      (envelope.workspace_id !== undefined &&
        typeof envelope.workspace_id !== "string") ||
      (envelope.scope === "workspace" && !envelope.workspace_id)
    )
      return null;

    const changes: RealtimeChange[] = [];
    for (const value of envelope.changes) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      if (typeof item.kind !== "string") continue;
      const change: RealtimeChange = { kind: item.kind };
      for (const key of [
        "workspace_id",
        "contact_id",
        "inquiry_id",
        "funnel_id",
        "channel_id",
        "conversation_id",
        "message_id",
        "target_type",
        "target_id",
        "note_id",
      ] as const) {
        if (typeof item[key] === "string") change[key] = item[key];
      }
      if (item.direction === "inbound" || item.direction === "outbound") {
        change.direction = item.direction;
      }
      if (typeof item.action === "string") change.action = item.action;
      changes.push(change);
    }

    return {
      scope: envelope.scope,
      workspace_id: envelope.workspace_id as string | undefined,
      version: envelope.version,
      changes,
    };
  } catch {
    return null;
  }
}

function isActiveScopeQuery(
  queryKey: readonly unknown[],
  userId: string,
  workspaceId: string | null,
) {
  if (queryKey[0] !== "private") return false;
  const kind = queryKey[1];
  if (kind === "notifications") {
    if (queryKey[2] !== userId) return false;
    return (
      queryKey[3] === "personal" ||
      (queryKey[3] === "workspace" && queryKey[4] === workspaceId)
    );
  }
  if (kind === "sessions" || kind === "two-factor") return true;
  if (kind === "conversations" && queryKey[3] === "notification-settings") {
    return false;
  }
  return (
    typeof kind === "string" &&
    workspaceQueryKinds.has(kind) &&
    queryKey[2] === workspaceId &&
    !queryKey.includes("events")
  );
}

export function RealtimeClient() {
  const { status, user, workspaceId, refreshCurrentUser } = useAuth();
  const chatRealtime = useChatRealtime();
  const queryClient = useQueryClient();
  const userId = status === "authenticated" ? user?.id : null;
  const currentCallbacks = useRef({
    refreshCurrentUser,
    onChatChange: chatRealtime.onRealtimeChange,
    reconcileChat: chatRealtime.reconcileRealtime,
  });

  useEffect(() => {
    currentCallbacks.current = {
      refreshCurrentUser,
      onChatChange: chatRealtime.onRealtimeChange,
      reconcileChat: chatRealtime.reconcileRealtime,
    };
  }, [
    chatRealtime.onRealtimeChange,
    chatRealtime.reconcileRealtime,
    refreshCurrentUser,
  ]);

  useEffect(() => {
    if (!userId) return;

    const activeWorkspaceId = workspaceId;
    const controller = new AbortController();
    const pending = new Map<
      string,
      { queryKey: readonly unknown[]; exact: boolean }
    >();
    const pendingActivity = new Map<
      string,
      {
        timer: number | null;
        dirty: boolean;
        recentlyCreated?: { funnelId?: string; contactId?: string };
      }
    >();
    const pendingContactActivity = new Map<
      string,
      { timer: number | null; dirty: boolean }
    >();
    const recentlyCreatedInquiries = new Map<
      string,
      { funnelId?: string; contactId?: string }
    >();
    let active = true;
    let connectedAt = 0;
    let retryAttempt = 0;
    let flushTimer: number | null = null;
    let lastReconcileAt = 0;
    let streamReady = false;
    let leaseEnded = false;
    let streamInterrupted = false;
    let reconcileWhenVisible = false;
    let userVersion: number | null = null;
    let workspaceVersion: number | null = null;
    let stateCheck: Promise<void> | null = null;
    let verifyStateAgain = false;
    let streamEpoch = 0;
    let lastVisibilityStateCheckAt = 0;
    let visibilityStateCheckTimer: number | null = null;
    let streamController: AbortController | null = null;
    let streamWatchdogTimer: number | null = null;
    let streamRestartTimer: number | null = null;
    let streamRestartRequested = false;
    let lastStreamActivityAt = 0;

    function clearStreamWatchdog() {
      if (streamWatchdogTimer !== null) {
        window.clearTimeout(streamWatchdogTimer);
        streamWatchdogTimer = null;
      }
    }

    function restartStalledStream() {
      if (!active || streamRestartRequested) return;
      // Some proxies keep the browser response open after their upstream
      // dies. Without heartbeats, a dead stream would appear connected.
      streamInterrupted = true;
      streamReady = false;
      leaseEnded = false;
      connectedAt = 0;
      streamRestartRequested = true;
      streamController?.abort();
    }

    function armStreamWatchdog() {
      clearStreamWatchdog();
      streamWatchdogTimer = window.setTimeout(() => {
        streamWatchdogTimer = null;
        restartStalledStream();
      }, streamHeartbeatTimeoutMs);
    }

    const flushInvalidations = () => {
      flushTimer = null;
      if (!active) return;
      const queued = Array.from(pending.values());
      pending.clear();
      for (const { queryKey, exact } of queued) {
        void queryClient.invalidateQueries({ queryKey, exact });
      }
    };
    const invalidate: QueueRealtimeInvalidation = (queryKey, exact = false) => {
      if (!active) return;
      for (const [id, queued] of pending) {
        if (!queued.exact && keyStartsWith(queryKey, queued.queryKey)) return;
        if (!exact && keyStartsWith(queued.queryKey, queryKey)) {
          pending.delete(id);
        }
      }
      pending.set(JSON.stringify([queryKey, exact]), { queryKey, exact });
      if (flushTimer === null) {
        flushTimer = window.setTimeout(flushInvalidations, coalesceMs);
      }
    };

    function scheduleInquiryActivity(inquiryId: string) {
      if (!active || !activeWorkspaceId) return;
      const recentlyCreated = recentlyCreatedInquiries.get(inquiryId);
      recentlyCreatedInquiries.delete(inquiryId);
      const existing = pendingActivity.get(inquiryId);
      if (existing) {
        existing.dirty = true;
        existing.recentlyCreated ??= recentlyCreated;
        return;
      }
      const entry = {
        timer: null as number | null,
        dirty: true,
        recentlyCreated,
      };
      pendingActivity.set(inquiryId, entry);
      const run = async () => {
        entry.timer = null;
        if (!active) return;
        entry.dirty = false;
        await refreshInquiryActivity(
          queryClient,
          activeWorkspaceId,
          inquiryId,
          invalidate,
          controller.signal,
          entry.recentlyCreated,
        );
        entry.recentlyCreated = undefined;
        if (!active) return;
        if (entry.dirty) {
          entry.timer = window.setTimeout(() => void run(), coalesceMs);
        } else {
          pendingActivity.delete(inquiryId);
        }
      };
      entry.timer = window.setTimeout(() => void run(), coalesceMs);
    }

    function scheduleContactActivity(contactId: string) {
      if (!active || !activeWorkspaceId) return;
      const existing = pendingContactActivity.get(contactId);
      if (existing) {
        existing.dirty = true;
        return;
      }
      const entry = { timer: null as number | null, dirty: true };
      pendingContactActivity.set(contactId, entry);
      const run = async () => {
        entry.timer = null;
        if (!active) return;
        entry.dirty = false;
        await refreshContactActivity(
          queryClient,
          activeWorkspaceId,
          contactId,
          invalidate,
          controller.signal,
        );
        if (!active) return;
        if (entry.dirty) {
          entry.timer = window.setTimeout(() => void run(), coalesceMs);
        } else {
          pendingContactActivity.delete(contactId);
        }
      };
      entry.timer = window.setTimeout(() => void run(), coalesceMs);
    }

    function reconcile(force = false) {
      if (!active) return;
      if (document.visibilityState !== "visible") {
        reconcileWhenVisible = true;
        return;
      }
      const now = Date.now();
      if (!force && now - lastReconcileAt < focusReconcileThrottleMs) return;
      lastReconcileAt = now;
      void currentCallbacks.current.refreshCurrentUser().catch(() => {});
      for (const query of queryClient.getQueryCache().getAll()) {
        if (
          query.getObserversCount() > 0 &&
          isActiveScopeQuery(query.queryKey, userId!, activeWorkspaceId)
        ) {
          invalidate(query.queryKey, true);
        }
      }
      if (activeWorkspaceId) currentCallbacks.current.reconcileChat(invalidate);
    }

    function checkStateOnReturn() {
      if (!active) return;
      if (stateCheck) {
        verifyStateAgain = true;
        return;
      }
      if (
        userVersion === null ||
        (activeWorkspaceId && workspaceVersion === null)
      ) {
        reconcile(true);
        return;
      }
      const userAtStart = userVersion;
      const workspaceAtStart = workspaceVersion;
      const epochAtStart = streamEpoch;
      const check = getRealtimeState(activeWorkspaceId, controller.signal)
        .then((state) => {
          if (
            !active ||
            streamEpoch !== epochAtStart ||
            document.visibilityState !== "visible"
          )
            return;
          // Events may arrive while this GET is in flight. A newer local
          // version already proves that those changes reached this tab.
          if (
            state.user_version > (userVersion ?? -1) ||
            state.user_version < userAtStart ||
            (activeWorkspaceId &&
              (state.workspace_version === null ||
                state.workspace_version > (workspaceVersion ?? -1) ||
                state.workspace_version < (workspaceAtStart ?? -1)))
          ) {
            reconcile(true);
          }
        })
        .catch(() => {
          if (active && streamEpoch === epochAtStart) reconcile(true);
        })
        .finally(() => {
          if (stateCheck === check) stateCheck = null;
          if (
            verifyStateAgain &&
            active &&
            document.visibilityState === "visible"
          ) {
            verifyStateAgain = false;
            checkStateOnReturn();
          }
        });
      stateCheck = check;
    }

    function dispatch(envelope: RealtimeEnvelope) {
      if (
        envelope.scope === "workspace" &&
        envelope.workspace_id !== activeWorkspaceId
      )
        return;
      const previousVersion =
        envelope.scope === "user" ? userVersion : workspaceVersion;
      // The connected snapshot can already include queued Pub/Sub changes.
      // Replaying those changes would resurrect an old incoming toast.
      if (previousVersion !== null && envelope.version <= previousVersion)
        return;
      if (previousVersion === null || envelope.version > previousVersion + 1) {
        reconcile(true);
      }
      if (envelope.scope === "user") {
        userVersion = Math.max(userVersion ?? 0, envelope.version);
      } else {
        workspaceVersion = Math.max(workspaceVersion ?? 0, envelope.version);
      }
      for (const change of envelope.changes) {
        const changeWorkspaceId = change.workspace_id ?? envelope.workspace_id;
        if (
          changeWorkspaceId &&
          activeWorkspaceId !== changeWorkspaceId &&
          change.kind !== "notification.changed" &&
          change.kind !== "identity.changed" &&
          change.kind !== "workspace.changed"
        )
          continue;

        handleNotificationRealtimeChange(
          change,
          envelope,
          userId!,
          activeWorkspaceId,
          invalidate,
        );
        if (
          change.kind === "identity.changed" ||
          change.kind === "workspace.changed"
        ) {
          void currentCallbacks.current.refreshCurrentUser().catch(() => {});
        }
        if (change.kind === "security.changed") {
          invalidate(["private", "sessions"], true);
          invalidate(["private", "two-factor"]);
        }
        if (
          !activeWorkspaceId ||
          (changeWorkspaceId && changeWorkspaceId !== activeWorkspaceId)
        )
          continue;
        if (
          change.kind === "inquiry.changed" &&
          change.action === "created" &&
          change.inquiry_id
        ) {
          recentlyCreatedInquiries.set(change.inquiry_id, {
            funnelId: change.funnel_id,
            contactId: change.contact_id,
          });
          if (recentlyCreatedInquiries.size > 200) {
            recentlyCreatedInquiries.delete(
              recentlyCreatedInquiries.keys().next().value!,
            );
          }
        }
        handleContactRealtimeChange(
          change,
          activeWorkspaceId,
          invalidate,
          scheduleContactActivity,
        );
        if (!(
          change.kind === "contact.changed" && change.action === "activity"
        )) {
          handleFunnelRealtimeChange(
            change,
            activeWorkspaceId,
            invalidate,
            queryClient,
            scheduleInquiryActivity,
          );
        }
        handleChannelRealtimeChange(change, activeWorkspaceId, invalidate);
        handleMemberRealtimeChange(change, activeWorkspaceId, invalidate);
        handleNoteRealtimeChange(change, activeWorkspaceId, invalidate);
        if (
          change.kind.startsWith("conversation.") ||
          (change.kind === "contact.changed" && change.action !== "activity") ||
          change.kind === "members.changed"
        ) {
          currentCallbacks.current.onChatChange(
            { ...change, workspace_id: activeWorkspaceId },
            streamReady,
            invalidate,
          );
        }
      }
    }

    // Focus can fire repeatedly while a healthy stream keeps receiving events.
    // Only a disconnected stream needs an extra foreground read.
    const onFocus = () => {
      if (
        streamReady &&
        lastStreamActivityAt > 0 &&
        Date.now() - lastStreamActivityAt >= streamHeartbeatTimeoutMs
      ) {
        restartStalledStream();
      }
      if (!streamReady) reconcile();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (visibilityStateCheckTimer !== null) {
          window.clearTimeout(visibilityStateCheckTimer);
          visibilityStateCheckTimer = null;
        }
        return;
      }
      if (
        streamReady &&
        lastStreamActivityAt > 0 &&
        Date.now() - lastStreamActivityAt >= streamHeartbeatTimeoutMs
      ) {
        restartStalledStream();
      }
      if (reconcileWhenVisible) {
        reconcileWhenVisible = false;
        reconcile(true);
      } else if (!streamReady) {
        reconcile(true);
      } else {
        // A healthy hidden tab keeps its SSE stream. Compare cheap scope
        // versions to detect suspension without refetching every active page.
        const wait =
          visibilityStateCheckThrottleMs -
          (Date.now() - lastVisibilityStateCheckAt);
        if (wait <= 0) {
          lastVisibilityStateCheckAt = Date.now();
          checkStateOnReturn();
        } else if (visibilityStateCheckTimer === null) {
          // Keep a trailing check so rapid tab switches cannot hide a gap.
          visibilityStateCheckTimer = window.setTimeout(() => {
            visibilityStateCheckTimer = null;
            if (
              !active ||
              !streamReady ||
              document.visibilityState !== "visible"
            )
              return;
            lastVisibilityStateCheckAt = Date.now();
            checkStateOnReturn();
          }, wait);
        }
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    function startStream() {
      if (!active) return;
      const attemptController = new AbortController();
      streamController = attemptController;
      armStreamWatchdog();
      const finished = () => {
        clearStreamWatchdog();
        if (
          !active ||
          !streamRestartRequested ||
          streamController !== attemptController
        )
          return;
        streamRestartRequested = false;
        streamRestartTimer = window.setTimeout(() => {
          streamRestartTimer = null;
          startStream();
        }, retryDelay(0));
      };
      void fetchEventSource(realtimeStreamUrl, {
        signal: attemptController.signal,
        openWhenHidden: true,
        headers: { accept: EventStreamContentType },
        fetch: (input, init) =>
          fetchRealtimeStream(input, init, activeWorkspaceId),
        async onopen(response) {
          if (
            response.status === 401 ||
            response.status === 403 ||
            response.status === 404
          ) {
            void currentCallbacks.current.refreshCurrentUser().catch(() => {});
            throw new RealtimeStreamSessionEnded();
          }
          if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            throw new RealtimeStreamSessionEnded();
          }
          if (!response.ok) throw new RetryRealtimeStream();
          if (
            !response.headers
              .get("content-type")
              ?.startsWith(EventStreamContentType)
          ) {
            throw new RealtimeStreamSessionEnded();
          }
          connectedAt = Date.now();
          streamReady = false;
          leaseEnded = false;
          lastStreamActivityAt = Date.now();
          armStreamWatchdog();
        },
        onmessage(event) {
          if (!active) return;
          lastStreamActivityAt = Date.now();
          armStreamWatchdog();
          if (event.event === "connected") {
            streamEpoch += 1;
            let state = null;
            try {
              state = parseRealtimeState(JSON.parse(event.data));
            } catch {
              // An invalid baseline forces a scoped reconciliation below.
            }
            const unchanged =
              state !== null &&
              userVersion !== null &&
              state.user_version === userVersion &&
              (activeWorkspaceId
                ? workspaceVersion !== null &&
                  state.workspace_version === workspaceVersion
                : state.workspace_version === null);
            userVersion = state?.user_version ?? null;
            workspaceVersion = activeWorkspaceId
              ? (state?.workspace_version ?? null)
              : null;
            // A normal lease renewal with no version change needs no list
            // refetch. An interrupted stream may have missed commits while
            // Redis could not record or publish their versions.
            if (
              streamInterrupted ||
              !unchanged ||
              Date.now() - lastReconcileAt >= safetyReconcileIntervalMs
            ) {
              reconcile(true);
            }
            streamInterrupted = false;
            streamReady = state !== null;
          } else if (event.event === "lease_end") {
            leaseEnded = true;
          } else if (event.event === "change") {
            const envelope = parseEnvelope(event.data);
            if (envelope) dispatch(envelope);
          }
        },
        onclose() {
          streamReady = false;
          clearStreamWatchdog();
          throw new RetryRealtimeStream();
        },
        onerror(error) {
          streamReady = false;
          clearStreamWatchdog();
          if (!leaseEnded) streamInterrupted = true;
          leaseEnded = false;
          if (error instanceof RealtimeStreamSessionEnded) throw error;
          if (connectedAt && Date.now() - connectedAt >= 30_000)
            retryAttempt = 0;
          connectedAt = 0;
          armStreamWatchdog();
          return retryDelay(retryAttempt++);
        },
      }).then(finished, finished);
    }
    startStream();

    return () => {
      active = false;
      controller.abort();
      streamController?.abort();
      clearStreamWatchdog();
      if (streamRestartTimer !== null) window.clearTimeout(streamRestartTimer);
      if (flushTimer !== null) window.clearTimeout(flushTimer);
      pending.clear();
      for (const entry of pendingActivity.values()) {
        if (entry.timer !== null) window.clearTimeout(entry.timer);
      }
      pendingActivity.clear();
      for (const entry of pendingContactActivity.values()) {
        if (entry.timer !== null) window.clearTimeout(entry.timer);
      }
      pendingContactActivity.clear();
      recentlyCreatedInquiries.clear();
      if (visibilityStateCheckTimer !== null) {
        window.clearTimeout(visibilityStateCheckTimer);
      }
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [queryClient, userId, workspaceId]);

  return null;
}
