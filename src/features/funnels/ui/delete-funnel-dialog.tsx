import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { FunnelRead } from "../api/funnels-api";
import { useDeleteFunnel } from "../model/use-delete-funnel";
import { useFunnelDeletionImpact } from "../model/use-funnel-deletion-impact";
import { FunnelDialog } from "./funnel-dialog";

export function DeleteFunnelDialog({
  funnel,
  workspaceId,
  onClose,
  onDeleted,
}: {
  funnel: FunnelRead;
  workspaceId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation("funnels");
  const remove = useDeleteFunnel();
  const impact = useFunnelDeletionImpact(workspaceId, funnel.id);

  async function confirm() {
    if (remove.isPending || impact.isFetching || !impact.isSuccess) return;
    try {
      await remove.mutateAsync(funnel.id);
      onDeleted();
    } catch {
      // The request error is shown in the dialog.
    }
  }

  return (
    <FunnelDialog
      busy={remove.isPending}
      description={t("deleteFunnelDescription")}
      onClose={onClose}
      title={t("deleteFunnelTitle")}
    >
      <p className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
        {funnel.name}
      </p>
      {impact.isFetching && (
        <p className="mt-4 text-sm text-muted" role="status">
          {t("checkingLinkedChannels")}
        </p>
      )}
      {impact.isError && (
        <div
          className="mt-4 flex items-center gap-3 text-sm text-danger"
          role="alert"
        >
          <span>{t("linkedChannelsLoadError")}</span>
          <Button
            onClick={() => void impact.refetch()}
            size="sm"
            variant="outline"
          >
            {t("retry")}
          </Button>
        </div>
      )}
      {impact.isSuccess &&
        !impact.isFetching &&
        impact.data.active_channels.length > 0 && (
          <p
            className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {t("linkedChannelsWillStop", {
              count: impact.data.active_channels.length,
            })}
          </p>
        )}
      {remove.isError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {t("actionError")}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button disabled={remove.isPending} onClick={onClose} variant="ghost">
          {t("cancel")}
        </Button>
        <Button
          disabled={remove.isPending || impact.isFetching || !impact.isSuccess}
          onClick={() => void confirm()}
          variant="danger"
        >
          {t("delete")}
        </Button>
      </div>
    </FunnelDialog>
  );
}
