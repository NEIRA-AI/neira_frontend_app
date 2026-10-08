import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Eye, EyeOff, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { useChangePassword } from "../model/use-change-password";

type PasswordEntryProps = {
  label: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
};

function PasswordEntry({
  label,
  autoComplete,
  value,
  onChange,
  error,
  autoFocus,
  disabled,
}: PasswordEntryProps) {
  const { t } = useTranslation("settings");
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <label
          className="absolute left-4 top-1 z-10 text-[11px] leading-4 text-muted"
          htmlFor={id}
        >
          {label}
        </label>
        <Input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="h-12 border-transparent bg-subtle pb-1 pl-4 pr-12 pt-4 text-sm"
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>
      {error && (
        <p
          className="mt-1 text-xs leading-4 text-danger"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

type CurrentPasswordError = "required" | "incorrect" | null;

export type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function PasswordForm({
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordDialogProps) {
  const { t } = useTranslation("settings");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentError, setCurrentError] = useState<CurrentPasswordError>(null);
  const [newPasswordInvalid, setNewPasswordInvalid] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const changePassword = useChangePassword();
  const busy = changePassword.isPending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const missingCurrent = currentPassword.length === 0;
    const newLength = Array.from(newPassword).length;
    const invalidNew = newLength < 8 || newLength > 128;
    setCurrentError(missingCurrent ? "required" : null);
    setNewPasswordInvalid(invalidNew);
    setRequestFailed(false);
    if (missingCurrent || invalidNew) return;

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setCurrentError("incorrect");
      } else {
        setRequestFailed(true);
      }
    }
  }

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen);
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-8"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <Dialog.Title className="px-8 text-center text-xl font-semibold leading-tight">
            {t("passwordDialogTitle")}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 sm:right-8 sm:top-8"
              disabled={busy}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          <Dialog.Description className="mx-auto mt-3 max-w-[390px] text-center text-sm leading-5 text-muted">
            {t("passwordDialogDescription")}
          </Dialog.Description>
          <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
            <PasswordEntry
              autoComplete="current-password"
              autoFocus
              disabled={busy}
              error={
                currentError === "required"
                  ? t("currentPasswordRequired")
                  : currentError === "incorrect"
                    ? t("incorrectCurrentPassword")
                    : undefined
              }
              label={t("currentPassword")}
              onChange={(value) => {
                setCurrentPassword(value);
                setCurrentError(null);
                setRequestFailed(false);
              }}
              value={currentPassword}
            />
            <PasswordEntry
              autoComplete="new-password"
              disabled={busy}
              error={newPasswordInvalid ? t("newPasswordLength") : undefined}
              label={t("newPassword")}
              onChange={(value) => {
                setNewPassword(value);
                setNewPasswordInvalid(false);
                setRequestFailed(false);
              }}
              value={newPassword}
            />
            {requestFailed && (
              <p className="text-sm text-danger" role="alert">
                {t("passwordChangeError")}
              </p>
            )}
            <div className="flex justify-end pt-2">
              <Button disabled={busy} type="submit">
                {t("saveNewPassword")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ChangePasswordDialog(props: ChangePasswordDialogProps) {
  return <PasswordForm key={props.open ? "open" : "closed"} {...props} />;
}
