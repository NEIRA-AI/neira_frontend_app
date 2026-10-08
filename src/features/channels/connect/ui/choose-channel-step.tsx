import { Info, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { channelOptions } from "../channel-options";

type ChooseChannelStepProps = {
  selected: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onRequestChannel: () => void;
};

export function ChooseChannelStep({
  selected,
  search,
  onSearchChange,
  onSelect,
  onContinue,
  onRequestChannel,
}: ChooseChannelStepProps) {
  const { t } = useTranslation("channelConnect");
  const filteredChannels = channelOptions.filter((channel) =>
    t(channel.label)
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold sm:text-2xl">{t("stepChoose")}</h1>
        <button
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
          onClick={onRequestChannel}
          type="button"
        >
          <Info aria-hidden="true" className="size-4" />
          {t("channelNotFound")}
        </button>
      </div>
      <Card className="border-0 p-4 sm:p-6">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            aria-label={t("searchPlaceholder")}
            className="border-transparent bg-subtle pl-10"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            type="search"
            value={search}
          />
        </div>
        {filteredChannels.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredChannels.map((channel) => (
              <button
                aria-pressed={selected === channel.id}
                className={`flex min-h-[104px] min-w-0 flex-col items-center justify-center gap-3 rounded-xl border p-3 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selected === channel.id ? "border-brand bg-brand-soft" : "border-transparent bg-subtle hover:border-brand-20"}`}
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                type="button"
              >
                <img alt="" height="30" src={channel.icon} width="30" />
                <span>{t(channel.label)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted">
            {t("noSearchResults")}
          </p>
        )}
        <div className="mt-5 flex justify-end border-t border-line pt-5">
          <Button
            className="w-full sm:w-1/2"
            disabled={!selected}
            onClick={onContinue}
          >
            {t("continue")}
          </Button>
        </div>
      </Card>
    </>
  );
}
