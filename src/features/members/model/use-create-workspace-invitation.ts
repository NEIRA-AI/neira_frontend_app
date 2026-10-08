import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createWorkspaceInvitation,
  workspaceMembersQueryKey,
  type EditableMemberRole,
} from "../api/members-api";

export function useCreateWorkspaceInvitation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; role: EditableMemberRole }) =>
      createWorkspaceInvitation(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}
