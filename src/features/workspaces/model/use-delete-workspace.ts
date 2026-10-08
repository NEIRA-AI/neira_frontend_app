import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { useAuth } from "@/features/auth";

import { deleteWorkspace } from "../api/workspaces-api";

export function useDeleteWorkspace() {
  const { updateCurrentUser, refreshCurrentUser } = useAuth();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (_, deletedId) => {
      updateCurrentUser(
        (current) => ({
          ...current,
          workspaces: current.workspaces.filter(
            (workspace) => workspace.id !== deletedId,
          ),
        }),
        { type: "after-delete", deletedWorkspaceId: deletedId },
      );
    },
    onError: (error, deletedId) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 409)
      ) {
        void refreshCurrentUser(
          error.response.status === 404
            ? { type: "after-delete", deletedWorkspaceId: deletedId }
            : { type: "current" },
        ).catch(() => undefined);
      }
    },
  });
}
