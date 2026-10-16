import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { contactQueryKey } from "@/features/contacts";
import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import {
  conversationQueryKey,
  conversationsQueryKey,
  getConversation,
  getMessage,
  messageAuthorsQueryKey,
  messageRevisionsQueryKey,
  messagesQueryKey,
  messagePreview,
  listConversationNotificationSettings,
  notificationSettingsQueryKey,
  unreadChatCountQueryKey,
  updateConversationNotificationSettings,
  type ChatMessage,
  type Conversation,
  type ConversationNotificationSettings,
  type ConversationNotificationSettingsPage,
  type ConversationPage,
  type MessagePage,
} from "../api/conversations-api";
import { MessageToast, type ChatToast } from "../ui/message-toast";

import {
  ChatNotificationContext,
  type ChatNotificationSettings,
} from "./chat-notification-context";

const defaultSettings: ChatNotificationSettings = {
  soundEnabled: true,
  notificationsEnabled: true,
};
const settingsScope = (workspaceId: string, userId: string) =>
  `${workspaceId}:${userId}`;
const messageSoundUrls = [
  "/sounds/message-notification.mp3",
  "/sounds/message-notification.ogg",
] as const;
let audioContext: AudioContext | null = null;
let messageSound: Promise<AudioBuffer | null> | null = null;

function loadMessageSound() {
  if (messageSound) return messageSound;
  try {
    audioContext ??= new AudioContext();
    const context = audioContext;
    messageSound = (async () => {
      for (const url of messageSoundUrls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          return await context.decodeAudioData(await response.arrayBuffer());
        } catch {
          // Try the other browser-compatible encoding.
        }
      }
      messageSound = null;
      return null;
    })();
    return messageSound;
  } catch {
    return Promise.resolve(null);
  }
}

function unlockMessageSound() {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => {});
    }
  } catch {
    // Audio playback is optional when the browser or device cannot provide it.
  }
}

async function playMessageSound() {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    if (audioContext.state !== "running") return;
    const buffer = await loadMessageSound();
    if (!buffer || audioContext.state !== "running") return;
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.45;
    source.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
  } catch {
    // Browser audio policy or missing audio hardware may block playback.
  }
}

function replaceSettings(
  current: ConversationNotificationSettingsPage | undefined,
  updated: ConversationNotificationSettings,
): ConversationNotificationSettingsPage {
  return {
    items: [
      ...(current?.items.filter(
        (item) => item.conversation_id !== updated.conversation_id,
      ) ?? []),
      updated,
    ],
  };
}

function conversationTimeKey(value: string) {
  const match =
    /^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)(?:\.(\d{1,6}))?(?:Z|\+00:00)$/.exec(
      value,
    );
  return match ? `${match[1]}.${(match[2] ?? "").padEnd(6, "0")}` : null;
}

function compareConversationOrder(a: Conversation, b: Conversation) {
  const aTime = conversationTimeKey(a.updated_at);
  const bTime = conversationTimeKey(b.updated_at);
  if (!aTime || !bTime) return null;
  return aTime === bTime
    ? a.id < b.id
      ? -1
      : a.id > b.id
        ? 1
        : 0
    : aTime < bTime
      ? -1
      : 1;
}

function patchConversationPages(
  current: InfiniteData<ConversationPage>,
  updated: Conversation,
): InfiniteData<ConversationPage> | null {
  if (
    !current.pages.length ||
    current.pages.length !== current.pageParams.length
  )
    return null;
  if (current.pages.some((page) => page.items.length === 0)) return null;
  const rows = current.pages.flatMap((page) => page.items);
  const first = rows[0];
  if (!first || (compareConversationOrder(updated, first) ?? -1) < 0)
    return null;

  let matches = 0;
  const seen = new Set<string>();
  for (const page of current.pages) {
    if (page.items.at(-1)?.id === updated.id) return null;
    for (const item of page.items) {
      if (seen.has(item.id)) return null;
      seen.add(item.id);
      if (item.id === updated.id) matches += 1;
    }
  }
  if (matches !== 1) return null;
  for (let index = 1; index < rows.length; index += 1) {
    const order = compareConversationOrder(rows[index - 1]!, rows[index]!);
    if (order === null || order < 0) return null;
  }

  const pages = current.pages.map((page) => ({
    ...page,
    items: page.items.filter((item) => item.id !== updated.id),
  }));
  pages[0]!.items.unshift(updated);
  return { ...current, pages };
}

function patchConversationReadPages(
  current: InfiniteData<ConversationPage>,
  updated: Conversation,
): InfiniteData<ConversationPage> | null {
  if (current.pages.length !== current.pageParams.length) return null;
  const matches = current.pages
    .flatMap((page) => page.items)
    .filter((item) => item.id === updated.id);
  if (matches.length !== 1 || matches[0]?.updated_at !== updated.updated_at)
    return null;
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    })),
  };
}

export function ChatNotifications({ children }: PropsWithChildren) {
  const { t } = useTranslation("chats");
  const { status, user, workspaceId } = useAuth();
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState<ChatToast[]>([]);
  const [settingsRefreshingFor, setSettingsRefreshingFor] = useState<
    string | null
  >(null);
  const [settingsRefreshFailedFor, setSettingsRefreshFailedFor] = useState<
    string | null
  >(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());
  const savingIdsRef = useRef(new Set<string>());
  const settingsSignalVersions = useRef(new Map<string, number>());
  const settingsRefreshesRef = useRef(
    new Map<string, Promise<ConversationNotificationSettingsPage>>(),
  );
  const failedSettingsRefreshesRef = useRef(new Set<string>());
  const timers = useRef(new Set<number>());
  const realtimeChangeRef = useRef<
    (
      change: RealtimeChange,
      live: boolean,
      invalidate: QueueRealtimeInvalidation,
    ) => void
  >(() => {});
  const realtimeReconcileRef = useRef<
    (invalidate: QueueRealtimeInvalidation) => void
  >(() => {});
  const onRealtimeChange = useCallback(
    (
      change: RealtimeChange,
      live: boolean,
      invalidate: QueueRealtimeInvalidation,
    ) => realtimeChangeRef.current(change, live, invalidate),
    [],
  );
  const reconcileRealtime = useCallback(
    (invalidate: QueueRealtimeInvalidation) =>
      realtimeReconcileRef.current(invalidate),
    [],
  );
  const userId = status === "authenticated" ? user?.id : null;
  const settingsKey = notificationSettingsQueryKey(
    workspaceId ?? "",
    userId ?? "",
  );
  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: () => listConversationNotificationSettings(workspaceId!),
    enabled: Boolean(userId && workspaceId),
  });
  const refreshSettings = useCallback(
    (activeWorkspaceId: string, activeUserId: string) => {
      const scope = settingsScope(activeWorkspaceId, activeUserId);
      const queryKey = notificationSettingsQueryKey(
        activeWorkspaceId,
        activeUserId,
      );
      const pending = queryClient
        .cancelQueries({ queryKey, exact: true })
        .then(() =>
          queryClient.fetchQuery({
            queryKey,
            queryFn: () =>
              listConversationNotificationSettings(activeWorkspaceId),
            retry: false,
            staleTime: 0,
          }),
        );
      settingsRefreshesRef.current.set(scope, pending);
      failedSettingsRefreshesRef.current.delete(scope);
      setSettingsRefreshingFor(scope);
      setSettingsRefreshFailedFor((current) =>
        current === scope ? null : current,
      );
      void pending.then(
        () => {
          if (settingsRefreshesRef.current.get(scope) === pending) {
            settingsRefreshesRef.current.delete(scope);
            failedSettingsRefreshesRef.current.delete(scope);
            setSettingsRefreshingFor((current) =>
              current === scope ? null : current,
            );
          }
        },
        () => {
          if (settingsRefreshesRef.current.get(scope) === pending) {
            settingsRefreshesRef.current.delete(scope);
            failedSettingsRefreshesRef.current.add(scope);
            setSettingsRefreshingFor((current) =>
              current === scope ? null : current,
            );
            setSettingsRefreshFailedFor(scope);
          }
        },
      );
      return pending;
    },
    [queryClient],
  );
  const settingsByConversation = useMemo(
    () =>
      new Map(
        settingsQuery.data?.items.map((item) => [item.conversation_id, item]),
      ),
    [settingsQuery.data],
  );
  const getSettings = useCallback(
    (conversationId: string): ChatNotificationSettings => {
      const settings = settingsByConversation.get(conversationId);
      return settings
        ? {
            soundEnabled: settings.sound_enabled,
            notificationsEnabled: settings.notifications_enabled,
          }
        : defaultSettings;
    },
    [settingsByConversation],
  );
  const isSaving = useCallback(
    (conversationId: string) => savingIds.has(conversationId),
    [savingIds],
  );
  const updateSettings = useCallback(
    async (
      conversationId: string,
      patch: Partial<ChatNotificationSettings>,
    ) => {
      if (!workspaceId || !userId || savingIdsRef.current.has(conversationId))
        return;
      const signalKey = `${workspaceId}:${userId}:${conversationId}`;
      const signalVersion = settingsSignalVersions.current.get(signalKey) ?? 0;
      savingIdsRef.current.add(conversationId);
      setSavingIds(new Set(savingIdsRef.current));
      try {
        const updated = await updateConversationNotificationSettings(
          workspaceId,
          conversationId,
          patch,
        );
        if (!updated.notifications_enabled) {
          setToasts((current) =>
            current.filter((item) => item.conversationId !== conversationId),
          );
        }
        let effective = updated;
        try {
          const page = await refreshSettings(workspaceId, userId);
          effective =
            page.items.find(
              (item) => item.conversation_id === conversationId,
            ) ?? updated;
        } catch {
          // PATCH succeeded even if the follow-up read failed. Show its saved
          // result locally and keep the alert barrier until a fresh read works.
          if (
            (settingsSignalVersions.current.get(signalKey) ?? 0) ===
            signalVersion
          ) {
            queryClient.setQueryData<ConversationNotificationSettingsPage>(
              notificationSettingsQueryKey(workspaceId, userId),
              (current) => replaceSettings(current, updated),
            );
          }
        }
        if (!effective.notifications_enabled) {
          setToasts((current) =>
            current.filter((item) => item.conversationId !== conversationId),
          );
        }
      } finally {
        savingIdsRef.current.delete(conversationId);
        setSavingIds(new Set(savingIdsRef.current));
      }
    },
    [queryClient, refreshSettings, userId, workspaceId],
  );

  useEffect(() => {
    // Browsers require a user gesture before sound can play. Prepare the
    // context on the first interaction so later SSE events can use it.
    void loadMessageSound();
    const unlock = () => unlockMessageSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const activeWorkspaceId = workspaceId;
    if (!userId || !activeWorkspaceId) return;

    const received = new Set<string>();
    const activeTimers = timers.current;
    const activeRefreshes = settingsRefreshesRef.current;
    const activeFailedRefreshes = failedSettingsRefreshesRef.current;
    const pendingMessageRefreshes = new Map<
      string,
      Promise<ChatMessage | null>
    >();
    const pendingConversationRefreshes = new Map<
      string,
      Promise<Conversation | null>
    >();
    const queuedMessageSummaries = new Map<
      string,
      {
        timer: number | null;
        running: boolean;
        dirty: boolean;
        mode: "message" | "read";
        invalidate: QueueRealtimeInvalidation;
      }
    >();
    const toastConversationLookups = new Map<
      string,
      { promise: Promise<Conversation>; expiresAt: number | null }
    >();
    const conversationRefreshVersions = new Map<string, number>();
    let conversationRefreshSerial = 0;
    let active = true;
    function invalidateConversation(
      invalidate: QueueRealtimeInvalidation,
      conversationId?: string,
      includeMessages = true,
    ) {
      invalidate(conversationsQueryKey(activeWorkspaceId!), true);
      invalidate(unreadChatCountQueryKey(activeWorkspaceId!), true);
      if (conversationId) {
        invalidate(
          conversationQueryKey(activeWorkspaceId!, conversationId),
          true,
        );
        if (includeMessages) {
          invalidate(
            messagesQueryKey(activeWorkspaceId!, conversationId),
            true,
          );
        }
      }
    }

    function invalidateProfile(
      invalidate: QueueRealtimeInvalidation,
      conversationId: string,
    ) {
      const detailKey = conversationQueryKey(
        activeWorkspaceId!,
        conversationId,
      );
      const conversation = queryClient.getQueryData<Conversation>(detailKey);
      invalidate(conversationsQueryKey(activeWorkspaceId!), true);
      invalidate(detailKey, true);
      invalidate(messagesQueryKey(activeWorkspaceId!, conversationId), true);
      invalidate(messageAuthorsQueryKey(activeWorkspaceId!, conversationId));
      if (conversation?.contact_id) {
        invalidate(
          contactQueryKey(activeWorkspaceId!, conversation.contact_id),
          true,
        );
      }
    }

    function invalidateEditedMessage(
      invalidate: QueueRealtimeInvalidation,
      conversationId: string,
      messageId?: string,
    ) {
      invalidate(conversationsQueryKey(activeWorkspaceId!), true);
      invalidate(
        conversationQueryKey(activeWorkspaceId!, conversationId),
        true,
      );
      invalidate(messagesQueryKey(activeWorkspaceId!, conversationId), true);
      invalidate(
        messageRevisionsQueryKey(activeWorkspaceId!, conversationId, messageId),
        Boolean(messageId),
      );
    }

    function cachedConversation(conversationId: string) {
      const detail = queryClient.getQueryData<Conversation>(
        conversationQueryKey(activeWorkspaceId!, conversationId),
      );
      if (detail) return detail;
      const list = queryClient.getQueryData<InfiniteData<ConversationPage>>(
        conversationsQueryKey(activeWorkspaceId!),
      );
      return list?.pages
        .flatMap((page) => page.items)
        .find((item) => item.id === conversationId);
    }

    function cachedMessage(conversationId: string, messageId: string) {
      const messages = queryClient.getQueryData<InfiniteData<MessagePage>>(
        messagesQueryKey(activeWorkspaceId!, conversationId),
      );
      return messages?.pages[0]?.items.find((item) => item.id === messageId);
    }

    function conversationForToast(conversationId: string) {
      const existing = toastConversationLookups.get(conversationId);
      if (
        existing &&
        (existing.expiresAt === null || existing.expiresAt > Date.now())
      )
        return existing.promise;
      const entry: {
        promise: Promise<Conversation>;
        expiresAt: number | null;
      } = { promise: getConversation(conversationId), expiresAt: null };
      toastConversationLookups.set(conversationId, entry);
      void entry.promise.then(
        () => {
          // Share metadata within a message burst, without holding a stale
          // conversation title after a later profile change.
          entry.expiresAt = Date.now() + 750;
          window.setTimeout(() => {
            if (toastConversationLookups.get(conversationId) === entry)
              toastConversationLookups.delete(conversationId);
          }, 750);
        },
        () => {
          if (toastConversationLookups.get(conversationId) === entry)
            toastConversationLookups.delete(conversationId);
        },
      );
      return entry.promise;
    }

    function refreshConversationSummary(
      conversationId: string,
      invalidate: QueueRealtimeInvalidation,
      mode: "message" | "read",
    ) {
      const listKey = conversationsQueryKey(activeWorkspaceId!);
      const detailKey = conversationQueryKey(
        activeWorkspaceId!,
        conversationId,
      );
      const fallback = () => {
        invalidate(listKey, true);
        invalidate(detailKey, true);
      };
      const version = ++conversationRefreshSerial;
      conversationRefreshVersions.set(conversationId, version);
      const listQuery = queryClient.getQueryCache().find({
        queryKey: listKey,
        exact: true,
      });
      if (
        !listQuery ||
        listQuery.getObserversCount() === 0 ||
        listQuery.state.fetchStatus === "fetching" ||
        !listQuery.state.data
      ) {
        conversationRefreshVersions.delete(conversationId);
        pendingConversationRefreshes.delete(conversationId);
        fallback();
        return null;
      }
      const originalList = listQuery.state.data;
      const originalDetail = queryClient.getQueryData(detailKey);
      const refresh = getConversation(conversationId).then(
        (updated): Conversation | null => {
          if (
            !active ||
            conversationRefreshVersions.get(conversationId) !== version
          )
            return null;
          if (updated.id !== conversationId) {
            fallback();
            return null;
          }
          const latestQuery = queryClient.getQueryCache().find({
            queryKey: listKey,
            exact: true,
          });
          const current =
            queryClient.getQueryData<InfiniteData<ConversationPage>>(listKey);
          const patched =
            current &&
            (mode === "message"
              ? patchConversationPages(current, updated)
              : patchConversationReadPages(current, updated));
          if (
            !latestQuery ||
            latestQuery.getObserversCount() === 0 ||
            latestQuery.state.fetchStatus === "fetching" ||
            current !== originalList ||
            !patched
          ) {
            fallback();
            return updated;
          }
          queryClient.setQueryData(listKey, patched);
          const detailQuery = queryClient.getQueryCache().find({
            queryKey: detailKey,
            exact: true,
          });
          if (
            detailQuery?.state.fetchStatus === "fetching" ||
            detailQuery?.state.data !== originalDetail
          ) {
            invalidate(detailKey, true);
          } else if (detailQuery) {
            queryClient.setQueryData(detailKey, updated);
          }
          return updated;
        },
        (): null => {
          if (
            active &&
            conversationRefreshVersions.get(conversationId) === version
          ) {
            fallback();
          }
          return null;
        },
      );
      pendingConversationRefreshes.set(conversationId, refresh);
      const clearRefresh = () => {
        if (pendingConversationRefreshes.get(conversationId) === refresh) {
          pendingConversationRefreshes.delete(conversationId);
          if (conversationRefreshVersions.get(conversationId) === version) {
            conversationRefreshVersions.delete(conversationId);
          }
        }
      };
      void refresh.then(clearRefresh, clearRefresh);
      return refresh;
    }

    function queueConversationSummary(
      conversationId: string,
      invalidate: QueueRealtimeInvalidation,
      mode: "message" | "read",
    ) {
      const listQuery = queryClient.getQueryCache().find({
        queryKey: conversationsQueryKey(activeWorkspaceId!),
        exact: true,
      });
      if (
        !listQuery ||
        listQuery.getObserversCount() === 0 ||
        listQuery.state.fetchStatus === "fetching" ||
        !listQuery.state.data
      ) {
        // An inactive list needs no detail GET. A reading list will refetch
        // after its current request rather than racing a cache patch.
        refreshConversationSummary(conversationId, invalidate, mode);
        return;
      }
      let queued = queuedMessageSummaries.get(conversationId);
      if (!queued) {
        queued = {
          timer: null,
          running: false,
          dirty: false,
          mode,
          invalidate,
        };
        queuedMessageSummaries.set(conversationId, queued);
      } else {
        queued.invalidate = invalidate;
        // A message can change list order; a read only changes this user's
        // unread count. Preserve the stronger patch mode for a mixed batch.
        if (mode === "message") queued.mode = "message";
        if (queued.running) queued.dirty = true;
      }
      if (queued.timer !== null || queued.running) return;
      const schedule = () => {
        queued.timer = window.setTimeout(() => {
          queued.timer = null;
          queued.running = true;
          queued.dirty = false;
          const refresh = refreshConversationSummary(
            conversationId,
            queued.invalidate,
            queued.mode,
          );
          if (!refresh) {
            queuedMessageSummaries.delete(conversationId);
            return;
          }
          void refresh.then(
            () => {
              if (!active) return;
              queued.running = false;
              // A later event can change the delivery state of this same
              // message ID, so an in-flight read needs one trailing read.
              if (queued.dirty) {
                schedule();
              } else {
                queuedMessageSummaries.delete(conversationId);
              }
            },
            () => {
              if (!active) return;
              queued.invalidate(
                conversationsQueryKey(activeWorkspaceId!),
                true,
              );
              queued.invalidate(
                conversationQueryKey(activeWorkspaceId!, conversationId),
                true,
              );
              queuedMessageSummaries.delete(conversationId);
            },
          );
        }, 120);
      };
      schedule();
    }

    function refreshNewMessage(
      conversationId: string,
      messageId: string,
      invalidate: QueueRealtimeInvalidation,
    ) {
      const key = messagesQueryKey(activeWorkspaceId!, conversationId);
      const query = queryClient
        .getQueryCache()
        .find({ queryKey: key, exact: true });
      if (!query || query.getObserversCount() === 0) return;
      const refresh = (async (): Promise<ChatMessage | null> => {
        let message: ChatMessage;
        try {
          message = await getMessage(conversationId, messageId);
        } catch {
          if (active) invalidate(key, true);
          return null;
        }
        if (!active) return message;
        const currentQuery = queryClient.getQueryCache().find({
          queryKey: key,
          exact: true,
        });
        if (!currentQuery || currentQuery.getObserversCount() === 0)
          return message;
        const data = queryClient.getQueryData<InfiniteData<MessagePage>>(key);
        const firstPage = data?.pages[0];
        const first = firstPage?.items[0];
        const existing = data?.pages
          .flatMap((page) => page.items)
          .find((item) => item.id === messageId);
        // The server's cursor names the oldest row in each page. Adding one
        // contiguous newest message leaves that cursor valid; gaps, history
        // reshuffles, and an in-flight list read need a server refetch.
        const canPatch =
          firstPage &&
          currentQuery.state.fetchStatus !== "fetching" &&
          (existing
            ? existing.sequence === message.sequence
            : first
              ? message.sequence === first.sequence + 1
              : firstPage.next_cursor === null);
        if (!canPatch) {
          invalidate(key, true);
          return message;
        }
        queryClient.setQueryData<InfiniteData<MessagePage>>(key, (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page, index) => ({
                  ...page,
                  items: existing
                    ? page.items.map((item) =>
                        item.id === messageId ? message : item,
                      )
                    : index === 0
                      ? [message, ...page.items]
                      : page.items,
                })),
              }
            : previous,
        );
        return message;
      })();
      pendingMessageRefreshes.set(messageId, refresh);
      const clearRefresh = () => {
        if (pendingMessageRefreshes.get(messageId) === refresh) {
          pendingMessageRefreshes.delete(messageId);
        }
      };
      void refresh.then(
        () => clearRefresh(),
        () => clearRefresh(),
      );
    }

    async function showIncomingToast(
      conversationId: string,
      messageId: string,
    ) {
      if (received.has(messageId)) return;
      received.add(messageId);
      if (received.size > 500) {
        received.delete(received.values().next().value!);
      }

      for (let attempt = 0; attempt < 3 && active; attempt++) {
        try {
          const scope = settingsScope(activeWorkspaceId!, userId!);
          const queryKey = notificationSettingsQueryKey(
            activeWorkspaceId!,
            userId!,
          );
          const refresh = settingsRefreshesRef.current.get(scope);
          let settings = refresh
            ? await refresh
            : failedSettingsRefreshesRef.current.has(scope) ||
                queryClient.getQueryState(queryKey)?.status === "error"
              ? await refreshSettings(activeWorkspaceId!, userId!)
              : await queryClient.ensureQueryData({
                  queryKey,
                  queryFn: () =>
                    listConversationNotificationSettings(activeWorkspaceId!),
                });
          const newerRefresh = settingsRefreshesRef.current.get(scope);
          if (newerRefresh && newerRefresh !== refresh) {
            settings = await newerRefresh;
          }
          settings =
            queryClient.getQueryData<ConversationNotificationSettingsPage>(
              queryKey,
            ) ?? settings;
          if (!active) return;
          const preference = settings.items.find(
            (item) => item.conversation_id === conversationId,
          );
          if (preference?.notifications_enabled === false) return;
          const refreshingMessage = pendingMessageRefreshes.get(messageId);
          const refreshingConversation =
            pendingConversationRefreshes.get(conversationId);
          const [message, conversation]: [ChatMessage, Conversation] =
            await Promise.all([
              refreshingMessage
                ? refreshingMessage.then(
                    (value) =>
                      value ??
                      cachedMessage(conversationId, messageId) ??
                      getMessage(conversationId, messageId),
                  )
                : (cachedMessage(conversationId, messageId) ??
                  getMessage(conversationId, messageId)),
              cachedConversation(conversationId) ??
                (refreshingConversation
                  ? refreshingConversation.then(
                      (value) => value ?? conversationForToast(conversationId),
                    )
                  : conversationForToast(conversationId)),
            ]);
          if (!active) return;
          if (message.direction !== "inbound") return;
          const toast: ChatToast = {
            id: message.id,
            conversationId,
            avatarUrl: message.author_avatar_url,
            name: message.author_name || conversation.title,
            preview: messagePreview(message, {
              photo: t("photo"),
              file: t("file"),
              voice: t("voice"),
            }),
          };
          setToasts((current) =>
            [...current.filter((item) => item.id !== toast.id), toast].slice(
              -3,
            ),
          );
          if (preference?.sound_enabled !== false) void playMessageSound();
          const timer = window.setTimeout(() => {
            activeTimers.delete(timer);
            setToasts((current) =>
              current.filter((item) => item.id !== toast.id),
            );
          }, 6_000);
          activeTimers.add(timer);
          return;
        } catch {
          if (attempt < 2 && active) {
            await new Promise((resolve) =>
              window.setTimeout(resolve, 500 * 2 ** attempt),
            );
          }
        }
      }
      received.delete(messageId);
    }

    realtimeReconcileRef.current = (invalidate) => {
      if (!active) return;
      invalidateConversation(invalidate);
      void refreshSettings(activeWorkspaceId!, userId!).catch(() => {});
    };
    realtimeChangeRef.current = (change, live, invalidate) => {
      if (
        !active ||
        (change.workspace_id && change.workspace_id !== activeWorkspaceId)
      )
        return;
      if (change.kind === "contact.changed") {
        toastConversationLookups.clear();
        invalidate(conversationsQueryKey(activeWorkspaceId!), true);
        if (change.contact_id) {
          const details = queryClient.getQueryCache().findAll({
            queryKey: [...conversationsQueryKey(activeWorkspaceId!), "detail"],
          });
          for (const detail of details) {
            const conversation = detail.state.data as Conversation | undefined;
            if (conversation?.contact_id !== change.contact_id) continue;
            invalidate(detail.queryKey, true);
            invalidate(
              messagesQueryKey(activeWorkspaceId!, conversation.id),
              true,
            );
            invalidate(
              messageAuthorsQueryKey(activeWorkspaceId!, conversation.id),
            );
          }
        }
        return;
      }
      if (change.kind === "members.changed") {
        toastConversationLookups.clear();
        invalidate(conversationsQueryKey(activeWorkspaceId!), true);
        invalidate([...conversationsQueryKey(activeWorkspaceId!), "detail"]);
        invalidate([...conversationsQueryKey(activeWorkspaceId!), "messages"]);
        invalidate([
          ...conversationsQueryKey(activeWorkspaceId!),
          "message-authors",
        ]);
        return;
      }
      if (change.kind === "conversation.settings") {
        if (change.conversation_id) {
          const signalKey = `${activeWorkspaceId}:${userId}:${change.conversation_id}`;
          settingsSignalVersions.current.set(
            signalKey,
            (settingsSignalVersions.current.get(signalKey) ?? 0) + 1,
          );
        }
        // Concurrent publications may arrive out of commit order. The GET
        // provides the committed settings before any later toast is shown.
        void refreshSettings(activeWorkspaceId!, userId!).then(
          (page) => {
            if (!active) return;
            const disabled = new Set(
              page.items
                .filter((item) => !item.notifications_enabled)
                .map((item) => item.conversation_id),
            );
            if (disabled.size > 0) {
              setToasts((toasts) =>
                toasts.filter((item) => !disabled.has(item.conversationId)),
              );
            }
          },
          () => {},
        );
        return;
      }
      if (!change.conversation_id) return;
      if (change.kind === "conversation.profile") {
        toastConversationLookups.delete(change.conversation_id);
        invalidateProfile(invalidate, change.conversation_id);
        return;
      }
      if (change.kind === "conversation.edit") {
        invalidateEditedMessage(
          invalidate,
          change.conversation_id,
          change.message_id,
        );
        return;
      }
      if (
        change.kind !== "conversation.message" &&
        change.kind !== "conversation.read" &&
        change.kind !== "conversation.history"
      )
        return;
      if (change.kind === "conversation.message") {
        if (change.direction !== "outbound") {
          invalidate(unreadChatCountQueryKey(activeWorkspaceId!), true);
        }
        queueConversationSummary(change.conversation_id, invalidate, "message");
        if (change.message_id) {
          refreshNewMessage(
            change.conversation_id,
            change.message_id,
            invalidate,
          );
        } else {
          invalidate(
            messagesQueryKey(activeWorkspaceId!, change.conversation_id),
            true,
          );
        }
      } else if (change.kind === "conversation.read") {
        invalidate(unreadChatCountQueryKey(activeWorkspaceId!), true);
        queueConversationSummary(change.conversation_id, invalidate, "read");
      } else {
        invalidateConversation(
          invalidate,
          change.conversation_id,
          change.kind === "conversation.history",
        );
      }
      if (
        change.kind === "conversation.message" &&
        change.message_id &&
        live &&
        change.direction !== "outbound"
      ) {
        void showIncomingToast(change.conversation_id, change.message_id);
      }
    };

    return () => {
      active = false;
      realtimeChangeRef.current = () => {};
      realtimeReconcileRef.current = () => {};
      setToasts([]);
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
      activeRefreshes.delete(settingsScope(activeWorkspaceId!, userId!));
      activeFailedRefreshes.delete(settingsScope(activeWorkspaceId!, userId!));
      pendingMessageRefreshes.clear();
      pendingConversationRefreshes.clear();
      queuedMessageSummaries.forEach(({ timer }) => {
        if (timer !== null) window.clearTimeout(timer);
      });
      queuedMessageSummaries.clear();
      toastConversationLookups.clear();
      conversationRefreshVersions.clear();
    };
  }, [queryClient, refreshSettings, t, userId, workspaceId]);

  return (
    <ChatNotificationContext.Provider
      value={{
        settingsReady:
          settingsQuery.isSuccess &&
          settingsRefreshingFor !==
            settingsScope(workspaceId ?? "", userId ?? "") &&
          settingsRefreshFailedFor !==
            settingsScope(workspaceId ?? "", userId ?? ""),
        getSettings,
        updateSettings,
        isSaving,
        onRealtimeChange,
        reconcileRealtime,
      }}
    >
      {children}
      <MessageToast
        onDismiss={(id) =>
          setToasts((current) => current.filter((item) => item.id !== id))
        }
        toasts={toasts}
      />
    </ChatNotificationContext.Provider>
  );
}
