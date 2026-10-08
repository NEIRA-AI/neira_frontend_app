import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import { leaveWorkspace } from "../api/members-api";

export function useLeaveWorkspace(workspaceId: string) {
  const { updateCurrentUser, refreshCurrentUser } = useAuth();

  return useMutation({
    mutationFn: () => leaveWorkspace(workspaceId),
    onSuccess: () => {
      updateCurrentUser(
        (current) => ({
          ...current,
          workspaces: current.workspaces.filter(
            (workspace) => workspace.id !== workspaceId,
          ),
        }),
        { type: "after-delete", deletedWorkspaceId: workspaceId },
      );
      void refreshCurrentUser().catch(() => undefined);
    },
  });
}
