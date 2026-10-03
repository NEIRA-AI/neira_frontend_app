import { cn } from "@/shared/lib/cn";

export function MaskIcon({
  className,
  src,
}: {
  className?: string;
  src: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-4 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
        className,
      )}
      style={{ maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }}
    />
  );
}
