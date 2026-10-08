import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

const variants = {
  primary:
    "bg-brand-fill text-on-brand shadow-sm hover:bg-brand-hover active:bg-brand-hover/90",
  secondary: "bg-brand-soft text-brand hover:bg-brand-soft/70",
  outline: "border border-line bg-surface text-ink hover:bg-page",
  ghost: "text-ink hover:bg-subtle",
  danger: "bg-danger-fill text-on-brand hover:bg-danger-fill/90",
} as const;

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      asChild = false,
      className,
      size = "md",
      type,
      variant = "primary",
      ...props
    },
    ref,
  ) {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        type={asChild ? undefined : (type ?? "button")}
        {...props}
      />
    );
  },
);
