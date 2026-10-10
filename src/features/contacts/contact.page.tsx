import axios from "axios";
import {
  ArrowLeft,
  MessageSquareText,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { useContact } from "./model/use-contact";
import { useContactInquiries } from "./model/use-contact-inquiries";

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

  const initial =
    Array.from(contact.display_name.trim())[0]?.toLocaleUpperCase(
      i18n.language,
    ) ?? "?";

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
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-soft text-2xl font-semibold text-brand"
          >
            {initial}
          </span>
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
                <li
                  className="flex min-w-0 gap-4 rounded-2xl border border-line bg-surface p-5"
                  key={identity.id}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"
                  >
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-words font-semibold">
                        {identity.display_name}
                      </span>
                      <Badge tone="brandSoft">
                        {identity.provider === "telegram_bot"
                          ? t("telegramProvider")
                          : identity.provider === "vk_community"
                            ? t("vkProvider")
                            : identity.provider}
                      </Badge>
                    </div>
                    <p className="mt-1 break-all text-xs text-muted">
                      {t("identityId", { id: identity.external_user_id })}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {t("lastSeen", {
                        date: dateTimeFormat.format(
                          new Date(identity.last_seen_at),
                        ),
                      })}
                    </p>
                  </div>
                </li>
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
