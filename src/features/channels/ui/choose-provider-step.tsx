import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import type { ChannelProvider } from "../api/channels-api";
import { channelProviders } from "../model/channel-presentation";

export function ChooseProviderStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ChannelProvider | null;
  onSelect: (provider: ChannelProvider) => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation("channels");
  const [search, setSearch] = useState("");
  const filtered = channelProviders.filter((provider) =>
    t(provider.label)
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );

  return (
    <>
      <h1 className="text-xl font-bold sm:text-2xl">{t("chooseTitle")}</h1>
      <Card className="mt-4 border-0 p-4 sm:p-6">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            aria-label={t("search")}
            className="border-transparent bg-subtle pl-10"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            type="search"
            value={search}
          />
        </div>
        {filtered.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filtered.map((provider) => (
              <button
                aria-pressed={selected === provider.id}
                className={`flex min-h-28 min-w-0 flex-col items-center justify-center gap-3 rounded-xl border p-3 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selected === provider.id ? "border-brand bg-brand-soft" : "border-transparent bg-subtle hover:border-brand-20"}`}
                key={provider.id}
                onClick={() => onSelect(provider.id)}
                type="button"
              >
                <img
                  alt=""
                  className="size-8 object-contain"
                  src={provider.icon}
                />
                <span>{t(provider.label)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted">
            {t("noResults")}
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
