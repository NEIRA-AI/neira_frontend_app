import axios, { type InternalAxiosRequestConfig } from "axios";

import { api } from "./client";

declare module "axios" {
  interface AxiosRequestConfig {
    workspace?: boolean;
    workspaceScopeId?: string;
    skipAuthRefresh?: boolean;
    identitySwitchRequest?: boolean;
  }
}

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _sessionEpoch?: number;
  _tokenVersion?: number;
  _retry?: boolean;
};

let accessToken: string | null = null;
let workspaceId: string | null = null;
let sessionEpoch = 0;
let tokenVersion = 0;
let refreshPromise: Promise<string> | null = null;
let refreshRequest: (() => Promise<string>) | null = null;
let interceptorsInstalled = false;
let identitySwitchPending = false;
const accessTokenLostListeners = new Set<() => void>();
const sessionIdentityChangedListeners = new Set<() => void>();

function tokenSession(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims: unknown = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );
    if (!claims || typeof claims !== "object") return null;
    const { sub, sid } = claims as Record<string, unknown>;
    return typeof sub === "string" && typeof sid === "string"
      ? `${sub}:${sid}`
      : null;
  } catch {
    return null;
  }
}

/** The refresh cookie is shared by all tabs. Serialize cookie-changing
 * requests so a late refresh cannot overwrite a successful identity switch. */
export async function withAuthCookieLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request("neira.auth-cookie", operation);
  }
  return await operation();
}

export function setAccessToken(token: string | null): void {
  const lostAccessToken = accessToken !== null && token === null;
  if ((accessToken === null) !== (token === null)) sessionEpoch += 1;
  accessToken = token;
  tokenVersion += 1;
  if (lostAccessToken) {
    accessTokenLostListeners.forEach((listener) => listener());
  }
}

/** Replace an authenticated identity without letting requests from the old
 * session refresh or retry under the new one. */
export function replaceSessionAccessToken(token: string): void {
  sessionEpoch += 1;
  accessToken = token;
  tokenVersion += 1;
  refreshPromise = null;
}

/** Invalidate pending refreshes before a cookie-changing start/stop request. */
export function beginIdentitySwitch(): void {
  if (identitySwitchPending)
    throw new Error("Identity switch already in progress");
  identitySwitchPending = true;
  sessionEpoch += 1;
  tokenVersion += 1;
  refreshPromise = null;
}

export function endIdentitySwitch(): void {
  identitySwitchPending = false;
}

export function hasAccessToken(): boolean {
  return accessToken !== null;
}

/** Read the current in-memory token for transports that cannot use Axios. */
export function getAccessToken(): string | null {
  return accessToken;
}

export function onAccessTokenLost(listener: () => void): () => void {
  accessTokenLostListeners.add(listener);
  return () => {
    accessTokenLostListeners.delete(listener);
  };
}

export function onSessionIdentityChanged(listener: () => void): () => void {
  sessionIdentityChangedListeners.add(listener);
  return () => {
    sessionIdentityChangedListeners.delete(listener);
  };
}

export function setWorkspaceHeader(id: string | null): void {
  workspaceId = id;
}

export function refreshAccessToken(): Promise<string> {
  if (identitySwitchPending) {
    return Promise.reject(new Error("Identity switch in progress"));
  }
  const refresh = refreshRequest;
  if (!refresh) throw new Error("Auth transport is not configured");

  if (!refreshPromise) {
    const epoch = sessionEpoch;
    const version = tokenVersion;
    const pending = (async () => {
      try {
        const token = await withAuthCookieLock(async () => {
          if (
            identitySwitchPending ||
            epoch !== sessionEpoch ||
            version !== tokenVersion
          ) {
            throw new Error("Session changed before refreshing");
          }
          return refresh();
        });
        if (epoch !== sessionEpoch || version !== tokenVersion) {
          throw new Error("Session changed while refreshing");
        }
        if (accessToken !== null) {
          const currentSession = tokenSession(accessToken);
          if (!currentSession || currentSession !== tokenSession(token)) {
            // A second tab changed the shared refresh cookie. Never replay the
            // original request with that tab's identity and workspace.
            setAccessToken(null);
            sessionIdentityChangedListeners.forEach((listener) => listener());
            throw new Error("Session identity changed while refreshing");
          }
        }
        setAccessToken(token);
        return token;
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401 &&
          epoch === sessionEpoch &&
          version === tokenVersion
        ) {
          setAccessToken(null);
        }
        throw error;
      }
    })();
    const tracked = pending.finally(() => {
      if (refreshPromise === tracked) refreshPromise = null;
    });
    refreshPromise = tracked;
  }
  return refreshPromise;
}

export function installAuthInterceptors(refresh: () => Promise<string>): void {
  refreshRequest = refresh;
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  api.interceptors.request.use(
    (config: AuthRequestConfig) => {
      if (identitySwitchPending && !config.identitySwitchRequest) {
        throw new Error("Identity switch in progress");
      }
      config._sessionEpoch = sessionEpoch;
      config._tokenVersion = tokenVersion;
      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        config.headers.delete("Authorization");
      }
      if (config.workspace && !config._retry) {
        const requestWorkspaceId = config.workspaceScopeId ?? workspaceId;
        if (!requestWorkspaceId) throw new Error("Workspace is not selected");
        config.headers.set("X-Neira-Workspace-Id", requestWorkspaceId);
      }
      return config;
    },
    undefined,
    { synchronous: true },
  );

  api.interceptors.response.use(undefined, async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }

    const request = error.config as AuthRequestConfig | undefined;
    if (!request || request._retry || request.skipAuthRefresh) throw error;
    request._retry = true;

    // Never replay a request under a different login session.
    if (request._sessionEpoch !== sessionEpoch) throw error;

    if (request._tokenVersion === tokenVersion) {
      await refreshAccessToken();
    } else if (!accessToken) {
      throw error;
    }
    const retryEpoch = sessionEpoch;

    try {
      return await api.request(request);
    } catch (retryError) {
      if (
        axios.isAxiosError(retryError) &&
        retryError.response?.status === 401 &&
        retryEpoch === sessionEpoch
      ) {
        setAccessToken(null);
      }
      throw retryError;
    }
  });
}
