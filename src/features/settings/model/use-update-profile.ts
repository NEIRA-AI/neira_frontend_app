import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";

import { updateProfile } from "../api/profile-api";

export function useUpdateProfile() {
  const { updateCurrentUser } = useAuth();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) =>
      updateCurrentUser((current) => ({
        ...current,
        name: user.name,
        telegram: user.telegram,
      })),
  });
}
