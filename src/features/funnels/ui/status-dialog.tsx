import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { FunnelRead, StatusRead } from "../api/funnels-api";
import { useUpdateStatus } from "../model/use-update-status";
import { FunnelDialog } from "./funnel-dialog";
import { StatusColorPicker } from "./status-color-picker";

export function StatusDialog({
  funnel,
  status,
  workspaceId,
  onClose,
}: {
  funnel: FunnelRead;
  status: StatusRead;
  workspaceId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation("funnels");
  const [name, setName] = useState(status.name);
  const [description, setDescription] = useState(status.description ?? "");
  const [color, setColor] = useState(status.color);
  const [submitted, setSubmitted] = useState(false);
  const update = useUpdateStatus(workspaceId);
  const pending = update.isPending;
  const failed = update.isError;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!name.trim() || pending) return;
    try {
      await update.mutateAsync({
        funnelId: funnel.id,
        statusId: status.id,
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
      onClose();
    } catch {
      // The request error is shown in the dialog.
    }
  }

  return (
    <FunnelDialog
      busy={pending}
      description={t("editStatusDescription")}
      onClose={onClose}
      title={t("editStatusTitle")}
    >
      <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor="status-name"
          >
            {t("name")}
          </label>
          <Input
            aria-invalid={submitted && !name.trim()}
            autoFocus
            disabled={pending}
            id="status-name"
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("statusNamePlaceholder")}
            value={name}
          />
          {submitted && !name.trim() && (
            <p className="mt-2 text-sm text-danger" role="alert">
              {t("nameRequired")}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor="status-description"
          >
            {t("description")}
          </label>
          <textarea
            className="min-h-28 w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 disabled:opacity-60"
            disabled={pending}
            id="status-description"
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("statusDescriptionPlaceholder")}
            value={description}
          />
        </div>
        <StatusColorPicker
          disabled={pending}
          name="status-color"
          onChange={setColor}
          value={color}
        />
        {failed && (
          <p className="text-sm text-danger" role="alert">
            {t("actionError")}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button disabled={pending} onClick={onClose} variant="ghost">
            {t("cancel")}
          </Button>
          <Button disabled={pending} type="submit">
            {t("save")}
          </Button>
        </div>
      </form>
    </FunnelDialog>
  );
}
