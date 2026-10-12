import { useState } from "react";

export function ChatAvatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase() ?? "?";
  const sizeClass =
    size === "sm"
      ? "size-8 text-xs"
      : size === "lg"
        ? "size-12 text-base"
        : size === "xl"
          ? "size-20 text-2xl"
          : "size-10 text-sm";

  return (
    <span
      aria-hidden="true"
      className={`grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand`}
    >
      {url && url !== failedUrl ? (
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailedUrl(url)}
          src={url}
        />
      ) : (
        initial
      )}
    </span>
  );
}
