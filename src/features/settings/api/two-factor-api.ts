import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type TwoFactorStatus = components["schemas"]["TwoFactorStatusResponse"];

export type TwoFactorSetup = components["schemas"]["TwoFactorSetupResponse"];

export type BackupCodesResponse = components["schemas"]["BackupCodesResponse"];
type ProtectedRequest = components["schemas"]["TwoFactorProtectedRequest"];

export const twoFactorQueryKey = ["private", "two-factor"] as const;

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const { data } = await api.get<TwoFactorStatus>("/auth/2fa");
  return data;
}

export async function beginTwoFactorSetup(
  currentPassword: string,
): Promise<TwoFactorSetup> {
  const { data } = await api.post<TwoFactorSetup>("/auth/2fa/setup", {
    current_password: currentPassword,
  });
  return data;
}

export async function confirmTwoFactorSetup(
  code: string,
): Promise<BackupCodesResponse> {
  const { data } = await api.post<BackupCodesResponse>("/auth/2fa/confirm", {
    code,
  });
  return data;
}

export async function disableTwoFactor(input: ProtectedRequest): Promise<void> {
  await api.post("/auth/2fa/disable", input);
}

export async function regenerateBackupCodes(
  input: ProtectedRequest,
): Promise<BackupCodesResponse> {
  const { data } = await api.post<BackupCodesResponse>(
    "/auth/2fa/backup-codes/regenerate",
    input,
  );
  return data;
}
