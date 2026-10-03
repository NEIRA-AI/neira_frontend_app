import * as Dialog from "@radix-ui/react-dialog";
import { Eye, EyeOff, X } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export type PasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  children: ReactNode;
};

function PasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
}: PasswordDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-8">
          <Dialog.Title className="px-8 text-center text-xl font-semibold leading-tight">
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label={closeLabel}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-8 sm:top-8"
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          <Dialog.Description className="mx-auto mt-3 max-w-[390px] text-center text-sm leading-5 text-muted">
            {description}
          </Dialog.Description>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type PasswordEntryProps = {
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function PasswordEntry({
  label,
  autoComplete,
  value,
  onChange,
  error,
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
          className="h-12 border-transparent bg-subtle pb-1 pl-4 pr-12 pt-4 text-sm"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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

export type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onPreviewComplete?: () => void;
};

function PasswordFlow({
  open,
  onOpenChange,
  email,
  onPreviewComplete,
}: ChangePasswordDialogProps) {
  const { t } = useTranslation("settings");
  const [step, setStep] = useState<"password" | "code">("password");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [code, setCode] = useState("");

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMismatch(true);
      return;
    }
    setStep("code");
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length === 6) onPreviewComplete?.();
  }

  if (step === "code") {
    return (
      <PasswordDialog
        closeLabel={t("closeDialog")}
        description={t("passwordCodeDescription")}
        onOpenChange={onOpenChange}
        open={open}
        title={t("passwordCodeTitle")}
      >
        <form onSubmit={submitCode}>
          <Input
            aria-label={t("passwordCodeLabel")}
            autoFocus
            autoComplete="one-time-code"
            className="h-14 border-transparent bg-subtle text-center text-2xl tracking-[0.5em]"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            pattern="[0-9]{6}"
            required
            type="text"
            value={code}
          />
          <p className="mt-4 text-center text-sm text-muted">
            {t("passwordCodeSentTo")} <span className="underline">{email}</span>
          </p>
          <div className="mt-6 flex justify-end">
            <Button
              disabled={code.length !== 6 || !onPreviewComplete}
              type="submit"
            >
              {t("confirmPasswordChange")}
            </Button>
          </div>
        </form>
      </PasswordDialog>
    );
  }

  return (
    <PasswordDialog
      closeLabel={t("closeDialog")}
      description={t("passwordDialogDescription")}
      onOpenChange={onOpenChange}
      open={open}
      title={t("passwordDialogTitle")}
    >
      <form className="space-y-5" onSubmit={submitPassword}>
        <PasswordEntry
          autoComplete="new-password"
          label={t("newPassword")}
          onChange={(value) => {
            setPassword(value);
            setMismatch(false);
          }}
          value={password}
        />
        <PasswordEntry
          autoComplete="new-password"
          error={mismatch ? t("passwordMismatch") : undefined}
          label={t("repeatNewPassword")}
          onChange={(value) => {
            setConfirmation(value);
            setMismatch(false);
          }}
          value={confirmation}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit">{t("saveNewPassword")}</Button>
        </div>
      </form>
    </PasswordDialog>
  );
}

export function ChangePasswordDialog(props: ChangePasswordDialogProps) {
  return <PasswordFlow key={props.open ? "open" : "closed"} {...props} />;
}
