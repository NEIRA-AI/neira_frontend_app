import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { resendEmailVerification, verifyEmail } from "../api/auth-api";
import { emailCodeSchema, emailSchema } from "../model/auth-forms";
import { invitationAuthDetails } from "../model/auth-return-path";
import { AuthField } from "./auth-field";
import { AuthInvitationContext } from "./auth-invitation-context";
import { AuthPageHeading } from "./auth-page-heading";
import { EmailCodeField } from "./email-code-field";

function initialEmail(state: unknown): string {
  if (typeof state !== "object" || state === null || !("email" in state))
    return "";
  return typeof state.email === "string" ? state.email : "";
}

export function VerifyForm() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const invitation = invitationAuthDetails(location.state);
  const [email, setEmail] = useState(() => initialEmail(location.state));
  const [code, setCode] = useState("");
  const [error, setError] = useState<
    "required" | "invalid" | "requestFailed" | "tryLater" | null
  >(null);
  const [emailError, setEmailError] = useState(false);
  const [resendMessage, setResendMessage] = useState<
    "resendSuccess" | "requestFailed" | "tryLater" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [invitationUnavailable, setInvitationUnavailable] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timeout = window.setTimeout(
      () => setResendCooldown(resendCooldown - 1),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const parsedEmail = emailSchema.safeParse(email);
    const parsedCode = emailCodeSchema.safeParse(code);
    setEmailError(!parsedEmail.success);
    setError(parsedCode.success ? null : "required");
    if (!parsedEmail.success || !parsedCode.success) return;

    setSubmitting(true);
    try {
      const result = await verifyEmail({
        email: parsedEmail.data,
        code: parsedCode.data,
      });
      setEmail(parsedEmail.data);
      setInvitationUnavailable(result.invitation_status === "unavailable");
      setVerified(true);
    } catch (failure) {
      const status = axios.isAxiosError(failure)
        ? failure.response?.status
        : null;
      setError(
        status === 429
          ? "tryLater"
          : status === 400 || status === 404 || status === 410 || status === 422
            ? "invalid"
            : "requestFailed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (resending || resendCooldown > 0) return;
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setEmailError(true);
      return;
    }
    setResending(true);
    setResendMessage(null);
    try {
      await resendEmailVerification(parsedEmail.data);
      setResendMessage("resendSuccess");
      setResendCooldown(60);
    } catch (failure) {
      setResendMessage(
        axios.isAxiosError(failure) && failure.response?.status === 429
          ? "tryLater"
          : "requestFailed",
      );
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <div className="w-full max-w-md space-y-6">
        <AuthPageHeading
          description={t("verify.successDescription")}
          title={t("verify.successTitle")}
        />
        {invitationUnavailable && (
          <p
            className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink"
            role="status"
          >
            {t("verify.invitationUnavailable")}
          </p>
        )}
        <Button asChild className="w-full" size="lg">
          <Link state={{ email }} to={ROUTES.SIGN_IN}>
            {t("resetPassword.signIn")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthPageHeading
        description={t("verify.description")}
        title={t("verify.title")}
      />
      {invitation && <AuthInvitationContext invitation={invitation} />}
      {emailSchema.safeParse(email).success && (
        <p className="text-center text-sm text-muted">
          {t("verify.sentTo", { email })}
        </p>
      )}
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthField
          error={emailError ? t("validation.emailInvalid") : undefined}
          id="email"
          label={t("verify.emailLabel")}
        >
          <Input
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={emailError}
            autoComplete="email"
            disabled={submitting}
            id="email"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(false);
            }}
            required
            type="email"
            value={email}
          />
        </AuthField>
        <EmailCodeField
          code={code}
          disabled={submitting}
          error={
            error
              ? t(error === "tryLater" ? "common.tryLater" : `verify.${error}`)
              : null
          }
          onChange={(value) => {
            setCode(value);
            setError(null);
          }}
        />
        <Button
          className="w-full"
          disabled={submitting}
          size="lg"
          type="submit"
        >
          {submitting ? t("common.submitting") : t("verify.submit")}
        </Button>
      </form>
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted">{t("verify.codeNotReceived")}</p>
        <Button
          className="w-full"
          disabled={resending || resendCooldown > 0}
          onClick={() => void resend()}
          size="lg"
          variant="secondary"
        >
          {resendCooldown > 0
            ? `${t("verify.resend")} (${resendCooldown})`
            : t("verify.resend")}
        </Button>
        {resendMessage && (
          <p
            className={
              resendMessage === "resendSuccess"
                ? "text-sm text-brand"
                : "text-sm text-danger"
            }
            role={resendMessage === "resendSuccess" ? "status" : "alert"}
          >
            {t(
              resendMessage === "tryLater"
                ? "common.tryLater"
                : `verify.${resendMessage}`,
            )}
          </p>
        )}
        <Link
          className="inline-block text-sm font-medium text-ink hover:text-brand hover:underline"
          to={ROUTES.SIGN_IN}
        >
          {t("verify.backToSignIn")}
        </Link>
      </div>
    </div>
  );
}
