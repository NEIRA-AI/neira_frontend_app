import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useLocation } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { validationKey } from "../model/auth-forms";
import {
  invitationAuthDetails,
  invitationSignUpState,
} from "../model/auth-return-path";
import { useSignIn } from "../model/use-sign-in";
import { isSessionRecoveryRequired } from "../model/session-recovery";
import { AuthField } from "./auth-field";
import { AuthInvitationContext } from "./auth-invitation-context";
import { AuthPageHeading } from "./auth-page-heading";
import { PasswordField } from "./password-field";

export function SignInForm({ logoutFailed }: { logoutFailed: boolean }) {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const invitation = invitationAuthDetails(location.state);
  const stateEmail =
    typeof location.state === "object" &&
    location.state !== null &&
    "email" in location.state &&
    typeof location.state.email === "string"
      ? location.state.email
      : "";
  const [email, setEmail] = useState(invitation?.email ?? stateEmail);
  const {
    challengeToken,
    clearFieldError,
    errors,
    handleSubmit,
    resetChallenge,
    setVerificationCode,
    setVerificationError,
    submitError,
    submitting,
    verificationCode,
    verificationError,
    verifyCode,
  } = useSignIn();

  if (challengeToken) {
    return (
      <div className="w-full max-w-md space-y-6">
        <AuthPageHeading
          description={t("twoFactor.description")}
          title={t("twoFactor.title")}
        />
        {invitation && <AuthInvitationContext invitation={invitation} />}
        <form className="space-y-5" noValidate onSubmit={verifyCode}>
          <AuthField
            error={
              verificationError
                ? t(`twoFactor.${verificationError}`)
                : undefined
            }
            id="two-factor-code"
            label={t("twoFactor.codeLabel")}
          >
            <Input
              aria-describedby={
                verificationError ? "two-factor-code-error" : undefined
              }
              aria-invalid={Boolean(verificationError)}
              autoCapitalize="off"
              autoComplete="one-time-code"
              autoCorrect="off"
              autoFocus
              id="two-factor-code"
              inputMode="text"
              maxLength={64}
              onChange={(event) => {
                setVerificationCode(event.target.value);
                setVerificationError(null);
              }}
              placeholder={t("twoFactor.codePlaceholder")}
              required
              value={verificationCode}
            />
          </AuthField>
          <p className="text-sm leading-5 text-muted">
            {t("twoFactor.backupHint")}
          </p>
          <Button
            className="w-full"
            disabled={submitting}
            size="lg"
            type="submit"
          >
            {submitting ? t("common.submitting") : t("twoFactor.submit")}
          </Button>
          <button
            className="w-full text-sm font-medium text-muted hover:text-brand focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
            disabled={submitting}
            onClick={resetChallenge}
            type="button"
          >
            {t("twoFactor.startAgain")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthPageHeading
        description={
          invitation
            ? t("invitation.signInDescription", {
                workspace: invitation.workspaceName,
              })
            : t("login.description")
        }
        title={t("login.title")}
      />

      {invitation && <AuthInvitationContext invitation={invitation} />}

      {isSessionRecoveryRequired() && (
        <p
          className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink"
          role="status"
        >
          {t("login.sessionChanged")}
        </p>
      )}

      <form
        className="space-y-5"
        noValidate
        onChange={clearFieldError}
        onSubmit={handleSubmit}
      >
        {logoutFailed && (
          <p
            className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {t("common.logoutFailed")}
          </p>
        )}
        <AuthField
          id="email"
          label={t("common.email")}
          error={errors.email ? t(validationKey(errors.email)) : undefined}
        >
          <Input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("common.emailPlaceholder")}
            readOnly={Boolean(invitation)}
            required
            type="email"
            value={email}
          />
        </AuthField>

        <div className="space-y-2">
          <PasswordField
            autoComplete="current-password"
            id="password"
            label={t("common.password")}
            error={
              errors.password ? t(validationKey(errors.password)) : undefined
            }
          />
          <p className="text-right text-sm">
            <Link
              className="text-muted hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              state={{ email }}
              to={ROUTES.FORGOT_PASSWORD}
            >
              {t("login.forgotPassword")}
            </Link>
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {submitError && (
            <div
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              <p>{t(submitError)}</p>
              {submitError === "login.emailUnverified" && (
                <Link
                  className="mt-2 inline-block font-medium underline underline-offset-2 hover:text-ink"
                  state={{ email, invitation }}
                  to={ROUTES.VERIFY}
                >
                  {t("login.verifyEmail")}
                </Link>
              )}
            </div>
          )}
          <Button
            className="w-full"
            disabled={submitting}
            size="lg"
            type="submit"
          >
            {submitting ? t("common.submitting") : t("login.submit")}
          </Button>
          <p className="text-center text-sm text-muted">
            {t("login.noAccount")}{" "}
            <Link
              className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              state={
                invitation ? invitationSignUpState(invitation) : location.state
              }
              to={ROUTES.SIGN_UP}
            >
              {t("login.signUp")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
