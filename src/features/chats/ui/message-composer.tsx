import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  FileText,
  Image,
  Paperclip,
  SendHorizontal,
  Smile,
  X,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";

import {
  useMediaAttachments,
  type SelectedAttachment,
} from "../hooks/use-media-attachments";
import {
  persistedSendStatus,
  sendFailureKind,
  useSendMessage,
} from "../model/use-send-message";

const maxMessageLength = 4096;
const maxAttachmentCaptionLength = 1024;
const maxPhotoSize = 10 * 1024 * 1024;
const maxFileSize = 20 * 1024 * 1024;
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const emojiChoices = [
  { emoji: "😀", ru: "улыбка", en: "grinning face" },
  { emoji: "😃", ru: "радость", en: "smiling face" },
  { emoji: "😄", ru: "счастливая улыбка", en: "happy face" },
  { emoji: "😁", ru: "широкая улыбка", en: "beaming face" },
  { emoji: "😆", ru: "смех", en: "laughing face" },
  { emoji: "😅", ru: "улыбка с потом", en: "grinning face with sweat" },
  { emoji: "😂", ru: "смех до слёз", en: "face with tears of joy" },
  { emoji: "🙂", ru: "лёгкая улыбка", en: "slightly smiling face" },
  { emoji: "🙃", ru: "перевёрнутая улыбка", en: "upside-down face" },
  { emoji: "😉", ru: "подмигивание", en: "winking face" },
  { emoji: "😊", ru: "довольная улыбка", en: "smiling face with smiling eyes" },
  { emoji: "😍", ru: "влюблённость", en: "heart eyes" },
  { emoji: "🥰", ru: "лицо с сердечками", en: "smiling face with hearts" },
  { emoji: "😘", ru: "воздушный поцелуй", en: "face blowing a kiss" },
  { emoji: "😎", ru: "лицо в очках", en: "smiling face with sunglasses" },
  { emoji: "🤔", ru: "задумчивость", en: "thinking face" },
  { emoji: "😐", ru: "нейтральное лицо", en: "neutral face" },
  { emoji: "😮", ru: "удивление", en: "surprised face" },
  { emoji: "😢", ru: "грусть", en: "crying face" },
  { emoji: "😭", ru: "сильный плач", en: "loudly crying face" },
  { emoji: "😡", ru: "злость", en: "angry face" },
  { emoji: "👍", ru: "палец вверх", en: "thumbs up" },
  { emoji: "👎", ru: "палец вниз", en: "thumbs down" },
  { emoji: "👏", ru: "аплодисменты", en: "clapping hands" },
  { emoji: "🙌", ru: "поднятые руки", en: "raising hands" },
  { emoji: "👋", ru: "приветствие", en: "waving hand" },
  { emoji: "🙏", ru: "сложенные ладони", en: "folded hands" },
  { emoji: "💪", ru: "сила", en: "flexed biceps" },
  { emoji: "🤝", ru: "рукопожатие", en: "handshake" },
  { emoji: "👌", ru: "жест отлично", en: "OK hand" },
  { emoji: "❤️", ru: "красное сердце", en: "red heart" },
  { emoji: "💜", ru: "фиолетовое сердце", en: "purple heart" },
  { emoji: "🔥", ru: "огонь", en: "fire" },
  { emoji: "✨", ru: "блёстки", en: "sparkles" },
  { emoji: "🎉", ru: "праздник", en: "party popper" },
  { emoji: "🎂", ru: "торт", en: "birthday cake" },
  { emoji: "✅", ru: "галочка", en: "check mark" },
  { emoji: "❌", ru: "крестик", en: "cross mark" },
  { emoji: "💯", ru: "сто баллов", en: "hundred points" },
  { emoji: "💬", ru: "сообщение", en: "speech balloon" },
  { emoji: "📷", ru: "камера", en: "camera" },
  { emoji: "👀", ru: "глаза", en: "eyes" },
] as const;

type SendAttempt =
  | { kind: "text"; text: string; id: string }
  | { kind: "media"; attachmentIds: string[]; caption: string; id: string };

function mediaBatches(
  attachments: SelectedAttachment[],
  provider: string | null,
): SelectedAttachment[][] {
  const batches: SelectedAttachment[][] = [];
  let current: SelectedAttachment[] = [];
  for (const attachment of attachments) {
    if (
      current.length === 10 ||
      (provider !== "vk_community" &&
        current.length > 0 &&
        current[0]?.kind !== attachment.kind)
    ) {
      batches.push(current);
      current = [];
    }
    current.push(attachment);
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function sameAttachmentIds(
  left: string[],
  right: SelectedAttachment[],
): boolean {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index]?.id)
  );
}

export function MessageComposer({
  conversationId,
  provider,
  workspaceId,
}: {
  conversationId: string;
  provider: string | null;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("chats");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [deliveryUncertain, setDeliveryUncertain] = useState(false);
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const pendingAttempt = useRef<SendAttempt | null>(null);
  const submitting = useRef(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const pendingCaretRef = useRef<number | null>(null);
  const focusAfterEmojiRef = useRef(false);
  const emojiCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attachmentCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const emojiOpenModeRef = useRef<"hover" | "manual">("manual");
  const attachmentOpenModeRef = useRef<"hover" | "manual">("manual");
  const restoreTextareaAfterHoverRef = useRef(false);
  const { attachments, addAttachments, removeAttachments, clearAttachments } =
    useMediaAttachments();
  const send = useSendMessage(workspaceId, conversationId);
  const busy = send.isPending || sendingBatch;
  const hasAttachments = attachments.length > 0;
  const batchCount = mediaBatches(attachments, provider).length;

  useEffect(
    () => () => {
      if (emojiCloseTimerRef.current !== null) {
        clearTimeout(emojiCloseTimerRef.current);
      }
      if (attachmentCloseTimerRef.current !== null) {
        clearTimeout(attachmentCloseTimerRef.current);
      }
    },
    [],
  );

  function clearEmojiCloseTimer() {
    if (emojiCloseTimerRef.current === null) return;
    clearTimeout(emojiCloseTimerRef.current);
    emojiCloseTimerRef.current = null;
  }

  function clearAttachmentCloseTimer() {
    if (attachmentCloseTimerRef.current === null) return;
    clearTimeout(attachmentCloseTimerRef.current);
    attachmentCloseTimerRef.current = null;
  }

  function closeAttachmentAfterPointerLeaves() {
    clearAttachmentCloseTimer();
    attachmentCloseTimerRef.current = setTimeout(() => {
      attachmentCloseTimerRef.current = null;
      setAttachmentOpen(false);
    }, 160);
  }

  function handleAttachmentOpenChange(open: boolean) {
    clearAttachmentCloseTimer();
    if (open) {
      attachmentOpenModeRef.current = "manual";
      setEmojiOpen(false);
    }
    setAttachmentOpen(open);
  }

  function closeEmojiAfterPointerLeaves() {
    clearEmojiCloseTimer();
    emojiCloseTimerRef.current = setTimeout(() => {
      emojiCloseTimerRef.current = null;
      setEmojiOpen(false);
    }, 160);
  }

  function handleEmojiOpenChange(open: boolean) {
    clearEmojiCloseTimer();
    if (open) {
      emojiOpenModeRef.current = "manual";
      restoreTextareaAfterHoverRef.current = false;
      setAttachmentOpen(false);
    }
    setEmojiOpen(open);
  }

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
    if (pendingCaretRef.current !== null) {
      textarea.focus();
      textarea.setSelectionRange(
        pendingCaretRef.current,
        pendingCaretRef.current,
      );
      pendingCaretRef.current = null;
    }
  }, [draft, attachments]);

  function rememberSelection() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  }

  function updateDraft(next: string) {
    setDraft(next);
    setSent(false);
    const previous = pendingAttempt.current;
    if (
      (previous?.kind === "media" &&
        (!sameAttachmentIds(
          previous.attachmentIds,
          mediaBatches(attachments, provider)[0] ?? [],
        ) ||
          previous.caption !== next.trim())) ||
      (previous?.kind === "text" &&
        (hasAttachments || previous.text !== next.trim()))
    ) {
      clearAttempt();
    } else {
      setError(null);
    }
  }

  function insertEmoji(emoji: string) {
    const { start, end } = selectionRef.current;
    const from = Math.min(start, draft.length);
    const to = Math.min(Math.max(end, from), draft.length);
    const next = `${draft.slice(0, from)}${emoji}${draft.slice(to)}`;
    if (
      next.length >
      (hasAttachments ? maxAttachmentCaptionLength : maxMessageLength)
    ) {
      setError(
        t(hasAttachments ? "attachmentCaptionTooLong" : "messageTooLong"),
      );
      return;
    }
    const caret = from + emoji.length;
    selectionRef.current = { start: caret, end: caret };
    pendingCaretRef.current = caret;
    focusAfterEmojiRef.current = true;
    updateDraft(next);
  }

  function clearAttempt() {
    pendingAttempt.current = null;
    setDeliveryUncertain(false);
    setError(null);
    setSent(false);
  }

  function clearPersistedDraft() {
    pendingAttempt.current = null;
    setDraft("");
    selectionRef.current = { start: 0, end: 0 };
    clearAttachments();
    setDeliveryUncertain(false);
    setError(null);
  }

  function chooseAttachments(files: File[], kind: "photo" | "file") {
    if (files.length === 0 || busy || deliveryUncertain) return;
    for (const file of files) {
      if (file.size === 0) {
        setError(t(kind === "photo" ? "photoEmpty" : "fileEmpty"));
        return;
      }
      if (file.size > (kind === "photo" ? maxPhotoSize : maxFileSize)) {
        setError(t(kind === "photo" ? "photoTooLarge" : "fileTooLarge"));
        return;
      }
      if (kind === "photo" && !allowedPhotoTypes.has(file.type)) {
        setError(t("photoInvalidType"));
        return;
      }
    }
    addAttachments(files, kind);
    clearAttempt();
    if (draft.trim().length > maxAttachmentCaptionLength) {
      setError(t("attachmentCaptionTooLong"));
    }
    textareaRef.current?.focus();
  }

  function handleAttachmentInput(
    event: ChangeEvent<HTMLInputElement>,
    kind: "photo" | "file",
  ) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    chooseAttachments(files, kind);
  }

  function showSendFailure(failure: unknown, kind: "text" | "media") {
    const failureKind = sendFailureKind(failure, kind);
    if (failureKind === "uncertain") {
      setDeliveryUncertain(true);
      setError(t("messageSendUncertain"));
    } else if (failureKind === "forbidden") {
      setError(t("messageSendForbidden"));
    } else if (failureKind === "unavailable") {
      setError(t("messageSendUnavailable"));
    } else if (failureKind === "connection") {
      setError(t("messageSendConnectionUnavailable"));
    } else if (failureKind === "permissions") {
      setError(t("messageSendPermissions"));
    } else if (failureKind === "conflict") {
      pendingAttempt.current = null;
      setError(t("messageSendConflict"));
    } else if (failureKind === "photo_invalid") {
      setError(t("photoInvalidType"));
    } else if (failureKind === "photo_too_large") {
      setError(t("photoTooLarge"));
    } else if (failureKind === "photo_caption_too_long") {
      setError(t("attachmentCaptionTooLong"));
    } else if (failureKind === "photo_storage_unavailable") {
      setError(t("photoStorageUnavailable"));
    } else if (failureKind === "file_empty") {
      setError(t("fileEmpty"));
    } else if (failureKind === "file_too_large") {
      setError(t("fileTooLarge"));
    } else if (failureKind === "file_caption_too_long") {
      setError(t("attachmentCaptionTooLong"));
    } else if (failureKind === "file_storage_unavailable") {
      setError(t("fileStorageUnavailable"));
    } else if (failureKind === "media_storage_unavailable") {
      setError(t("mediaStorageUnavailable"));
    } else {
      setError(t("messageSendFailed"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || busy || deliveryUncertain) return;
    const text = draft.trim();
    if (!text && !hasAttachments) return;
    if (
      text.length >
      (hasAttachments ? maxAttachmentCaptionLength : maxMessageLength)
    ) {
      setError(
        t(hasAttachments ? "attachmentCaptionTooLong" : "messageTooLong"),
      );
      return;
    }

    submitting.current = true;
    setError(null);
    setSent(false);
    try {
      if (!hasAttachments) {
        const previous = pendingAttempt.current;
        const attempt: SendAttempt =
          previous?.kind === "text" && previous.text === text
            ? previous
            : { kind: "text", text, id: crypto.randomUUID() };
        pendingAttempt.current = attempt;
        try {
          const result = await send.mutateAsync({
            kind: "text",
            text: attempt.text,
            clientMessageId: attempt.id,
          });
          if (result.delivery_status === "sent") {
            clearPersistedDraft();
            setSent(true);
          } else if (
            result.delivery_status === "failed" ||
            result.delivery_status === "unknown" ||
            result.delivery_status === "pending"
          ) {
            clearPersistedDraft();
          } else {
            setDeliveryUncertain(true);
            setError(t("messageSendUncertain"));
          }
        } catch (failure) {
          if (persistedSendStatus(failure, attempt.id)) {
            clearPersistedDraft();
          } else {
            showSendFailure(failure, "text");
          }
        }
        return;
      }

      const batches = mediaBatches(attachments, provider);
      setSendingBatch(true);
      for (const [index, batch] of batches.entries()) {
        setBatchProgress({ current: index + 1, total: batches.length });
        const caption = index === 0 ? text : "";
        const previous = pendingAttempt.current;
        const attempt: SendAttempt =
          previous?.kind === "media" &&
          sameAttachmentIds(previous.attachmentIds, batch) &&
          previous.caption === caption
            ? previous
            : {
                kind: "media",
                attachmentIds: batch.map((attachment) => attachment.id),
                caption,
                id: crypto.randomUUID(),
              };
        pendingAttempt.current = attempt;
        let deliveryStatus: string | null;
        try {
          const result = await send.mutateAsync({
            kind: "media",
            attachments: batch.map(({ kind, file }) => ({ kind, file })),
            caption,
            clientMessageId: attempt.id,
          });
          deliveryStatus = result.delivery_status;
        } catch (failure) {
          const persistedStatus = persistedSendStatus(failure, attempt.id);
          if (persistedStatus) {
            removeAttachments(attempt.attachmentIds);
            pendingAttempt.current = null;
            if (index === 0) setDraft("");
            if (index + 1 < batches.length) setError(t("mediaBatchStopped"));
          } else {
            showSendFailure(failure, "media");
          }
          return;
        }
        if (
          deliveryStatus !== "sent" &&
          deliveryStatus !== "failed" &&
          deliveryStatus !== "unknown" &&
          deliveryStatus !== "pending"
        ) {
          setDeliveryUncertain(true);
          setError(t("messageSendUncertain"));
          return;
        }
        // This batch is in history, including any delivery error. Never send
        // it again from the composer after another batch fails.
        removeAttachments(attempt.attachmentIds);
        pendingAttempt.current = null;
        if (index === 0) setDraft("");
        if (deliveryStatus !== "sent") {
          if (index + 1 < batches.length) setError(t("mediaBatchStopped"));
          return;
        }
      }
      setSent(true);
    } finally {
      submitting.current = false;
      setSendingBatch(false);
      setBatchProgress(null);
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
      className="shrink-0 bg-page px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[1.375rem] border border-line bg-surface shadow-sm">
        {hasAttachments && (
          <div className="border-b border-line px-3 py-2.5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
              <span>
                {t("selectedAttachments", { count: attachments.length })}
              </span>
              <span>{t("attachmentMessageCount", { count: batchCount })}</span>
            </div>
            <div
              aria-label={t("selectedAttachments", {
                count: attachments.length,
              })}
              className="flex gap-2 overflow-x-auto pb-1"
              role="list"
            >
              {attachments.map((attachment) => (
                <div
                  className="flex w-52 shrink-0 items-center gap-2 rounded-xl border border-line bg-page p-1.5"
                  key={attachment.id}
                  role="listitem"
                >
                  {attachment.previewUrl ? (
                    <img
                      alt={t("selectedPhotoAlt")}
                      className="size-11 shrink-0 rounded-lg bg-subtle object-cover"
                      src={attachment.previewUrl}
                    />
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-subtle text-muted">
                      <FileText aria-hidden="true" className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-medium text-ink"
                      title={attachment.file.name}
                    >
                      {attachment.file.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {attachment.file.size < 1024
                        ? t("fileSizeBytes", { size: attachment.file.size })
                        : attachment.file.size < 1024 * 1024
                          ? t("fileSizeKb", {
                              size: Math.max(
                                1,
                                Math.round(attachment.file.size / 1024),
                              ),
                            })
                          : t("fileSizeMb", {
                              size: (
                                attachment.file.size /
                                (1024 * 1024)
                              ).toFixed(1),
                            })}
                    </p>
                  </div>
                  <button
                    aria-label={t("removeAttachmentNamed", {
                      name: attachment.file.name,
                    })}
                    className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busy || deliveryUncertain}
                    onClick={() => {
                      removeAttachments([attachment.id]);
                      clearAttempt();
                    }}
                    type="button"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-end gap-0 px-2 py-1.5">
          <input
            accept="image/jpeg,image/png,image/webp"
            hidden
            multiple
            onChange={(event) => handleAttachmentInput(event, "photo")}
            ref={photoInputRef}
            tabIndex={-1}
            type="file"
          />
          <input
            hidden
            multiple
            onChange={(event) => handleAttachmentInput(event, "file")}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />
          <DropdownMenu.Root
            modal={false}
            open={attachmentOpen}
            onOpenChange={handleAttachmentOpenChange}
          >
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={t("openAttachmentPicker")}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted/70 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || deliveryUncertain}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType !== "mouse" ||
                    busy ||
                    deliveryUncertain
                  )
                    return;
                  clearAttachmentCloseTimer();
                  if (attachmentOpen) return;
                  attachmentOpenModeRef.current = "hover";
                  setEmojiOpen(false);
                  setAttachmentOpen(true);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse")
                    closeAttachmentAfterPointerLeaves();
                }}
                onPointerDown={(event) => {
                  if (
                    event.pointerType === "mouse" &&
                    attachmentOpen &&
                    attachmentOpenModeRef.current === "hover"
                  ) {
                    event.preventDefault();
                    attachmentOpenModeRef.current = "manual";
                  }
                }}
                type="button"
              >
                <Paperclip aria-hidden="true" className="size-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                className="z-50 min-w-40 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-lg outline-none"
                collisionPadding={12}
                onCloseAutoFocus={(event) => {
                  if (attachmentOpenModeRef.current === "hover")
                    event.preventDefault();
                  attachmentOpenModeRef.current = "manual";
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse")
                    clearAttachmentCloseTimer();
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse")
                    closeAttachmentAfterPointerLeaves();
                }}
                side="top"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-subtle"
                  onSelect={() => photoInputRef.current?.click()}
                >
                  <Image aria-hidden="true" className="size-4" />
                  {t("attachPhoto")}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-subtle"
                  onSelect={() => fileInputRef.current?.click()}
                >
                  <FileText aria-hidden="true" className="size-4" />
                  {t("attachFile")}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <DropdownMenu.Root
            modal={false}
            open={emojiOpen}
            onOpenChange={handleEmojiOpenChange}
          >
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={t("openEmojiPicker")}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted/70 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || deliveryUncertain}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType !== "mouse" ||
                    busy ||
                    deliveryUncertain
                  )
                    return;
                  clearEmojiCloseTimer();
                  if (emojiOpen) return;
                  emojiOpenModeRef.current = "hover";
                  restoreTextareaAfterHoverRef.current =
                    document.activeElement === textareaRef.current;
                  setAttachmentOpen(false);
                  setEmojiOpen(true);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    closeEmojiAfterPointerLeaves();
                  }
                }}
                onPointerDown={(event) => {
                  if (
                    event.pointerType === "mouse" &&
                    emojiOpen &&
                    emojiOpenModeRef.current === "hover"
                  ) {
                    // Hover already opened the menu; the first click should
                    // keep it open rather than toggle it closed.
                    event.preventDefault();
                    emojiOpenModeRef.current = "manual";
                    restoreTextareaAfterHoverRef.current = false;
                  }
                }}
                type="button"
              >
                <Smile aria-hidden="true" className="size-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                className="z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-line bg-surface p-3 shadow-lg outline-none"
                collisionPadding={12}
                onCloseAutoFocus={(event) => {
                  if (focusAfterEmojiRef.current) {
                    event.preventDefault();
                    const textarea = textareaRef.current;
                    textarea?.focus();
                    textarea?.setSelectionRange(
                      selectionRef.current.start,
                      selectionRef.current.end,
                    );
                    pendingCaretRef.current = null;
                    focusAfterEmojiRef.current = false;
                  } else if (emojiOpenModeRef.current === "hover") {
                    event.preventDefault();
                    if (restoreTextareaAfterHoverRef.current) {
                      textareaRef.current?.focus();
                    }
                  }
                  emojiOpenModeRef.current = "manual";
                  restoreTextareaAfterHoverRef.current = false;
                }}
                onInteractOutside={() => {
                  restoreTextareaAfterHoverRef.current = false;
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") clearEmojiCloseTimer();
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    closeEmojiAfterPointerLeaves();
                  }
                }}
                side="top"
                sideOffset={8}
              >
                <DropdownMenu.Label className="mb-2 px-1 text-xs font-semibold text-muted">
                  {t("emojiPickerTitle")}
                </DropdownMenu.Label>
                <div className="grid grid-cols-7 gap-1">
                  {emojiChoices.map(({ emoji, ru, en }) => (
                    <DropdownMenu.Item
                      aria-label={t("insertEmoji", {
                        name: i18n.language.startsWith("ru") ? ru : en,
                      })}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-xl leading-none outline-none hover:bg-subtle focus:bg-subtle focus-visible:outline-2 focus-visible:outline-brand"
                      key={emoji}
                      onSelect={() => insertEmoji(emoji)}
                      title={i18n.language.startsWith("ru") ? ru : en}
                    >
                      <span aria-hidden="true">{emoji}</span>
                    </DropdownMenu.Item>
                  ))}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <label className="min-w-0 flex-1">
            <span className="sr-only">
              {t(hasAttachments ? "attachmentCaptionInput" : "messageInput")}
            </span>
            <textarea
              aria-describedby={error ? "chat-send-error" : undefined}
              aria-invalid={
                draft.trim().length >
                (hasAttachments ? maxAttachmentCaptionLength : maxMessageLength)
              }
              className="block max-h-36 min-h-10 w-full resize-none overflow-y-auto bg-transparent px-1 py-2.5 text-[15px] leading-5 text-ink caret-brand outline-none placeholder:text-muted/80"
              disabled={busy || deliveryUncertain}
              maxLength={
                hasAttachments ? maxAttachmentCaptionLength : maxMessageLength
              }
              onChange={(event) => {
                updateDraft(event.target.value);
                rememberSelection();
              }}
              onKeyDown={handleKeyDown}
              onSelect={rememberSelection}
              onPaste={(event) => {
                const files = Array.from(event.clipboardData.files).filter(
                  (item) => allowedPhotoTypes.has(item.type),
                );
                if (files.length === 0) return;
                event.preventDefault();
                chooseAttachments(files, "photo");
              }}
              placeholder={t(
                hasAttachments
                  ? "attachmentCaptionPlaceholder"
                  : "messagePlaceholder",
              )}
              ref={textareaRef}
              rows={1}
              value={draft}
            />
          </label>
          <button
            aria-label={t(busy ? "sendingMessage" : "sendMessage")}
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-brand-fill text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-45"
            disabled={
              (!draft.trim() && !hasAttachments) || busy || deliveryUncertain
            }
            title={t(busy ? "sendingMessage" : "sendMessage")}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      {error && (
        <p
          className="mx-auto mt-2 max-w-4xl text-sm text-danger"
          id="chat-send-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {deliveryUncertain && (
        <button
          className="mx-auto mt-2 block max-w-4xl cursor-pointer text-sm text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => {
            clearPersistedDraft();
            setSent(false);
          }}
          type="button"
        >
          {t("discardUncertainDraft")}
        </button>
      )}
      {busy && (
        <p className="sr-only" role="status">
          {t("sendingMessage")}
        </p>
      )}
      {batchProgress && (
        <p className="mx-auto mt-2 max-w-4xl text-xs text-muted" role="status">
          {t("sendingAttachmentBatch", batchProgress)}
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
