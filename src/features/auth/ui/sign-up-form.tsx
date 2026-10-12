import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { validationKey } from "../model/auth-forms";
import {
  invitationAuthDetails,
  invitationSignInState,
} from "../model/auth-return-path";
import { useSignUp } from "../model/use-sign-up";
import { AuthField } from "./auth-field";
import { AuthInvitationContext } from "./auth-invitation-context";
import { AuthPageHeading } from "./auth-page-heading";
import { ConsentCheckbox } from "./consent-checkbox";
import { PasswordField } from "./password-field";

const termsUrl = "https://neira.sale/oferta";
const privacyUrl = "https://neira.sale/privacy";
const consentUrl = "/agreement-on-processing-personal-data-neira-sale.docx";

const documentLinkClassName =
  "text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand";

export function SignUpForm() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const invitation = invitationAuthDetails(location.state);
  const { clearFieldError, errors, handleSubmit, submitError, submitting } =
    useSignUp(invitation);

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthPageHeading
        description={
          invitation
            ? t("invitation.signUpDescription", {
                workspace: invitation.workspaceName,
              })
            : t("register.description")
        }
        title={t("register.title")}
      />

      {invitation && <AuthInvitationContext invitation={invitation} />}

      <form
        className="space-y-4"
        noValidate
        onChange={clearFieldError}
        onSubmit={handleSubmit}
      >
        <AuthField
          id="name"
          label={t("register.name")}
          error={errors.name ? t(validationKey(errors.name)) : undefined}
        >
          <Input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            id="name"
            name="name"
            placeholder={t("register.namePlaceholder")}
            required
          />
        </AuthField>

        <AuthField
          id="email"
          label={t("common.email")}
          error={errors.email ? t(validationKey(errors.email)) : undefined}
        >
          <Input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            defaultValue={invitation?.email}
            id="email"
            name="email"
            placeholder={t("common.emailPlaceholder")}
            readOnly={Boolean(invitation)}
            required
            type="email"
          />
        </AuthField>

        <AuthField
          id="telegram"
          label={t("register.telegram")}
          error={
            errors.telegram ? t(validationKey(errors.telegram)) : undefined
          }
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-4 flex items-center text-muted"
            >
              @
            </span>
            <Input
              aria-describedby={errors.telegram ? "telegram-error" : undefined}
              aria-invalid={Boolean(errors.telegram)}
              autoComplete="off"
              className="pl-9"
              id="telegram"
              name="telegram"
              placeholder={t("register.telegramPlaceholder")}
              type="text"
            />
          </div>
        </AuthField>

        <PasswordField
          autoComplete="new-password"
          id="password"
          label={t("common.password")}
          error={
            errors.password ? t(validationKey(errors.password)) : undefined
          }
        />

        <div className="space-y-3 py-1">
          <ConsentCheckbox
            name="accept_oferta"
            invalid={Boolean(errors.accepted_terms)}
          >
            <label className="cursor-pointer" htmlFor="accept_oferta">
              {t("register.acceptOfertaPrefix")}{" "}
            </label>
            <a
              className={documentLinkClassName}
              href={termsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("register.termsOfUseLink")}
            </a>
          </ConsentCheckbox>
          <ConsentCheckbox
            name="accept_privacy"
            invalid={Boolean(errors.accepted_privacy)}
          >
            <label className="cursor-pointer" htmlFor="accept_privacy">
              {t("register.acceptPrivacyPrefix")}{" "}
            </label>
            <a
              className={documentLinkClassName}
              href={consentUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("register.personalDataConsentLink")}
            </a>{" "}
            {t("register.privacyConnector")}{" "}
            <a
              className={documentLinkClassName}
              href={privacyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("register.privacyPolicyLink")}
            </a>
          </ConsentCheckbox>
          {(errors.accepted_terms || errors.accepted_privacy) && (
            <p className="text-sm text-danger" role="alert">
              {t("validation.consentRequired")}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-1">
          {submitError && (
            <p
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {t(submitError)}
            </p>
          )}
          <Button
            className="w-full"
            disabled={submitting}
            size="lg"
            type="submit"
          >
            {submitting ? t("common.submitting") : t("register.submit")}
          </Button>
          <p className="text-center text-sm text-muted">
            {t("register.haveAccount")}{" "}
            <Link
              className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              state={
                invitation ? invitationSignInState(invitation) : location.state
              }
              to={ROUTES.SIGN_IN}
            >
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
