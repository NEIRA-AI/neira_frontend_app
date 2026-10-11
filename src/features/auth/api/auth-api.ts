import { z } from "zod";

import { api, publicApi } from "@/shared/api/client";
import { withAuthCookieLock } from "@/shared/api/auth-interceptors";
import type { components } from "@/shared/api/generated/schema";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("bearer"),
}) satisfies z.ZodType<components["schemas"]["TokenResponse"]>;

const twoFactorChallengeSchema = z.object({
  two_factor_required: z.literal(true),
  challenge_token: z.string().min(1),
  expires_in: z.number().positive(),
}) satisfies z.ZodType<components["schemas"]["TwoFactorChallengeResponse"]>;

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
  impersonation: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .nullable()
    .optional()
    .default(null),
}) satisfies z.ZodType<components["schemas"]["MeResponse"]>;

export type SessionUser = z.infer<typeof userSchema>;
export type WorkspaceMembership = z.infer<typeof workspaceSchema>;
export type LoginInput = components["schemas"]["LoginRequest"];
export type RegisterInput = components["schemas"]["RegisterRequest"];

export async function fetchCurrentUser(): Promise<SessionUser> {
  const { data } = await api.get<unknown>("/auth/me");
  return userSchema.parse(data);
}

export type SignInResult =
  | { twoFactorRequired: false; accessToken: string }
  | { twoFactorRequired: true; challengeToken: string };

export async function signIn(input: LoginInput): Promise<SignInResult> {
  return withAuthCookieLock(async () => {
    const { data } = await publicApi.post<unknown>("/auth/login", input);
    const challenge = twoFactorChallengeSchema.safeParse(data);
    if (challenge.success) {
      return {
        twoFactorRequired: true,
        challengeToken: challenge.data.challenge_token,
      };
    }
    return {
      twoFactorRequired: false,
      accessToken: tokenSchema.parse(data).access_token,
    };
  });
}

export async function verifyTwoFactorLogin(
  input: components["schemas"]["LoginTwoFactorRequest"],
): Promise<string> {
  return withAuthCookieLock(async () => {
    const { data } = await publicApi.post<unknown>("/auth/login/2fa", input);
    return tokenSchema.parse(data).access_token;
  });
}

export async function signUp(input: RegisterInput): Promise<string> {
  return withAuthCookieLock(async () => {
    const { data } = await publicApi.post<unknown>("/auth/register", input);
    return tokenSchema.parse(data).access_token;
  });
}

export async function refreshSession(): Promise<string> {
  const { data } = await publicApi.post<unknown>("/auth/refresh");
  return tokenSchema.parse(data).access_token;
}

export async function endCurrentSession(): Promise<void> {
  await withAuthCookieLock(() =>
    api.post("/auth/logout", null, { skipAuthRefresh: true }),
  );
}

export async function startImpersonationSession(
  targetUserId: string,
): Promise<string> {
  const input: components["schemas"]["ImpersonationStartRequest"] = {
    target_user_id: targetUserId,
  };
  const { data } = await api.post<unknown>("/auth/impersonation/start", input, {
    skipAuthRefresh: true,
    identitySwitchRequest: true,
  });
  return tokenSchema.parse(data).access_token;
}

export async function stopImpersonationSession(): Promise<string> {
  const { data } = await api.post<unknown>("/auth/impersonation/stop", null, {
    skipAuthRefresh: true,
    identitySwitchRequest: true,
  });
  return tokenSchema.parse(data).access_token;
}
