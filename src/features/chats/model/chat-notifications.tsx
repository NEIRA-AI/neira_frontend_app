import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import {
  contactInquiriesQueryPrefix,
  contactQueryKey,
} from "@/features/contacts";

import {
  conversationQueryKey,
  conversationsQueryKey,
  getConversation,
  getMessage,
  messageAuthorsQueryKey,
  messagesQueryKey,
  messagePreview,
  unreadChatCountQueryKey,
  type Conversation,
} from "../api/conversations-api";
import {
  conversationStreamUrl,
  ConversationStreamSessionEnded,
  fetchConversationStream,
} from "../api/conversation-stream";
import { MessageToast, type ChatToast } from "../ui/message-toast";

import { ChatNotificationContext } from "./chat-notification-context";

const soundStorageKey = "neira.chat-sound-enabled";
const messageSoundUrls = [
  "/sounds/message-notification.mp3",
  "/sounds/message-notification.ogg",
] as const;
const maxRetryDelayMs = 30_000;

class RetryConversationStream extends Error {}

function initialSoundEnabled() {
  try {
    return window.localStorage.getItem(soundStorageKey) !== "false";
  } catch {
    return true;
  }
}

function retryDelay(attempt: number): number {
  const base = Math.min(maxRetryDelayMs, 3_000 * 2 ** Math.min(attempt, 4));
  return Math.min(maxRetryDelayMs, base + Math.floor(Math.random() * 750));
}

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
    unlockMessageSound();
    if (!audioContext || audioContext.state !== "running") return;
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

function parseEvent(
  data: string,
): { conversation_id: string; message_id?: string } | null {
  try {
    const value: unknown = JSON.parse(data);
    if (!value || typeof value !== "object") return null;
    const event = value as Record<string, unknown>;
    if (typeof event.conversation_id !== "string") return null;
    if (event.message_id !== undefined && typeof event.message_id !== "string")
      return null;
    return {
      conversation_id: event.conversation_id,
      message_id: event.message_id as string | undefined,
    };
  } catch {
    return null;
  }
}

export function ChatNotifications({ children }: PropsWithChildren) {
  const { t } = useTranslation("chats");
  const { status, user, workspaceId } = useAuth();
  const queryClient = useQueryClient();
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const soundEnabledRef = useRef(soundEnabled);
  const [toasts, setToasts] = useState<ChatToast[]>([]);
  const timers = useRef(new Set<number>());
  const userId = status === "authenticated" ? user?.id : null;

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
    soundEnabledRef.current = soundEnabled;
    try {
      window.localStorage.setItem(soundStorageKey, String(soundEnabled));
    } catch {
      // The in-memory preference still works without storage.
    }
  }, [soundEnabled]);

  useEffect(() => {
    const activeWorkspaceId = workspaceId;
    if (!userId || !activeWorkspaceId) return;

    const controller = new AbortController();
    const received = new Set<string>();
    const activeTimers = timers.current;
    let active = true;
    let retryAttempt = 0;
    let connectedAt = 0;

    function invalidateConversation(conversationId?: string) {
      void queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(activeWorkspaceId!),
        exact: Boolean(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: unreadChatCountQueryKey(activeWorkspaceId!),
      });
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: messagesQueryKey(activeWorkspaceId!, conversationId),
        });
        void queryClient.invalidateQueries({
          queryKey: conversationQueryKey(activeWorkspaceId!, conversationId),
        });
      }
    }

    function invalidateProfile(conversationId: string) {
      const detailKey = conversationQueryKey(
        activeWorkspaceId!,
        conversationId,
      );
      const conversation = queryClient.getQueryData<Conversation>(detailKey);
      void queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(activeWorkspaceId!),
        exact: true,
      });
      void queryClient.invalidateQueries({ queryKey: detailKey, exact: true });
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKey(activeWorkspaceId!, conversationId),
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: messageAuthorsQueryKey(activeWorkspaceId!, conversationId),
      });
      if (conversation?.contact_id) {
        void queryClient.invalidateQueries({
          queryKey: contactQueryKey(
            activeWorkspaceId!,
            conversation.contact_id,
          ),
          exact: true,
        });
      }
    }

    function invalidateContactInquiries(conversation: Conversation) {
      if (!conversation.contact_id) return;
      void queryClient.invalidateQueries({
        queryKey: contactInquiriesQueryPrefix(
          activeWorkspaceId!,
          conversation.contact_id,
        ),
      });
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
          const [message, conversation] = await Promise.all([
            getMessage(conversationId, messageId),
            getConversation(conversationId),
          ]);
          if (!active) return;
          invalidateContactInquiries(conversation);
          if (message.direction !== "inbound") return;
          const toast: ChatToast = {
            id: message.id,
            conversationId,
            avatarUrl: message.author_avatar_url,
            name: message.author_name || conversation.title,
            preview: messagePreview(message, {
              photo: t("photo"),
              file: t("file"),
            }),
          };
          setToasts((current) =>
            [...current.filter((item) => item.id !== toast.id), toast].slice(
              -3,
            ),
          );
          if (soundEnabledRef.current) void playMessageSound();
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

    void fetchEventSource(conversationStreamUrl, {
      signal: controller.signal,
      openWhenHidden: true,
      headers: { accept: EventStreamContentType },
      fetch: (input, init) =>
        fetchConversationStream(input, init, activeWorkspaceId),
      async onopen(response) {
        if (response.status === 401 || response.status === 403) {
          throw new ConversationStreamSessionEnded();
        }
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw new ConversationStreamSessionEnded();
        }
        if (!response.ok) throw new RetryConversationStream();
        if (
          !response.headers
            .get("content-type")
            ?.startsWith(EventStreamContentType)
        ) {
          throw new ConversationStreamSessionEnded();
        }
        connectedAt = Date.now();
      },
      onmessage(event) {
        if (event.event === "connected") {
          invalidateConversation();
          return;
        }
        if (event.event === "profile") {
          const payload = parseEvent(event.data);
          if (payload) invalidateProfile(payload.conversation_id);
          return;
        }
        if (
          event.event !== "message" &&
          event.event !== "read" &&
          event.event !== "history"
        )
          return;
        const payload = parseEvent(event.data);
        if (!payload) return;
        invalidateConversation(payload.conversation_id);
        if (event.event === "message" && payload.message_id) {
          void showIncomingToast(payload.conversation_id, payload.message_id);
        } else if (event.event === "history" || event.event === "message") {
          const conversation = queryClient.getQueryData<Conversation>(
            conversationQueryKey(activeWorkspaceId!, payload.conversation_id),
          );
          if (conversation) invalidateContactInquiries(conversation);
        }
      },
      onclose() {
        throw new RetryConversationStream();
      },
      onerror(error) {
        if (error instanceof ConversationStreamSessionEnded) throw error;
        if (connectedAt && Date.now() - connectedAt >= 30_000) retryAttempt = 0;
        connectedAt = 0;
        return retryDelay(retryAttempt++);
      },
    }).catch(() => {
      // Session and query failures are handled by their owning layers.
    });

    return () => {
      active = false;
      controller.abort();
      setToasts([]);
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, [queryClient, t, userId, workspaceId]);

  return (
    <ChatNotificationContext.Provider value={{ soundEnabled, setSoundEnabled }}>
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
