import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import {
  createWorkspace,
  type WorkspaceNameInput,
} from "../api/workspaces-api";

export function useCreateWorkspace() {
  const { updateCurrentUser } = useAuth();

  return useMutation({
    mutationFn: (input: WorkspaceNameInput & { switchToNew: boolean }) =>
      createWorkspace({ name: input.name }),
    onSuccess: (created, input) => {
      updateCurrentUser(
        (current) => ({
          ...current,
          workspaces: [...current.workspaces, created],
        }),
        input.switchToNew
          ? { type: "select", workspaceId: created.id }
          : { type: "current" },
      );
    },
  });
}
