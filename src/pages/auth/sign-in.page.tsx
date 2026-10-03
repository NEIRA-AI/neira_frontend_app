import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/shared/routes";
import { Input } from "@/shared/ui/input";

import { AuthField } from "./ui/auth-field";
import { AuthPageHeading } from "./ui/auth-page-heading";
import { PasswordField } from "./ui/password-field";
import { PreviewForm } from "./ui/preview-form";

function SignInPage() {
  const { t } = useTranslation("auth");

  return (
    <div className="w-full max-w-md space-y-8">
      <AuthPageHeading
        description={t("login.description")}
        title={t("login.title")}
      />

      <PreviewForm
        afterSubmit={
          <p className="text-center text-sm text-muted">
            {t("login.noAccount")}{" "}
            <Link
              className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              to={ROUTES.SIGN_UP}
            >
              {t("login.signUp")}
            </Link>
          </p>
        }
        className="space-y-5"
        submitLabel={t("login.submit")}
      >
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

        <div className="space-y-2">
          <PasswordField
            autoComplete="current-password"
            id="password"
            label={t("common.password")}
          />
          <p className="text-right text-sm text-muted">
            {t("login.forgotPassword")}
          </p>
        </div>
      </PreviewForm>
    </div>
  );
}

export const Component = SignInPage;
