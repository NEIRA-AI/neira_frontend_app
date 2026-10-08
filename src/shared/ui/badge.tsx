import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "brand" | "brandSoft" | "warning" | "danger";
};

const tones = {
  neutral: "bg-subtle text-muted dark:text-muted-strong",
  success: "bg-success-soft text-success-ink",
  brand: "bg-brand-fill text-on-brand",
  brandSoft: "bg-brand-soft text-brand-strong",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger",
} as const;

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
