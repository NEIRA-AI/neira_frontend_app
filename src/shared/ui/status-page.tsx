import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { NeiraLogo } from "@/shared/ui/logo";

type StatusPageProps = {
  actions: ReactNode;
  description: string;
  symbol: string;
  symbolSize?: "default" | "compact";
  title: string;
};

export function StatusPage({
  actions,
  description,
  symbol,
  symbolSize = "default",
  title,
}: StatusPageProps) {
  return (
    <main className="relative isolate grid min-h-screen min-h-dvh place-items-center overflow-hidden bg-page px-4 py-12">
      <div
        aria-hidden="true"
        className="status-page-backdrop pointer-events-none absolute inset-0"
      />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <NeiraLogo className="w-24" />
        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <span
            className={cn(
              "font-mono leading-none font-black tracking-tight text-ink",
              symbolSize === "compact"
                ? "text-5xl sm:text-7xl"
                : "text-6xl sm:text-8xl",
            )}
          >
            {symbol}
          </span>
          <span
            aria-hidden="true"
            className="hidden h-24 w-px bg-linear-to-b from-brand/20 via-brand to-brand/20 sm:block"
          />
          <h1 className="max-w-full text-balance text-2xl leading-tight font-semibold text-ink sm:text-left sm:text-3xl sm:whitespace-nowrap">
            {title}
          </h1>
        </div>
        <p className="mt-6 max-w-md text-sm leading-6 text-muted sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {actions}
        </div>
      </div>
    </main>
  );
}
