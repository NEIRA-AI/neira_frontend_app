import { Link, useNavigate, useNavigationType } from "react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import { StatusPage } from "@/shared/ui/status-page";

export function NotFoundPage() {
  const { t } = useTranslation("notFound");
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  return (
    <StatusPage
      actions={
        <>
          <Button asChild className="w-full sm:w-auto" size="lg">
            <Link to={ROUTES.HOME}>{t("backToHome")}</Link>
          </Button>
          {navigationType === "PUSH" && (
            <Button
              className="w-full sm:w-auto"
              size="lg"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t("goBack")}
            </Button>
          )}
        </>
      }
      description={t("description")}
      symbol="404"
      title={`${t("title")}\u00a0:(`}
    />
  );
}
