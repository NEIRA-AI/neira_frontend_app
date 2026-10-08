import axios from "axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { WorkspaceSummary } from "../api/workspaces-api";
import { useDeleteWorkspace } from "../model/use-delete-workspace";
import { WorkspaceDialog } from "./workspace-dialog";

export function DeleteWorkspaceDialog({
  workspace,
  workspaceLabel,
  onDeleted,
  onStale,
}: {
  workspace: WorkspaceSummary;
  workspaceLabel: string;
  onDeleted: () => void;
  onStale: (status: 404 | 409) => void;
}) {
  const { t } = useTranslation("workspaces");
  const [open, setOpen] = useState(false);
  const remove = useDeleteWorkspace();

  function changeOpen(nextOpen: boolean) {
    if (remove.isPending) return;
    setOpen(nextOpen);
    remove.reset();
  }

  async function confirmDelete() {
    if (remove.isPending) return;
    try {
      await remove.mutateAsync(workspace.id);
      onDeleted();
      changeOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 409) {
          onStale(status);
          changeOpen(false);
        }
      }
      // Other mutation errors are shown in the dialog.
    }
  }

  return (
    <WorkspaceDialog
      busy={remove.isPending}
      description={t("deleteDescription", { name: workspaceLabel })}
      nested
      onOpenChange={changeOpen}
      open={open}
      title={t("deleteTitle")}
      trigger={
        <Button
          aria-label={t("deleteWorkspace", { name: workspaceLabel })}
          className="size-9 min-h-9 rounded-lg px-0 text-muted hover:bg-danger-soft hover:text-danger"
          size="sm"
          title={t("deleteWorkspace", { name: workspaceLabel })}
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </Button>
      }
    >
      {remove.isError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {t("actionError")}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          disabled={remove.isPending}
          onClick={() => changeOpen(false)}
          variant="ghost"
        >
          {t("cancel")}
        </Button>
        <Button
          disabled={remove.isPending}
          onClick={() => void confirmDelete()}
          variant="danger"
        >
          {t("confirmDelete")}
        </Button>
      </div>
    </WorkspaceDialog>
  );
}
