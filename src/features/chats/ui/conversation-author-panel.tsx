import axios from "axios";
import { ArrowLeft, ArrowUpRight, ExternalLink, RotateCcw } from "lucide-react";
import { type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { channelProviders } from "@/features/channels";
import { channelDetailsPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import type { MessageAuthor } from "../api/conversations-api";
import { useMessageAuthor } from "../model/use-message-author";

import { ChatAvatar } from "./chat-avatar";

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function ChannelAuthorDetails({
  author,
}: {
  author: Extract<MessageAuthor, { kind: "channel" }>;
}) {
  const { t } = useTranslation("chats");
  const provider = channelProviders.find((item) => item.id === author.provider);
  const providerName =
    author.provider === "telegram_bot"
      ? t("telegramProvider")
      : author.provider === "vk_community"
        ? t("vkProvider")
        : author.provider || t("channelProvider");
  const profileUrl = safeExternalUrl(author.profile_url);
  const statusKey = author.archived
    ? "channelArchived"
    : author.status === "active"
      ? "channelActive"
      : author.status === "disconnected"
        ? "channelDisconnected"
        : author.status === "needs_reconnect"
          ? "channelNeedsReconnect"
          : author.status === "pending"
            ? "channelPending"
            : "channelUnavailable";

  return (
    <>
      <section className="px-5 py-5">
        <h3 className="text-sm font-semibold text-ink">
          {t("channelDetails")}
        </h3>
        <div className="mt-4 flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            {provider ? (
              <img
                alt=""
                className="size-5 object-contain"
                src={provider.icon}
              />
            ) : (
              <span aria-hidden="true">?</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{providerName}</p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          {author.channel_name && (
            <div>
              <dt className="text-xs text-muted">{t("channelNameInNeira")}</dt>
              <dd className="mt-0.5 break-words text-ink">
                {author.channel_name}
              </dd>
            </div>
          )}
          {author.username && (
            <div>
              <dt className="text-xs text-muted">{t("providerUsername")}</dt>
              <dd className="mt-0.5 break-all text-ink">{author.username}</dd>
            </div>
          )}
          {author.external_id && (
            <div>
              <dt className="text-xs text-muted">{t("providerUserId")}</dt>
              <dd className="mt-0.5 break-all text-ink">
                {author.external_id}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted">{t("channelStatus")}</dt>
            <dd className="mt-0.5 text-ink">{t(statusKey)}</dd>
          </div>
        </dl>
      </section>
      {(profileUrl || (author.id && !author.archived)) && (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-5 text-sm">
          {profileUrl && (
            <a
              className="inline-flex w-fit items-center gap-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href={profileUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              {t("openChannelProfile", { provider: providerName })}
            </a>
          )}
          {author.id && !author.archived && (
            <Link
              className="inline-flex w-fit items-center gap-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              to={channelDetailsPath(author.id)}
            >
              <ArrowUpRight aria-hidden="true" className="size-4" />
              {t("openChannelSettings")}
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function UserAuthorDetails({
  author,
}: {
  author: Extract<MessageAuthor, { kind: "user" }>;
}) {
  const { t } = useTranslation("chats");
  const roleKey =
    author.workspace_role === "owner"
      ? "roleOwner"
      : author.workspace_role === "admin"
        ? "roleAdmin"
        : author.workspace_role === "manager"
          ? "roleManager"
          : author.workspace_role === "reader"
            ? "roleReader"
            : null;

  return (
    <section className="px-5 py-5">
      <h3 className="text-sm font-semibold text-ink">
        {t("platformUserDetails")}
      </h3>
      {roleKey ? (
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted">{t("email")}</dt>
            <dd className="mt-0.5 break-all text-ink">
              {author.email || t("noValue")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t("telegram")}</dt>
            <dd className="mt-0.5 break-all text-ink">
              {author.telegram || t("noValue")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t("workspaceRole")}</dt>
            <dd className="mt-0.5 text-ink">{t(roleKey)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted">{t("formerMemberDetails")}</p>
      )}
    </section>
  );
}

export function ConversationAuthorPanel({
  avatarUrl,
  backButtonRef,
  conversationId,
  messageId,
  mode,
  name,
  onBack,
  titleRef,
  workspaceId,
}: {
  avatarUrl: string | null;
  backButtonRef: RefObject<HTMLButtonElement | null>;
  conversationId: string;
  messageId: string;
  mode: "drawer" | "inline";
  name: string;
  onBack?: () => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
  workspaceId: string;
}) {
  const { t } = useTranslation("chats");
  const authorQuery = useMessageAuthor(workspaceId, conversationId, messageId);
  const author = authorQuery.data;
  const isMissing =
    axios.isAxiosError(authorQuery.error) &&
    [404, 422].includes(authorQuery.error.response?.status ?? 0);
  const panelTitle =
    author?.kind === "channel"
      ? t("channelPanelTitle")
      : author?.kind === "user"
        ? t("userPanelTitle")
        : t("authorPanelTitle");

  return (
    <aside
      aria-labelledby="chat-author-panel-title"
      className={`flex h-full min-h-0 min-w-0 flex-col border-l border-line bg-surface ${mode === "drawer" ? "w-full shadow-xl" : ""}`}
      id="chat-author-panel"
    >
      <header className="flex min-h-18 shrink-0 items-center gap-2 border-b border-line px-5 py-3">
        {onBack && (
          <button
            aria-label={t("backToContactPanel")}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            onClick={onBack}
            ref={backButtonRef}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
        )}
        <h2
          className="truncate rounded text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-brand"
          id="chat-author-panel-title"
          ref={titleRef}
          tabIndex={-1}
        >
          {panelTitle}
        </h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col items-center bg-brand-soft px-5 py-7 text-center">
          <ChatAvatar
            name={author?.display_name ?? name}
            size="xl"
            url={author?.avatar_url ?? avatarUrl}
          />
          <h3 className="mt-3 max-w-full break-words text-lg font-semibold text-ink">
            {author?.display_name ?? name}
          </h3>
        </div>
        {isMissing ? (
          <p className="px-5 py-8 text-sm text-muted">
            {t("authorUnavailable")}
          </p>
        ) : authorQuery.isPending ? (
          <p className="px-5 py-8 text-sm text-muted" role="status">
            {t("loadingAuthor")}
          </p>
        ) : authorQuery.isError || !author ? (
          <div className="px-5 py-8">
            <p className="text-sm text-danger" role="alert">
              {t("authorLoadError")}
            </p>
            <Button
              className="mt-3"
              onClick={() => void authorQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : author.kind === "channel" ? (
          <ChannelAuthorDetails author={author} />
        ) : (
          <UserAuthorDetails author={author} />
        )}
      </div>
    </aside>
  );
}
