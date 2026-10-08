import { cn } from "@/shared/lib/cn";
import { NeiraLogo } from "@/shared/ui/logo";
import { useTranslation } from "react-i18next";

type LoadingScreenProps = {
  className?: string;
  label?: string;
};

export function LoadingScreen({ className, label }: LoadingScreenProps) {
  const { t } = useTranslation("app");

  const loadingLabel = label ?? t("loading");

  return (
    <div
      className={cn(
        "grid min-h-screen min-h-dvh w-full place-items-center bg-page px-6 py-12",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-7" role="status">
        <div aria-hidden="true" className="relative size-16">
          <NeiraLogo
            className="absolute top-1/2 left-1/2 w-7 -translate-x-1/2 -translate-y-1/2"
            variant="mark"
          />
          <svg
            className="size-16 motion-safe:animate-[spin_2.5s_linear_infinite]"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32"
              cy="32"
              fill="none"
              r="27"
              stroke="currentColor"
              strokeWidth="5"
              className="text-brand/15"
            />
            <path
              d="M 32 5 A 27 27 0 0 1 59 32"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="5"
              className="text-brand"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <NeiraLogo className="w-24" />
          <span className="text-sm text-muted">{loadingLabel}</span>
        </div>
      </div>
    </div>
  );
}
