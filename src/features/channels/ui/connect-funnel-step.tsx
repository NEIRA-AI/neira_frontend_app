import { LoaderCircle, Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";

import type { ChannelProvider, ValidatedChannel } from "../api/channels-api";
import {
  channelProfileField,
  providerDetails,
} from "../model/channel-presentation";

export function ConnectFunnelStep({
  provider,
  verified,
  funnels,
  funnelId,
  loadingFunnels,
  funnelsError,
  connecting,
  onFunnelChange,
  onCreateFunnel,
  canCreateFunnel,
  onRetryFunnels,
  onBack,
  onFinish,
}: {
  provider: ChannelProvider;
  verified: ValidatedChannel;
  funnels: ReadonlyArray<{ id: string; name: string }>;
  funnelId: string | null;
  loadingFunnels: boolean;
  funnelsError: boolean;
  connecting: boolean;
  onFunnelChange: (id: string | null) => void;
  onCreateFunnel: () => void;
  canCreateFunnel: boolean;
  onRetryFunnels: () => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation("channels");
  const details = providerDetails(provider);
  const providerName =
    channelProfileField(verified.profile, "name") ?? verified.external_id;

  return (
    <>
      <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <img alt="" className="size-6 object-contain" src={details.icon} />
        {t("funnelTitle")}
      </h1>
      <Card className="mt-4 border-0 p-4 sm:p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold">{t("funnelTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {t("funnelOptional")}
            </p>
          </div>
          <div className="rounded-xl bg-brand-soft px-4 py-3">
            <p className="text-xs font-medium text-brand-strong">
              {t("providerIdentity")}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {providerName}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted">
              {verified.external_id}
            </p>
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="channel-funnel"
            >
              {t("funnelLabel")}
            </label>
            <Select
              ariaLabel={t("funnelLabel")}
              className="w-full border-transparent bg-subtle"
              disabled={connecting || loadingFunnels}
              id="channel-funnel"
              onValueChange={(value) =>
                onFunnelChange(value === "none" ? null : value)
              }
              options={[
                { value: "none", label: t("noFunnel") },
                ...funnels.map((funnel) => ({
                  value: funnel.id,
                  label: funnel.name,
                })),
              ]}
              value={funnelId ?? "none"}
            />
            {loadingFunnels && (
              <p className="mt-2 text-xs text-muted" role="status">
                {t("loading")}
              </p>
            )}
            {funnelsError && (
              <div
                className="mt-2 flex items-center gap-2 text-xs text-danger"
                role="alert"
              >
                {t("funnelLoadError")}
                <button
                  aria-label={t("retry")}
                  className="rounded p-1 hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-brand"
                  onClick={onRetryFunnels}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                </button>
              </div>
            )}
          </div>
          {canCreateFunnel && (
            <button
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
              disabled={connecting}
              onClick={onCreateFunnel}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("createFunnel")}
            </button>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button disabled={connecting} onClick={onBack} variant="secondary">
              {t("back")}
            </Button>
            <Button disabled={connecting} onClick={onFinish}>
              {connecting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {t(connecting ? "connecting" : "create")}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
