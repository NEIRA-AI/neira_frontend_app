import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  renewWorkspaceInvitation,
  workspaceMembersQueryKey,
} from "../api/members-api";

export function useRenewWorkspaceInvitation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      renewWorkspaceInvitation(workspaceId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}
