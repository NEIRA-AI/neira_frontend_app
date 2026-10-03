import { useTranslation } from "react-i18next";

import { LoadingScreen } from "@/shared/ui/loading-screen";

export function RouteLoadingScreen() {
  const { t } = useTranslation("app");
  return <LoadingScreen label={t("loading")} />;
}
