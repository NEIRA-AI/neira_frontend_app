import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import { removeAvatar } from "../api/profile-api";

export function useRemoveAvatar() {
  const { updateCurrentUser } = useAuth();

  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => updateCurrentUser((user) => ({ ...user, avatar_url: "" })),
  });
}
