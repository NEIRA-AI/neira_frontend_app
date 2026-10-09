import { Copy, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import telegramIcon from "../../assets/telegram.png";
import type { ChannelOption } from "../channel-options";
import { AgentSelect } from "./agent-select";
import { ChannelHeading } from "./channel-heading";

type ConnectAgentStepProps = {
  channel: ChannelOption;
  agentId: string;
  finishing: boolean;
  onAgentChange: (agentId: string) => void;
  onCreateAgent: () => void;
  onBack: () => void;
  onFinish: () => void;
};

export function ConnectAgentStep({
  channel,
  agentId,
  finishing,
  onAgentChange,
  onCreateAgent,
  onBack,
  onFinish,
}: ConnectAgentStepProps) {
  const { t } = useTranslation("channelConnectPreview");

  return (
    <>
      <ChannelHeading active channel={channel} />
      <Card className="space-y-5 border-0 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{t("agentTitle")}</h2>
          <button
            className="text-sm text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
            onClick={onCreateAgent}
            type="button"
          >
            {t("createAgent")}
          </button>
        </div>
        <AgentSelect
          onCreate={onCreateAgent}
          onValueChange={onAgentChange}
          value={agentId}
        />
        <div className="flex gap-2 rounded-xl bg-brand-soft p-4 text-sm text-brand">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t("agentInfo")}</p>
        </div>
        {agentId && (
          <div className="space-y-4 border-t border-line pt-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted">{t("agentId")}</span>
              <span aria-label={t("agentIdUnavailable")}>—</span>
              <button
                aria-label={t("copyAgentId")}
                className="rounded text-muted disabled:cursor-not-allowed disabled:opacity-40"
                disabled
                title={t("agentIdUnavailable")}
                type="button"
              >
                <Copy aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted">{t("connectedChannels")}</span>
              <span className="inline-flex items-center gap-1.5">
                <img alt="" height="18" src={telegramIcon} width="18" />
                {t("telegramBot")}
              </span>
              <span className="text-muted">/</span>
              <span>{t("mainTelegram")}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted">{t("publicationStatus")}</span>
              <Badge>{t("stopped")}</Badge>
            </div>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Button onClick={onBack} variant="secondary">
            {t("cancel")}
          </Button>
          <Button disabled={!agentId || finishing} onClick={onFinish}>
            {t("connectAgent")}
          </Button>
        </div>
        <p className="text-xs text-muted">{t("previewNotice")}</p>
      </Card>
    </>
  );
}
