import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateWorkspaceMemberRole,
  workspaceMembersQueryKey,
  type EditableMemberRole,
} from "../api/members-api";

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: EditableMemberRole;
    }) => updateWorkspaceMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}
