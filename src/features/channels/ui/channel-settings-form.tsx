import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import type { ChannelRead } from "../api/channels-api";

export function ChannelSettingsForm({
  channel,
  funnels,
  busy,
  canManage,
  onSave,
}: {
  channel: ChannelRead;
  funnels: ReadonlyArray<{ id: string; name: string }>;
  busy: boolean;
  canManage: boolean;
  onSave: (name: string, funnelId: string | null) => void;
}) {
  const { t } = useTranslation("channels");
  const [name, setName] = useState(channel.name);
  const [funnelId, setFunnelId] = useState<string | null>(channel.funnel_id);
  const [submitted, setSubmitted] = useState(false);
  const changed =
    name.trim() !== channel.name || funnelId !== channel.funnel_id;
  const unavailableFunnel =
    funnelId && !funnels.some((funnel) => funnel.id === funnelId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!name.trim() || !changed || busy) return;
    onSave(name.trim(), funnelId);
  }

  return (
    <Card className="border-0 p-4 sm:p-6">
      <h2 className="text-base font-semibold">{t("configuration")}</h2>
      <form className="mt-5 space-y-5" onSubmit={submit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="channel-settings-name"
          >
            {t("channelName")}
          </label>
          <Input
            aria-invalid={submitted && !name.trim()}
            className="border-transparent bg-subtle"
            disabled={!canManage || busy}
            id="channel-settings-name"
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          {submitted && !name.trim() && (
            <p className="mt-1.5 text-sm text-danger" role="alert">
              {t("requiredName")}
            </p>
          )}
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="channel-settings-funnel"
          >
            {t("funnelLabel")}
          </label>
          <Select
            ariaLabel={t("funnelLabel")}
            className="w-full border-transparent bg-subtle"
            disabled={!canManage || busy}
            id="channel-settings-funnel"
            onValueChange={(value) =>
              setFunnelId(value === "none" ? null : value)
            }
            options={[
              { value: "none", label: t("noFunnel") },
              ...(unavailableFunnel
                ? [{ value: funnelId, label: t("unavailable"), disabled: true }]
                : []),
              ...funnels.map((funnel) => ({
                value: funnel.id,
                label: funnel.name,
              })),
            ]}
            value={funnelId ?? "none"}
          />
          <p className="mt-2 text-xs leading-5 text-muted">
            {t("funnelOptional")}
          </p>
        </div>
        {canManage && (
          <div className="flex justify-end border-t border-line pt-5">
            <Button disabled={busy || !changed || !name.trim()} type="submit">
              {t(busy ? "saving" : "save")}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
