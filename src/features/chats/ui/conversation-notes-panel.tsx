import { type RefObject } from "react";
import { useTranslation } from "react-i18next";

import { NotesSection } from "@/features/notes";

export function ConversationNotesPanel({
  canWrite,
  conversationId,
  mode,
  titleRef,
  workspaceId,
}: {
  canWrite: boolean;
  conversationId: string;
  mode: "drawer" | "inline";
  titleRef: RefObject<HTMLHeadingElement | null>;
  workspaceId: string;
}) {
  const { t } = useTranslation("notes");

  return (
    <aside
      aria-labelledby="chat-notes-panel-title"
      className={`flex h-full min-h-0 min-w-0 flex-col border-l border-line bg-surface ${mode === "drawer" ? "w-full shadow-xl" : ""}`}
      id="chat-notes-panel"
    >
      <header className="flex min-h-18 shrink-0 items-center border-b border-line px-5 py-3">
        <h2
          className="truncate rounded text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-brand"
          id="chat-notes-panel-title"
          ref={titleRef}
          tabIndex={-1}
        >
          {t("titleConversation")}
        </h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <NotesSection
          canWrite={canWrite}
          compact
          hideTitle
          targetId={conversationId}
          targetType="conversation"
          workspaceId={workspaceId}
        />
      </div>
    </aside>
  );
}
