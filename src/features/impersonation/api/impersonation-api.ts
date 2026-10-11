import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ImpersonationTarget = components["schemas"]["ImpersonationTarget"];
export type ImpersonationUsersPage =
  components["schemas"]["ImpersonationTargetsResponse"];

export const impersonationUsersQueryKey = (search?: string) =>
  ["private", "impersonation", "users", search ?? ""] as const;

export async function authorizeImpersonation(
  currentPassword: string,
): Promise<void> {
  const input: components["schemas"]["ImpersonationAuthorizeRequest"] = {
    current_password: currentPassword,
  };
  await api.post("/auth/impersonation/authorize", input);
}

export async function listImpersonationUsers(
  search: string,
  offset: number,
): Promise<ImpersonationUsersPage> {
  const { data } = await api.get<ImpersonationUsersPage>(
    "/auth/impersonation/users",
    { params: { search: search || undefined, limit: 25, offset } },
  );
  return data;
}
