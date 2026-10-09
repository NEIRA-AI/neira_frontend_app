import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type UpdateProfileInput = components["schemas"]["ProfileUpdateRequest"];
type MeResponse = components["schemas"]["MeResponse"];
type AvatarResponse = components["schemas"]["AvatarResponse"];

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<MeResponse> {
  const { data } = await api.patch<MeResponse>("/auth/me", input);
  return data;
}

export async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<AvatarResponse>("/auth/me/avatar", form, {
    timeout: 120_000,
  });
  return data.avatar_url;
}

export async function removeAvatar(): Promise<void> {
  await api.delete("/auth/me/avatar");
}
