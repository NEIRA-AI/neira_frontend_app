import { useTranslation } from "react-i18next";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { StatusPage } from "@/shared/ui/status-page";

export function ErrorScreen() {
  const { t } = useTranslation("error");

  return (
    <StatusPage
      actions={
        <>
          <Button
            className="w-full sm:w-auto"
            size="lg"
            onClick={() => window.location.reload()}
          >
            {t("reload")}
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
            size="lg"
            variant="outline"
          >
            <a href={ROUTES.HOME}>{t("home")}</a>
          </Button>
        </>
      }
      description={t("description")}
      symbol=":("
      symbolSize="compact"
      title={t("title")}
    />
  );
}
