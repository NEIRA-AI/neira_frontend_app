import axios from "axios";
import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { isRevisionConflict } from "@/shared/api/revision-conflict";
import { Button } from "@/shared/ui/button";

import type { StatusRead } from "./api/funnels-api";
import type { InquiryFilter, InquirySummary } from "./api/inquiries-api";
import { useChangeInquiryState } from "./model/use-change-inquiry-state";
import { useListFunnelInquiries } from "./model/use-list-funnel-inquiries";
import { useListFunnels } from "./model/use-list-funnels";
import { useMakeEntryStatus } from "./model/use-make-entry-status";
import { useMoveInquiry } from "./model/use-move-inquiry";
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

type InquiryActionError = {
  action: "move" | "state";
  reason: "conflict" | "alreadyOpen" | "routeUnavailable" | "other";
};

function inquiryErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return null;
  }
  const detail: unknown = error.response.data?.detail;
  if (!detail || typeof detail !== "object" || !("code" in detail)) {
    return null;
  }
  return typeof detail.code === "string" ? detail.code : null;
}

function stateErrorReason(error: unknown): InquiryActionError["reason"] {
  const code = inquiryErrorCode(error);
  if (code === "revision_conflict") return "conflict";
  if (code === "inquiry_already_open") return "alreadyOpen";
  if (code === "inquiry_route_unavailable") return "routeUnavailable";
  return "other";
}

function FunnelsPage() {
  const { t } = useTranslation("funnels");
  const { workspaceId, workspaces } = useAuth();
  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );
  const canEdit = selectedWorkspace?.role === "owner";
  const canMoveInquiries =
    canEdit ||
    selectedWorkspace?.role === "admin" ||
    selectedWorkspace?.role === "manager";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inquiryFilter, setInquiryFilter] = useState<InquiryFilter>("all");
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [actionError, setActionError] = useState(false);
  const [inquiryActionError, setInquiryActionError] =
    useState<InquiryActionError | null>(null);
  const funnelsQuery = useListFunnels(workspaceId ?? "");
  const makeEntry = useMakeEntryStatus(workspaceId ?? "");
  const reorder = useReorderStatuses(workspaceId ?? "");
  const moveInquiry = useMoveInquiry(workspaceId ?? "");
  const changeInquiryState = useChangeInquiryState(workspaceId ?? "");
  const funnels = funnelsQuery.data ?? [];
  const funnel = funnels.find((item) => item.id === selectedId) ?? funnels[0];
  const inquiriesQuery = useListFunnelInquiries(
    workspaceId ?? "",
    funnel?.id ?? "",
    inquiryFilter,
  );
  const inquiryPages = inquiriesQuery.data?.pages ?? [];
  const inquiries = inquiryPages.flatMap((page) => page.items);
  const inquiryCounts = inquiryPages[0]?.status_counts ?? null;
  const actionBusy = makeEntry.isPending || reorder.isPending;
  const boardBusy =
    actionBusy || moveInquiry.isPending || changeInquiryState.isPending;

  function selectFunnel(id: string) {
    setSelectedId(id);
    setActionError(false);
    setInquiryActionError(null);
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

  async function moveInquiryToStatus(
    inquiry: InquirySummary,
    status: StatusRead,
  ) {
    if (
      !funnel ||
      !canMoveInquiries ||
      boardBusy ||
      inquiry.status_id === status.id ||
      inquiry.state !== "open"
    )
      return;
    setInquiryActionError(null);
    try {
      await moveInquiry.mutateAsync({
        funnelId: funnel.id,
        inquiryId: inquiry.id,
        statusId: status.id,
        statusName: status.name,
        expectedRevision: inquiry.revision,
        filter: inquiryFilter,
      });
    } catch (error) {
      setInquiryActionError({
        action: "move",
        reason:
          isRevisionConflict(error) ||
          inquiryErrorCode(error) === "inquiry_closed"
            ? "conflict"
            : "other",
      });
    }
  }

  async function setInquiryState(inquiry: InquirySummary) {
    if (!funnel || !canMoveInquiries || boardBusy) return;
    const state = inquiry.state === "open" ? "closed" : "open";
    setInquiryActionError(null);
    try {
      await changeInquiryState.mutateAsync({
        funnelId: funnel.id,
        contactId: inquiry.contact_id,
        inquiryId: inquiry.id,
        state,
        expectedRevision: inquiry.revision,
      });
    } catch (error) {
      setInquiryActionError({
        action: "state",
        reason: stateErrorReason(error),
      });
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
            inquiryFilter={inquiryFilter}
            funnel={funnel}
            funnels={funnels}
            onConfigureFunnel={() => setDialog({ kind: "configureFunnel" })}
            onCreateFunnel={() => setDialog({ kind: "createFunnel" })}
            onDeleteFunnel={() => setDialog({ kind: "deleteFunnel" })}
            onInquiryFilterChange={(filter) => {
              setInquiryFilter(filter);
              setInquiryActionError(null);
            }}
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
          {inquiryActionError && (
            <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger sm:mx-6 lg:mx-8">
              <p role="alert">
                {t(
                  inquiryActionError.action === "move"
                    ? inquiryActionError.reason === "conflict"
                      ? "moveInquiryConflict"
                      : "moveInquiryError"
                    : inquiryActionError.reason === "conflict"
                      ? "changeInquiryStateConflict"
                      : inquiryActionError.reason === "alreadyOpen"
                        ? "reopenInquiryAlreadyOpen"
                        : inquiryActionError.reason === "routeUnavailable"
                          ? "reopenInquiryRouteUnavailable"
                          : "changeInquiryStateError",
                )}
              </p>
              {inquiryActionError.reason !== "other" && (
                <Button
                  onClick={() => {
                    setInquiryActionError(null);
                    void Promise.all([
                      inquiriesQuery.refetch(),
                      funnelsQuery.refetch(),
                    ]);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  {t("refreshInquiries")}
                </Button>
              )}
            </div>
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
            busy={boardBusy}
            canEdit={canEdit}
            canMoveInquiries={canMoveInquiries}
            canChangeInquiryState={canMoveInquiries}
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
            onMoveInquiry={(inquiry, status) =>
              void moveInquiryToStatus(inquiry, status)
            }
            onChangeInquiryState={(inquiry) => void setInquiryState(inquiry)}
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
