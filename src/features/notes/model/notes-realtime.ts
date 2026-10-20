import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import { notesQueryKey, type NoteTargetType } from "../api/notes-api";

const targetTypes = new Set<NoteTargetType>([
  "contact",
  "conversation",
  "inquiry",
]);

export function handleNoteRealtimeChange(
  change: RealtimeChange,
  workspaceId: string,
  invalidate: QueueRealtimeInvalidation,
) {
  if (change.kind !== "note.changed") return;
  if (
    change.target_id &&
    change.target_type &&
    targetTypes.has(change.target_type as NoteTargetType)
  ) {
    invalidate(
      notesQueryKey(
        workspaceId,
        change.target_type as NoteTargetType,
        change.target_id,
      ),
      true,
    );
  }
}
