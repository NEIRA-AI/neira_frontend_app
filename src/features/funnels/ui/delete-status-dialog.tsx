import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { FunnelRead, StatusRead } from "../api/funnels-api";
import { deletionErrorKey } from "../model/deletion-error";
import { useDeleteStatus } from "../model/use-delete-status";
import { FunnelDialog } from "./funnel-dialog";

export function DeleteStatusDialog({
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
  const remove = useDeleteStatus(workspaceId);
  const errorKey = deletionErrorKey(remove.error);

  async function confirm() {
    if (remove.isPending || status.is_entry || funnel.statuses.length <= 1)
      return;
    try {
      await remove.mutateAsync({ funnelId: funnel.id, statusId: status.id });
      onClose();
    } catch {
      // The request error is shown in the dialog.
    }
  }

  return (
    <FunnelDialog
      busy={remove.isPending}
      description={t("deleteStatusDescription")}
      onClose={onClose}
      title={t("deleteStatusTitle")}
    >
      <p className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
        {status.name}
      </p>
      {remove.isError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {t(
            errorKey === "openInquiries" ? "statusHasOpenInquiries" : errorKey,
          )}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={remove.isPending} onClick={onClose} variant="ghost">
          {t("cancel")}
        </Button>
        <Button
          disabled={
            remove.isPending || status.is_entry || funnel.statuses.length <= 1
          }
          onClick={() => void confirm()}
          variant="danger"
        >
          {t("delete")}
        </Button>
      </div>
    </FunnelDialog>
  );
}
