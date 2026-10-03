import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink outline-none",
        "placeholder:text-muted/70 focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15",
        "disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
});
