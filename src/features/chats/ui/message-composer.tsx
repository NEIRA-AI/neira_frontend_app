import { Paperclip, SendHorizontal } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { sendFailureKind, useSendMessage } from "../model/use-send-message";

const maxMessageLength = 4096;

export function MessageComposer({
  conversationId,
  workspaceId,
}: {
  conversationId: string;
  workspaceId: string;
}) {
  const { t } = useTranslation("chats");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [deliveryUncertain, setDeliveryUncertain] = useState(false);
  const pendingAttempt = useRef<{ text: string; id: string } | null>(null);
  const submitting = useRef(false);
  const send = useSendMessage(workspaceId, conversationId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || send.isPending || deliveryUncertain) return;
    const text = draft.trim();
    if (!text) return;
    if (text.length > maxMessageLength) {
      setError(t("messageTooLong"));
      return;
    }

    const attempt =
      pendingAttempt.current?.text === text
        ? pendingAttempt.current
        : { text, id: crypto.randomUUID() };
    pendingAttempt.current = attempt;
    submitting.current = true;
    setError(null);
    setSent(false);
    try {
      const result = await send.mutateAsync({
        text,
        clientMessageId: attempt.id,
      });
      if (result.delivery_status === "sent") {
        pendingAttempt.current = null;
        setDraft("");
        setSent(true);
      } else if (result.delivery_status === "failed") {
        setError(t("messageSendFailed"));
      } else {
        setDeliveryUncertain(true);
        setError(t("messageSendUncertain"));
      }
    } catch (failure) {
      const kind = sendFailureKind(failure);
      if (kind === "uncertain") {
        setDeliveryUncertain(true);
        setError(t("messageSendUncertain"));
      } else if (kind === "forbidden") {
        setError(t("messageSendForbidden"));
      } else if (kind === "unavailable") {
        setError(t("messageSendUnavailable"));
      } else if (kind === "connection") {
        setError(t("messageSendConnectionUnavailable"));
      } else if (kind === "conflict") {
        pendingAttempt.current = null;
        setError(t("messageSendConflict"));
      } else {
        setError(t("messageSendFailed"));
      }
    } finally {
      submitting.current = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      className="shrink-0 border-t border-line bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="flex items-end gap-3 rounded-2xl border border-line bg-page p-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-20">
        <button
          aria-label={t("attachmentsSoon")}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted opacity-50"
          disabled
          type="button"
        >
          <Paperclip aria-hidden="true" className="size-5" />
        </button>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t("messageInput")}</span>
          <textarea
            aria-describedby={error ? "chat-send-error" : undefined}
            aria-invalid={Boolean(error)}
            className="max-h-36 min-h-9 w-full resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
            disabled={send.isPending}
            maxLength={maxMessageLength}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              setSent(false);
              if (pendingAttempt.current?.text !== next.trim()) {
                pendingAttempt.current = null;
                setDeliveryUncertain(false);
              }
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("messagePlaceholder")}
            rows={1}
            value={draft}
          />
        </label>
        <button
          aria-label={t(send.isPending ? "sendingMessage" : "sendMessage")}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-fill text-on-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!draft.trim() || send.isPending || deliveryUncertain}
          title={t(send.isPending ? "sendingMessage" : "sendMessage")}
          type="submit"
        >
          <SendHorizontal aria-hidden="true" className="size-4" />
        </button>
      </div>
      {error && (
        <p
          className="mt-2 text-sm text-danger"
          id="chat-send-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {send.isPending && (
        <p className="mt-2 text-xs text-muted" role="status">
          {t("sendingMessage")}
        </p>
      )}
      {sent && (
        <p className="sr-only" role="status">
          {t("messageSent")}
        </p>
      )}
    </form>
  );
}
