import * as Dialog from "@radix-ui/react-dialog";
import { PanelsTopLeft, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { workspaceDisplayName } from "@/shared/lib/workspace-display-name";
import { Button } from "@/shared/ui/button";

import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { RenameWorkspaceDialog } from "./rename-workspace-dialog";

export function ManageWorkspacesDialog() {
  const { t } = useTranslation("workspaces");
  const { workspaces, workspaceId, selectWorkspace, refreshCurrentUser } =
    useAuth();
  const [open, setOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<404 | 409 | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const current = workspaces.find((workspace) => workspace.id === workspaceId);
  const others = workspaces.filter((workspace) => workspace.id !== workspaceId);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setDeleteNotice(null);
  }

  return (
    <Dialog.Root onOpenChange={changeOpen} open={open}>
      <Dialog.Trigger asChild>
        <Button
          className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
          disabled={!current}
          size="sm"
          variant="secondary"
        >
          {t("manage")}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7">
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {t("manageTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {t("manageDescription")}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-7 sm:top-7"
              ref={closeButtonRef}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>

          {deleteNotice && (
            <div
              className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              <span>
                {deleteNotice === 409
                  ? t("lastWorkspaceError")
                  : t("missingWorkspaceError")}
              </span>
              <Button
                className="min-h-8 px-3"
                onClick={() => {
                  void refreshCurrentUser()
                    .then(() => setDeleteNotice(null))
                    .catch(() => undefined);
                }}
                size="sm"
                variant="outline"
              >
                {t("retry")}
              </Button>
            </div>
          )}

          {current && (
            <section aria-label={t("currentWorkspace")} className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">
                {t("currentWorkspace")}
              </h3>
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 py-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <PanelsTopLeft aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-32 flex-1 break-words text-sm font-semibold text-ink">
                  {workspaceDisplayName(current, workspaces)}
                </span>
                {(current.role === "owner" || current.role === "admin") && (
                  <div className="ml-auto">
                    <RenameWorkspaceDialog
                      nested
                      onRenamed={() => setDeleteNotice(null)}
                      workspace={current}
                      workspaceLabel={workspaceDisplayName(current, workspaces)}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <section
            aria-label={t("otherWorkspaces")}
            className={current ? "border-t border-line pt-5" : "mt-6"}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("otherWorkspaces")}
            </h3>
            {others.length ? (
              <ul className="divide-y divide-line">
                {others.map((workspace) => {
                  const label = workspaceDisplayName(workspace, workspaces);

                  return (
                    <li
                      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-3 sm:flex"
                      key={workspace.id}
                    >
                      <span className="min-w-0 break-words px-2 text-sm font-semibold text-ink sm:flex-1">
                        {label}
                      </span>
                      <Button
                        aria-label={t("switchWorkspace", { name: label })}
                        className="col-span-2 row-start-2 min-h-8 shrink-0 justify-self-start rounded-lg px-3 text-xs font-bold"
                        onClick={() => {
                          selectWorkspace(workspace.id);
                          changeOpen(false);
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        {t("switch")}
                      </Button>
                      {(workspace.role === "owner" ||
                        workspace.role === "admin") && (
                        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-1">
                          <RenameWorkspaceDialog
                            iconOnly
                            nested
                            onRenamed={() => setDeleteNotice(null)}
                            workspace={workspace}
                            workspaceLabel={label}
                          />
                          {workspace.role === "owner" &&
                            workspaces.length > 1 && (
                              <DeleteWorkspaceDialog
                                onDeleted={() => {
                                  setDeleteNotice(null);
                                  requestAnimationFrame(() =>
                                    closeButtonRef.current?.focus(),
                                  );
                                }}
                                onStale={setDeleteNotice}
                                workspace={workspace}
                                workspaceLabel={label}
                              />
                            )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-5 text-sm text-muted">
                {t("noOtherWorkspaces")}
              </p>
            )}
          </section>

          <div className="flex justify-end border-t border-line pt-5">
            <CreateWorkspaceDialog
              nested
              onCreated={() => setDeleteNotice(null)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
