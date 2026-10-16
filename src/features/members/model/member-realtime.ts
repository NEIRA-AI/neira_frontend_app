import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import { workspaceMembersQueryKey } from "../api/members-api";

export function handleMemberRealtimeChange(
  change: RealtimeChange,
  workspaceId: string,
  invalidate: QueueRealtimeInvalidation,
) {
  if (change.kind === "members.changed") {
    invalidate(workspaceMembersQueryKey(workspaceId), true);
  }
}
