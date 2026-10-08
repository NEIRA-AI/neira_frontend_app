import { useTranslation } from "react-i18next";

import type { StatusRead } from "../api/funnels-api";

type StatusColor = StatusRead["color"];

const statusColors = [
  "violet",
  "blue",
  "cyan",
  "mint",
  "amber",
  "coral",
  "pink",
  "slate",
] as const satisfies readonly StatusColor[];

const colorLabels = {
  violet: "colorViolet",
  blue: "colorBlue",
  cyan: "colorCyan",
  mint: "colorMint",
  amber: "colorAmber",
  coral: "colorCoral",
  pink: "colorPink",
  slate: "colorSlate",
} as const satisfies Record<StatusColor, string>;

export function StatusColorPicker({
  value,
  onChange,
  name,
  disabled = false,
  compact = false,
}: {
  value: StatusColor;
  onChange: (color: StatusColor) => void;
  name: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation("funnels");

  return (
    <fieldset disabled={disabled}>
      <legend
        className={compact ? "sr-only" : "mb-3 text-sm font-semibold text-ink"}
      >
        {t("color")}
      </legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {statusColors.map((color) => (
          <label
            className={`group relative flex size-9 items-center justify-center rounded-full ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
            key={color}
            title={t(colorLabels[color])}
          >
            <input
              checked={value === color}
              className="peer sr-only"
              name={name}
              onChange={() => onChange(color)}
              type="radio"
              value={color}
            />
            <span
              aria-hidden="true"
              className={`size-7 rounded-full border border-ink/10 transition-transform group-hover:scale-110 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand ${value === color ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
              style={{ backgroundColor: `var(--funnel-${color})` }}
            />
            <span className="sr-only">{t(colorLabels[color])}</span>
          </label>
        ))}
      </div>
      {!compact && (
        <p className="mt-2 text-xs text-muted">{t(colorLabels[value])}</p>
      )}
    </fieldset>
  );
}
