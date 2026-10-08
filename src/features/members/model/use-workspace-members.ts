import { useQuery } from "@tanstack/react-query";

import {
  listWorkspaceMembers,
  workspaceMembersQueryKey,
} from "../api/members-api";

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: workspaceMembersQueryKey(workspaceId ?? ""),
    queryFn: () => {
      if (!workspaceId) throw new Error("Workspace is not selected");
      return listWorkspaceMembers(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });
}
