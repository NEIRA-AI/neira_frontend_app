import axios from "axios";
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquareText,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { useAuth } from "@/features/auth";
import { channelProviders } from "@/features/channels";
import { messageConversationPath, ROUTES } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { ContactDetail } from "./api/contacts-api";
import { useContact } from "./model/use-contact";
import { useContactInquiries } from "./model/use-contact-inquiries";
import { ContactAvatar } from "./ui/contact-avatar";

type IdentityView = ContactDetail["identities"][number];

function safeExternalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function IdentityAvatar({ identity }: { identity: IdentityView }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-soft text-brand"
    >
      {identity.avatar_url && identity.avatar_url !== failedUrl ? (
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailedUrl(identity.avatar_url)}
          src={identity.avatar_url}
        />
      ) : (
        <UserRound className="size-5" />
      )}
    </span>
  );
}

function IdentityCard({
  identity,
  dateTimeFormat,
}: {
  identity: IdentityView;
  dateTimeFormat: Intl.DateTimeFormat;
}) {
  const { t } = useTranslation("contacts");
  const providerName =
    identity.provider === "telegram_bot"
      ? t("telegramProvider")
      : identity.provider === "vk_community"
        ? t("vkProvider")
        : identity.provider;
  const username =
    typeof identity.profile_data?.username === "string"
      ? identity.profile_data.username
      : typeof identity.profile_data?.screen_name === "string"
        ? identity.profile_data.screen_name
        : null;
  const profileUrl = safeExternalUrl(identity.profile_url);
  const providerDialogUrl = safeExternalUrl(identity.provider_dialog_url);
  const platformConversations = identity.platform_conversations;
  const provider = channelProviders.find(
    (item) => item.id === identity.provider,
  );
  const icon = provider ? (
    <img alt="" className="size-5 object-contain" src={provider.icon} />
  ) : (
    <MessageSquareText aria-hidden="true" className="size-5" />
  );

  return (
    <li className="flex min-w-0 gap-4 rounded-2xl border border-line bg-surface p-5">
      <IdentityAvatar identity={identity} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-words font-semibold">
            {identity.display_name}
          </span>
          {platformConversations[0] ? (
            <Link
              aria-label={t("openChannelConversation", {
                channel: providerName,
                name: identity.display_name,
              })}
              className="grid size-8 place-items-center rounded-lg hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
              title={providerName}
              to={messageConversationPath(
                platformConversations[0].conversation_id,
              )}
            >
              {icon}
            </Link>
          ) : (
            <span aria-label={providerName} role="img" title={providerName}>
              {icon}
            </span>
          )}
        </div>
        {username && (
          <p className="mt-0.5 break-all text-sm text-muted">@{username}</p>
        )}
        <p className="mt-1 break-all text-xs text-muted">
          {t("identityId", { id: identity.external_user_id })}
        </p>
        <div className="mt-4 grid gap-2 text-sm">
          {profileUrl ? (
            <a
              className="inline-flex w-fit items-center gap-1 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href={profileUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("profileInProvider", { provider: providerName })}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ) : (
            <span className="text-muted">{t("profileLinkUnavailable")}</span>
          )}
          {providerDialogUrl ? (
            <a
              className="inline-flex w-fit items-center gap-1 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href={providerDialogUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("dialogInProvider", { provider: providerName })}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ) : (
            <span className="text-muted">{t("providerDialogUnavailable")}</span>
          )}
          {platformConversations.length ? (
            platformConversations.map((conversation, index) => (
              <Link
                className="inline-flex w-fit items-center gap-1 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                key={conversation.conversation_id}
                to={messageConversationPath(conversation.conversation_id)}
              >
                {platformConversations.length > 1
                  ? t("dialogInNeiraNumbered", { number: index + 1 })
                  : t("dialogInNeira")}
                <MessageSquareText aria-hidden="true" className="size-4" />
              </Link>
            ))
          ) : (
            <span className="text-muted">{t("platformDialogUnavailable")}</span>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          {t("lastSeen", {
            date: dateTimeFormat.format(new Date(identity.last_seen_at)),
          })}
        </p>
        {identity.profile_refreshed_at && (
          <p className="mt-1 text-xs text-muted">
            {t("profileUpdated", {
              date: dateTimeFormat.format(
                new Date(identity.profile_refreshed_at),
              ),
            })}
          </p>
        )}
      </div>
    </li>
  );
}

function ContactPage() {
  const { t, i18n } = useTranslation("contacts");
  const { contactId } = useParams<"contactId">();
  const { workspaceId } = useAuth();
  const workspace = workspaceId ?? "";
  const contactQuery = useContact(workspace, contactId ?? "");
  const inquiriesQuery = useContactInquiries(workspace, contactId ?? "");
  const contact = contactQuery.data;
  const inquiries =
    inquiriesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
  });
  const dateTimeFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const isMissing =
    !contactId ||
    (axios.isAxiosError(contactQuery.error) &&
      [404, 422].includes(contactQuery.error.response?.status ?? 0));

  if (isMissing) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-ink">
          {t("contactNotFound")}
        </h1>
        <p className="text-sm text-muted">{t("contactNotFoundHelp")}</p>
        <Button asChild>
          <Link to={ROUTES.CONTACTS}>{t("backToContacts")}</Link>
        </Button>
      </div>
    );
  }

  if (contactQuery.isPending) {
    return (
      <p className="px-6 py-12 text-sm text-muted" role="status">
        {t("loading")}
      </p>
    );
  }

  if (contactQuery.isError || !contact) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <p className="text-sm text-danger" role="alert">
          {t("contactLoadError")}
        </p>
        <Button
          className="mt-4"
          onClick={() => void contactQuery.refetch()}
          variant="outline"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-page text-ink">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to={ROUTES.CONTACTS}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t("backToContacts")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="flex min-w-0 flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <ContactAvatar
            language={i18n.language}
            name={contact.display_name}
            size="lg"
            url={contact.avatar_url}
          />
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold">
              {contact.display_name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t("contactCreated", {
                date: dateFormat.format(new Date(contact.created_at)),
              })}
            </p>
          </div>
          <dl className="ml-auto grid min-w-0 gap-2 text-sm sm:min-w-52">
            <div className="flex min-w-0 items-baseline gap-3">
              <dt className="w-16 shrink-0 text-muted">{t("email")}</dt>
              <dd className="min-w-0 break-all text-ink">
                {contact.email || t("noValue")}
              </dd>
            </div>
            <div className="flex min-w-0 items-baseline gap-3">
              <dt className="w-16 shrink-0 text-muted">{t("phone")}</dt>
              <dd className="min-w-0 text-ink">
                {contact.phone || t("noValue")}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="contact-identities-title">
          <h2
            className="mb-4 text-lg font-semibold"
            id="contact-identities-title"
          >
            {t("identities")}
          </h2>
          {contact.identities.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-muted">
              {t("noIdentities")}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {contact.identities.map((identity) => (
                <IdentityCard
                  dateTimeFormat={dateTimeFormat}
                  identity={identity}
                  key={identity.id}
                />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="contact-inquiries-title">
          <h2
            className="mb-4 text-lg font-semibold"
            id="contact-inquiries-title"
          >
            {t("inquiries")}
          </h2>
          {inquiriesQuery.isPending ? (
            <p
              className="rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-muted"
              role="status"
            >
              {t("loading")}
            </p>
          ) : inquiriesQuery.isError && !inquiriesQuery.data ? (
            <div className="rounded-2xl border border-line bg-surface px-5 py-8">
              <p className="text-sm text-danger" role="alert">
                {t("inquiriesLoadError")}
              </p>
              <Button
                className="mt-4"
                onClick={() => void inquiriesQuery.refetch()}
                variant="outline"
              >
                {t("retry")}
              </Button>
            </div>
          ) : inquiries.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface px-5 py-8 text-sm text-muted">
              {t("noInquiries")}
            </p>
          ) : (
            <>
              {inquiriesQuery.isError && (
                <p className="mb-3 text-sm text-danger" role="alert">
                  {t("inquiriesLoadError")}
                </p>
              )}
              <ul className="grid gap-3">
                {inquiries.map((inquiry) => (
                  <li
                    className="rounded-2xl border border-line bg-surface p-5"
                    key={inquiry.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <MessageSquareText
                        aria-hidden="true"
                        className="size-4 text-brand"
                      />
                      <span className="font-semibold">
                        {inquiry.funnel_name || t("unknownFunnel")}
                      </span>
                      <Badge
                        className="ml-auto"
                        tone={inquiry.state === "open" ? "success" : "neutral"}
                      >
                        {inquiry.state === "open"
                          ? t("open")
                          : inquiry.state === "closed"
                            ? t("closed")
                            : inquiry.state}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {t("status", {
                        name: inquiry.status_name || t("unknownStatus"),
                      })}
                    </p>
                    {inquiry.last_message_text && (
                      <p className="mt-3 line-clamp-3 break-words text-sm text-ink">
                        {inquiry.last_message_text}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-muted">
                      {t("openedAt", {
                        date: dateTimeFormat.format(
                          new Date(inquiry.opened_at),
                        ),
                      })}
                    </p>
                  </li>
                ))}
              </ul>
              {inquiriesQuery.hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <Button
                    disabled={inquiriesQuery.isFetchingNextPage}
                    onClick={() => void inquiriesQuery.fetchNextPage()}
                    variant="outline"
                  >
                    {inquiriesQuery.isFetchingNextPage
                      ? t("loadingMore")
                      : t("loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export const Component = ContactPage;
