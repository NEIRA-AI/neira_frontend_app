import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { WorkspaceSummary } from "../api/workspaces-api";
import { useRenameWorkspace } from "../model/use-rename-workspace";
import { normalizedWorkspaceName } from "../model/workspace-name";
import { WorkspaceDialog } from "./workspace-dialog";

export function RenameWorkspaceDialog({
  workspace,
  workspaceLabel,
  onRenamed,
  iconOnly = false,
  nested = false,
}: {
  workspace: WorkspaceSummary;
  workspaceLabel: string;
  onRenamed?: () => void;
  iconOnly?: boolean;
  nested?: boolean;
}) {
  const { t } = useTranslation("workspaces");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [invalidName, setInvalidName] = useState(false);
  const nameErrorId = useId();
  const rename = useRenameWorkspace();

  function changeOpen(nextOpen: boolean) {
    if (rename.isPending) return;
    setOpen(nextOpen);
    setName(workspace.name);
    setInvalidName(false);
    rename.reset();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rename.isPending) return;
    const normalizedName = normalizedWorkspaceName(name);
    if (!normalizedName) {
      setInvalidName(true);
      return;
    }

    try {
      await rename.mutateAsync({ id: workspace.id, name: normalizedName });
      onRenamed?.();
      changeOpen(false);
    } catch {
      // The mutation error is shown beside the form.
    }
  }

  return (
    <WorkspaceDialog
      busy={rename.isPending}
      description={t("renameDescription")}
      nested={nested}
      onOpenChange={changeOpen}
      open={open}
      title={t("renameTitle")}
      trigger={
        <Button
          aria-label={t("renameWorkspace", { name: workspaceLabel })}
          className={
            iconOnly
              ? "size-9 min-h-9 rounded-lg px-0 text-muted hover:text-ink"
              : "min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
          }
          size="sm"
          title={
            iconOnly
              ? t("renameWorkspace", { name: workspaceLabel })
              : undefined
          }
          variant={iconOnly ? "ghost" : "secondary"}
        >
          {iconOnly ? (
            <Pencil aria-hidden="true" className="size-4" />
          ) : (
            t("rename")
          )}
        </Button>
      }
    >
      <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor={`workspace-name-${workspace.id}`}
          >
            {t("name")}
          </label>
          <Input
            aria-describedby={invalidName ? nameErrorId : undefined}
            aria-invalid={invalidName}
            autoFocus
            disabled={rename.isPending}
            id={`workspace-name-${workspace.id}`}
            maxLength={120}
            onChange={(event) => {
              setName(event.target.value);
              setInvalidName(false);
              rename.reset();
            }}
            value={name}
          />
          {invalidName && (
            <p
              className="mt-2 text-sm text-danger"
              id={nameErrorId}
              role="alert"
            >
              {t("nameRequired")}
            </p>
          )}
        </div>
        {rename.isError && (
          <p className="text-sm text-danger" role="alert">
            {t("actionError")}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            disabled={rename.isPending}
            onClick={() => changeOpen(false)}
            variant="ghost"
          >
            {t("cancel")}
          </Button>
          <Button disabled={rename.isPending} type="submit">
            {t("saveRename")}
          </Button>
        </div>
      </form>
    </WorkspaceDialog>
  );
}
