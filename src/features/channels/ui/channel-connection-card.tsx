import { CircleAlert, CircleCheck, CirclePause, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import type { ChannelRead } from "../api/channels-api";
import { channelFailureKey } from "../model/channel-error";
import { formatCheckTime } from "../model/channel-presentation";

function statusMessage(channel: ChannelRead) {
  switch (channel.status) {
    case "active":
      return "connectionActive" as const;
    case "disconnected":
      return "connectionStopped" as const;
    case "needs_reconnect":
      return "connectionNeedsReconnect" as const;
    case "pending":
      return "connectionPending" as const;
  }
}

export function ChannelConnectionCard({
  channel,
  canManage,
  busy,
  onCheck,
  onRefresh,
  onReconnect,
}: {
  channel: ChannelRead;
  canManage: boolean;
  busy: boolean;
  onCheck: () => void;
  onRefresh: () => void;
  onReconnect: () => void;
}) {
  const { t, i18n } = useTranslation("channels");
  const { hash } = useLocation();
  const active = channel.status === "active";
  const issue = channelFailureKey(channel.last_error_code);
  const healthy = active && !issue;
  const hasAccess = active || channel.status === "pending";
  const Icon = healthy
    ? CircleCheck
    : channel.status === "disconnected" && !issue
      ? CirclePause
      : CircleAlert;
  const lastChecked = formatCheckTime(channel.last_checked_at, i18n.language);

  useEffect(() => {
    if (hash === "#connection") {
      document.getElementById("connection")?.scrollIntoView({ block: "start" });
    }
  }, [hash, channel.id]);

  return (
    <Card className="scroll-mt-24 border-0 p-4 sm:p-6" id="connection">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("connection")}</h2>
        {lastChecked && (
          <span className="text-xs text-muted">
            {t("lastChecked", { date: lastChecked })}
          </span>
        )}
      </div>
      <div
        className={`mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${healthy ? "bg-success-soft text-success-ink" : channel.status === "disconnected" && !issue ? "bg-subtle text-muted-strong" : active || channel.status === "pending" || channel.status === "disconnected" ? "bg-warning-soft text-warning-ink" : "bg-danger-soft text-danger"}`}
      >
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>{t(issue ?? statusMessage(channel))}</span>
      </div>
      {canManage && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={busy || !hasAccess}
            onClick={onCheck}
            size="sm"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t("check")}
          </Button>
          <Button
            disabled={busy || !hasAccess}
            onClick={onRefresh}
            size="sm"
            variant="outline"
          >
            {t("refresh")}
          </Button>
          <Button
            disabled={busy}
            onClick={onReconnect}
            size="sm"
            variant="secondary"
          >
            {t("reconnect")}
          </Button>
        </div>
      )}
    </Card>
  );
}
