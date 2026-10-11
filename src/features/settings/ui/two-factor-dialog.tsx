import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Copy, ShieldCheck, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { TwoFactorSetup } from "../api/two-factor-api";
import { useTwoFactorActions } from "../model/use-two-factor-actions";

type Phase =
  "password" | "scan" | "overview" | "regenerate" | "disable" | "codes";

type ErrorKey =
  | "twoFactorPasswordRequired"
  | "twoFactorPasswordIncorrect"
  | "twoFactorStateChanged"
  | "twoFactorTooManyAttempts"
  | "twoFactorError"
  | "twoFactorCodeInvalid"
  | "twoFactorCodeRequired"
  | "twoFactorVerificationRequired"
  | "twoFactorCredentialsInvalid"
  | "twoFactorCopyError";

type TwoFactorDialogProps = {
  open: boolean;
  enabled: boolean;
  backupCodesRemaining: number;
  onOpenChange: (open: boolean) => void;
};

const headings = {
  password: ["twoFactorSetupTitle", "twoFactorSetupDescription"],
  scan: ["twoFactorScanTitle", "twoFactorScanDescription"],
  overview: ["twoFactorOverviewTitle", "twoFactorOverviewDescription"],
  regenerate: ["twoFactorRegenerate", "twoFactorRegenerateWarning"],
  disable: ["twoFactorDisable", "twoFactorDisableWarning"],
  codes: ["twoFactorCodesTitle", "twoFactorCodesDescription"],
} as const;

function TwoFactorDialogContent({
  open,
  enabled,
  backupCodesRemaining,
  onOpenChange,
}: TwoFactorDialogProps) {
  const { t } = useTranslation("settings");
  const actions = useTwoFactorActions();
  const [phase, setPhase] = useState<Phase>(enabled ? "overview" : "password");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordError, setPasswordError] = useState<ErrorKey | null>(null);
  const [codeError, setCodeError] = useState<ErrorKey | null>(null);
  const [actionError, setActionError] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function clearErrors() {
    setPasswordError(null);
    setCodeError(null);
    setActionError(null);
  }

  function startManagement(next: "regenerate" | "disable") {
    clearErrors();
    setPassword("");
    setCode("");
    setPhase(next);
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!password) {
      setPasswordError("twoFactorPasswordRequired");
      return;
    }
    clearErrors();
    setBusy(true);
    try {
      const nextSetup = await actions.beginSetup(password);
      setSetup(nextSetup);
      setPassword("");
      setCode("");
      setPhase("scan");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setPasswordError("twoFactorPasswordIncorrect");
      } else if (axios.isAxiosError(error) && error.response?.status === 409) {
        setActionError("twoFactorStateChanged");
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        setActionError("twoFactorTooManyAttempts");
      } else {
        setActionError("twoFactorError");
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !setup) return;
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError(code ? "twoFactorCodeInvalid" : "twoFactorCodeRequired");
      return;
    }
    clearErrors();
    setBusy(true);
    try {
      const response = await actions.confirmSetup(code.trim());
      setBackupCodes(response.backup_codes);
      setSetup(null);
      setCode("");
      setPhase("codes");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setCodeError("twoFactorCodeInvalid");
      } else if (axios.isAxiosError(error) && error.response?.status === 409) {
        setActionError("twoFactorStateChanged");
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        setActionError("twoFactorTooManyAttempts");
      } else {
        setActionError("twoFactorError");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitManagement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (phase !== "disable" && phase !== "regenerate")) return;
    const missingPassword = !password;
    const missingCode = !code.trim();
    setPasswordError(missingPassword ? "twoFactorPasswordRequired" : null);
    setCodeError(missingCode ? "twoFactorVerificationRequired" : null);
    if (missingPassword || missingCode) return;

    clearErrors();
    setBusy(true);
    try {
      const input = { current_password: password, code: code.trim() };
      if (phase === "disable") {
        await actions.disable(input);
        onOpenChange(false);
      } else {
        const response = await actions.regenerate(input);
        setBackupCodes(response.backup_codes);
        setPhase("codes");
      }
      setPassword("");
      setCode("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setActionError("twoFactorCredentialsInvalid");
      } else if (axios.isAxiosError(error) && error.response?.status === 409) {
        setActionError("twoFactorStateChanged");
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        setActionError("twoFactorTooManyAttempts");
      } else {
        setActionError("twoFactorError");
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      setActionError(null);
    } catch {
      setActionError("twoFactorCopyError");
    }
  }

  const [heading, description] = headings[phase];

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (busy || (phase === "codes" && !nextOpen)) return;
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-8"
          onEscapeKeyDown={(event) => {
            if (busy || phase === "codes") event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy || phase === "codes") event.preventDefault();
          }}
        >
          <Dialog.Title className="px-8 text-center text-xl font-semibold leading-tight">
            {t(heading)}
          </Dialog.Title>
          <Dialog.Description className="mx-auto mt-3 max-w-[430px] text-center text-sm leading-5 text-muted">
            {t(description)}
          </Dialog.Description>
          {phase !== "codes" && (
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
          )}

          {phase === "password" && (
            <form
              className="mt-6 space-y-4"
              noValidate
              onSubmit={submitPassword}
            >
              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="two-factor-password"
              >
                <span>{t("twoFactorPasswordLabel")}</span>
                <Input
                  aria-invalid={Boolean(passwordError)}
                  autoComplete="current-password"
                  autoFocus
                  disabled={busy}
                  id="two-factor-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearErrors();
                  }}
                  required
                  type="password"
                  value={password}
                />
              </label>
              {passwordError && (
                <p className="text-sm text-danger" role="alert">
                  {t(passwordError)}
                </p>
              )}
              <ActionError error={actionError} />
              <div className="flex justify-end pt-2">
                <Button disabled={busy} type="submit">
                  {busy ? t("twoFactorLoading") : t("twoFactorContinue")}
                </Button>
              </div>
            </form>
          )}

          {phase === "scan" && setup && (
            <form className="mt-6 space-y-5" noValidate onSubmit={confirmSetup}>
              <div className="mx-auto w-fit rounded-2xl border border-line bg-white p-4">
                <QRCodeSVG
                  aria-label={t("twoFactorScanTitle")}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  marginSize={1}
                  size={190}
                  value={setup.otpauth_uri}
                />
              </div>
              <div className="rounded-xl bg-subtle px-4 py-3 text-center text-sm text-muted">
                <p>{t("twoFactorManualKey")}</p>
                <code className="mt-2 block break-all font-mono text-sm font-semibold tracking-wider text-ink select-all">
                  {setup.secret}
                </code>
              </div>
              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="two-factor-confirm-code"
              >
                <span>{t("twoFactorCodeLabel")}</span>
                <Input
                  aria-invalid={Boolean(codeError)}
                  autoComplete="one-time-code"
                  disabled={busy}
                  id="two-factor-confirm-code"
                  inputMode="numeric"
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    clearErrors();
                  }}
                  pattern="[0-9]{6}"
                  placeholder={t("twoFactorCodePlaceholder")}
                  required
                  value={code}
                />
              </label>
              {codeError && (
                <p className="text-sm text-danger" role="alert">
                  {t(codeError)}
                </p>
              )}
              <ActionError error={actionError} />
              <div className="flex justify-end pt-2">
                <Button disabled={busy} type="submit">
                  {busy ? t("twoFactorLoading") : t("twoFactorConfirm")}
                </Button>
              </div>
            </form>
          )}

          {phase === "overview" && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
                <ShieldCheck aria-hidden="true" className="size-5 shrink-0" />
                <span>
                  {t("twoFactorCodesRemaining", {
                    count: backupCodesRemaining,
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() => startManagement("regenerate")}
                  variant="outline"
                >
                  {t("twoFactorRegenerate")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => startManagement("disable")}
                  variant="danger"
                >
                  {t("twoFactorDisable")}
                </Button>
              </div>
            </div>
          )}

          {(phase === "regenerate" || phase === "disable") && (
            <form
              className="mt-6 space-y-4"
              noValidate
              onSubmit={submitManagement}
            >
              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="two-factor-manage-password"
              >
                <span>{t("twoFactorPasswordLabel")}</span>
                <Input
                  aria-invalid={Boolean(passwordError)}
                  autoComplete="current-password"
                  autoFocus
                  disabled={busy}
                  id="two-factor-manage-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearErrors();
                  }}
                  required
                  type="password"
                  value={password}
                />
              </label>
              {passwordError && (
                <p className="text-sm text-danger" role="alert">
                  {t(passwordError)}
                </p>
              )}
              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="two-factor-manage-code"
              >
                <span>{t("twoFactorVerificationCode")}</span>
                <Input
                  aria-invalid={Boolean(codeError)}
                  autoComplete="one-time-code"
                  disabled={busy}
                  id="two-factor-manage-code"
                  onChange={(event) => {
                    setCode(event.target.value);
                    clearErrors();
                  }}
                  required
                  value={code}
                />
              </label>
              {codeError && (
                <p className="text-sm text-danger" role="alert">
                  {t(codeError)}
                </p>
              )}
              <ActionError error={actionError} />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  disabled={busy}
                  onClick={() => {
                    clearErrors();
                    setPassword("");
                    setCode("");
                    setPhase("overview");
                  }}
                  type="button"
                  variant="ghost"
                >
                  {t("twoFactorCancel")}
                </Button>
                <Button
                  disabled={busy}
                  type="submit"
                  variant={phase === "disable" ? "danger" : "primary"}
                >
                  {busy
                    ? t("twoFactorLoading")
                    : t(
                        phase === "disable"
                          ? "twoFactorConfirmDisable"
                          : "twoFactorConfirmRegenerate",
                      )}
                </Button>
              </div>
            </form>
          )}

          {phase === "codes" && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-subtle p-4 sm:grid-cols-3">
                {backupCodes.map((backupCode) => (
                  <code
                    className="rounded-lg bg-surface px-2 py-2 text-center font-mono text-sm text-ink select-all"
                    key={backupCode}
                  >
                    {backupCode}
                  </code>
                ))}
              </div>
              <ActionError error={actionError} />
              <div className="flex flex-wrap justify-end gap-3">
                <Button onClick={() => void copyCodes()} variant="outline">
                  <Copy aria-hidden="true" className="size-4" />
                  {t(copied ? "twoFactorCopied" : "twoFactorCopyCodes")}
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  {t("twoFactorCodesSaved")}
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ActionError({ error }: { error: ErrorKey | null }) {
  const { t } = useTranslation("settings");
  return error ? (
    <p className="text-sm text-danger" role="alert">
      {t(error)}
    </p>
  ) : null;
}

export function TwoFactorDialog(props: TwoFactorDialogProps) {
  return (
    <TwoFactorDialogContent key={props.open ? "open" : "closed"} {...props} />
  );
}
