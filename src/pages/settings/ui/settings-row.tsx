import type { ReactNode } from "react";

type SettingsRowProps = {
  label: ReactNode;
  children: ReactNode;
  divider?: boolean;
};

export function SettingsRow({
  label,
  children,
  divider = false,
}: SettingsRowProps) {
  return (
    <div
      className={`flex min-h-15 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6 ${divider ? "border-t border-line" : ""}`}
    >
      <span className="font-bold text-ink">{label}</span>
      <div className="min-w-0 text-right font-bold text-muted">{children}</div>
    </div>
  );
}
