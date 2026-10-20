import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createNote,
  deleteNote,
  listNotes,
  notesQueryKey,
  type NoteTargetType,
  updateNote,
} from "../api/notes-api";

type NoteTarget = {
  workspaceId: string;
  targetType: NoteTargetType;
  targetId: string;
};

export function useNotes(target: NoteTarget, enabled = true) {
  const { workspaceId, targetType, targetId } = target;
  return useInfiniteQuery({
    queryKey: notesQueryKey(workspaceId, targetType, targetId),
    queryFn: ({ pageParam, signal }) =>
      listNotes(workspaceId, targetType, targetId, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: enabled && Boolean(workspaceId && targetId),
  });
}

export function useCreateNote(target: NoteTarget) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      createNote(target.workspaceId, target.targetType, target.targetId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notesQueryKey(
          target.workspaceId,
          target.targetType,
          target.targetId,
        ),
        exact: true,
      });
    },
  });
}

export function useUpdateNote(target: NoteTarget) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      noteId: string;
      text: string;
      expectedRevision: number;
    }) =>
      updateNote(
        target.workspaceId,
        input.noteId,
        input.text,
        input.expectedRevision,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notesQueryKey(
          target.workspaceId,
          target.targetType,
          target.targetId,
        ),
        exact: true,
      });
    },
  });
}

export function useDeleteNote(target: NoteTarget) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { noteId: string; expectedRevision: number }) =>
      deleteNote(target.workspaceId, input.noteId, input.expectedRevision),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notesQueryKey(
          target.workspaceId,
          target.targetType,
          target.targetId,
        ),
        exact: true,
      });
    },
  });
}
