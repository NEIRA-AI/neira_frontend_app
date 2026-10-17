import { BellOff, RotateCcw, Search, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

import { useAuth } from "@/features/auth";
import { channelProviders } from "@/features/channels";
import { messageConversationPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import { messagePreview, type Conversation } from "../api/conversations-api";
import { useChatNotificationSettings } from "../model/chat-notification-context";

import { ChatAvatar } from "./chat-avatar";
import { ChatNotificationContextMenu } from "./chat-notification-menu";

function previewText(
  conversation: Conversation,
  fallback: string,
  labels: { photo: string; file: string; voice: string },
  currentUserId: string | null,
  youLabel: string,
) {
  const message = conversation.last_message;
  if (!message) return fallback;
  const text = messagePreview(message, labels) || fallback;
  const authorName =
    conversation.kind === "external" && message.direction === "outbound"
      ? currentUserId && message.author_user_id === currentUserId
        ? youLabel
        : message.author_name?.trim()
      : null;
  return authorName ? `${authorName}: ${text}` : text;
}

function ConversationRow({
  conversation,
  selected,
  timeFormat,
}: {
  conversation: Conversation;
  selected: boolean;
  timeFormat: Intl.DateTimeFormat;
}) {
  const { t } = useTranslation("chats");
  const { user } = useAuth();
  const { getSettings, settingsReady } = useChatNotificationSettings();
  const { notificationsEnabled, soundEnabled } = getSettings(conversation.id);
  const provider = channelProviders.find(
    (item) => item.id === conversation.channel_provider,
  );
  const providerName = provider
    ? t(provider.id === "telegram_bot" ? "telegramProvider" : "vkProvider")
    : null;
  const muted = !notificationsEnabled || !soundEnabled;
  const mutedUnread = muted || !settingsReady;

  return (
    <li>
      <ChatNotificationContextMenu
        conversationId={conversation.id}
        trigger={
          <NavLink
            aria-current={selected ? "page" : undefined}
            className={`flex min-w-0 gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:shadow-[inset_3px_0_0_var(--ui-brand)] sm:px-5 ${selected ? "bg-brand-soft" : ""}`}
            to={messageConversationPath(conversation.id)}
          >
            <span className="relative size-10 shrink-0">
              <ChatAvatar
                name={conversation.title}
                url={conversation.avatar_url}
              />
              {provider && (
                <span className="absolute -bottom-0.5 -right-0.5 grid size-4.5 place-items-center rounded-full bg-surface ring-2 ring-surface">
                  <img
                    alt=""
                    className="size-4 object-contain"
                    src={provider.icon}
                  />
                  <span className="sr-only">{providerName}</span>
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-sm font-semibold text-ink">
                  {conversation.title}
                </span>
                {muted && (
                  <span
                    aria-label={
                      notificationsEnabled
                        ? t("soundDisabled")
                        : t("notificationsDisabled")
                    }
                    className="shrink-0 text-muted"
                    role="img"
                  >
                    {notificationsEnabled ? (
                      <VolumeX aria-hidden="true" className="size-3.5" />
                    ) : (
                      <BellOff aria-hidden="true" className="size-3.5" />
                    )}
                  </span>
                )}
                {conversation.last_message && (
                  <time
                    className="ml-auto shrink-0 text-[11px] text-muted"
                    dateTime={conversation.last_message.occurred_at}
                  >
                    {timeFormat.format(
                      new Date(conversation.last_message.occurred_at),
                    )}
                  </time>
                )}
              </span>
              <span className="mt-1 flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-xs text-muted">
                  {previewText(
                    conversation,
                    t("unsupportedMessage"),
                    {
                      photo: t("photo"),
                      file: t("file"),
                      voice: t("voice"),
                    },
                    user?.id ?? null,
                    t("you"),
                  )}
                </span>
                {conversation.unread_count > 0 && (
                  <span
                    aria-label={t("unreadCount", {
                      count: conversation.unread_count,
                    })}
                    className={`grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${mutedUnread ? "bg-subtle text-muted-strong" : "bg-brand-fill text-on-brand"}`}
                  >
                    {conversation.unread_count > 99
                      ? "99+"
                      : conversation.unread_count}
                  </span>
                )}
              </span>
            </span>
          </NavLink>
        }
      />
    </li>
  );
}

export function ConversationList({
  conversations,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  onRetry,
  selectedId,
}: {
  conversations: Conversation[];
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  selectedId: string | null;
}) {
  const { t, i18n } = useTranslation("chats");
  const [searchDraft, setSearchDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef<HTMLDivElement>(null);
  const timeFormat = new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const root = scrollRef.current;
    const target = loadRef.current;
    if (!root || !target || !hasNextPage || isFetchingNextPage || isError)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root, rootMargin: "180px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isError, isFetchingNextPage, onLoadMore]);

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col border-line bg-surface md:border-r">
      <div className="shrink-0 border-b border-line px-4 pb-4 pt-5 sm:px-5">
        <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
        <label className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-line bg-page px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-20">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
          <span className="sr-only">{t("search")}</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder={t("searchPlaceholder")}
            type="search"
            value={searchDraft}
          />
        </label>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
      >
        {isPending ? (
          <p className="px-5 py-8 text-sm text-muted" role="status">
            {t("loadingConversations")}
          </p>
        ) : isError && conversations.length === 0 ? (
          <div className="px-5 py-8">
            <p className="text-sm text-danger" role="alert">
              {t("conversationLoadError")}
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
        ) : conversations.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-semibold text-ink">{t("emptyConversations")}</p>
            <p className="mt-2 text-sm text-muted">
              {t("emptyConversationsHelp")}
            </p>
          </div>
        ) : (
          <>
            <ul>
              {conversations.map((conversation) => (
                <ConversationRow
                  conversation={conversation}
                  key={conversation.id}
                  selected={selectedId === conversation.id}
                  timeFormat={timeFormat}
                />
              ))}
            </ul>
            {isError && (
              <div className="px-5 py-3 text-sm text-danger" role="alert">
                {t("conversationLoadError")}
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
            <div ref={loadRef} />
            {isFetchingNextPage && (
              <p
                className="px-5 py-4 text-center text-xs text-muted"
                role="status"
              >
                {t("loadingMore")}
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
