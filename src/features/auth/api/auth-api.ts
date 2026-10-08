import { z } from "zod";

import { api, publicApi } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("bearer"),
}) satisfies z.ZodType<components["schemas"]["TokenResponse"]>;

const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  telegram: z.string().nullable(),
  avatar_url: z.string(),
  platform_role: z.string(),
  email_verified: z.boolean(),
  workspaces: z.array(workspaceSchema),
  last_deleted_workspace_name: z.string().nullable().optional().default(null),
}) satisfies z.ZodType<components["schemas"]["MeResponse"]>;

export type SessionUser = z.infer<typeof userSchema>;
export type WorkspaceMembership = z.infer<typeof workspaceSchema>;
export type LoginInput = components["schemas"]["LoginRequest"];
export type RegisterInput = components["schemas"]["RegisterRequest"];

export async function fetchCurrentUser(): Promise<SessionUser> {
  const { data } = await api.get<unknown>("/auth/me");
  return userSchema.parse(data);
}

export async function signIn(input: LoginInput): Promise<string> {
  const { data } = await publicApi.post<unknown>("/auth/login", input);
  return tokenSchema.parse(data).access_token;
}

export async function signUp(input: RegisterInput): Promise<string> {
  const { data } = await publicApi.post<unknown>("/auth/register", input);
  return tokenSchema.parse(data).access_token;
}

export async function refreshSession(): Promise<string> {
  const { data } = await publicApi.post<unknown>("/auth/refresh");
  return tokenSchema.parse(data).access_token;
}

export async function endCurrentSession(): Promise<void> {
  await api.post("/auth/logout");
}
