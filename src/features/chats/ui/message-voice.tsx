import { LoaderCircle, Play } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

type VoicePart = ChatMessage["parts"][number];

function playableVoiceUrl(part: VoicePart): string | null {
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

function formatDuration(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function MessageVoice({
  part,
  refreshMessage,
}: {
  part: VoicePart;
  refreshMessage: () => Promise<ChatMessage>;
}) {
  const { t } = useTranslation("chats");
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const duration = part.duration_seconds;

  async function loadVoice() {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      // Messages can stay open longer than the S3 signature. Ask the API for a
      // fresh, authorized URL only when the user starts playback.
      const freshMessage = await refreshMessage();
      const freshPart = freshMessage.parts.find(
        (item) => item.id === part.id && item.kind === "voice",
      );
      const url = freshPart ? playableVoiceUrl(freshPart) : null;
      if (!url) throw new Error("Voice URL unavailable");
      setSource(url);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-full">
      {source ? (
        <audio
          aria-label={t("voice")}
          autoPlay
          className="h-12 w-[min(68vw,20rem)] max-w-full"
          controls
          onError={() => {
            setSource(null);
            setError(true);
          }}
          preload="none"
          src={source}
        />
      ) : (
        <button
          aria-label={t(error ? "retryVoice" : "playVoice")}
          className="flex h-12 w-[min(68vw,20rem)] max-w-full cursor-pointer items-center gap-3 rounded-xl bg-subtle px-3 text-left transition-colors hover:bg-subtle/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait"
          disabled={loading}
          onClick={() => void loadVoice()}
          type="button"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface">
            {loading ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Play aria-hidden="true" className="size-4 fill-current" />
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {loading ? t("voiceLoading") : t("voice")}
          </span>
          {duration !== null && Number.isFinite(duration) && (
            <span className="shrink-0 text-xs text-muted">
              {formatDuration(duration)}
            </span>
          )}
        </button>
      )}
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {t("voiceUnavailable")}
        </p>
      )}
    </div>
  );
}
