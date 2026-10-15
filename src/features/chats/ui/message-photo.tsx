import { ImageOff, LoaderCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

type MessagePart = ChatMessage["parts"][number];
type PhotoState = "loading" | "refreshing" | "ready" | "error";

function usablePhotoUrl(part: MessagePart): string | null {
  if (!part.media_url || !part.media_url_expires_at) return null;
  const expiresAt = Date.parse(part.media_url_expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + 15_000)
    return null;
  try {
    const url = new URL(part.media_url);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function photoAspectRatio(part: MessagePart): number {
  if (!part.width || !part.height) return 4 / 3;
  return Math.max(0.7, Math.min(1.8, part.width / part.height));
}

export function MessagePhoto({
  layout = "single",
  onOpen,
  openLabel,
  part,
  refreshMessage,
}: {
  layout?: "single" | "tile" | "viewer";
  onOpen?: () => void;
  openLabel?: string;
  part: MessagePart;
  refreshMessage: () => Promise<ChatMessage>;
}) {
  const { t } = useTranslation("chats");
  const [imageUrl, setImageUrl] = useState(() => usablePhotoUrl(part));
  const [state, setState] = useState<PhotoState>(
    imageUrl ? "loading" : "refreshing",
  );
  const [loadVersion, setLoadVersion] = useState(0);
  const mountedRef = useRef(false);
  const refreshingRef = useRef(false);
  const autoRefreshedRef = useRef(imageUrl === null);
  const needsInitialRefreshRef = useRef(imageUrl === null);

  const refreshUrl = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setImageUrl(null);
    setState("refreshing");
    try {
      const message = await refreshMessage();
      const freshPart = message.parts.find(
        (item) => item.id === part.id && item.kind === "image",
      );
      const freshUrl = freshPart ? usablePhotoUrl(freshPart) : null;
      if (!freshUrl) throw new Error("Photo URL unavailable");
      if (mountedRef.current) {
        setImageUrl(freshUrl);
        setLoadVersion((value) => value + 1);
        setState("loading");
      }
    } catch {
      if (mountedRef.current) setState("error");
    } finally {
      refreshingRef.current = false;
    }
  }, [part.id, refreshMessage]);

  useEffect(() => {
    mountedRef.current = true;
    if (needsInitialRefreshRef.current) {
      needsInitialRefreshRef.current = false;
      void refreshUrl();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [refreshUrl]);

  const canOpen = Boolean(onOpen) && layout !== "viewer";
  const image = imageUrl && (
    <img
      alt={canOpen ? "" : t("photoAlt")}
      className={
        layout === "viewer"
          ? "block h-auto w-auto max-h-full max-w-full object-contain"
          : `h-full w-full ${layout === "tile" ? "object-cover" : "object-contain"}`
      }
      decoding="async"
      data-viewer-photo={layout === "viewer" ? true : undefined}
      height={part.height ?? undefined}
      key={`${imageUrl}:${loadVersion}`}
      loading="lazy"
      onError={() => {
        if (autoRefreshedRef.current) {
          setState("error");
        } else {
          autoRefreshedRef.current = true;
          void refreshUrl();
        }
      }}
      onLoad={() => setState("ready")}
      referrerPolicy="no-referrer"
      src={imageUrl}
      width={part.width ?? undefined}
    />
  );

  return (
    <div
      className={`relative max-w-full overflow-hidden ${layout === "viewer" ? "bg-transparent" : "bg-subtle"} ${layout === "single" ? "w-[min(78vw,22rem)]" : "h-full w-full"}`}
      style={
        layout === "single"
          ? { aspectRatio: photoAspectRatio(part) }
          : undefined
      }
    >
      {canOpen && image ? (
        <button
          aria-label={openLabel ?? t("photoAlt")}
          className="absolute inset-0 h-full w-full cursor-zoom-in p-0 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
          disabled={state !== "ready"}
          onClick={onOpen}
          type="button"
        >
          {image}
        </button>
      ) : (
        image && (
          <div
            className={
              layout === "viewer"
                ? "absolute inset-0 flex items-center justify-center"
                : "absolute inset-0"
            }
          >
            {image}
          </div>
        )
      )}
      {(state === "loading" || state === "refreshing") && (
        <div
          className={`absolute inset-0 flex items-center justify-center gap-2 text-xs ${layout === "viewer" ? "bg-transparent text-on-dark/70" : "bg-subtle text-muted"}`}
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          <span className={layout === "tile" ? "sr-only" : undefined}>
            {t("photoLoading")}
          </span>
        </div>
      )}
      {state === "error" && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center text-xs ${layout === "viewer" ? "bg-transparent text-on-dark/70" : "bg-subtle text-muted"}`}
        >
          <ImageOff aria-hidden="true" className="size-5" />
          <span
            className={layout === "tile" ? "sr-only" : undefined}
            role="alert"
          >
            {t("photoUnavailable")}
          </span>
          <button
            aria-label={layout === "tile" ? t("photoRetry") : undefined}
            className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${layout === "viewer" ? "text-on-dark focus-visible:outline-on-dark" : "text-brand focus-visible:outline-brand"}`}
            onClick={() => {
              autoRefreshedRef.current = true;
              void refreshUrl();
            }}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            <span className={layout === "tile" ? "sr-only" : undefined}>
              {t("photoRetry")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
