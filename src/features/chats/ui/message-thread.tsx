import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import {
  getMessage,
  messageText,
  type ChatMessage,
  type Conversation,
} from "../api/conversations-api";
import { useThreadScroll } from "../hooks/use-thread-scroll";
import { useChatNotificationSettings } from "../model/chat-notification-context";
import { useCancelFailedMessages } from "../model/use-cancel-failed-messages";
import {
  useRetryAllFailedMessages,
  type RetryAllProgress,
} from "../model/use-retry-all-failed-messages";
import { useRetryMessage } from "../model/use-retry-message";
import {
  persistedSendStatus,
  sendFailureKind,
} from "../model/use-send-message";
import { useVisibleMessageRead } from "../model/use-visible-message-read";

import { ChatAvatar } from "./chat-avatar";
import { MessageComposer } from "./message-composer";
import { MessageEditHistory } from "./message-edit-history";
import { MessageFile } from "./message-file";
import { MessagePhotoMosaic } from "./message-photo-mosaic";
import { MessagePhotoViewer } from "./message-photo-viewer";
import { MessageVoice } from "./message-voice";

type MessagePart = ChatMessage["parts"][number];
type MediaGroup =
  | { kind: "photos"; parts: MessagePart[] }
  | { kind: "file" | "voice"; part: MessagePart };

function groupMediaParts(parts: MessagePart[]): MediaGroup[] {
  const groups: MediaGroup[] = [];
  for (const part of parts) {
    if (part.kind === "image") {
      const last = groups[groups.length - 1];
      if (last?.kind === "photos") last.parts.push(part);
      else groups.push({ kind: "photos", parts: [part] });
    } else if (part.kind === "file" || part.kind === "voice") {
      groups.push({ kind: part.kind, part });
    }
  }
  return groups;
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function FailedMessageStatus({
  canManage,
  error,
  label,
  onCancel,
  onRetry,
  retryBlocked,
  busy,
}: {
  canManage: boolean;
  error: string;
  label: string;
  onCancel: () => void;
  onRetry: () => void;
  retryBlocked: boolean;
  busy: boolean;
}) {
  const { t } = useTranslation("chats");
  const content = (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            aria-label={!canManage ? error : undefined}
            className="grid size-4 place-items-center rounded-full bg-surface"
            role={!canManage ? "img" : undefined}
            tabIndex={!canManage ? 0 : undefined}
          >
            <CircleAlert aria-hidden="true" className="size-3 text-danger" />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-64 rounded-xl border border-line bg-surface px-3 py-2 text-xs leading-5 text-ink shadow-lg"
            collisionPadding={8}
            side="top"
            sideOffset={7}
          >
            {error}
            <Tooltip.Arrow className="fill-surface" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      <span>{label}</span>
      {canManage && <ChevronDown aria-hidden="true" className="size-3" />}
    </span>
  );

  if (!canManage) {
    return <span className="mt-1 flex justify-end rounded">{content}</span>;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-description={error}
          aria-label={t("failedMessageActions")}
          className="mt-1 ml-auto flex cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          type="button"
        >
          {content}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-44 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
          collisionPadding={8}
          sideOffset={6}
        >
          <DropdownMenu.Item
            className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-brand-soft"
            disabled={busy || retryBlocked}
            onSelect={onRetry}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("retry")}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-danger-soft"
            disabled={busy}
            onSelect={onCancel}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            {t("cancelFailedMessage")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function FailedMessagesBadge({
  canManage,
  busy,
  error,
  notice,
  progress,
  onCancelAll,
  onRetryAll,
}: {
  canManage: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  progress: string | null;
  onCancelAll: () => void;
  onRetryAll: () => void;
}) {
  const { t } = useTranslation("chats");
  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">
      <CircleAlert aria-hidden="true" className="size-3.5" />
      {t("failedMessagesSection")}
      {canManage && <ChevronDown aria-hidden="true" className="size-3.5" />}
    </span>
  );
  return (
    <li className="flex flex-col items-center gap-1 py-2">
      {canManage ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label={t("failedMessagesActions")}
              className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              type="button"
            >
              {badge}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="center"
              className="z-50 min-w-44 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
              collisionPadding={8}
              sideOffset={6}
            >
              <DropdownMenu.Item
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-brand-soft"
                disabled={busy}
                onSelect={onRetryAll}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("retryAllFailedMessages")}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-danger-soft"
                disabled={busy}
                onSelect={onCancelAll}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                {t("cancelAllFailedMessages")}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : (
        badge
      )}
      {progress && (
        <p className="max-w-xs text-center text-xs text-muted" role="status">
          {progress}
        </p>
      )}
      {notice && (
        <p className="max-w-xs text-center text-xs text-muted" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="max-w-xs text-center text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

function MessageRow({
  canManageFailure,
  message,
  workspaceId,
  timeFormat,
  failedTimeFormat,
  unsupportedMessage,
  deliveryStatusText,
  onRetryFailed,
  onCancelFailed,
  onOpenContact,
  onOpenAuthor,
  retryError,
  retryBlocked,
  retrying,
  cancelling,
  actionsBusy,
  unknownParticipant,
}: {
  canManageFailure: boolean;
  message: ChatMessage;
  workspaceId: string;
  timeFormat: Intl.DateTimeFormat;
  failedTimeFormat: Intl.DateTimeFormat;
  unsupportedMessage: string;
  deliveryStatusText: Record<"pending" | "failed" | "unknown", string>;
  onRetryFailed: (message: ChatMessage) => void;
  onCancelFailed: (message: ChatMessage) => void;
  onOpenContact: (
    contactId: string | null,
    identityId: string | null,
    trigger: HTMLButtonElement,
    fallback: { name: string; avatarUrl: string | null },
  ) => void;
  onOpenAuthor: (message: ChatMessage, trigger: HTMLButtonElement) => void;
  retryError: string | null;
  retryBlocked: boolean;
  retrying: boolean;
  cancelling: boolean;
  actionsBusy: boolean;
  unknownParticipant: string;
}) {
  const { t } = useTranslation("chats");
  const text = messageText(message);
  const mediaParts = message.parts
    .filter(
      (part) =>
        part.kind === "image" || part.kind === "file" || part.kind === "voice",
    )
    .sort((a, b) => a.position - b.position);
  const photoParts = mediaParts.filter((part) => part.kind === "image");
  const hasPhotos = photoParts.length > 0;
  const mediaGroups = groupMediaParts(mediaParts);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const mediaRefreshRef = useRef<Promise<ChatMessage> | null>(null);
  const refreshMediaMessage = useCallback(() => {
    if (mediaRefreshRef.current) return mediaRefreshRef.current;
    const request = getMessage(message.conversation_id, message.id);
    mediaRefreshRef.current = request;
    const clear = () => {
      if (mediaRefreshRef.current === request) mediaRefreshRef.current = null;
    };
    void request.then(clear, clear);
    return request;
  }, [message.conversation_id, message.id]);
  const isSystem = message.direction === "system";
  const isOutgoing = message.direction === "outbound";
  const deliveryStatus = message.delivery_status;
  const deliveryLabel =
    deliveryStatus === "pending" ||
    deliveryStatus === "failed" ||
    deliveryStatus === "unknown"
      ? deliveryStatusText[deliveryStatus]
      : null;
  const deliveryDetail =
    deliveryStatus === "failed"
      ? message.delivery_error_code === "missing_permissions"
        ? t("messageSendPermissions")
        : message.delivery_error_code === "connection_unavailable" ||
            message.delivery_error_code === "channel_credentials_unavailable"
          ? t("messageSendConnectionUnavailable")
          : message.delivery_error_code === "photo_upload_failed"
            ? t("messagePhotoUploadFailed")
            : message.delivery_error_code === "file_upload_failed"
              ? t("messageFileUploadFailed")
              : null
      : null;
  const visibleDeliveryDetail =
    deliveryStatus === "sent"
      ? null
      : retryError || deliveryDetail || t("messageSendFailed");
  const canOpenContact = !isOutgoing && Boolean(message.author_contact_id);

  function openAuthor(trigger: HTMLButtonElement) {
    if (isOutgoing) {
      onOpenAuthor(message, trigger);
    } else if (message.author_contact_id) {
      onOpenContact(
        message.author_contact_id,
        message.author_external_identity_id,
        trigger,
        {
          name: message.author_name || unknownParticipant,
          avatarUrl: message.author_avatar_url,
        },
      );
    }
  }

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
      className={`flex items-end gap-2 ${isOutgoing ? "justify-end" : "justify-start"}`}
      data-message-id={message.id}
    >
      {!isOutgoing &&
        (message.author_contact_id ? (
          <button
            aria-label={t("openContactPanel", {
              name: message.author_name || unknownParticipant,
            })}
            className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={(event) => openAuthor(event.currentTarget)}
            type="button"
          >
            <ChatAvatar
              name={message.author_name || unknownParticipant}
              size="sm"
              url={message.author_avatar_url}
            />
          </button>
        ) : (
          <ChatAvatar
            name={message.author_name || unknownParticipant}
            size="sm"
            url={message.author_avatar_url}
          />
        ))}
      <div
        className={`max-w-[min(85%,38rem)] rounded-2xl border border-line bg-surface text-ink shadow-sm ${hasPhotos ? "overflow-hidden" : "px-4 py-3"} ${isOutgoing ? "rounded-br-md" : "rounded-bl-md"}`}
      >
        {message.author_name &&
          (isOutgoing || canOpenContact ? (
            <button
              aria-label={t(
                isOutgoing ? "openAuthorPanel" : "openContactPanel",
                {
                  name: message.author_name,
                },
              )}
              className={`${hasPhotos ? "mx-3 mt-2 mb-2" : "mb-1"} block cursor-pointer rounded text-left text-xs font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
              onClick={(event) => openAuthor(event.currentTarget)}
              type="button"
            >
              {message.author_name}
            </button>
          ) : (
            <p
              className={`${hasPhotos ? "mx-3 mt-2 mb-2" : "mb-1"} text-xs font-semibold text-brand`}
            >
              {message.author_name}
            </p>
          ))}
        {mediaParts.length > 0 && (
          <div className={hasPhotos ? "flex flex-col gap-[2px]" : "space-y-2"}>
            {mediaGroups.map((group) =>
              group.kind === "photos" ? (
                <MessagePhotoMosaic
                  allPhotos={photoParts}
                  key={group.parts[0]?.id ?? message.id}
                  onOpen={setSelectedPhotoId}
                  photos={group.parts}
                  refreshMessage={refreshMediaMessage}
                />
              ) : (
                <div
                  className={hasPhotos ? "px-3 py-2" : undefined}
                  key={group.part.id}
                >
                  {group.kind === "voice" ? (
                    <MessageVoice
                      part={group.part}
                      refreshMessage={refreshMediaMessage}
                    />
                  ) : (
                    <MessageFile
                      part={group.part}
                      refreshMessage={refreshMediaMessage}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        )}
        <div className={hasPhotos ? "px-3 pt-2 pb-2" : undefined}>
          {(text || mediaParts.length === 0) && (
            <p
              className={`whitespace-pre-wrap break-words text-sm leading-6 ${mediaParts.length > 0 && !hasPhotos ? "mt-2" : ""}`}
            >
              {text || unsupportedMessage}
            </p>
          )}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-muted">
            {message.edited_at && (
              <MessageEditHistory
                conversationId={message.conversation_id}
                messageId={message.id}
                workspaceId={workspaceId}
              />
            )}
            <time dateTime={message.occurred_at}>
              {(deliveryStatus === "failed"
                ? failedTimeFormat
                : timeFormat
              ).format(new Date(message.occurred_at))}
            </time>
          </div>
          {isOutgoing && deliveryStatus === "failed" && deliveryLabel ? (
            <FailedMessageStatus
              busy={retrying || cancelling || actionsBusy}
              canManage={canManageFailure}
              error={visibleDeliveryDetail ?? t("messageSendFailed")}
              label={deliveryLabel}
              onCancel={() => onCancelFailed(message)}
              onRetry={() => onRetryFailed(message)}
              retryBlocked={retryBlocked}
            />
          ) : (
            isOutgoing &&
            deliveryLabel && (
              <p className="mt-1 text-right text-[10px] text-muted">
                {deliveryLabel}
              </p>
            )
          )}
        </div>
      </div>
      {hasPhotos && (
        <MessagePhotoViewer
          authorAvatarUrl={message.author_avatar_url}
          authorName={message.author_name || unknownParticipant}
          onSelectedPhotoIdChange={setSelectedPhotoId}
          occurredAt={message.occurred_at}
          photos={photoParts}
          refreshMessage={refreshMediaMessage}
          selectedPhotoId={selectedPhotoId}
        />
      )}
      {isOutgoing && (
        <button
          aria-label={t("openAuthorPanel", {
            name: message.author_name || unknownParticipant,
          })}
          className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={(event) => openAuthor(event.currentTarget)}
          type="button"
        >
          <ChatAvatar
            name={message.author_name || unknownParticipant}
            size="sm"
            url={message.author_avatar_url}
          />
        </button>
      )}
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
  onOpenContact,
  onOpenAuthor,
  onRetry,
  isContactPanelOpen,
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
  onOpenContact: (
    contactId: string | null,
    identityId: string | null,
    trigger: HTMLButtonElement,
    fallback: { name: string; avatarUrl: string | null },
  ) => void;
  onOpenAuthor: (message: ChatMessage, trigger: HTMLButtonElement) => void;
  onRetry: () => void;
  isContactPanelOpen: boolean;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("chats");
  const { user } = useAuth();
  const retrySend = useRetryMessage(workspaceId, conversationId);
  const retryAll = useRetryAllFailedMessages(workspaceId, conversationId);
  const { cancelOne, cancelAll } = useCancelFailedMessages(
    workspaceId,
    conversationId,
  );
  const retryingRef = useRef(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"retry" | "cancel" | null>(null);
  const [bulkProgress, setBulkProgress] = useState<RetryAllProgress | null>(
    null,
  );
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);
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
  const failedTimeFormat = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
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
  };
  const deliveredMessages = messages.filter(
    (message) => message.delivery_status !== "failed",
  );
  const failedMessages = messages.filter(
    (message) => message.delivery_status === "failed",
  );
  const hasOwnLoadedFailure = failedMessages.some(
    (message) => message.author_user_id === user?.id,
  );
  const displayedMessages = [...deliveredMessages, ...failedMessages];
  const profileUrl =
    conversation?.kind === "external"
      ? safeExternalUrl(conversation.profile_url)
      : null;
  const providerName =
    conversation?.channel_provider === "telegram_bot"
      ? t("telegramProvider")
      : conversation?.channel_provider === "vk_community"
        ? t("vkProvider")
        : t("channelProvider");

  async function retryFailed(message: ChatMessage) {
    if (
      !canSend ||
      retryingRef.current ||
      message.author_user_id !== user?.id ||
      uncertainRetryIds.has(message.id) ||
      message.delivery_status !== "failed"
    )
      return;
    retryingRef.current = true;
    setRetryingId(message.id);
    setRetryError(null);
    try {
      await retrySend.mutateAsync(message.id);
    } catch (failure) {
      const persistedStatus = persistedSendStatus(failure, message.id);
      if (persistedStatus) {
        if (persistedStatus !== "failed") {
          setUncertainRetryIds((ids) => new Set(ids).add(message.id));
          setRetryError({
            messageId: message.id,
            text: t("messageSendUncertain"),
            blocked: true,
          });
        }
        // The refetched message owns the delivery error; avoid a second,
        // possibly contradictory error under the retry button.
        return;
      }
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
                  : kind === "permissions"
                    ? "messageSendPermissions"
                    : kind === "photo_storage_unavailable"
                      ? "photoRetryStorageUnavailable"
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

  async function cancelFailed(message: ChatMessage) {
    if (
      !canSend ||
      retryingRef.current ||
      message.author_user_id !== user?.id ||
      message.delivery_status !== "failed"
    )
      return;
    retryingRef.current = true;
    setCancellingId(message.id);
    setRetryError(null);
    try {
      await cancelOne.mutateAsync(message.id);
      setUncertainRetryIds((ids) => {
        const next = new Set(ids);
        next.delete(message.id);
        return next;
      });
    } catch {
      setRetryError({
        messageId: message.id,
        text: t("cancelFailedMessageError"),
        blocked: false,
      });
    } finally {
      retryingRef.current = false;
      setCancellingId(null);
    }
  }

  async function cancelAllFailed() {
    if (!canSend || retryingRef.current) return;
    retryingRef.current = true;
    setBulkAction("cancel");
    setBulkError(null);
    setBulkNotice(null);
    try {
      const cancelledCount = await cancelAll.mutateAsync();
      if (cancelledCount === 0) setBulkNotice(t("noOwnFailedMessages"));
    } catch {
      setBulkError(t("cancelAllFailedMessagesError"));
    } finally {
      retryingRef.current = false;
      setBulkAction(null);
    }
  }

  async function retryAllFailed() {
    if (!canSend || retryingRef.current) return;
    retryingRef.current = true;
    setBulkAction("retry");
    setBulkProgress(null);
    setBulkError(null);
    setBulkNotice(null);
    try {
      const result = await retryAll.mutateAsync(setBulkProgress);
      if (result.total === 0) {
        setBulkNotice(t("noOwnFailedMessages"));
      } else if (result.stopped) {
        setBulkError(t("retryAllFailedMessagesError"));
      } else if (result.succeeded < result.total) {
        setBulkError(
          t("retryAllFailedMessagesFinished", {
            succeeded: result.succeeded,
            total: result.total,
          }),
        );
      }
    } catch {
      setBulkError(t("retryAllFailedMessagesError"));
    } finally {
      retryingRef.current = false;
      setBulkAction(null);
      setBulkProgress(null);
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
        {conversation?.kind === "external" ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              aria-controls={
                isContactPanelOpen ? "chat-contact-panel" : undefined
              }
              aria-expanded={isContactPanelOpen}
              aria-label={t("openContactPanel", { name: conversation.title })}
              className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={(event) =>
                onOpenContact(
                  conversation.contact_id,
                  conversation.primary_external_identity_id,
                  event.currentTarget,
                  {
                    name: conversation.title,
                    avatarUrl: conversation.avatar_url,
                  },
                )
              }
              type="button"
            >
              <ChatAvatar
                name={conversation.title}
                url={conversation.avatar_url}
              />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-ink sm:text-base">
                <button
                  aria-controls={
                    isContactPanelOpen ? "chat-contact-panel" : undefined
                  }
                  aria-expanded={isContactPanelOpen}
                  className="max-w-full cursor-pointer truncate rounded text-left hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  onClick={(event) =>
                    onOpenContact(
                      conversation.contact_id,
                      conversation.primary_external_identity_id,
                      event.currentTarget,
                      {
                        name: conversation.title,
                        avatarUrl: conversation.avatar_url,
                      },
                    )
                  }
                  type="button"
                >
                  {conversation.title}
                </button>
              </h2>
              {profileUrl ? (
                <a
                  className="inline-flex max-w-full min-w-0 items-center gap-1 rounded text-xs text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  href={profileUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="truncate">
                    {t("openProviderProfile", { provider: providerName })}
                  </span>
                  <ExternalLink
                    aria-hidden="true"
                    className="size-3 shrink-0"
                  />
                </a>
              ) : (
                <p className="text-xs text-muted">
                  {t("externalConversation")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ChatAvatar
              name={conversation?.title ?? t("conversation")}
              url={conversation?.avatar_url ?? null}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-ink sm:text-base">
                {conversation?.title ?? t("conversation")}
              </h2>
              <p className="text-xs text-muted">{t("platformConversation")}</p>
            </div>
          </div>
        )}
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
              <Tooltip.Provider delayDuration={250} skipDelayDuration={150}>
                <ol className="space-y-3">
                  {displayedMessages.map((message, index) => {
                    const isFailed = index >= deliveredMessages.length;
                    const day = new Date(message.occurred_at).toDateString();
                    const previousMessage = displayedMessages[index - 1];
                    const previousDay = previousMessage
                      ? new Date(previousMessage.occurred_at).toDateString()
                      : null;
                    const showDay = !isFailed && day !== previousDay;
                    return (
                      <FragmentWithDay
                        canManageFailure={
                          canSend && message.author_user_id === user?.id
                        }
                        canManageFailedSection={canSend && Boolean(user)}
                        actionsBusy={
                          bulkAction !== null ||
                          retryingId !== null ||
                          cancellingId !== null
                        }
                        bulkProgressText={
                          isFailed && index === deliveredMessages.length
                            ? bulkAction === "retry" && bulkProgress
                              ? t(
                                  "retryAllFailedMessagesProgress",
                                  bulkProgress,
                                )
                              : null
                            : null
                        }
                        bulkError={bulkError}
                        bulkNotice={hasOwnLoadedFailure ? null : bulkNotice}
                        date={
                          showDay
                            ? dayFormat.format(new Date(message.occurred_at))
                            : null
                        }
                        failedSectionTitle={
                          isFailed && index === deliveredMessages.length
                            ? t("failedMessagesSection")
                            : null
                        }
                        failedTimeFormat={failedTimeFormat}
                        key={message.id}
                        message={message}
                        workspaceId={workspaceId}
                        deliveryStatusText={deliveryStatusText}
                        onRetryFailed={(failedMessage) => {
                          void retryFailed(failedMessage);
                        }}
                        onCancelFailed={(failedMessage) => {
                          void cancelFailed(failedMessage);
                        }}
                        onRetryAllFailed={() => {
                          void retryAllFailed();
                        }}
                        onCancelAllFailed={() => {
                          void cancelAllFailed();
                        }}
                        onOpenContact={onOpenContact}
                        onOpenAuthor={onOpenAuthor}
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
                        cancelling={cancellingId === message.id}
                        timeFormat={timeFormat}
                        unsupportedMessage={t("unsupportedMessage")}
                        unknownParticipant={t("unknownParticipant")}
                      />
                    );
                  })}
                </ol>
              </Tooltip.Provider>
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
          provider={conversation?.channel_provider ?? null}
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
  canManageFailure,
  canManageFailedSection,
  actionsBusy,
  bulkProgressText,
  bulkError,
  bulkNotice,
  date,
  failedSectionTitle,
  failedTimeFormat,
  message,
  workspaceId,
  timeFormat,
  unsupportedMessage,
  deliveryStatusText,
  onRetryFailed,
  onCancelFailed,
  onRetryAllFailed,
  onCancelAllFailed,
  onOpenContact,
  onOpenAuthor,
  retryError,
  retryBlocked,
  retrying,
  cancelling,
  unknownParticipant,
}: {
  canManageFailure: boolean;
  canManageFailedSection: boolean;
  actionsBusy: boolean;
  bulkProgressText: string | null;
  bulkError: string | null;
  bulkNotice: string | null;
  date: string | null;
  failedSectionTitle: string | null;
  failedTimeFormat: Intl.DateTimeFormat;
  message: ChatMessage;
  workspaceId: string;
  timeFormat: Intl.DateTimeFormat;
  unsupportedMessage: string;
  deliveryStatusText: Record<"pending" | "failed" | "unknown", string>;
  onRetryFailed: (message: ChatMessage) => void;
  onCancelFailed: (message: ChatMessage) => void;
  onRetryAllFailed: () => void;
  onCancelAllFailed: () => void;
  onOpenContact: (
    contactId: string | null,
    identityId: string | null,
    trigger: HTMLButtonElement,
    fallback: { name: string; avatarUrl: string | null },
  ) => void;
  onOpenAuthor: (message: ChatMessage, trigger: HTMLButtonElement) => void;
  retryError: string | null;
  retryBlocked: boolean;
  retrying: boolean;
  cancelling: boolean;
  unknownParticipant: string;
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
      {failedSectionTitle && (
        <FailedMessagesBadge
          busy={actionsBusy}
          canManage={canManageFailedSection}
          error={bulkError}
          notice={bulkNotice}
          progress={bulkProgressText}
          onCancelAll={onCancelAllFailed}
          onRetryAll={onRetryAllFailed}
        />
      )}
      <MessageRow
        canManageFailure={canManageFailure}
        actionsBusy={actionsBusy}
        message={message}
        workspaceId={workspaceId}
        deliveryStatusText={deliveryStatusText}
        failedTimeFormat={failedTimeFormat}
        onRetryFailed={onRetryFailed}
        onCancelFailed={onCancelFailed}
        onOpenContact={onOpenContact}
        onOpenAuthor={onOpenAuthor}
        retryError={retryError}
        retryBlocked={retryBlocked}
        retrying={retrying}
        cancelling={cancelling}
        timeFormat={timeFormat}
        unsupportedMessage={unsupportedMessage}
        unknownParticipant={unknownParticipant}
      />
    </>
  );
}
