import { FileText, Image, Mic } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

type Reply = NonNullable<ChatMessage["reply_to"]>;

function usableThumbnailUrl(reply: Reply): string | null {
  if (
    reply.content_type !== "image" ||
    !reply.thumbnail_url ||
    !reply.thumbnail_url_expires_at
  )
    return null;
  const expiresAt = Date.parse(reply.thumbnail_url_expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + 15_000)
    return null;
  try {
    const url = new URL(reply.thumbnail_url);
    const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(
      url.hostname,
    );
    return url.protocol === "https:" || (url.protocol === "http:" && isLoopback)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function MessageReplyPreview({
  reply,
  hasPhotos,
  onOpen,
  refreshReply,
}: {
  reply: Reply;
  hasPhotos: boolean;
  onOpen?: () => void;
  refreshReply: () => Promise<ChatMessage>;
}) {
  const { t } = useTranslation("chats");
  const contentId = useId();
  const attemptedRefreshUrlsRef = useRef(new Set<string>());
  const previewElementRef = useRef<HTMLElement | null>(null);
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(
    null,
  );
  const [refreshedReply, setRefreshedReply] = useState<{
    sourceUrl: string | null;
    reply: Reply;
  } | null>(null);
  const visibleReply =
    refreshedReply?.sourceUrl === reply.thumbnail_url
      ? refreshedReply.reply
      : reply;
  const author = visibleReply.author_name?.trim() || t("unknownParticipant");
  const thumbnailUrl = usableThumbnailUrl(visibleReply);
  const thumbnailNeedsRefresh =
    visibleReply.content_type === "image" &&
    Boolean(visibleReply.thumbnail_url) &&
    Boolean(visibleReply.thumbnail_url_expires_at) &&
    (!thumbnailUrl || thumbnailUrl === failedThumbnailUrl);
  const showThumbnail = Boolean(
    thumbnailUrl && thumbnailUrl !== failedThumbnailUrl,
  );
  const content =
    visibleReply.text?.trim() ||
    (visibleReply.content_type === "image"
      ? t("photo")
      : visibleReply.content_type === "file"
        ? t("file")
        : visibleReply.content_type === "voice"
          ? t("voice")
          : t("repliedMessageUnavailable"));
  const icon =
    visibleReply.content_type === "image" && !showThumbnail ? (
      <Image aria-hidden="true" className="size-3.5 shrink-0" />
    ) : visibleReply.content_type === "file" ? (
      <FileText aria-hidden="true" className="size-3.5 shrink-0" />
    ) : visibleReply.content_type === "voice" ? (
      <Mic aria-hidden="true" className="size-3.5 shrink-0" />
    ) : null;

  const refreshThumbnail = useCallback(() => {
    const sourceUrl = visibleReply.thumbnail_url;
    if (!sourceUrl || attemptedRefreshUrlsRef.current.has(sourceUrl)) return;
    attemptedRefreshUrlsRef.current.add(sourceUrl);
    void refreshReply()
      .then((message) => {
        if (message.reply_to) {
          setRefreshedReply({
            sourceUrl: reply.thumbnail_url,
            reply: message.reply_to,
          });
        }
      })
      .catch(() => {
        // Retry only after the quote leaves and re-enters the viewport.
        attemptedRefreshUrlsRef.current.delete(sourceUrl);
      });
  }, [refreshReply, reply.thumbnail_url, visibleReply.thumbnail_url]);

  useEffect(() => {
    if (!thumbnailNeedsRefresh) return;
    const element = previewElementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        refreshThumbnail();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [thumbnailNeedsRefresh, refreshThumbnail]);

  function handleThumbnailError() {
    if (!thumbnailUrl) return;
    setFailedThumbnailUrl(thumbnailUrl);
    refreshThumbnail();
  }

  function setPreviewElement(element: HTMLElement | null) {
    previewElementRef.current = element;
  }
  const className = `${hasPhotos ? "mx-3 mt-2 mb-2 w-[calc(100%-1.5rem)]" : "mb-2 w-full"} flex min-w-0 items-center gap-2 rounded-lg border-l-[3px] border-brand bg-brand-soft px-2.5 py-1.5 text-left ${onOpen ? "cursor-pointer transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" : ""}`;
  const preview = (
    <>
      {showThumbnail && thumbnailUrl && (
        <span className="size-11 shrink-0 overflow-hidden rounded bg-subtle">
          <img
            alt={visibleReply.text?.trim() ? t("photo") : ""}
            className="h-full w-full object-cover"
            decoding="async"
            loading="lazy"
            onError={handleThumbnailError}
            referrerPolicy="no-referrer"
            src={thumbnailUrl}
          />
        </span>
      )}
      <span className="block min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-brand">
          {author}
        </span>
        <span className="mt-0.5 flex min-w-0 items-start gap-1 text-xs text-muted-strong">
          {icon}
          <span
            className="line-clamp-2 min-w-0 break-words whitespace-pre-line"
            id={contentId}
          >
            {content}
          </span>
        </span>
      </span>
    </>
  );

  return onOpen ? (
    <button
      aria-describedby={contentId}
      aria-label={t("goToRepliedMessage", { author })}
      className={className}
      onClick={onOpen}
      ref={setPreviewElement}
      type="button"
    >
      {preview}
    </button>
  ) : (
    <div className={className} ref={setPreviewElement}>
      {preview}
    </div>
  );
}
