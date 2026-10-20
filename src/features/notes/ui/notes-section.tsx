import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { isRevisionConflict } from "@/shared/api/revision-conflict";
import { Button } from "@/shared/ui/button";

import type { Note, NoteTargetType } from "../api/notes-api";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "../model/use-notes";

const maxNoteLength = 5000;

function noteLength(text: string): number {
  return Array.from(text.trim()).length;
}

function noteTextError(text: string): "textRequired" | "textTooLong" | null {
  const length = noteLength(text);
  if (!length) return "textRequired";
  if (length > maxNoteLength) return "textTooLong";
  return null;
}

function isNoteMissing(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

function mutationError(error: unknown, fallback: "saveError" | "deleteError") {
  if (isRevisionConflict(error)) return "conflict";
  if (isNoteMissing(error)) return "noteMissing";
  if (axios.isAxiosError(error) && error.response?.status === 403)
    return "permissionDenied";
  return fallback;
}

type EditingNote = { id: string; revision: number; text: string };

export function NotesSection({
  canWrite,
  compact = false,
  hideTitle = false,
  targetId,
  targetType,
  workspaceId,
}: {
  canWrite: boolean;
  compact?: boolean;
  hideTitle?: boolean;
  targetId: string;
  targetType: NoteTargetType;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("notes");
  const target = { workspaceId, targetType, targetId };
  const notesQuery = useNotes(target);
  const create = useCreateNote(target);
  const update = useUpdateNote(target);
  const remove = useDeleteNote(target);
  const [newText, setNewText] = useState("");
  const [editing, setEditing] = useState<EditingNote | null>(null);
  const [editingMissing, setEditingMissing] = useState(false);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const notesById = new Map<string, Note>();
  for (const page of notesQuery.data?.pages ?? []) {
    for (const note of page.items) notesById.set(note.id, note);
  }
  const notes = [...notesById.values()];
  const orphanedEditing =
    editing && notesQuery.data && !notesById.has(editing.id) ? editing : null;
  const orphanedEditingKnownMissing = Boolean(
    orphanedEditing && (editingMissing || !notesQuery.hasNextPage),
  );
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const titleKey =
    targetType === "contact"
      ? "titleContact"
      : targetType === "conversation"
        ? "titleConversation"
        : "titleInquiry";
  const newTextError = noteTextError(newText);
  const editingTextError = editing ? noteTextError(editing.text) : null;
  const busy = create.isPending || update.isPending || remove.isPending;

  function formatDate(value: string) {
    return dateFormat.format(new Date(value));
  }

  function refresh() {
    setDeleting(null);
    create.reset();
    update.reset();
    remove.reset();
    void notesQuery.refetch();
  }

  function refreshDeletedNote() {
    void notesQuery.refetch().then((result) => {
      if (result.isError) return;
      setDeleting(null);
      remove.reset();
    });
  }

  return (
    <section
      className={
        compact
          ? "border-t border-line px-5 py-5"
          : "rounded-2xl border border-line bg-surface p-5 sm:p-7"
      }
    >
      {!hideTitle && (
        <h2
          className={`${compact ? "text-sm" : "text-lg"} font-semibold text-ink`}
        >
          {t(titleKey)}
        </h2>
      )}

      {canWrite && (
        <form
          className={hideTitle ? "" : "mt-4"}
          onSubmit={(event) => {
            event.preventDefault();
            if (newTextError || busy) return;
            create.mutate(newText.trim(), {
              onSuccess: () => setNewText(""),
            });
          }}
        >
          <label
            className="sr-only"
            htmlFor={`new-note-${targetType}-${targetId}`}
          >
            {t("newNote")}
          </label>
          <textarea
            className="min-h-24 w-full resize-y rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            disabled={busy}
            id={`new-note-${targetType}-${targetId}`}
            onChange={(event) => {
              setNewText(event.target.value);
              if (create.isError) create.reset();
            }}
            placeholder={t("newNotePlaceholder")}
            value={newText}
          />
          {noteLength(newText) > maxNoteLength && (
            <p className="mt-1 text-xs text-danger" role="alert">
              {t("textTooLong")}
            </p>
          )}
          {create.isError && (
            <p className="mt-1 text-xs text-danger" role="alert">
              {t(mutationError(create.error, "saveError"))}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <Button
              disabled={Boolean(newTextError) || busy}
              size="sm"
              type="submit"
            >
              {create.isPending ? t("saving") : t("add")}
            </Button>
          </div>
        </form>
      )}

      <div className={canWrite ? "mt-6" : "mt-4"}>
        {orphanedEditing && (
          <div className="mb-4 rounded-xl border border-danger bg-danger-soft p-3">
            <p className="text-sm text-danger" role="alert">
              {t(orphanedEditingKnownMissing ? "noteRemoved" : "noteNotLoaded")}
            </p>
            <label
              className="sr-only"
              htmlFor={`removed-note-draft-${orphanedEditing.id}`}
            >
              {t("editNote")}
            </label>
            <textarea
              className="mt-3 min-h-24 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              disabled={busy}
              id={`removed-note-draft-${orphanedEditing.id}`}
              onChange={(event) =>
                setEditing({ ...orphanedEditing, text: event.target.value })
              }
              value={orphanedEditing.text}
            />
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              <Button
                onClick={() => {
                  setEditing(null);
                  setEditingMissing(false);
                }}
                size="sm"
                variant="ghost"
              >
                {t("cancel")}
              </Button>
              {canWrite && orphanedEditingKnownMissing && (
                <Button
                  onClick={() => {
                    setNewText(orphanedEditing.text);
                    setEditing(null);
                    setEditingMissing(false);
                    update.reset();
                  }}
                  size="sm"
                  variant="outline"
                >
                  {t("moveDraftToNew")}
                </Button>
              )}
            </div>
          </div>
        )}
        {notesQuery.isPending ? (
          <p className="text-sm text-muted" role="status">
            {t("loading")}
          </p>
        ) : notesQuery.isError && notes.length === 0 ? (
          <div>
            <p className="text-sm text-danger" role="alert">
              {t("loadError")}
            </p>
            <Button
              className="mt-2"
              onClick={refresh}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <>
            {notesQuery.isError && (
              <p className="mb-3 text-sm text-danger" role="alert">
                {t("loadError")}
              </p>
            )}
            <ul className="space-y-3">
              {notes.map((note) => {
                const isEditing = editing?.id === note.id;
                return (
                  <li
                    className="rounded-xl border border-line bg-page px-3 py-3"
                    key={note.id}
                  >
                    {isEditing && editing ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!canWrite || editingTextError || busy) return;
                          update.mutate(
                            {
                              noteId: note.id,
                              text: editing.text.trim(),
                              expectedRevision: editing.revision,
                            },
                            {
                              onSuccess: () => {
                                setEditing(null);
                                setEditingMissing(false);
                              },
                              onError: (error) => {
                                if (
                                  isRevisionConflict(error) ||
                                  isNoteMissing(error)
                                ) {
                                  if (isNoteMissing(error)) {
                                    setEditingMissing(true);
                                  }
                                  void notesQuery.refetch();
                                }
                              },
                            },
                          );
                        }}
                      >
                        <label
                          className="sr-only"
                          htmlFor={`edit-note-${note.id}`}
                        >
                          {t("editNote")}
                        </label>
                        <textarea
                          className="min-h-24 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          disabled={busy}
                          id={`edit-note-${note.id}`}
                          onChange={(event) => {
                            setEditing({
                              ...editing,
                              text: event.target.value,
                            });
                            if (update.isError) update.reset();
                          }}
                          value={editing.text}
                        />
                        {noteLength(editing.text) > maxNoteLength && (
                          <p className="mt-1 text-xs text-danger" role="alert">
                            {t("textTooLong")}
                          </p>
                        )}
                        {!canWrite && (
                          <p className="mt-1 text-xs text-danger" role="alert">
                            {t("permissionDenied")}
                          </p>
                        )}
                        {update.isError && (
                          <p className="mt-1 text-xs text-danger" role="alert">
                            {t(mutationError(update.error, "saveError"))}
                          </p>
                        )}
                        {update.isError && isRevisionConflict(update.error) && (
                          <div className="mt-2 rounded-lg border border-line bg-surface p-3">
                            <p className="text-xs font-medium text-muted">
                              {t("currentVersion")}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
                              {note.text}
                            </p>
                            <Button
                              className="mt-2"
                              disabled={note.revision === editing.revision}
                              onClick={() => {
                                setEditing({
                                  ...editing,
                                  revision: note.revision,
                                });
                                update.reset();
                              }}
                              size="sm"
                              variant="outline"
                            >
                              {t("useCurrentRevision")}
                            </Button>
                            {note.revision === editing.revision && (
                              <Button
                                className="mt-2 ml-2"
                                onClick={() => void notesQuery.refetch()}
                                size="sm"
                                variant="ghost"
                              >
                                {t("refresh")}
                              </Button>
                            )}
                          </div>
                        )}
                        {update.isError && isNoteMissing(update.error) && (
                          <Button
                            className="mt-2"
                            disabled={notesQuery.isFetching}
                            onClick={() => void notesQuery.refetch()}
                            size="sm"
                            variant="outline"
                          >
                            {t("refresh")}
                          </Button>
                        )}
                        <div className="mt-2 flex flex-wrap justify-end gap-2">
                          <Button
                            disabled={busy}
                            onClick={() => {
                              setEditing(null);
                              setEditingMissing(false);
                              update.reset();
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            disabled={
                              Boolean(editingTextError) ||
                              !canWrite ||
                              busy ||
                              (update.isError &&
                                (isRevisionConflict(update.error) ||
                                  isNoteMissing(update.error)))
                            }
                            size="sm"
                            type="submit"
                          >
                            {update.isPending ? t("saving") : t("save")}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap break-words text-sm text-ink">
                          {note.text}
                        </p>
                        <p className="mt-3 text-xs text-muted">
                          {t("writtenBy", {
                            name: note.author.name || t("unknownAuthor"),
                            date: formatDate(note.created_at),
                          })}
                        </p>
                        {note.last_editor && (
                          <p className="mt-1 text-xs text-muted">
                            {t("editedBy", {
                              name: note.last_editor.name || t("unknownAuthor"),
                              date: formatDate(note.updated_at),
                            })}
                          </p>
                        )}
                        {canWrite && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              disabled={busy}
                              onClick={() => {
                                update.reset();
                                setEditingMissing(false);
                                setEditing({
                                  id: note.id,
                                  revision: note.revision,
                                  text: note.text,
                                });
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <Pencil aria-hidden="true" className="size-3.5" />
                              {t("edit")}
                            </Button>
                            <Button
                              disabled={busy}
                              onClick={() => {
                                remove.reset();
                                setDeleting(note);
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden="true" className="size-3.5" />
                              {t("delete")}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {notesQuery.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  disabled={notesQuery.isFetchingNextPage}
                  onClick={() => void notesQuery.fetchNextPage()}
                  size="sm"
                  variant="outline"
                >
                  {notesQuery.isFetchingNextPage
                    ? t("loadingMore")
                    : t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog.Root
        onOpenChange={(open) => {
          if (!open && !remove.isPending) {
            setDeleting(null);
            remove.reset();
          }
        }}
        open={Boolean(deleting)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[81] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 text-ink shadow-xl focus-visible:outline-2 focus-visible:outline-brand">
            <Dialog.Title className="text-lg font-semibold">
              {t("deleteTitle")}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted">
              {t("deleteHelp")}
            </Dialog.Description>
            {remove.isError && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {t(mutationError(remove.error, "deleteError"))}
              </p>
            )}
            {remove.isError &&
              (isRevisionConflict(remove.error) ||
                isNoteMissing(remove.error)) && (
                <Button
                  className="mt-3"
                  disabled={notesQuery.isFetching}
                  onClick={refreshDeletedNote}
                  size="sm"
                  variant="outline"
                >
                  {t("refresh")}
                </Button>
              )}
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button disabled={remove.isPending} size="sm" variant="outline">
                  {t("cancel")}
                </Button>
              </Dialog.Close>
              <Button
                disabled={
                  !deleting ||
                  !canWrite ||
                  remove.isPending ||
                  (remove.isError &&
                    (isRevisionConflict(remove.error) ||
                      isNoteMissing(remove.error)))
                }
                onClick={() => {
                  if (!deleting) return;
                  remove.mutate(
                    {
                      noteId: deleting.id,
                      expectedRevision: deleting.revision,
                    },
                    {
                      onSuccess: () => setDeleting(null),
                      onError: (error) => {
                        if (isNoteMissing(error)) refreshDeletedNote();
                      },
                    },
                  );
                }}
                size="sm"
                variant="danger"
              >
                {remove.isPending ? t("saving") : t("deleteConfirm")}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
