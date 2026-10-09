import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import { uploadAvatar } from "../api/profile-api";

export function useUploadAvatar() {
  const { updateCurrentUser } = useAuth();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) =>
      updateCurrentUser((user) => ({ ...user, avatar_url: avatarUrl })),
  });
}
