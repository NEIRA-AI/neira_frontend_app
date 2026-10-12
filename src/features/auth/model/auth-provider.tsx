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
  beginIdentitySwitch,
  endIdentitySwitch,
  hasAccessToken,
  onAccessTokenLost,
  onSessionIdentityChanged,
  replaceSessionAccessToken,
  refreshAccessToken,
  setAccessToken,
  setWorkspaceHeader,
  withAuthCookieLock,
} from "@/shared/api/auth-interceptors";
import { ROUTES } from "@/shared/config/routes";

import {
  endCurrentSession,
  fetchCurrentUser,
  signIn,
  signUp,
  startImpersonationSession,
  stopImpersonationSession,
  verifyTwoFactorLogin,
  type SessionUser,
} from "../api/auth-api";
import { AuthContext, type AuthContextValue } from "./auth-context";
import {
  clearSessionRecoveryRequired,
  markSessionRecoveryRequired,
} from "./session-recovery";

const WORKSPACE_STORAGE_KEY = "neira.workspaceId";
const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
const PRIVATE_QUERY_KEY = ["private"] as const;
const SESSION_CHANGE_STORAGE_KEY = "neira.authSessionChanged";
const SESSION_CHANGE_CHANNEL = "neira.authSession";
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

function readSessionChange(): string | null {
  try {
    return localStorage.getItem(SESSION_CHANGE_STORAGE_KEY);
  } catch {
    return null;
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
  const [switchingIdentity, setSwitchingIdentity] = useState(false);
  const selectedWorkspaceIdRef = useRef(selectedWorkspaceId);
  const userRevisionRef = useRef(0);
  const sessionChangeRef = useRef(readSessionChange());
  const externalSessionChangeRef = useRef(false);
  const sessionChannelRef = useRef<BroadcastChannel | null>(null);

  const invalidateExternalSession = useCallback(() => {
    if (externalSessionChangeRef.current) return;
    externalSessionChangeRef.current = true;
    markSessionRecoveryRequired();
    setSwitchingIdentity(true);
    userRevisionRef.current += 1;
    setAccessToken(null);
    setWorkspaceHeader(null);
    storeWorkspace(null);
    queryClient.clear();
    // The refresh cookie changed in another tab. Reload to restore /auth/me,
    // workspaces and all non-query state under that new identity.
    window.location.reload();
  }, [queryClient]);

  const handleExternalSessionChange = useCallback(
    (marker: string | null) => {
      if (!marker || marker === sessionChangeRef.current) return;
      sessionChangeRef.current = marker;
      invalidateExternalSession();
    },
    [invalidateExternalSession],
  );

  function announceSessionChange() {
    const marker =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random()}`;
    sessionChangeRef.current = marker;
    try {
      localStorage.setItem(SESSION_CHANGE_STORAGE_KEY, marker);
    } catch {
      // BroadcastChannel still informs other live tabs without local storage.
    }
    try {
      sessionChannelRef.current?.postMessage(marker);
    } catch {
      // Storage events and the refresh token guard still protect other tabs.
    }
  }

  useEffect(() => {
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(SESSION_CHANGE_CHANNEL);
    sessionChannelRef.current = channel;
    if (channel) {
      channel.onmessage = (event: MessageEvent<unknown>) => {
        if (typeof event.data === "string") {
          handleExternalSessionChange(event.data);
        }
      };
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_CHANGE_STORAGE_KEY) {
        handleExternalSessionChange(event.newValue);
      }
    };
    const checkSessionChange = () => {
      handleExternalSessionChange(readSessionChange());
    };
    const onVisibilityChange = () => {
      if (!document.hidden) checkSessionChange();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", checkSessionChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    checkSessionChange();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", checkSessionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (sessionChannelRef.current === channel)
        sessionChannelRef.current = null;
      channel?.close();
    };
  }, [handleExternalSessionChange]);

  useEffect(
    () => onSessionIdentityChanged(invalidateExternalSession),
    [invalidateExternalSession],
  );

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
      clearSessionRecoveryRequired();
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
    announceSessionChange();
    updateWorkspace(null);
    queryClient.removeQueries({ queryKey: PRIVATE_QUERY_KEY });
    // A successful login or registration is durable. If /auth/me is temporarily
    // unavailable, the session screen can retry without repeating that POST.
    await queryClient.resetQueries({
      queryKey: AUTH_ME_QUERY_KEY,
      exact: true,
    });
  }

  async function changeIdentity(
    requestToken: () => Promise<string>,
  ): Promise<void> {
    beginIdentitySwitch();
    let switchedOnServer = false;
    let reloading = false;
    try {
      const token = await withAuthCookieLock(async () => {
        const nextToken = await requestToken();
        announceSessionChange();
        return nextToken;
      });
      switchedOnServer = true;
      setSwitchingIdentity(true);
      userRevisionRef.current += 1;
      await queryClient.cancelQueries();
      replaceSessionAccessToken(token);
      endIdentitySwitch();
      updateWorkspace(null);
      queryClient.clear();
      // A new refresh cookie is already active. Restore the complete app from
      // that session; /auth/me failures then show the session error screen.
      reloading = true;
      window.location.replace(ROUTES.SELECT_WORKSPACE);
    } catch (error) {
      if (switchedOnServer || !axios.isAxiosError(error) || !error.response) {
        // A response could be lost after the server set its cookie. Never
        // continue showing the previous account under an uncertain session.
        setSwitchingIdentity(true);
        if (!switchedOnServer) announceSessionChange();
        queryClient.clear();
        reloading = true;
        window.location.replace(ROUTES.SELECT_WORKSPACE);
        return;
      }
      throw error;
    } finally {
      endIdentitySwitch();
      if (!reloading) setSwitchingIdentity(false);
    }
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
    announceSessionChange();
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
  if (switchingIdentity || meQuery.isPending || (meQuery.isFetching && !user)) {
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
        register: signUp,
        logout,
        startImpersonation: (targetUserId) =>
          changeIdentity(() => startImpersonationSession(targetUserId)),
        stopImpersonation: () => changeIdentity(stopImpersonationSession),
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
