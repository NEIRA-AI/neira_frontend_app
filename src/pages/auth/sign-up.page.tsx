import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/shared/routes";
import { Input } from "@/shared/ui/input";

import { AuthField } from "./ui/auth-field";
import { AuthPageHeading } from "./ui/auth-page-heading";
import { ConsentCheckbox } from "./ui/consent-checkbox";
import { PasswordField } from "./ui/password-field";
import { PreviewForm } from "./ui/preview-form";

const termsUrl = "https://neira.sale/oferta";
const privacyUrl = "https://neira.sale/privacy";
const consentUrl = "/agreement-on-processing-personal-data-neira-sale.docx";

const documentLinkClassName =
  "text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand";

function SignUpPage() {
  const { t } = useTranslation("auth");

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthPageHeading
        description={t("register.description")}
        title={t("register.title")}
      />

      <PreviewForm
        afterSubmit={
          <p className="text-center text-sm text-muted">
            {t("register.haveAccount")}{" "}
            <Link
              className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              to={ROUTES.SIGN_IN}
            >
              {t("register.signIn")}
            </Link>
          </p>
        }
        className="space-y-4"
        submitLabel={t("register.submit")}
      >
        <AuthField id="name" label={t("register.name")}>
          <Input
            autoComplete="name"
            id="name"
            name="name"
            placeholder={t("register.namePlaceholder")}
            required
          />
        </AuthField>

        <AuthField id="email" label={t("common.email")}>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            placeholder={t("common.emailPlaceholder")}
            required
            type="email"
          />
        </AuthField>

        <AuthField id="telegram" label={t("register.telegram")}>
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-4 flex items-center text-muted"
            >
              @
            </span>
            <Input
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
        />

        <div className="space-y-3 py-1">
          <ConsentCheckbox name="accept_oferta">
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
          <ConsentCheckbox name="accept_privacy">
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
        </div>
      </PreviewForm>
    </div>
  );
}

export const Component = SignUpPage;
