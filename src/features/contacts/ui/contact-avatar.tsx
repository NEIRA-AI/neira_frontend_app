import { useState } from "react";

type ContactAvatarProps = {
  name: string;
  language: string;
  url?: string | null;
  size?: "sm" | "lg";
};

export function ContactAvatar({
  name,
  language,
  url,
  size = "sm",
}: ContactAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initial =
    Array.from(name.trim())[0]?.toLocaleUpperCase(language) ?? "?";
  const sizeClass = size === "lg" ? "size-16 text-2xl" : "size-10 text-sm";

  return (
    <span
      aria-hidden="true"
      className={`grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand-strong`}
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
