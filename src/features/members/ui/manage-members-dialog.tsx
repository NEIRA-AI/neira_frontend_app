import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, Mail, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import { useAuth, type SessionUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import type {
  EditableMemberRole,
  WorkspaceInvitation,
  WorkspaceMember,
} from "../api/members-api";
import { invitationUrl } from "../model/invitation-url";
import { useDeleteWorkspaceInvitation } from "../model/use-delete-workspace-invitation";
import { useDeleteWorkspaceMember } from "../model/use-delete-workspace-member";
import { useLeaveWorkspace } from "../model/use-leave-workspace";
import { useRenewWorkspaceInvitation } from "../model/use-renew-workspace-invitation";
import { useUpdateWorkspaceMemberRole } from "../model/use-update-workspace-member-role";
import { useWorkspaceMembers } from "../model/use-workspace-members";
import { ConfirmMemberActionDialog } from "./confirm-member-action-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";

type CopyState = { failed: boolean; url: string };
const emptyInvitations: WorkspaceInvitation[] = [];

function MemberAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase() ?? "?";

  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-sm font-bold text-brand">
      {avatarUrl ? (
        <img alt="" className="size-full object-cover" src={avatarUrl} />
      ) : (
        initial
      )}
    </span>
  );
}

function InvitationAvatar() {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
      <Mail aria-hidden="true" className="size-5" />
    </span>
  );
}

type IconActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  danger?: boolean;
  children: ReactNode;
};

const IconAction = forwardRef<HTMLButtonElement, IconActionProps>(
  function IconAction(
    { label, danger = false, children, className, ...props },
    ref,
  ) {
    return (
      <button
        aria-label={label}
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${danger ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-subtle hover:text-ink"} ${className ?? ""}`}
        ref={ref}
        title={label}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  },
);

function WorkspaceMembersDialogContent({
  workspaceId,
  user,
}: {
  workspaceId: string;
  user: SessionUser;
}) {
  const { t } = useTranslation("members");
  const [open, setOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<EditableMemberRole>("reader");
  const [roleError, setRoleError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [copyState, setCopyState] = useState<CopyState | null>(null);
  const [clock, setClock] = useState(Date.now);
  const membersQuery = useWorkspaceMembers(workspaceId);
  const updateRole = useUpdateWorkspaceMemberRole(workspaceId);
  const removeMember = useDeleteWorkspaceMember(workspaceId);
  const renewInvitation = useRenewWorkspaceInvitation(workspaceId);
  const removeInvitation = useDeleteWorkspaceInvitation(workspaceId);
  const leave = useLeaveWorkspace(workspaceId);

  const currentWorkspace = user.workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );
  const currentMember = membersQuery.data?.members.find(
    (member) => member.user_id === user.id,
  );
  const currentRole = currentMember?.role ?? currentWorkspace?.role ?? "reader";
  const canManage = currentRole === "owner" || currentRole === "admin";
  const otherMembers =
    membersQuery.data?.members.filter((member) => member.user_id !== user.id) ??
    [];
  const invitations = membersQuery.data?.invitations ?? emptyInvitations;
  const loading = membersQuery.isPending && membersQuery.isFetching;

  useEffect(() => {
    if (!open) return;
    const nextExpiry = Math.min(
      ...invitations
        .filter((invitation) => invitation.status === "pending")
        .map((invitation) => Date.parse(invitation.expires_at))
        .filter((expiresAt) => Number.isFinite(expiresAt) && expiresAt > clock),
    );
    if (!Number.isFinite(nextExpiry)) return;
    const timer = window.setTimeout(
      () => setClock(Date.now()),
      Math.max(0, nextExpiry - Date.now()) + 1000,
    );
    return () => window.clearTimeout(timer);
  }, [clock, invitations, open]);

  function roleLabel(role: string) {
    switch (role) {
      case "owner":
        return t("roleOwner");
      case "admin":
        return t("roleAdmin");
      case "manager":
        return t("roleManager");
      case "reader":
        return t("roleReader");
      default:
        return role;
    }
  }

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setClock(Date.now());
      void membersQuery.refetch();
    } else {
      setEditingUserId(null);
      setRoleError(false);
      setActionError(false);
      setCopyState(null);
    }
  }

  async function copyLink(token: string) {
    const url = invitationUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopyState({ failed: false, url });
    } catch {
      setCopyState({ failed: true, url });
    }
  }

  async function renew(invitation: WorkspaceInvitation) {
    setActionError(false);
    setCopyState(null);
    try {
      const renewed = await renewInvitation.mutateAsync(invitation.id);
      await copyLink(renewed.token);
    } catch {
      setActionError(true);
    }
  }

  async function saveRole(member: WorkspaceMember) {
    setRoleError(false);
    try {
      await updateRole.mutateAsync({ userId: member.user_id, role: draftRole });
      setEditingUserId(null);
    } catch {
      setRoleError(true);
    }
  }

  function memberRow(member: WorkspaceMember) {
    const label = member.name || member.email;
    const canEdit = canManage && member.role !== "owner";
    const editing = editingUserId === member.user_id;

    return (
      <li
        className="flex min-w-0 flex-wrap items-center gap-3 py-4"
        key={member.user_id}
      >
        <MemberAvatar name={label} />
        <div className="min-w-0 flex-1">
          <p className="break-all text-sm font-semibold text-ink">
            {member.email}
          </p>
          {member.name && (
            <p className="mt-1 break-words text-xs text-muted">{member.name}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {editing ? (
            <>
              <Select
                ariaLabel={t("role")}
                className="min-h-9 min-w-28 px-2"
                contentClassName="z-[60]"
                disabled={updateRole.isPending}
                onValueChange={(value) =>
                  setDraftRole(value as EditableMemberRole)
                }
                options={[
                  { value: "admin", label: t("roleAdmin") },
                  { value: "manager", label: t("roleManager") },
                  { value: "reader", label: t("roleReader") },
                ]}
                value={draftRole}
              />
              <IconAction
                disabled={updateRole.isPending}
                label={t("saveRole")}
                onClick={() => void saveRole(member)}
              >
                <Check aria-hidden="true" className="size-4" />
              </IconAction>
              <IconAction
                disabled={updateRole.isPending}
                label={t("cancelEdit")}
                onClick={() => {
                  setEditingUserId(null);
                  setRoleError(false);
                }}
              >
                <X aria-hidden="true" className="size-4" />
              </IconAction>
            </>
          ) : (
            <>
              <Badge tone={member.role === "admin" ? "brandSoft" : "neutral"}>
                {roleLabel(member.role)}
              </Badge>
              {canEdit && (
                <>
                  <IconAction
                    disabled={updateRole.isPending}
                    label={t("editMember", { name: label })}
                    onClick={() => {
                      setEditingUserId(member.user_id);
                      setDraftRole(member.role as EditableMemberRole);
                      setRoleError(false);
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </IconAction>
                  <ConfirmMemberActionDialog
                    confirmLabel={t("confirmRemove")}
                    description={t("removeMemberDescription", { name: label })}
                    onConfirm={() => removeMember.mutateAsync(member.user_id)}
                    title={t("removeMemberTitle")}
                    trigger={
                      <IconAction
                        danger
                        disabled={removeMember.isPending}
                        label={t("removeMember", { name: label })}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </IconAction>
                    }
                  />
                </>
              )}
            </>
          )}
        </div>
        {editing && roleError && (
          <p className="w-full text-sm text-danger" role="alert">
            {t("actionError")}
          </p>
        )}
      </li>
    );
  }

  function invitationRow(invitation: WorkspaceInvitation) {
    const status =
      invitation.status === "pending" &&
      Date.parse(invitation.expires_at) <= clock
        ? "expired"
        : invitation.status;
    return (
      <li
        className="flex min-w-0 flex-wrap items-center gap-3 py-4"
        key={invitation.id}
      >
        <InvitationAvatar />
        <div className="min-w-0 flex-1">
          <p className="break-all text-sm font-semibold text-ink">
            {invitation.email}
          </p>
          {invitation.recipient_name && (
            <p className="mt-1 break-words text-xs text-muted">
              {invitation.recipient_name}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge tone="brandSoft">{roleLabel(invitation.role)}</Badge>
          <Badge tone={status === "expired" ? "warning" : "neutral"}>
            {status === "pending"
              ? t("pending")
              : status === "expired"
                ? t("expired")
                : status}
          </Badge>
          {canManage &&
            (status === "pending" ? (
              <IconAction
                label={t("copyLink", { email: invitation.email })}
                onClick={() => void copyLink(invitation.token)}
              >
                <Copy aria-hidden="true" className="size-4" />
              </IconAction>
            ) : status === "expired" ? (
              <IconAction
                disabled={renewInvitation.isPending}
                label={t("renewInvite", { email: invitation.email })}
                onClick={() => void renew(invitation)}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
              </IconAction>
            ) : null)}
          {canManage && (status === "pending" || status === "expired") && (
            <ConfirmMemberActionDialog
              confirmLabel={t("confirmDelete")}
              description={t("deleteInviteDescription", {
                email: invitation.email,
              })}
              onConfirm={() => removeInvitation.mutateAsync(invitation.id)}
              title={t("deleteInviteTitle")}
              trigger={
                <IconAction
                  danger
                  disabled={removeInvitation.isPending}
                  label={t("deleteInvite", { email: invitation.email })}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </IconAction>
              }
            />
          )}
        </div>
      </li>
    );
  }

  return (
    <Dialog.Root onOpenChange={changeOpen} open={open}>
      <Dialog.Trigger asChild>
        <Button
          className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
          size="sm"
          variant="secondary"
        >
          {t("manage")}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7">
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {t("title")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {t("description")}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-7 sm:top-7"
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>

          {membersQuery.isError && (
            <div
              className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              <span>
                {membersQuery.data ? t("refreshError") : t("loadError")}
              </span>
              <Button
                className="min-h-8 px-3"
                onClick={() => void membersQuery.refetch()}
                size="sm"
                variant="outline"
              >
                {t("retry")}
              </Button>
            </div>
          )}
          {actionError && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {t("actionError")}
            </p>
          )}
          {copyState && (
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${copyState.failed ? "bg-danger-soft text-danger" : "bg-success-soft text-success-ink"}`}
              role={copyState.failed ? "alert" : "status"}
            >
              <p>{copyState.failed ? t("copyFailed") : t("copied")}</p>
              {copyState.failed && (
                <Input
                  aria-label={t("invitationLink")}
                  className="mt-3"
                  onFocus={(event) => event.target.select()}
                  readOnly
                  value={copyState.url}
                />
              )}
            </div>
          )}

          <section aria-label={t("you")} className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">
              {t("you")}
            </h3>
            <div className="flex min-w-0 flex-wrap items-center gap-3 py-4">
              <MemberAvatar
                avatarUrl={user.avatar_url}
                name={currentMember?.name || user.name || user.email}
              />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-ink">
                  {currentMember?.name || user.name || user.email}
                </p>
                <p className="mt-1 break-all text-xs text-muted">
                  {currentMember?.email || user.email}
                </p>
              </div>
              <Badge tone={currentRole === "owner" ? "brandSoft" : "neutral"}>
                {roleLabel(currentMember?.role ?? currentRole)}
              </Badge>
              {currentRole !== "owner" && (
                <ConfirmMemberActionDialog
                  confirmLabel={t("confirmLeave")}
                  description={t("leaveDescription")}
                  onConfirm={async () => {
                    await leave.mutateAsync();
                    changeOpen(false);
                  }}
                  title={t("leaveTitle")}
                  trigger={
                    <Button size="sm" variant="outline">
                      {t("leave")}
                    </Button>
                  }
                />
              )}
            </div>
          </section>

          <section
            aria-label={t("peopleAndInvitations")}
            className="border-t border-line pt-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t("peopleAndInvitations")}
              </h3>
              {membersQuery.data && (
                <span className="text-xs text-muted">
                  {t("activeMembers", {
                    count: membersQuery.data.members.length,
                  })}
                </span>
              )}
            </div>
            {loading ? (
              <p className="py-10 text-center text-sm text-muted" role="status">
                {t("loading")}
              </p>
            ) : membersQuery.data ? (
              otherMembers.length || invitations.length ? (
                <ul className="divide-y divide-line">
                  {otherMembers.map(memberRow)}
                  {invitations.map(invitationRow)}
                </ul>
              ) : (
                <p className="py-5 text-sm text-muted">{t("noPeople")}</p>
              )
            ) : null}
          </section>

          {canManage && (
            <div className="flex justify-end border-t border-line pt-5">
              <InviteMemberDialog workspaceId={workspaceId} />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ManageMembersDialog() {
  const { user, workspaceId } = useAuth();

  if (!user || !workspaceId) return null;

  return (
    <WorkspaceMembersDialogContent
      key={`${user.id}:${workspaceId}`}
      user={user}
      workspaceId={workspaceId}
    />
  );
}
