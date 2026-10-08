import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteWorkspaceInvitation,
  workspaceMembersQueryKey,
} from "../api/members-api";

export function useDeleteWorkspaceInvitation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      deleteWorkspaceInvitation(workspaceId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}
