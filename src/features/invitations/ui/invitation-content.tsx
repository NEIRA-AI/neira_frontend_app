import { ArrowRight, Building2, Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { SessionUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import type { InvitationPreview } from "../api/invitations-api";

export function InvitationMessage({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="w-full max-w-lg rounded-3xl border border-line bg-surface px-6 py-10 text-center shadow-sm sm:px-10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Building2 aria-hidden="true" className="size-7" />
      </span>
      <h1 className="mt-6 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
      {actions && (
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {actions}
        </div>
      )}
    </section>
  );
}

export function InvitationConfirmation({
  invitation,
  user,
  onAccept,
  onDecline,
  accepting,
  declining,
  actionError,
}: {
  invitation: InvitationPreview;
  user: SessionUser;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
  declining: boolean;
  actionError: boolean;
}) {
  const { t } = useTranslation("invitations");
  const roleKey =
    invitation.role === "admin"
      ? "roles.admin"
      : invitation.role === "manager"
        ? "roles.manager"
        : invitation.role === "reader"
          ? "roles.reader"
          : "roles.member";
  const initial =
    Array.from(user.name.trim() || user.email)[0]?.toLocaleUpperCase() ?? "?";
  const busy = accepting || declining;

  return (
    <section className="w-full max-w-xl rounded-3xl border border-line bg-surface px-6 py-9 text-center shadow-sm sm:px-12 sm:py-12">
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
        {t("description", { workspace: invitation.workspace_name })}
      </p>

      <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-2xl bg-subtle px-4 py-5 sm:gap-5">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-brand-20 text-xl font-semibold text-brand">
            {user.avatar_url ? (
              <img
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
                src={user.avatar_url}
              />
            ) : (
              initial
            )}
          </span>
          <span className="w-full truncate text-sm font-medium text-ink">
            {user.name}
          </span>
          <span
            className="w-full truncate text-xs text-muted"
            title={user.email}
          >
            {user.email}
          </span>
        </div>
        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-brand" />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-brand shadow-sm">
            <Building2 aria-hidden="true" className="size-7" />
          </span>
          <span
            className="w-full truncate text-sm font-semibold text-ink"
            title={invitation.workspace_name}
          >
            {invitation.workspace_name}
          </span>
          <span className="w-full truncate text-xs text-muted">
            {t("workspace")}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted">
        {t("role", { role: t(roleKey) })}
      </p>
      {actionError && (
        <p
          className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {t("actionError")}
        </p>
      )}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <Button disabled={busy} onClick={onDecline} size="lg" variant="outline">
          <X aria-hidden="true" className="size-5" />
          {declining ? t("declining") : t("decline")}
        </Button>
        <Button disabled={busy} onClick={onAccept} size="lg">
          <Check aria-hidden="true" className="size-5" />
          {accepting ? t("confirming") : t("confirm")}
        </Button>
      </div>
    </section>
  );
}
