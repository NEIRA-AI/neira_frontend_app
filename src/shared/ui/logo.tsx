import { cn } from "@/shared/lib/cn";

type LogoProps = {
  className?: string;
  variant?: "dark" | "light" | "mark";
};

export function NeiraLogo({ className, variant = "dark" }: LogoProps) {
  return (
    <img
      alt="NEIRA"
      className={cn(
        "block h-auto shrink-0",
        variant === "mark" ? "w-8" : "w-24",
        variant === "light" && "brightness-0 invert",
        variant === "dark" && "dark:invert",
        className,
      )}
      height={variant === "mark" ? 32 : 24}
      src={
        variant === "mark" ? "/images/neira-mark.svg" : "/images/neira-logo.svg"
      }
      width={variant === "mark" ? 36 : 100}
    />
  );
}
