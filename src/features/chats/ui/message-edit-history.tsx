import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { MessageRevision } from "../api/conversations-api";
import { useMessageRevisions } from "../model/use-message-revisions";

function RevisionContent({ revision }: { revision: MessageRevision }) {
  const { t, i18n } = useTranslation("chats");
  const textParts = revision.parts
    .filter((part) => part.kind === "text" && part.text)
    .sort((a, b) => a.position - b.position);
  const attachments = revision.parts
    .filter((part) => part.kind !== "text")
    .sort((a, b) => a.position - b.position);
  const date = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(revision.changed_at));

  return (
    <li className="space-y-1.5 border-t border-line pt-2.5 first:border-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px]">
        <span className="font-medium text-ink">
          {revision.is_current
            ? t("currentMessageRevision")
            : revision.revision_no === 1
              ? t("originalMessageRevision")
              : t("messageRevisionNumber", { number: revision.revision_no })}
        </span>
        <time className="text-muted" dateTime={revision.changed_at}>
          {date}
        </time>
      </div>
      {textParts.map((part) => (
        <p
          className="whitespace-pre-wrap break-words text-xs leading-5 text-ink"
          key={part.position}
        >
          {part.text}
        </p>
      ))}
      {attachments.length > 0 && (
        <ul className="space-y-0.5 text-xs text-muted">
          {attachments.map((part) => (
            <li className="break-all" key={part.position}>
              {part.file_name ||
                (part.kind === "image"
                  ? t("photo")
                  : part.kind === "voice"
                    ? t("voice")
                    : t("file"))}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function MessageEditHistory({
  workspaceId,
  conversationId,
  messageId,
}: {
  workspaceId: string;
  conversationId: string;
  messageId: string;
}) {
  const { t } = useTranslation("chats");
  const [open, setOpen] = useState(false);
  const revisions = useMessageRevisions(
    workspaceId,
    conversationId,
    messageId,
    open,
  );
  const items = revisions.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Tooltip.Root onOpenChange={setOpen} open={open}>
      <Tooltip.Trigger asChild>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t("showMessageEditHistory")}
          className="cursor-pointer rounded-sm text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setOpen(true)}
          type="button"
        >
          {t("editedMessage")}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          align="end"
          aria-label={t("messageEditHistory")}
          aria-modal={false}
          className="z-50 w-[min(21rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-3 text-left text-ink shadow-xl"
          collisionPadding={8}
          role="dialog"
          side="top"
          sideOffset={7}
        >
          <p className="mb-2 text-xs font-semibold">
            {t("messageEditHistory")}
          </p>
          {revisions.isPending ? (
            <p className="text-xs text-muted" role="status">
              {t("loadingMessageEditHistory")}
            </p>
          ) : revisions.isError && !revisions.data ? (
            <p className="text-xs text-muted" role="alert">
              {t("messageEditHistoryError")}
            </p>
          ) : items.length === 0 ? (
            <p className="text-xs text-muted">{t("emptyMessageEditHistory")}</p>
          ) : (
            <div
              aria-label={t("messageEditHistory")}
              className="max-h-72 overflow-y-auto rounded-sm pr-1 focus-visible:outline-2 focus-visible:outline-brand"
              tabIndex={0}
            >
              <ol className="space-y-2.5">
                {items.map((revision) => (
                  <RevisionContent key={revision.id} revision={revision} />
                ))}
              </ol>
              {revisions.hasNextPage && (
                <button
                  className="mt-3 cursor-pointer rounded-sm text-xs text-muted underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait"
                  disabled={revisions.isFetchingNextPage}
                  onClick={() => void revisions.fetchNextPage()}
                  onPointerDown={(event) => event.preventDefault()}
                  type="button"
                >
                  {revisions.isFetchingNextPage
                    ? t("loadingMessageEditHistory")
                    : revisions.isFetchNextPageError
                      ? t("retryOlderMessageRevisions")
                      : t("olderMessageRevisions")}
                </button>
              )}
            </div>
          )}
          <Tooltip.Arrow className="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
