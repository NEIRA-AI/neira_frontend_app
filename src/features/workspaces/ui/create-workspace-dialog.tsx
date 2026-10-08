import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { useCreateWorkspace } from "../model/use-create-workspace";
import { normalizedWorkspaceName } from "../model/workspace-name";
import { WorkspaceDialog } from "./workspace-dialog";

export function CreateWorkspaceDialog({
  onCreated,
  nested = false,
}: {
  onCreated: () => void;
  nested?: boolean;
}) {
  const { t } = useTranslation("workspaces");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [switchToNew, setSwitchToNew] = useState(true);
  const [invalidName, setInvalidName] = useState(false);
  const nameErrorId = useId();
  const actionErrorId = useId();
  const create = useCreateWorkspace();

  function changeOpen(nextOpen: boolean) {
    if (create.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setName("");
      setSwitchToNew(true);
      setInvalidName(false);
      create.reset();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;
    const normalizedName = normalizedWorkspaceName(name);
    if (!normalizedName) {
      setInvalidName(true);
      return;
    }

    try {
      await create.mutateAsync({ name: normalizedName, switchToNew });
      onCreated();
      changeOpen(false);
    } catch {
      // The mutation error is shown beside the form.
    }
  }

  return (
    <WorkspaceDialog
      busy={create.isPending}
      description={t("createDescription")}
      nested={nested}
      onOpenChange={changeOpen}
      open={open}
      title={t("createTitle")}
      trigger={
        <Button size="sm">
          <Plus aria-hidden="true" className="size-4" />
          {t("create")}
        </Button>
      }
    >
      <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor="new-workspace-name"
          >
            {t("name")}
          </label>
          <Input
            aria-describedby={invalidName ? nameErrorId : undefined}
            aria-invalid={invalidName}
            autoFocus
            disabled={create.isPending}
            id="new-workspace-name"
            maxLength={120}
            onChange={(event) => {
              setName(event.target.value);
              setInvalidName(false);
              create.reset();
            }}
            placeholder={t("namePlaceholder")}
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

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm font-medium text-ink">
          <span>{t("switchToNew")}</span>
          <input
            checked={switchToNew}
            className="peer sr-only"
            disabled={create.isPending}
            onChange={(event) => setSwitchToNew(event.target.checked)}
            role="switch"
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-11 shrink-0 rounded-full bg-subtle transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform peer-checked:bg-brand-fill peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:opacity-50"
          />
        </label>

        {create.isError && (
          <p className="text-sm text-danger" id={actionErrorId} role="alert">
            {t("actionError")}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            disabled={create.isPending}
            onClick={() => changeOpen(false)}
            variant="ghost"
          >
            {t("cancel")}
          </Button>
          <Button disabled={create.isPending} type="submit">
            {t("saveCreate")}
          </Button>
        </div>
      </form>
    </WorkspaceDialog>
  );
}
