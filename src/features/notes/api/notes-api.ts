import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type NoteTargetType = components["schemas"]["NoteCreate"]["target_type"];
export type Note = components["schemas"]["NoteRead"];
export type NotePage = components["schemas"]["NotePage"];
type NoteCreate = components["schemas"]["NoteCreate"];
type NoteUpdate = components["schemas"]["NoteUpdate"];

export const notesQueryKey = (
  workspaceId: string,
  targetType: NoteTargetType,
  targetId: string,
) => ["private", "notes", workspaceId, targetType, targetId] as const;

export async function listNotes(
  workspaceId: string,
  targetType: NoteTargetType,
  targetId: string,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<NotePage> {
  const { data } = await api.get<NotePage>("/notes", {
    params: {
      target_type: targetType,
      target_id: targetId,
      limit: 50,
      cursor: cursor ?? undefined,
    },
    workspace: true,
    workspaceScopeId: workspaceId,
    signal,
  });
  return data;
}

export async function createNote(
  workspaceId: string,
  targetType: NoteTargetType,
  targetId: string,
  text: string,
): Promise<Note> {
  const request: NoteCreate = {
    target_type: targetType,
    target_id: targetId,
    text,
  };
  const { data } = await api.post<Note>("/notes", request, {
    workspace: true,
    workspaceScopeId: workspaceId,
  });
  return data;
}

export async function updateNote(
  workspaceId: string,
  noteId: string,
  text: string,
  expectedRevision: number,
): Promise<Note> {
  const request: NoteUpdate = { text, expected_revision: expectedRevision };
  const { data } = await api.patch<Note>(
    `/notes/${encodeURIComponent(noteId)}`,
    request,
    { workspace: true, workspaceScopeId: workspaceId },
  );
  return data;
}

export async function deleteNote(
  workspaceId: string,
  noteId: string,
  expectedRevision: number,
): Promise<void> {
  await api.delete(`/notes/${encodeURIComponent(noteId)}`, {
    params: { expected_revision: expectedRevision },
    workspace: true,
    workspaceScopeId: workspaceId,
  });
}
