import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { StatusPage } from "@/shared/ui/status-page";

import { errorTranslations } from "./i18n/translations";

export function BootstrapErrorScreen() {
  const copy = errorTranslations.ru;

  return (
    <StatusPage
      actions={
        <>
          <Button
            className="w-full sm:w-auto"
            size="lg"
            onClick={() => window.location.reload()}
          >
            {copy.reload}
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
            size="lg"
            variant="outline"
          >
            <a href={ROUTES.HOME}>{copy.home}</a>
          </Button>
        </>
      }
      description={copy.description}
      symbol=":("
      symbolSize="compact"
      title={copy.title}
    />
  );
}
