import {
  ArrowDown,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import {
  messageText,
  type ChatMessage,
  type Conversation,
} from "../api/conversations-api";
import { useThreadScroll } from "../hooks/use-thread-scroll";
import { useChatNotificationSettings } from "../model/chat-notification-context";
import { sendFailureKind, useSendMessage } from "../model/use-send-message";
import { useVisibleMessageRead } from "../model/use-visible-message-read";

import { ChatAvatar } from "./chat-avatar";
import { MessageComposer } from "./message-composer";

function MessageRow({
  canSend,
  message,
  timeFormat,
  unsupportedMessage,
  deliveryStatusText,
  onRetryFailed,
  retryError,
  retryBlocked,
  retrying,
}: {
  canSend: boolean;
  message: ChatMessage;
  timeFormat: Intl.DateTimeFormat;
  unsupportedMessage: string;
  deliveryStatusText: Record<
    "pending" | "failed" | "unknown" | "retry",
    string
  >;
  onRetryFailed: (message: ChatMessage) => void;
  retryError: string | null;
  retryBlocked: boolean;
  retrying: boolean;
}) {
  const text = messageText(message);
  const isSystem = message.direction === "system";
  const isOutgoing = message.direction === "outbound";
  const deliveryStatus = message.delivery_status;
  const deliveryLabel =
    deliveryStatus === "pending" ||
    deliveryStatus === "failed" ||
    deliveryStatus === "unknown"
      ? deliveryStatusText[deliveryStatus]
      : null;

  if (isSystem) {
    return (
      <li className="flex justify-center py-2" data-message-id={message.id}>
        <span className="max-w-[80%] rounded-full bg-subtle px-4 py-2 text-center text-xs text-muted">
          {text || unsupportedMessage}
        </span>
      </li>
    );
  }

  return (
    <li
      className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
      data-message-id={message.id}
    >
      <div
        className={`max-w-[min(85%,38rem)] rounded-2xl px-4 py-3 shadow-sm ${isOutgoing ? "rounded-br-md bg-brand-fill text-on-brand" : "rounded-bl-md border border-line bg-surface text-ink"}`}
      >
        {message.author_name && (
          <p
            className={`mb-1 text-xs font-semibold ${isOutgoing ? "text-on-brand/80" : "text-brand"}`}
          >
            {message.author_name}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {text || unsupportedMessage}
        </p>
        <time
          className={`mt-1 block text-right text-[10px] ${isOutgoing ? "text-on-brand/70" : "text-muted"}`}
          dateTime={message.occurred_at}
        >
          {timeFormat.format(new Date(message.occurred_at))}
        </time>
        {isOutgoing && deliveryLabel && (
          <p className="mt-1 text-right text-[10px] text-on-brand/80">
            {deliveryLabel}
          </p>
        )}
        {canSend && isOutgoing && deliveryStatus === "failed" && text && (
          <button
            className="mt-1 block rounded px-1 text-xs font-medium text-on-brand underline decoration-on-brand/60 underline-offset-2 hover:decoration-on-brand disabled:opacity-50"
            disabled={retrying || retryBlocked}
            onClick={() => onRetryFailed(message)}
            type="button"
          >
            {retrying ? deliveryStatusText.pending : deliveryStatusText.retry}
          </button>
        )}
        {retryError && deliveryStatus === "failed" && (
          <p className="mt-1 text-xs text-on-brand" role="alert">
            {retryError}
          </p>
        )}
      </div>
    </li>
  );
}

export function MessageThread({
  canSend,
  conversation,
  conversationId,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  messages,
  onLoadMore,
  onRetry,
  workspaceId,
}: {
  canSend: boolean;
  conversation: Conversation | null;
  conversationId: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  messages: ChatMessage[];
  onLoadMore: () => void;
  onRetry: () => void;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("chats");
  const retrySend = useSendMessage(workspaceId, conversationId);
  const retryingRef = useRef(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [uncertainRetryIds, setUncertainRetryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [retryError, setRetryError] = useState<{
    messageId: string;
    text: string;
    blocked: boolean;
  } | null>(null);
  const { soundEnabled, setSoundEnabled } = useChatNotificationSettings();
  const {
    scrollRef,
    olderSentinelRef,
    isAtBottom,
    hasNewMessage,
    onScroll,
    jumpToBottom,
  } = useThreadScroll({
    conversationId,
    hasNextPage,
    isError,
    isFetchingNextPage,
    messages,
    onLoadMore,
  });
  useVisibleMessageRead({
    conversationId,
    messages,
    scrollRef,
    workspaceId,
  });
  const timeFormat = new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayFormat = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deliveryStatusText = {
    pending: t("deliveryPending"),
    failed: t("deliveryFailed"),
    unknown: t("deliveryUnknown"),
    retry: t("retry"),
  };

  async function retryFailed(message: ChatMessage) {
    if (
      !canSend ||
      retryingRef.current ||
      uncertainRetryIds.has(message.id) ||
      message.delivery_status !== "failed"
    )
      return;
    const text = messageText(message);
    if (!text) return;
    retryingRef.current = true;
    setRetryingId(message.id);
    setRetryError(null);
    try {
      await retrySend.mutateAsync({ text, clientMessageId: message.id });
    } catch (failure) {
      const kind = sendFailureKind(failure);
      if (kind === "uncertain") {
        setUncertainRetryIds((ids) => new Set(ids).add(message.id));
      }
      setRetryError({
        messageId: message.id,
        text: t(
          kind === "uncertain"
            ? "messageSendUncertain"
            : kind === "forbidden"
              ? "messageSendForbidden"
              : kind === "unavailable"
                ? "messageSendUnavailable"
                : kind === "connection"
                  ? "messageSendConnectionUnavailable"
                  : "messageSendFailed",
        ),
        blocked:
          kind === "uncertain" ||
          kind === "forbidden" ||
          kind === "unavailable",
      });
    } finally {
      retryingRef.current = false;
      setRetryingId(null);
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-page">
      <header className="flex min-h-18 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <Link
          aria-label={t("backToConversations")}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle focus-visible:outline-2 focus-visible:outline-brand md:hidden"
          to={ROUTES.MESSAGES}
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <ChatAvatar
          name={conversation?.title ?? t("conversation")}
          url={conversation?.avatar_url ?? null}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-ink sm:text-base">
            {conversation?.title ?? t("conversation")}
          </h2>
          <p className="text-xs text-muted">
            {conversation?.kind === "external"
              ? t("externalConversation")
              : t("platformConversation")}
          </p>
        </div>
        <button
          aria-label={t(soundEnabled ? "muteSound" : "enableSound")}
          aria-pressed={!soundEnabled}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={t(soundEnabled ? "muteSound" : "enableSound")}
          type="button"
        >
          {soundEnabled ? (
            <Volume2 aria-hidden="true" className="size-5" />
          ) : (
            <VolumeX aria-hidden="true" className="size-5" />
          )}
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          aria-label={t("messageHistory")}
          className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
          onScroll={onScroll}
          ref={scrollRef}
          role="log"
        >
          {isPending ? (
            <p className="py-8 text-center text-sm text-muted" role="status">
              {t("loadingMessages")}
            </p>
          ) : isError && messages.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-danger" role="alert">
                {t("messageLoadError")}
              </p>
              <Button
                className="mt-3"
                onClick={onRetry}
                size="sm"
                variant="outline"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("retry")}
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              {t("emptyMessages")}
            </p>
          ) : (
            <div className="mx-auto max-w-4xl">
              <div ref={olderSentinelRef} />
              {isFetchingNextPage && (
                <p
                  className="pb-3 text-center text-xs text-muted"
                  role="status"
                >
                  {t("loadingMore")}
                </p>
              )}
              {isError && (
                <div
                  className="pb-3 text-center text-sm text-danger"
                  role="alert"
                >
                  {t("messageLoadError")}
                  <Button
                    className="ml-2"
                    onClick={onRetry}
                    size="sm"
                    variant="outline"
                  >
                    {t("retry")}
                  </Button>
                </div>
              )}
              <ol className="space-y-3">
                {messages.map((message, index) => {
                  const day = new Date(message.occurred_at).toDateString();
                  const previousMessage = messages[index - 1];
                  const previousDay = previousMessage
                    ? new Date(previousMessage.occurred_at).toDateString()
                    : null;
                  const showDay = day !== previousDay;
                  return (
                    <FragmentWithDay
                      canSend={canSend}
                      date={
                        showDay
                          ? dayFormat.format(new Date(message.occurred_at))
                          : null
                      }
                      key={message.id}
                      message={message}
                      deliveryStatusText={deliveryStatusText}
                      onRetryFailed={(failedMessage) => {
                        void retryFailed(failedMessage);
                      }}
                      retryError={
                        retryError?.messageId === message.id
                          ? retryError.text
                          : null
                      }
                      retryBlocked={
                        uncertainRetryIds.has(message.id) ||
                        (retryError?.messageId === message.id &&
                          retryError.blocked)
                      }
                      retrying={retryingId === message.id}
                      timeFormat={timeFormat}
                      unsupportedMessage={t("unsupportedMessage")}
                    />
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {(!isAtBottom || hasNewMessage) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
            {hasNewMessage && (
              <button
                className="pointer-events-auto rounded-full bg-brand-fill px-4 py-2 text-xs font-semibold text-on-brand shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={jumpToBottom}
                type="button"
              >
                {t("newMessagePill")}
              </button>
            )}
            {!isAtBottom && (
              <button
                aria-label={t("jumpToBottom")}
                className="pointer-events-auto grid size-9 place-items-center rounded-full border border-line bg-surface text-ink shadow-md hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={jumpToBottom}
                type="button"
              >
                <ArrowDown aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {canSend ? (
        <MessageComposer
          conversationId={conversationId}
          workspaceId={workspaceId}
        />
      ) : (
        <p className="shrink-0 border-t border-line bg-surface px-4 py-4 text-center text-sm text-muted sm:px-6">
          {t("readerCannotSend")}
        </p>
      )}
    </section>
  );
}

function FragmentWithDay({
  canSend,
  date,
  message,
  timeFormat,
  unsupportedMessage,
  deliveryStatusText,
  onRetryFailed,
  retryError,
  retryBlocked,
  retrying,
}: {
  canSend: boolean;
  date: string | null;
  message: ChatMessage;
  timeFormat: Intl.DateTimeFormat;
  unsupportedMessage: string;
  deliveryStatusText: Record<
    "pending" | "failed" | "unknown" | "retry",
    string
  >;
  onRetryFailed: (message: ChatMessage) => void;
  retryError: string | null;
  retryBlocked: boolean;
  retrying: boolean;
}) {
  return (
    <>
      {date && (
        <li className="flex justify-center py-2">
          <span className="rounded-full bg-subtle px-3 py-1 text-xs text-muted">
            {date}
          </span>
        </li>
      )}
      <MessageRow
        canSend={canSend}
        message={message}
        deliveryStatusText={deliveryStatusText}
        onRetryFailed={onRetryFailed}
        retryError={retryError}
        retryBlocked={retryBlocked}
        retrying={retrying}
        timeFormat={timeFormat}
        unsupportedMessage={unsupportedMessage}
      />
    </>
  );
}
