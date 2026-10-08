import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { useAuth } from "@/features/auth";

import { renameWorkspace } from "../api/workspaces-api";

export function useRenameWorkspace() {
  const { updateCurrentUser, refreshCurrentUser } = useAuth();

  return useMutation({
    mutationFn: renameWorkspace,
    onSuccess: (renamed) => {
      updateCurrentUser((current) => ({
        ...current,
        workspaces: current.workspaces.map((workspace) =>
          workspace.id === renamed.id ? renamed : workspace,
        ),
      }));
    },
    onError: (error, { id }) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        void refreshCurrentUser({
          type: "after-delete",
          deletedWorkspaceId: id,
        }).catch(() => undefined);
      }
    },
  });
}
