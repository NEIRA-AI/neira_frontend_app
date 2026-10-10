import { RotateCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

import { messageConversationPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import { messageText, type Conversation } from "../api/conversations-api";

import { ChatAvatar } from "./chat-avatar";

function previewText(conversation: Conversation, fallback: string) {
  const text = messageText(conversation.last_message);
  if (!conversation.last_message) return fallback;
  return text || fallback;
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
                <li key={conversation.id}>
                  <NavLink
                    aria-current={
                      selectedId === conversation.id ? "page" : undefined
                    }
                    className={`flex min-w-0 gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand sm:px-5 ${selectedId === conversation.id ? "bg-brand-soft" : ""}`}
                    to={messageConversationPath(conversation.id)}
                  >
                    <ChatAvatar
                      name={conversation.title}
                      url={conversation.avatar_url}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                          {conversation.title}
                        </span>
                        {conversation.last_message && (
                          <time
                            className="shrink-0 text-[11px] text-muted"
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
                          {previewText(conversation, t("unsupportedMessage"))}
                        </span>
                        {conversation.unread_count > 0 && (
                          <span
                            aria-label={t("unreadCount", {
                              count: conversation.unread_count,
                            })}
                            className="grid min-w-5 shrink-0 place-items-center rounded-full bg-brand-fill px-1.5 py-0.5 text-[11px] font-semibold text-on-brand"
                          >
                            {conversation.unread_count > 99
                              ? "99+"
                              : conversation.unread_count}
                          </span>
                        )}
                      </span>
                    </span>
                  </NavLink>
                </li>
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
