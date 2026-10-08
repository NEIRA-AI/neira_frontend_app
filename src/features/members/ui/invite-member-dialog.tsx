import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import type {
  EditableMemberRole,
  WorkspaceInvitation,
} from "../api/members-api";
import { invitationUrl } from "../model/invitation-url";
import { useCreateWorkspaceInvitation } from "../model/use-create-workspace-invitation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation("members");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EditableMemberRole>("reader");
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [created, setCreated] = useState<WorkspaceInvitation | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const emailErrorId = useId();
  const create = useCreateWorkspaceInvitation(workspaceId);
  const busy = create.isPending;
  const createdUrl = created ? invitationUrl(created.token) : null;

  function changeOpen(nextOpen: boolean) {
    if (busy) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setRole("reader");
      setEmailInvalid(false);
      setCreated(null);
      setCopyFailed(false);
      create.reset();
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const normalizedEmail = email.trim();
    if (!emailPattern.test(normalizedEmail)) {
      setEmailInvalid(true);
      return;
    }
    try {
      const invitation = await create.mutateAsync({
        email: normalizedEmail,
        role,
      });
      setCreated(invitation);
      await copy(invitationUrl(invitation.token));
    } catch {
      // The request error is shown beside the form.
    }
  }

  return (
    <Dialog.Root onOpenChange={changeOpen} open={open}>
      <Dialog.Trigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" className="size-4" />
          {t("invite")}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {created ? t("inviteReady") : t("inviteTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {created ? t("inviteReadyDescription") : t("inviteDescription")}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 sm:right-7 sm:top-7"
              disabled={busy}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>

          {createdUrl ? (
            <div className="mt-6 space-y-4">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor="created-invitation-url"
                >
                  {t("invitationLink")}
                </label>
                <Input
                  id="created-invitation-url"
                  onFocus={(event) => event.target.select()}
                  readOnly
                  value={createdUrl}
                />
              </div>
              <p
                className={`text-sm ${copyFailed ? "text-danger" : "text-success-ink"}`}
                role={copyFailed ? "alert" : "status"}
              >
                {copyFailed ? t("copyFailed") : t("copied")}
              </p>
              <div className="flex flex-wrap justify-end gap-3">
                <Button onClick={() => void copy(createdUrl)} variant="outline">
                  {t("copyAgain")}
                </Button>
                <Button onClick={() => changeOpen(false)}>{t("done")}</Button>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor="invite-member-email"
                >
                  {t("email")}
                </label>
                <Input
                  aria-describedby={emailInvalid ? emailErrorId : undefined}
                  aria-invalid={emailInvalid}
                  autoComplete="email"
                  autoFocus
                  disabled={busy}
                  id="invite-member-email"
                  maxLength={320}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailInvalid(false);
                    create.reset();
                  }}
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  value={email}
                />
                {emailInvalid && (
                  <p
                    className="mt-2 text-sm text-danger"
                    id={emailErrorId}
                    role="alert"
                  >
                    {t("emailInvalid")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  htmlFor="invite-member-role"
                >
                  {t("role")}
                </label>
                <Select
                  ariaLabel={t("role")}
                  className="min-h-12 w-full px-4"
                  contentClassName="z-[80]"
                  disabled={busy}
                  id="invite-member-role"
                  onValueChange={(value) =>
                    setRole(value as EditableMemberRole)
                  }
                  options={[
                    { value: "admin", label: t("roleAdmin") },
                    { value: "manager", label: t("roleManager") },
                    { value: "reader", label: t("roleReader") },
                  ]}
                  value={role}
                />
              </div>
              {create.isError && (
                <p className="text-sm text-danger" role="alert">
                  {axios.isAxiosError(create.error) &&
                  create.error.response?.status === 409
                    ? t("inviteExists")
                    : t("actionError")}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  disabled={busy}
                  onClick={() => changeOpen(false)}
                  variant="ghost"
                >
                  {t("cancel")}
                </Button>
                <Button disabled={busy} type="submit">
                  {t("createInvite")}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
