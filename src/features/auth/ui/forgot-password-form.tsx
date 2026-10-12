import axios from "axios";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { requestPasswordReset } from "../api/auth-api";
import { emailSchema } from "../model/auth-forms";
import { AuthField } from "./auth-field";
import { AuthPageHeading } from "./auth-page-heading";

function stateEmail(state: unknown): string {
  if (typeof state !== "object" || state === null || !("email" in state))
    return "";
  return typeof state.email === "string" ? state.email : "";
}

export function ForgotPasswordForm() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const [email, setEmail] = useState(() => stateEmail(location.state));
  const [emailError, setEmailError] = useState(false);
  const [submitError, setSubmitError] = useState<
    "tryLater" | "requestFailed" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const parsedEmail = emailSchema.safeParse(email);
    setEmailError(!parsedEmail.success);
    if (!parsedEmail.success) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await requestPasswordReset(parsedEmail.data);
      setEmail(parsedEmail.data);
      setSent(true);
    } catch (error) {
      setSubmitError(
        axios.isAxiosError(error) && error.response?.status === 429
          ? "tryLater"
          : "requestFailed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-6">
        <AuthPageHeading
          description={t("forgotPassword.sentDescription", { email })}
          title={t("forgotPassword.sentTitle")}
        />
        <Button asChild className="w-full" size="lg">
          <Link
            state={location.state}
            to={`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`}
          >
            {t("forgotPassword.goToReset")}
          </Link>
        </Button>
        <p className="text-center">
          <Link
            className="text-sm font-medium text-ink hover:text-brand hover:underline"
            state={location.state}
            to={ROUTES.SIGN_IN}
          >
            {t("forgotPassword.backToSignIn")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthPageHeading
        description={t("forgotPassword.description")}
        title={t("forgotPassword.title")}
      />
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <AuthField
          error={emailError ? t("validation.emailInvalid") : undefined}
          id="email"
          label={t("common.email")}
        >
          <Input
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={emailError}
            autoComplete="email"
            autoFocus
            id="email"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(false);
            }}
            placeholder={t("common.emailPlaceholder")}
            required
            type="email"
            value={email}
          />
        </AuthField>
        {submitError && (
          <p
            className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {t(
              submitError === "tryLater"
                ? "common.tryLater"
                : "common.requestFailed",
            )}
          </p>
        )}
        <Button
          className="w-full"
          disabled={submitting}
          size="lg"
          type="submit"
        >
          {submitting ? t("common.submitting") : t("forgotPassword.submit")}
        </Button>
      </form>
      <p className="text-center">
        <Link
          className="text-sm font-medium text-ink hover:text-brand hover:underline"
          state={location.state}
          to={ROUTES.SIGN_IN}
        >
          {t("forgotPassword.backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
