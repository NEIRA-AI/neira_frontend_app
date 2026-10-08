import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ChangePasswordInput =
  components["schemas"]["ChangePasswordRequest"];

export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  await api.post("/auth/change-password", input);
}
