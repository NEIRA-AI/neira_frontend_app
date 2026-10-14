import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

import { ChatAvatar } from "./chat-avatar";
import { MessagePhoto } from "./message-photo";

export function MessagePhotoViewer({
  authorAvatarUrl,
  authorName,
  occurredAt,
  photos,
  selectedPhotoId,
  onSelectedPhotoIdChange,
  refreshMessage,
}: {
  authorAvatarUrl: string | null;
  authorName: string;
  occurredAt: string;
  photos: ChatMessage["parts"];
  selectedPhotoId: string | null;
  onSelectedPhotoIdChange: (id: string | null) => void;
  refreshMessage: () => Promise<ChatMessage>;
}) {
  const { t, i18n } = useTranslation("chats");
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const images = photos
    .filter((part) => part.kind === "image")
    .sort((a, b) => a.position - b.position);
  const selectedIndex = images.findIndex((part) => part.id === selectedPhotoId);
  const selectedPhoto = images[selectedIndex];
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(occurredAt));

  function selectOffset(offset: number) {
    const nextPhoto = images[selectedIndex + offset];
    if (nextPhoto) onSelectedPhotoIdChange(nextPhoto.id);
  }

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) onSelectedPhotoIdChange(null);
      }}
      open={Boolean(selectedPhoto)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-auth-artwork/90" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[71] grid h-dvh grid-rows-[4rem_minmax(0,1fr)_3rem] text-on-dark outline-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
            returnFocusRef.current = null;
          }}
          onKeyDown={(event) => {
            if (
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey
            )
              return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              selectOffset(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
          onOpenAutoFocus={() => {
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
        >
          <Dialog.Title className="sr-only">
            {t("photoViewerTitle")}
          </Dialog.Title>
          <div className="flex min-w-0 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <ChatAvatar name={authorName} size="md" url={authorAvatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{authorName}</p>
                <time
                  className="block truncate text-xs text-on-dark/65"
                  dateTime={occurredAt}
                >
                  {formattedDate}
                </time>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label={t("photoViewerClose")}
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-on-dark/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
                type="button"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 min-w-0 px-3 sm:px-20">
            {selectedPhoto && (
              <MessagePhoto
                key={selectedPhoto.id}
                layout="viewer"
                part={selectedPhoto}
                refreshMessage={refreshMessage}
              />
            )}
          </div>
          {images.length > 1 && (
            <>
              <button
                aria-label={t("photoViewerPrevious")}
                className="absolute top-16 bottom-12 left-0 z-10 flex w-16 cursor-pointer items-center justify-center hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-on-dark disabled:cursor-default disabled:opacity-0 disabled:hover:bg-transparent sm:w-20"
                disabled={selectedIndex <= 0}
                onClick={() => selectOffset(-1)}
                type="button"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-8 drop-shadow-md"
                />
              </button>
              <button
                aria-label={t("photoViewerNext")}
                className="absolute top-16 right-0 bottom-12 z-10 flex w-16 cursor-pointer items-center justify-center hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-on-dark disabled:cursor-default disabled:opacity-0 disabled:hover:bg-transparent sm:w-20"
                disabled={selectedIndex >= images.length - 1}
                onClick={() => selectOffset(1)}
                type="button"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-8 drop-shadow-md"
                />
              </button>
            </>
          )}
          <div className="flex items-center justify-center px-4">
            {images.length > 1 ? (
              <span aria-live="polite" className="text-sm tabular-nums">
                {t("photoViewerPosition", {
                  current: selectedIndex + 1,
                  total: images.length,
                })}
              </span>
            ) : (
              <span className="sr-only">
                {t("photoViewerPosition", { current: 1, total: 1 })}
              </span>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
