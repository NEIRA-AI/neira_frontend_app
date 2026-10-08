import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import { acceptInvitation } from "../api/invitations-api";
import { invitationQueryKey } from "./use-invitation";

export function useAcceptInvitation(token: string) {
  const queryClient = useQueryClient();
  const { workspaces, refreshCurrentUser, selectWorkspace } = useAuth();

  return useMutation({
    mutationFn: () => acceptInvitation(token),
    onSuccess: async () => {
      const previousIds = new Set(workspaces.map((workspace) => workspace.id));
      try {
        const nextUser = await refreshCurrentUser();
        const joined = nextUser.workspaces.filter(
          (workspace) => !previousIds.has(workspace.id),
        );
        if (joined.length === 1 && joined[0]) selectWorkspace(joined[0].id);
      } catch {
        // Acceptance has already succeeded. Let the session query surface a
        // recoverable loading error instead of offering to accept again.
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueryKey(token),
      });
    },
  });
}
