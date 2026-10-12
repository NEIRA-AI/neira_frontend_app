import axios from "axios";
import {
  ArrowUpRight,
  ExternalLink,
  MessageSquareText,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import { type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { channelProviders } from "@/features/channels";
import { type ContactDetail, useContact } from "@/features/contacts";
import {
  contactDetailsPath,
  messageConversationPath,
} from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import type { Conversation } from "../api/conversations-api";

import { ChatAvatar } from "./chat-avatar";
import { ConversationInquiries } from "./conversation-inquiries";

type Identity = ContactDetail["identities"][number];

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function profileString(identity: Identity, key: string) {
  const value = identity.profile_data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatProviderBirthday(value: string) {
  const match = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/.exec(value);
  if (!match) return value;

  const day = Number(match[1]);
  const month = Number(match[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return value;

  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}${match[3] ? `.${match[3]}` : ""}`;
}

function profileCity(identity: Identity) {
  const value = identity.profile_data.city;
  if (!value || typeof value !== "object" || !("title" in value)) return null;
  return typeof value.title === "string" && value.title.trim()
    ? value.title.trim()
    : null;
}

function IdentityDetails({
  identity,
  conversationId,
}: {
  identity: Identity;
  conversationId: string;
}) {
  const { t, i18n } = useTranslation("chats");
  const provider = channelProviders.find(
    (item) => item.id === identity.provider,
  );
  const providerName =
    identity.provider === "telegram_bot"
      ? t("telegramProvider")
      : identity.provider === "vk_community"
        ? t("vkProvider")
        : identity.provider;
  const username =
    profileString(identity, "username") ??
    profileString(identity, "screen_name");
  const bio =
    profileString(identity, "bio") ?? profileString(identity, "about");
  const birthday = profileString(identity, "bdate");
  const city = profileCity(identity);
  const profileUrl = safeExternalUrl(identity.profile_url);
  const providerDialogUrl = safeExternalUrl(identity.provider_dialog_url);
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const platformConversation = identity.platform_conversations.find(
    (item) => item.conversation_id === conversationId,
  );

  return (
    <section className="border-t border-line px-5 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          {provider ? (
            <img alt="" className="size-5 object-contain" src={provider.icon} />
          ) : (
            <MessageSquareText aria-hidden="true" className="size-5" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{providerName}</h3>
          <p className="truncate text-xs text-muted">{identity.display_name}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        {username && (
          <div>
            <dt className="text-xs text-muted">{t("providerUsername")}</dt>
            <dd className="mt-0.5 break-all text-ink">
              {username.startsWith("@") ? username : `@${username}`}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-muted">{t("providerUserId")}</dt>
          <dd className="mt-0.5 break-all text-ink">
            {identity.external_user_id}
          </dd>
        </div>
        {bio && (
          <div>
            <dt className="text-xs text-muted">{t("providerBio")}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-ink">
              {bio}
            </dd>
          </div>
        )}
        {city && (
          <div>
            <dt className="text-xs text-muted">{t("providerCity")}</dt>
            <dd className="mt-0.5 break-words text-ink">{city}</dd>
          </div>
        )}
        {birthday && (
          <div>
            <dt className="text-xs text-muted">{t("providerBirthday")}</dt>
            <dd className="mt-0.5 text-ink">
              {formatProviderBirthday(birthday)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-muted">{t("lastActivity")}</dt>
          <dd className="mt-0.5 text-ink">
            {dateFormat.format(new Date(identity.last_seen_at))}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-2 text-sm">
        {profileUrl && (
          <a
            className="inline-flex w-fit items-center gap-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={profileUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            {t("openProviderProfile", { provider: providerName })}
          </a>
        )}
        {providerDialogUrl && (
          <a
            className="inline-flex w-fit items-center gap-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={providerDialogUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageSquareText aria-hidden="true" className="size-4" />
            {t("openProviderDialog", { provider: providerName })}
          </a>
        )}
        {platformConversation && (
          <Link
            className="inline-flex w-fit items-center gap-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to={messageConversationPath(platformConversation.conversation_id)}
          >
            <MessageSquareText aria-hidden="true" className="size-4" />
            {t("openPlatformDialog")}
          </Link>
        )}
      </div>
    </section>
  );
}

export function ConversationContactPanel({
  contactId,
  conversation,
  fallbackAvatarUrl,
  fallbackName,
  identityId,
  mode,
  onClose,
  closeButtonRef,
  workspaceId,
}: {
  contactId: string | null;
  conversation: Conversation;
  fallbackAvatarUrl: string | null;
  fallbackName: string;
  identityId: string | null;
  mode: "drawer" | "inline";
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  workspaceId: string;
}) {
  const { t } = useTranslation("chats");
  const contactQuery = useContact(workspaceId, contactId ?? "");
  const contact = contactQuery.data;
  const identity =
    contact?.identities.find((item) => item.id === identityId) ??
    (contact?.identities.length === 1 ? contact.identities[0] : null);
  const identities = contact?.identities ?? [];
  const orderedIdentities = identity
    ? [identity, ...identities.filter((item) => item.id !== identity.id)]
    : identities;
  const isMissing =
    !contactId ||
    (axios.isAxiosError(contactQuery.error) &&
      [404, 422].includes(contactQuery.error.response?.status ?? 0));

  return (
    <aside
      aria-labelledby="chat-contact-panel-title"
      className={`flex h-full min-h-0 min-w-0 flex-col border-l border-line bg-surface ${mode === "drawer" ? "w-full shadow-xl" : ""}`}
      id="chat-contact-panel"
    >
      <header className="flex min-h-18 shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2
          className="truncate text-base font-semibold text-ink"
          id="chat-contact-panel-title"
        >
          {t("contactPanelTitle")}
        </h2>
        <button
          aria-label={t("closeContactPanel")}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col items-center bg-brand-soft px-5 py-7 text-center">
          <ChatAvatar
            name={contact?.display_name ?? fallbackName}
            size="xl"
            url={
              identity?.avatar_url ?? contact?.avatar_url ?? fallbackAvatarUrl
            }
          />
          <h3 className="mt-3 max-w-full break-words text-lg font-semibold text-ink">
            {contact?.display_name ?? fallbackName}
          </h3>
          {contact && (
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link to={contactDetailsPath(contact.id)}>
                <UserRound aria-hidden="true" className="size-4" />
                {t("openFullContact")}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {isMissing ? (
          <p className="px-5 py-8 text-sm text-muted">
            {t("contactUnavailable")}
          </p>
        ) : contactQuery.isPending ? (
          <p className="px-5 py-8 text-sm text-muted" role="status">
            {t("loadingContact")}
          </p>
        ) : contactQuery.isError || !contact ? (
          <div className="px-5 py-8">
            <p className="text-sm text-danger" role="alert">
              {t("contactLoadError")}
            </p>
            <Button
              className="mt-3"
              onClick={() => void contactQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : (
          <>
            <section className="px-5 py-5">
              <h3 className="text-sm font-semibold text-ink">
                {t("contactDetails")}
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">{t("email")}</dt>
                  <dd className="mt-0.5 break-all text-ink">
                    {contact.email || t("noValue")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t("phone")}</dt>
                  <dd className="mt-0.5 break-all text-ink">
                    {contact.phone || t("noValue")}
                  </dd>
                </div>
              </dl>
            </section>
            <ConversationInquiries
              contactId={contact.id}
              workspaceId={workspaceId}
            />
            {orderedIdentities.length ? (
              orderedIdentities.map((item) => (
                <IdentityDetails
                  conversationId={conversation.id}
                  identity={item}
                  key={item.id}
                />
              ))
            ) : (
              <p className="border-t border-line px-5 py-5 text-sm text-muted">
                {t("identityUnavailable")}
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
