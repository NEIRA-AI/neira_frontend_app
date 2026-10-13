import { Download, FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

type FilePart = ChatMessage["parts"][number];

function usableFileUrl(part: FilePart): string | null {
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

export function MessageFile({
  outgoing,
  part,
  refreshMessage,
}: {
  outgoing: boolean;
  part: FilePart;
  refreshMessage: () => Promise<ChatMessage>;
}) {
  const { t } = useTranslation("chats");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const fileName = part.file_name || t("file");
  const size = part.size_bytes;
  const sizeLabel =
    size === null
      ? null
      : size < 1024
        ? t("fileSizeBytes", { size })
        : size < 1024 * 1024
          ? t("fileSizeKb", { size: Math.max(1, Math.round(size / 1024)) })
          : t("fileSizeMb", { size: (size / (1024 * 1024)).toFixed(1) });

  async function download() {
    if (downloading) return;
    setDownloading(true);
    setError(false);
    try {
      // Resolve a fresh, authorized URL on each click. A message can remain
      // visible well after its original S3 signature has expired.
      const freshMessage = await refreshMessage();
      const freshPart = freshMessage.parts.find(
        (item) => item.id === part.id && item.kind === "file",
      );
      const url = freshPart ? usableFileUrl(freshPart) : null;
      if (!url) throw new Error("File URL unavailable");
      window.location.assign(url);
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-full">
      <button
        aria-label={t("downloadFile", { name: fileName })}
        className={`flex w-[min(68vw,20rem)] max-w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait ${outgoing ? "bg-on-brand/10 hover:bg-on-brand/20" : "bg-subtle hover:bg-subtle/70"}`}
        disabled={downloading}
        onClick={() => void download()}
        type="button"
      >
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg ${outgoing ? "bg-on-brand/15" : "bg-surface"}`}
        >
          <FileText aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-sm font-medium"
            dir="auto"
            title={fileName}
          >
            {fileName}
          </span>
          {sizeLabel && (
            <span
              className={`block text-xs ${outgoing ? "text-on-brand/70" : "text-muted"}`}
            >
              {sizeLabel}
            </span>
          )}
        </span>
        {downloading ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 shrink-0 animate-spin"
          />
        ) : (
          <Download aria-hidden="true" className="size-4 shrink-0" />
        )}
      </button>
      {error && (
        <p
          className={`mt-1 text-xs ${outgoing ? "text-on-brand" : "text-danger"}`}
          role="alert"
        >
          {t("fileUnavailable")}
        </p>
      )}
    </div>
  );
}
