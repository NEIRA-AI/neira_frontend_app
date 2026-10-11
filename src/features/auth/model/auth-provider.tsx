import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  hasAccessToken,
  onAccessTokenLost,
  refreshAccessToken,
  setAccessToken,
  setWorkspaceHeader,
} from "@/shared/api/auth-interceptors";

import {
  endCurrentSession,
  fetchCurrentUser,
  signIn,
  signUp,
  verifyTwoFactorLogin,
  type SessionUser,
} from "../api/auth-api";
import { AuthContext, type AuthContextValue } from "./auth-context";

const WORKSPACE_STORAGE_KEY = "neira.workspaceId";
const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
const PRIVATE_QUERY_KEY = ["private"] as const;
type WorkspaceSelection =
  | { type: "current" }
  | { type: "after-delete"; deletedWorkspaceId: string }
  | { type: "select"; workspaceId: string };

function readStoredWorkspace(): string | null {
  try {
    return localStorage.getItem(WORKSPACE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeWorkspace(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  } catch {
    // The app still works when browser storage is unavailable.
  }
}

function resolveWorkspace(user: SessionUser, preferredId: string | null) {
  const previous = user.workspaces.find(
    (workspace) => workspace.id === preferredId,
  );
  if (previous) return previous.id;
  return user.workspaces.length === 1 ? (user.workspaces[0]?.id ?? null) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState(readStoredWorkspace);
  const selectedWorkspaceIdRef = useRef(selectedWorkspaceId);
  const userRevisionRef = useRef(0);

  const updateWorkspace = useCallback(
    (id: string | null) => {
      const changed = selectedWorkspaceIdRef.current !== id;
      selectedWorkspaceIdRef.current = id;
      setWorkspaceHeader(id);
      storeWorkspace(id);
      setSelectedWorkspaceId(id);
      if (changed) {
        // Private queries may contain data scoped to the previous workspace.
        queryClient.removeQueries({ queryKey: PRIVATE_QUERY_KEY });
      }
    },
    [queryClient],
  );

  useEffect(
    () =>
      onAccessTokenLost(() => {
        userRevisionRef.current += 1;
        updateWorkspace(null);
        queryClient.removeQueries({ queryKey: PRIVATE_QUERY_KEY });
        queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
      }),
    [queryClient, updateWorkspace],
  );

  const meQuery = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      // Access tokens are intentionally not persisted; a refresh cookie restores
      // the session after a reload or when another tab opens.
      if (!hasAccessToken()) {
        await refreshAccessToken();
      }
      const user = await fetchCurrentUser();
      updateWorkspace(resolveWorkspace(user, readStoredWorkspace()));
      return user;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const user = meQuery.data ?? null;
  const workspaces = user?.workspaces ?? [];
  const workspaceId = user ? resolveWorkspace(user, selectedWorkspaceId) : null;

  async function authenticate(requestToken: () => Promise<string>) {
    userRevisionRef.current += 1;
    setAccessToken(await requestToken());
    updateWorkspace(null);
    queryClient.removeQueries({ queryKey: PRIVATE_QUERY_KEY });
    // A successful login or registration is durable. If /auth/me is temporarily
    // unavailable, the session screen can retry without repeating that POST.
    await queryClient.resetQueries({
      queryKey: AUTH_ME_QUERY_KEY,
      exact: true,
    });
  }

  async function logout() {
    userRevisionRef.current += 1;
    let failure: unknown;
    try {
      await endCurrentSession();
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        failure = error;
      }
    }
    setAccessToken(null);
    updateWorkspace(null);
    queryClient.removeQueries({ queryKey: PRIVATE_QUERY_KEY });
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
    if (failure) throw failure;
  }

  function selectWorkspace(id: string) {
    if (!workspaces.some((workspace) => workspace.id === id)) {
      throw new Error("Workspace does not belong to the current user");
    }
    updateWorkspace(id);
  }

  function applyCurrentUser(
    nextUser: SessionUser,
    selection: WorkspaceSelection = { type: "current" },
  ) {
    userRevisionRef.current += 1;
    const currentId = selectedWorkspaceIdRef.current;
    const nextId =
      selection.type === "after-delete"
        ? currentId === selection.deletedWorkspaceId
          ? (nextUser.workspaces[0]?.id ?? null)
          : resolveWorkspace(nextUser, currentId)
        : selection.type === "select"
          ? resolveWorkspace(nextUser, selection.workspaceId)
          : resolveWorkspace(nextUser, currentId);

    updateWorkspace(nextId);
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextUser);
    return nextUser;
  }

  function updateCurrentUser(
    update: (current: SessionUser) => SessionUser,
    selection: WorkspaceSelection = { type: "current" },
  ) {
    const current = queryClient.getQueryData<SessionUser>(AUTH_ME_QUERY_KEY);
    return current ? applyCurrentUser(update(current), selection) : null;
  }

  async function refreshCurrentUser(
    selection: WorkspaceSelection = { type: "current" },
  ) {
    const revision = userRevisionRef.current;
    const nextUser = await fetchCurrentUser();
    if (revision !== userRevisionRef.current) {
      const current = queryClient.getQueryData<SessionUser>(AUTH_ME_QUERY_KEY);
      if (!current) throw new Error("Auth state changed while refreshing");
      return current;
    }
    return applyCurrentUser(nextUser, selection);
  }

  let status: AuthContextValue["status"] = "unauthenticated";
  if (meQuery.isPending || (meQuery.isFetching && !user)) {
    status = "loading";
  } else if (meQuery.isError) {
    status =
      axios.isAxiosError(meQuery.error) &&
      meQuery.error.response?.status === 401
        ? "unauthenticated"
        : "error";
  } else if (user) {
    status = "authenticated";
  }

  function retrySession() {
    void meQuery.refetch();
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        workspaces,
        workspaceId,
        login: async (input) => {
          const result = await signIn(input);
          if (result.twoFactorRequired) return result;
          await authenticate(() => Promise.resolve(result.accessToken));
          return { twoFactorRequired: false };
        },
        completeTwoFactorLogin: (input) =>
          authenticate(() => verifyTwoFactorLogin(input)),
        register: (input) => authenticate(() => signUp(input)),
        logout,
        selectWorkspace,
        updateCurrentUser,
        refreshCurrentUser,
        retrySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
