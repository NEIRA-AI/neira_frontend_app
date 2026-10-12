import axios from "axios";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { confirmPasswordReset } from "../api/auth-api";
import {
  emailCodeSchema,
  emailSchema,
  newPasswordSchema,
} from "../model/auth-forms";
import { AuthField } from "./auth-field";
import { AuthPageHeading } from "./auth-page-heading";
import { EmailCodeField } from "./email-code-field";
import { PasswordField } from "./password-field";

function initialEmail(search: string): string {
  const email = new URLSearchParams(search).get("email") ?? "";
  return emailSchema.safeParse(email).success ? email : "";
}

export function ResetPasswordForm() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const [email, setEmail] = useState(() => initialEmail(location.search));
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [repeatError, setRepeatError] = useState(false);
  const [submitError, setSubmitError] = useState<
    "invalid" | "requestFailed" | "tryLater" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(event.currentTarget);
    const parsedEmail = emailSchema.safeParse(email);
    const parsedCode = emailCodeSchema.safeParse(code);
    const parsedPassword = newPasswordSchema.safeParse(
      data.get("new_password"),
    );
    const repeatPassword = data.get("repeat_password");
    const passwordsMatch =
      parsedPassword.success && repeatPassword === parsedPassword.data;
    setEmailError(!parsedEmail.success);
    setCodeError(!parsedCode.success);
    setPasswordError(!parsedPassword.success);
    setRepeatError(!passwordsMatch);
    setSubmitError(null);
    if (
      !parsedEmail.success ||
      !parsedCode.success ||
      !parsedPassword.success ||
      !passwordsMatch
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset({
        email: parsedEmail.data,
        code: parsedCode.data,
        new_password: parsedPassword.data,
      });
      setEmail(parsedEmail.data);
      setDone(true);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : null;
      setSubmitError(
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

  if (done) {
    return (
      <div className="w-full max-w-md space-y-6">
        <AuthPageHeading
          description={t("resetPassword.successDescription")}
          title={t("resetPassword.successTitle")}
        />
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
        description={t("resetPassword.description")}
        title={t("resetPassword.title")}
      />
      <form
        className="space-y-5"
        noValidate
        onChange={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;
          if (target.name === "new_password") setPasswordError(false);
          if (target.name === "repeat_password") setRepeatError(false);
        }}
        onSubmit={handleSubmit}
      >
        <AuthField
          error={emailError ? t("validation.emailInvalid") : undefined}
          id="email"
          label={t("common.email")}
        >
          <Input
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={emailError}
            autoComplete="email"
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
        <EmailCodeField
          code={code}
          error={codeError ? t("verify.required") : null}
          onChange={(value) => {
            setCode(value);
            setCodeError(false);
            setSubmitError(null);
          }}
        />
        <PasswordField
          autoComplete="new-password"
          error={passwordError ? t("validation.passwordLength") : undefined}
          id="new_password"
          label={t("resetPassword.newPassword")}
        />
        <PasswordField
          autoComplete="new-password"
          error={repeatError ? t("resetPassword.mismatch") : undefined}
          id="repeat_password"
          label={t("resetPassword.repeatPassword")}
        />
        {submitError && (
          <p
            className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {t(
              submitError === "tryLater"
                ? "common.tryLater"
                : `resetPassword.${submitError}`,
            )}
          </p>
        )}
        <Button
          className="w-full"
          disabled={submitting}
          size="lg"
          type="submit"
        >
          {submitting ? t("common.submitting") : t("resetPassword.submit")}
        </Button>
      </form>
      <p className="text-center">
        <Link
          className="text-sm font-medium text-ink hover:text-brand hover:underline"
          to={ROUTES.FORGOT_PASSWORD}
        >
          {t("resetPassword.restart")}
        </Link>
      </p>
    </div>
  );
}
