import { createContext, useContext } from "react";

import type {
  LoginInput,
  RegisterInput,
  SessionUser,
  WorkspaceMembership,
} from "../api/auth-api";

export type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated" | "error";
  user: SessionUser | null;
  workspaces: WorkspaceMembership[];
  workspaceId: string | null;
  login: (
    input: LoginInput,
  ) => Promise<
    | { twoFactorRequired: false }
    | { twoFactorRequired: true; challengeToken: string }
  >;
  completeTwoFactorLogin: (input: {
    challenge_token: string;
    code: string;
  }) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  selectWorkspace: (id: string) => void;
  updateCurrentUser: (
    update: (current: SessionUser) => SessionUser,
    selection?:
      | { type: "current" }
      | { type: "after-delete"; deletedWorkspaceId: string }
      | { type: "select"; workspaceId: string },
  ) => SessionUser | null;
  refreshCurrentUser: (
    selection?:
      | { type: "current" }
      | { type: "after-delete"; deletedWorkspaceId: string }
      | { type: "select"; workspaceId: string },
  ) => Promise<SessionUser>;
  retrySession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return auth;
}
