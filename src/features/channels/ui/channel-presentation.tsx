import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";

import type { ChannelStatus } from "../api/channels-api";

export function ChannelStatusBadge({ status }: { status: ChannelStatus }) {
  const { t } = useTranslation("channels");
  switch (status) {
    case "active":
      return <Badge tone="success">{t("active")}</Badge>;
    case "disconnected":
      return <Badge tone="warning">{t("disconnected")}</Badge>;
    case "needs_reconnect":
      return <Badge tone="danger">{t("needsReconnect")}</Badge>;
    case "pending":
      return <Badge tone="brandSoft">{t("pending")}</Badge>;
  }
}
