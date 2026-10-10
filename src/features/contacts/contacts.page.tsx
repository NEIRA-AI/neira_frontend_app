import { ChevronRight, RotateCcw, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useAuth } from "@/features/auth";
import { contactDetailsPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import { useListContacts } from "./model/use-list-contacts";

function ContactsPage() {
  const { t, i18n } = useTranslation("contacts");
  const { workspaceId } = useAuth();
  const contactsQuery = useListContacts(workspaceId ?? "");
  const contacts =
    contactsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
  });

  return (
    <div className="min-h-full bg-page text-ink">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-muted">{t("description")}</p>

        {contactsQuery.isPending ? (
          <p className="py-12 text-center text-sm text-muted" role="status">
            {t("loading")}
          </p>
        ) : contactsQuery.isError && !contactsQuery.data ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center">
            <p className="text-sm text-danger" role="alert">
              {t("loadError")}
            </p>
            <Button
              className="mt-4"
              onClick={() => void contactsQuery.refetch()}
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
              <UsersRound aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{t("emptyTitle")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <>
            {contactsQuery.isError && (
              <div
                className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
                role="alert"
              >
                <span>{t("loadError")}</span>
                <Button
                  onClick={() => void contactsQuery.refetch()}
                  size="sm"
                  variant="outline"
                >
                  {t("retry")}
                </Button>
              </div>
            )}
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact) => {
                const initial =
                  Array.from(contact.display_name.trim())[0]?.toLocaleUpperCase(
                    i18n.language,
                  ) ?? "?";
                return (
                  <li key={contact.id}>
                    <Link
                      aria-label={t("openContact", {
                        name: contact.display_name,
                      })}
                      className="group flex min-h-28 items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-brand/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
                      to={contactDetailsPath(contact.id)}
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-semibold text-brand"
                      >
                        {initial}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">
                          {contact.display_name}
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {t("contactCreated", {
                            date: dateFormat.format(
                              new Date(contact.created_at),
                            ),
                          })}
                        </span>
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            {contactsQuery.hasNextPage && (
              <div className="mt-7 flex justify-center">
                <Button
                  disabled={contactsQuery.isFetchingNextPage}
                  onClick={() => void contactsQuery.fetchNextPage()}
                  variant="outline"
                >
                  {contactsQuery.isFetchingNextPage
                    ? t("loadingMore")
                    : t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export const Component = ContactsPage;
