import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import type { StatusRead } from "./api/funnels-api";
import { useListFunnelInquiries } from "./model/use-list-funnel-inquiries";
import { useListFunnels } from "./model/use-list-funnels";
import { useMakeEntryStatus } from "./model/use-make-entry-status";
import { useReorderStatuses } from "./model/use-reorder-statuses";
import { DeleteFunnelDialog } from "./ui/delete-funnel-dialog";
import { DeleteStatusDialog } from "./ui/delete-status-dialog";
import { FunnelBoard } from "./ui/funnel-board";
import { FunnelEditorDialog } from "./ui/funnel-editor-dialog";
import { FunnelToolbar } from "./ui/funnel-toolbar";
import { StatusDialog } from "./ui/status-dialog";

type ActiveDialog =
  | { kind: "createFunnel" }
  | { kind: "configureFunnel" }
  | { kind: "deleteFunnel" }
  | { kind: "editStatus"; status: StatusRead }
  | { kind: "deleteStatus"; status: StatusRead }
  | null;

function FunnelsPage() {
  const { t } = useTranslation("funnels");
  const { workspaceId, workspaces } = useAuth();
  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );
  const canEdit = selectedWorkspace?.role === "owner";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [actionError, setActionError] = useState(false);
  const funnelsQuery = useListFunnels(workspaceId ?? "");
  const makeEntry = useMakeEntryStatus(workspaceId ?? "");
  const reorder = useReorderStatuses(workspaceId ?? "");
  const funnels = funnelsQuery.data ?? [];
  const funnel = funnels.find((item) => item.id === selectedId) ?? funnels[0];
  const inquiriesQuery = useListFunnelInquiries(
    workspaceId ?? "",
    funnel?.id ?? "",
  );
  const inquiryPages = inquiriesQuery.data?.pages ?? [];
  const inquiries = inquiryPages.flatMap((page) => page.items);
  const inquiryCounts = inquiryPages[0]?.status_counts ?? null;
  const actionBusy = makeEntry.isPending || reorder.isPending;

  function selectFunnel(id: string) {
    setSelectedId(id);
    setActionError(false);
    setDialog(null);
  }

  async function changeEntry(status: StatusRead) {
    if (!funnel || !canEdit || actionBusy) return;
    setActionError(false);
    try {
      await makeEntry.mutateAsync({ funnelId: funnel.id, statusId: status.id });
    } catch {
      setActionError(true);
    }
  }

  async function reorderStatuses(ids: string[]) {
    if (!funnel || !canEdit || actionBusy) return;
    setActionError(false);
    try {
      await reorder.mutateAsync({ funnelId: funnel.id, statusIds: ids });
    } catch {
      setActionError(true);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem-var(--impersonation-banner-height,0px))] min-h-[calc(100dvh-4rem-var(--impersonation-banner-height,0px))] min-w-0 flex-col bg-page lg:h-[calc(100dvh-var(--impersonation-banner-height,0px))] lg:min-h-[calc(100dvh-var(--impersonation-banner-height,0px))]">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <span title={t("manualCreationUnavailable")}>
            <Button disabled size="sm">
              <Plus aria-hidden="true" className="size-4" />
              {t("createAppeal")}
            </Button>
          </span>
        </div>
      </header>

      {funnelsQuery.isPending ? (
        <div
          className="flex-1 px-4 py-10 text-sm text-muted sm:px-6 lg:px-8"
          role="status"
        >
          {t("title")}…
        </div>
      ) : funnelsQuery.isError ? (
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-danger" role="alert">
            {t("loadError")}
          </p>
          <Button
            className="mt-4"
            onClick={() => void funnelsQuery.refetch()}
            size="sm"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("retry")}
          </Button>
        </div>
      ) : funnel ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <FunnelToolbar
            canEdit={canEdit}
            funnel={funnel}
            funnels={funnels}
            onConfigureFunnel={() => setDialog({ kind: "configureFunnel" })}
            onCreateFunnel={() => setDialog({ kind: "createFunnel" })}
            onDeleteFunnel={() => setDialog({ kind: "deleteFunnel" })}
            onSelect={selectFunnel}
          />
          {!canEdit && (
            <p className="px-4 pt-4 text-xs text-muted sm:px-6 lg:px-8">
              {t("readOnly")}
            </p>
          )}
          {actionError && (
            <p
              className="mx-4 mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger sm:mx-6 lg:mx-8"
              role="alert"
            >
              {reorder.isError ? t("reorderError") : t("actionError")}
            </p>
          )}
          {inquiriesQuery.isError && (
            <div className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger sm:mx-6 lg:mx-8">
              <p role="alert">{t("inquiriesLoadError")}</p>
              <Button
                onClick={() => void inquiriesQuery.refetch()}
                size="sm"
                variant="outline"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("retry")}
              </Button>
            </div>
          )}
          <FunnelBoard
            busy={actionBusy}
            canEdit={canEdit}
            hasMoreInquiries={Boolean(inquiriesQuery.hasNextPage)}
            inquiries={inquiries}
            inquiryCounts={inquiryCounts}
            inquiriesFailed={
              inquiriesQuery.isError && inquiryPages.length === 0
            }
            inquiriesLoading={inquiriesQuery.isPending}
            loadingMoreInquiries={inquiriesQuery.isFetchingNextPage}
            onLoadMoreInquiries={() => void inquiriesQuery.fetchNextPage()}
            onDelete={(status) => setDialog({ kind: "deleteStatus", status })}
            onEdit={(status) => setDialog({ kind: "editStatus", status })}
            onMakeEntry={(status) => void changeEntry(status)}
            onReorder={(ids) => void reorderStatuses(ids)}
            statuses={funnel.statuses}
          />
        </div>
      ) : (
        <div className="flex-1 px-4 py-10 text-center sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-ink">{t("noFunnels")}</h2>
          <p className="mt-2 text-sm text-muted">{t("noFunnelsHelp")}</p>
          {canEdit && (
            <Button
              className="mt-6"
              onClick={() => setDialog({ kind: "createFunnel" })}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("createFunnel")}
            </Button>
          )}
        </div>
      )}

      {workspaceId && dialog?.kind === "createFunnel" && (
        <FunnelEditorDialog
          onClose={() => setDialog(null)}
          onSaved={(id) => {
            setSelectedId(id);
            setDialog(null);
          }}
          workspaceId={workspaceId}
        />
      )}
      {workspaceId && funnel && dialog?.kind === "configureFunnel" && (
        <FunnelEditorDialog
          funnel={funnel}
          onClose={() => setDialog(null)}
          onSaved={() => setDialog(null)}
          workspaceId={workspaceId}
        />
      )}
      {workspaceId && funnel && dialog?.kind === "deleteFunnel" && (
        <DeleteFunnelDialog
          funnel={funnel}
          onClose={() => setDialog(null)}
          onDeleted={() => {
            setSelectedId(null);
            setDialog(null);
          }}
          workspaceId={workspaceId}
        />
      )}
      {workspaceId && funnel && dialog?.kind === "editStatus" && (
        <StatusDialog
          funnel={funnel}
          onClose={() => setDialog(null)}
          status={dialog.status}
          workspaceId={workspaceId}
        />
      )}
      {workspaceId && funnel && dialog?.kind === "deleteStatus" && (
        <DeleteStatusDialog
          funnel={funnel}
          onClose={() => setDialog(null)}
          status={dialog.status}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}

export const Component = FunnelsPage;
