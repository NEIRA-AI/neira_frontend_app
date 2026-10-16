import axios from "axios";
import { RotateCcw, SearchX, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { isRevisionConflict } from "@/shared/api/revision-conflict";

import type { ContactSummary } from "./api/contacts-api";
import { useDeleteContact } from "./model/use-delete-contact";
import { useListContacts } from "./model/use-list-contacts";
import { useUpdateContact } from "./model/use-update-contact";
import { ContactsList } from "./ui/contacts-list";
import { ContactsToolbar } from "./ui/contacts-toolbar";
import { DeleteContactDialog } from "./ui/delete-contact-dialog";
import { EditContactDialog } from "./ui/edit-contact-dialog";

type ContactActionState = {
  workspaceId: string;
  contact: ContactSummary;
};

function ContactsPage() {
  const { t } = useTranslation("contacts");
  const { workspaceId, workspaces } = useAuth();
  const workspace = workspaceId ?? "";
  const role = workspaces.find((item) => item.id === workspaceId)?.role;
  const canManage = role === "owner" || role === "admin";
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingAction, setEditingAction] = useState<ContactActionState | null>(
    null,
  );
  const [deletingAction, setDeletingAction] =
    useState<ContactActionState | null>(null);
  const editingContact =
    editingAction?.workspaceId === workspace ? editingAction.contact : null;
  const deletingContact =
    deletingAction?.workspaceId === workspace ? deletingAction.contact : null;

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const contactsQuery = useListContacts(workspace, search);
  const update = useUpdateContact(workspace);
  const remove = useDeleteContact(workspace);
  const contacts =
    contactsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const permissionDenied = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 403;
  const editConflict = update.isError && isRevisionConflict(update.error);
  const deleteConflict = remove.isError && isRevisionConflict(remove.error);

  return (
    <div className="min-h-full bg-page text-ink">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <section
          className="overflow-hidden rounded-2xl bg-surface"
          aria-label={t("allContacts")}
        >
          <ContactsToolbar
            onSearchChange={setSearchInput}
            search={searchInput}
          />

          {contactsQuery.isPending ? (
            <div
              className="flex min-h-64 items-center justify-center px-6 py-12 text-sm text-muted"
              role="status"
            >
              {t("loading")}
            </div>
          ) : contactsQuery.isError && !contactsQuery.data ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
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
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                {search ? (
                  <SearchX aria-hidden="true" className="size-6" />
                ) : (
                  <UsersRound aria-hidden="true" className="size-6" />
                )}
              </span>
              <h2 className="mt-5 text-lg font-semibold">
                {search ? t("noSearchResults") : t("emptyTitle")}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted">
                {search ? t("noSearchResultsHelp") : t("emptyDescription")}
              </p>
              {search && (
                <Button
                  className="mt-5"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  variant="outline"
                >
                  {t("clearSearch")}
                </Button>
              )}
            </div>
          ) : (
            <>
              {contactsQuery.isError && (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-danger-soft px-5 py-3 text-sm text-danger"
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
              <ContactsList
                canManage={canManage}
                contacts={contacts}
                onDelete={(contact) => {
                  remove.reset();
                  setDeletingAction({ workspaceId: workspace, contact });
                }}
                onEdit={(contact) => {
                  update.reset();
                  setEditingAction({ workspaceId: workspace, contact });
                }}
              />
              {contactsQuery.hasNextPage && (
                <div className="flex justify-center border-t border-line px-5 py-5">
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
        </section>
      </main>
      {editingContact && (
        <EditContactDialog
          busy={update.isPending}
          conflict={editConflict}
          contact={editingContact}
          errorMessage={
            update.isError
              ? t(
                  permissionDenied(update.error)
                    ? "permissionDenied"
                    : editConflict
                      ? "editConflict"
                      : "saveFailed",
                )
              : null
          }
          key={editingContact.id}
          onClose={() => setEditingAction(null)}
          onRefresh={() => {
            setEditingAction(null);
            void contactsQuery.refetch();
          }}
          onSave={(request) => {
            if (!canManage || editingAction?.workspaceId !== workspace) return;
            update.mutate(
              {
                id: editingContact.id,
                request: {
                  ...request,
                  expected_revision: editingContact.revision,
                },
              },
              { onSuccess: () => setEditingAction(null) },
            );
          }}
        />
      )}
      {deletingContact && (
        <DeleteContactDialog
          busy={remove.isPending}
          conflict={deleteConflict}
          contact={deletingContact}
          errorMessage={
            remove.isError
              ? t(
                  permissionDenied(remove.error)
                    ? "permissionDenied"
                    : deleteConflict
                      ? "deleteConflict"
                      : "deleteFailed",
                )
              : null
          }
          key={deletingContact.id}
          onClose={() => setDeletingAction(null)}
          onRefresh={() => {
            setDeletingAction(null);
            void contactsQuery.refetch();
          }}
          onConfirm={() => {
            if (!canManage || deletingAction?.workspaceId !== workspace) return;
            remove.mutate(
              {
                id: deletingContact.id,
                expectedRevision: deletingContact.revision,
              },
              {
                onSuccess: () => setDeletingAction(null),
              },
            );
          }}
        />
      )}
    </div>
  );
}

export const Component = ContactsPage;
