import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { ManageMembersDialog, useWorkspaceMembers } from "@/features/members";
import { workspaceDisplayName } from "@/shared/lib/workspace-display-name";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

import { ManageWorkspacesDialog } from "./manage-workspaces-dialog";
import { RenameWorkspaceDialog } from "./rename-workspace-dialog";

export function WorkspaceSettings() {
  const { t } = useTranslation("workspaces");
  const { workspaces, workspaceId } = useAuth();
  const current = workspaces.find((workspace) => workspace.id === workspaceId);
  const members = useWorkspaceMembers(workspaceId);

  return (
    <section aria-label={t("sectionTitle")} className="space-y-4">
      <h2 className="text-base font-semibold leading-[19px] text-ink">
        {t("sectionTitle")}
      </h2>

      <Card className="overflow-hidden border-0">
        <div className="flex min-h-15 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 break-words font-bold text-ink">
              {current ? workspaceDisplayName(current, workspaces) : "—"}
            </span>
            <Badge tone="brandSoft">{t("currentWorkspace")}</Badge>
          </div>
          {(current?.role === "owner" || current?.role === "admin") && (
            <RenameWorkspaceDialog
              workspace={current}
              workspaceLabel={workspaceDisplayName(current, workspaces)}
            />
          )}
        </div>

        <div className="flex min-h-15 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-sm sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{t("members")}</span>
            <Badge className="min-w-6 justify-center" tone="neutral">
              {members.data?.members.length ?? "—"}
            </Badge>
          </div>
          <ManageMembersDialog />
        </div>

        <div className="flex min-h-15 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-sm sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{t("workspaceList")}</span>
            <Badge className="min-w-6 justify-center" tone="neutral">
              {workspaces.length}
            </Badge>
          </div>
          <ManageWorkspacesDialog />
        </div>
      </Card>
    </section>
  );
}
