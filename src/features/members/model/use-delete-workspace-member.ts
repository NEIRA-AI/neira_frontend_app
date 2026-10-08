import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteWorkspaceMember,
  workspaceMembersQueryKey,
} from "../api/members-api";

export function useDeleteWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteWorkspaceMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(workspaceId),
      });
    },
  });
}
