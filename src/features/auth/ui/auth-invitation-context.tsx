import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { InvitationAuthDetails } from "../model/auth-return-path";

export function AuthInvitationContext({
  invitation,
}: {
  invitation: InvitationAuthDetails;
}) {
  const { t } = useTranslation("auth");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand">
        <Building2 aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">
          {t("invitation.workspaceLabel")}
        </p>
        <p className="truncate text-sm font-semibold text-ink">
          {invitation.workspaceName}
        </p>
        <p className="truncate text-xs text-muted">{invitation.email}</p>
      </div>
    </div>
  );
}
