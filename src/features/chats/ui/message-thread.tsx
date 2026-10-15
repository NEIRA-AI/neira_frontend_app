import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  Eye,
  EyeOff,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useAuth } from "@/features/auth";
import { channelProviders, useChannel } from "@/features/channels";
import { channelDetailsPath, ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import {
  getMessage,
  messageText,
  type ChatMessage,
  type Conversation,
} from "../api/conversations-api";
import { useThreadScroll } from "../hooks/use-thread-scroll";
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
import { ChatAvatarPhoto } from "./chat-avatar-photo";
import { ChatNotificationMenu } from "./chat-notification-menu";
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

type MessageDayGroup = {
  kind: "day" | "failed";
  key: string;
  messages: [ChatMessage, ...ChatMessage[]];
};

function groupMessagesForDisplay(messages: ChatMessage[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];
  for (const message of messages) {
    const kind = message.delivery_status === "failed" ? "failed" : "day";
    const key =
      kind === "failed"
        ? "failed"
        : new Date(message.occurred_at).toDateString();
    const previous = groups.at(-1);
    if (previous?.kind === kind && previous.key === key) {
      previous.messages.push(message);
    } else {
      groups.push({ kind, key, messages: [message] });
    }
  }
  return groups;
}

function readFailedMessagesHidden(storageKey: string | null) {
  if (!storageKey || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

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
  hidden,
  notice,
  progress,
  onCancelAll,
  onRetryAll,
  onToggleHidden,
}: {
  canManage: boolean;
  busy: boolean;
  error: string | null;
  hidden: boolean;
  notice: string | null;
  progress: string | null;
  onCancelAll: () => void;
  onRetryAll: () => void;
  onToggleHidden: () => void;
}) {
  const { t } = useTranslation("chats");
  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger">
      <CircleAlert aria-hidden="true" className="size-3.5" />
      {t("failedMessagesSection")}
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </span>
  );
  return (
    <li className="flex flex-col items-center gap-1 py-2">
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
              className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-brand-soft"
              onSelect={onToggleHidden}
            >
              {hidden ? (
                <Eye aria-hidden="true" className="size-4" />
              ) : (
                <EyeOff aria-hidden="true" className="size-4" />
              )}
              {t(hidden ? "showFailedMessages" : "hideFailedMessages")}
            </DropdownMenu.Item>
            {canManage && (
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
            )}
            {canManage && (
              <DropdownMenu.Item
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-brand-soft"
                disabled={busy}
                onSelect={onRetryAll}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("retryAllFailedMessages")}
              </DropdownMenu.Item>
            )}
            {canManage && (
              <DropdownMenu.Item
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-danger-soft"
                disabled={busy}
                onSelect={onCancelAll}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                {t("cancelAllFailedMessages")}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
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
  const isPhotoOnly =
    hasPhotos &&
    !text.trim() &&
    mediaParts.every((part) => part.kind === "image");
  const hasMessageText = Boolean(text) || mediaParts.length === 0;
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
  const hasFailedStatus =
    isOutgoing && deliveryStatus === "failed" && Boolean(deliveryLabel);
  const otherDeliveryLabel =
    isOutgoing && deliveryStatus !== "failed" ? deliveryLabel : null;
  const messageMeta = (
    <>
      {otherDeliveryLabel && <span>{otherDeliveryLabel}</span>}
      {message.edited_at && (
        <span className="pointer-events-auto">
          <MessageEditHistory
            conversationId={message.conversation_id}
            messageId={message.id}
            workspaceId={workspaceId}
          />
        </span>
      )}
      <time dateTime={message.occurred_at}>
        {(deliveryStatus === "failed" ? failedTimeFormat : timeFormat).format(
          new Date(message.occurred_at),
        )}
      </time>
    </>
  );

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
        className={`${hasPhotos ? `${photoParts.length > 1 ? "w-[min(85%,32rem)]" : "w-[min(85%,22rem)]"} overflow-hidden` : "max-w-[min(85%,38rem)] px-3 py-2"} rounded-2xl border border-line bg-surface text-ink shadow-sm ${isOutgoing ? "rounded-br-md" : "rounded-bl-md"}`}
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
          <div
            className={
              hasPhotos
                ? "relative flex w-full min-w-0 flex-col gap-[2px]"
                : "space-y-2"
            }
          >
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
            {isPhotoOnly && (
              <div className="pointer-events-none absolute right-2 bottom-2 z-10 inline-flex items-center gap-1 rounded-md bg-overlay px-1.5 py-1 text-[10px] leading-none text-on-dark shadow-sm">
                {messageMeta}
              </div>
            )}
          </div>
        )}
        {(!isPhotoOnly || hasFailedStatus) && (
          <div className={hasPhotos ? "px-3 py-1.5" : undefined}>
            {!isPhotoOnly &&
              (hasMessageText ? (
                <p
                  className={`flex items-end gap-2 ${mediaParts.length > 0 && !hasPhotos ? "mt-2" : ""}`}
                >
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-5">
                    {text || unsupportedMessage}
                  </span>
                  <span className="inline-flex shrink-0 items-baseline gap-1 whitespace-nowrap text-[10px] leading-3 text-muted">
                    {messageMeta}
                  </span>
                </p>
              ) : (
                <div className="flex justify-end gap-1 text-[10px] leading-3 text-muted">
                  {messageMeta}
                </div>
              ))}
            {hasFailedStatus && (
              <FailedMessageStatus
                busy={retrying || cancelling || actionsBusy}
                canManage={canManageFailure}
                error={visibleDeliveryDetail ?? t("messageSendFailed")}
                label={deliveryLabel ?? ""}
                onCancel={() => onCancelFailed(message)}
                onRetry={() => onRetryFailed(message)}
                retryBlocked={retryBlocked}
              />
            )}
          </div>
        )}
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
  isPanelOpen,
  onToggleContactPanel,
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
  isPanelOpen: boolean;
  onToggleContactPanel: (trigger: HTMLButtonElement) => void;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("chats");
  const { t: tChannels } = useTranslation("channels");
  const { user } = useAuth();
  const failedMessagesStorageKey =
    user?.id && workspaceId && conversationId
      ? `neira.chats.failed-messages-hidden:${user.id}:${workspaceId}:${conversationId}`
      : null;
  const [storedFailedVisibility, setStoredFailedVisibility] = useState(() => ({
    storageKey: failedMessagesStorageKey,
    hidden: readFailedMessagesHidden(failedMessagesStorageKey),
  }));
  const failedMessagesHidden =
    storedFailedVisibility.storageKey === failedMessagesStorageKey
      ? storedFailedVisibility.hidden
      : readFailedMessagesHidden(failedMessagesStorageKey);
  const channelQuery = useChannel(workspaceId, conversation?.channel_id ?? "");
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
  const [notificationMenuOpenFor, setNotificationMenuOpenFor] = useState<
    string | null
  >(null);
  const deliveredMessages = messages.filter(
    (message) => message.delivery_status !== "failed",
  );
  const failedMessages = messages.filter(
    (message) => message.delivery_status === "failed",
  );
  const hasOwnLoadedFailure = failedMessages.some(
    (message) => message.author_user_id === user?.id,
  );
  const displayedMessages = [
    ...deliveredMessages,
    ...(failedMessagesHidden ? [] : failedMessages),
  ];
  const {
    scrollRef,
    olderSentinelRef,
    isAtBottom,
    hasNewMessage,
    onScroll,
    jumpToBottom,
    jumpToNewMessage,
  } = useThreadScroll({
    conversationId,
    hasNextPage,
    isError,
    isFetchingNextPage,
    messages,
    onLoadMore,
    visibleMessages: displayedMessages,
    visibleMessagesHidden: failedMessagesHidden,
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
  const channelProvider = channelProviders.find(
    ({ id }) =>
      id === (channelQuery.data?.provider ?? conversation?.channel_provider),
  );
  const channelType = channelProvider ? tChannels(channelProvider.label) : null;

  function toggleFailedMessagesHidden() {
    const hidden = !failedMessagesHidden;
    setStoredFailedVisibility({ storageKey: failedMessagesStorageKey, hidden });
    if (!failedMessagesStorageKey) return;
    try {
      window.localStorage.setItem(failedMessagesStorageKey, String(hidden));
    } catch {
      // The visibility choice still works for this session without storage.
    }
  }

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
            <ChatAvatarPhoto
              fallbackAction={{
                controls: isPanelOpen
                  ? isContactPanelOpen
                    ? "chat-contact-panel"
                    : "chat-author-panel"
                  : undefined,
                expanded: isPanelOpen,
                label: isPanelOpen
                  ? t("closeSidePanel")
                  : t("openContactPanel", { name: conversation.title }),
                onClick: onToggleContactPanel,
              }}
              name={conversation.title}
              url={conversation.avatar_url}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-ink sm:text-base">
                <button
                  aria-controls={
                    isPanelOpen
                      ? isContactPanelOpen
                        ? "chat-contact-panel"
                        : "chat-author-panel"
                      : undefined
                  }
                  aria-expanded={isPanelOpen}
                  className="max-w-full cursor-pointer truncate rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  onClick={(event) => onToggleContactPanel(event.currentTarget)}
                  type="button"
                >
                  {conversation.title}
                </button>
              </h2>
              {conversation.channel_id ? (
                <Link
                  className="inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  to={channelDetailsPath(conversation.channel_id)}
                >
                  {channelProvider && (
                    <img
                      alt=""
                      className="size-4 shrink-0 object-contain"
                      src={channelProvider.icon}
                    />
                  )}
                  <span className="truncate">
                    {channelQuery.data?.name ?? t("channelDetails")}
                  </span>
                  {channelType && (
                    <span className="shrink-0 font-normal">
                      ({channelType})
                    </span>
                  )}
                </Link>
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
        <div className="flex shrink-0 items-center">
          <ChatNotificationMenu
            conversationId={conversationId}
            onOpenChange={(open) =>
              setNotificationMenuOpenFor(open ? conversationId : null)
            }
            open={notificationMenuOpenFor === conversationId}
            trigger={
              <button
                aria-label={t("notificationSettingsForChat")}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                type="button"
              >
                <MoreHorizontal aria-hidden="true" className="size-5" />
              </button>
            }
          />
          {(conversation?.kind === "external" || isPanelOpen) && (
            <button
              aria-controls={
                isPanelOpen
                  ? isContactPanelOpen
                    ? "chat-contact-panel"
                    : "chat-author-panel"
                  : undefined
              }
              aria-expanded={isPanelOpen}
              aria-label={
                isPanelOpen
                  ? t("closeSidePanel")
                  : t("openContactPanel", { name: conversation?.title ?? "" })
              }
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              id="chat-panel-toggle"
              onClick={(event) => onToggleContactPanel(event.currentTarget)}
              type="button"
            >
              {isPanelOpen ? (
                <PanelRightClose aria-hidden="true" className="size-5" />
              ) : (
                <PanelRightOpen aria-hidden="true" className="size-5" />
              )}
            </button>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          aria-label={t("messageHistory")}
          className="absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-5 sm:px-6"
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
            <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-end pt-5">
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
                  {groupMessagesForDisplay(displayedMessages).map((group) => (
                    <li className="relative" key={`${group.kind}:${group.key}`}>
                      {group.kind === "day" && (
                        <div className="sticky top-0 z-10 mb-3 flex justify-center bg-page py-2">
                          <span className="rounded-full border border-line bg-surface/95 px-3 py-1 text-xs font-medium text-muted-strong shadow-sm backdrop-blur-sm">
                            {dayFormat.format(
                              new Date(group.messages[0].occurred_at),
                            )}
                          </span>
                        </div>
                      )}
                      <ol className="space-y-3">
                        {group.messages.map((message, index) => (
                          <MessageWithFailedSection
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
                              group.kind === "failed" && index === 0
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
                            failedSectionTitle={
                              group.kind === "failed" && index === 0
                                ? t("failedMessagesSection")
                                : null
                            }
                            failedMessagesHidden={failedMessagesHidden}
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
                            onToggleFailedMessagesHidden={
                              toggleFailedMessagesHidden
                            }
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
                        ))}
                      </ol>
                    </li>
                  ))}
                  {failedMessagesHidden && failedMessages.length > 0 && (
                    <FailedMessagesBadge
                      busy={
                        bulkAction !== null ||
                        retryingId !== null ||
                        cancellingId !== null
                      }
                      canManage={canSend && Boolean(user)}
                      error={bulkError}
                      hidden
                      notice={hasOwnLoadedFailure ? null : bulkNotice}
                      progress={
                        bulkAction === "retry" && bulkProgress
                          ? t("retryAllFailedMessagesProgress", bulkProgress)
                          : null
                      }
                      onCancelAll={() => {
                        void cancelAllFailed();
                      }}
                      onRetryAll={() => {
                        void retryAllFailed();
                      }}
                      onToggleHidden={toggleFailedMessagesHidden}
                    />
                  )}
                </ol>
              </Tooltip.Provider>
            </div>
          )}
        </div>

        {(!isAtBottom || hasNewMessage) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
            {hasNewMessage && (
              <button
                className="pointer-events-auto cursor-pointer rounded-full bg-brand-fill px-4 py-2 text-xs font-semibold text-on-brand shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={jumpToNewMessage}
                type="button"
              >
                {t("newMessagePill")}
              </button>
            )}
            {!isAtBottom && (
              <button
                aria-label={t("jumpToBottom")}
                className="pointer-events-auto grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink shadow-md hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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

function MessageWithFailedSection({
  canManageFailure,
  canManageFailedSection,
  actionsBusy,
  bulkProgressText,
  bulkError,
  bulkNotice,
  failedSectionTitle,
  failedMessagesHidden,
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
  onToggleFailedMessagesHidden,
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
  failedSectionTitle: string | null;
  failedMessagesHidden: boolean;
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
  onToggleFailedMessagesHidden: () => void;
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
      {failedSectionTitle && (
        <FailedMessagesBadge
          busy={actionsBusy}
          canManage={canManageFailedSection}
          error={bulkError}
          hidden={failedMessagesHidden}
          notice={bulkNotice}
          progress={bulkProgressText}
          onCancelAll={onCancelAllFailed}
          onRetryAll={onRetryAllFailed}
          onToggleHidden={onToggleFailedMessagesHidden}
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
