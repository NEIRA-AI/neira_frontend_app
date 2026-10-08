import axios, { type InternalAxiosRequestConfig } from "axios";

import { api } from "./client";

declare module "axios" {
  interface AxiosRequestConfig {
    workspace?: boolean;
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
const accessTokenLostListeners = new Set<() => void>();

export function setAccessToken(token: string | null): void {
  const lostAccessToken = accessToken !== null && token === null;
  if ((accessToken === null) !== (token === null)) sessionEpoch += 1;
  accessToken = token;
  tokenVersion += 1;
  if (lostAccessToken) {
    accessTokenLostListeners.forEach((listener) => listener());
  }
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

export function setWorkspaceHeader(id: string | null): void {
  workspaceId = id;
}

export function refreshAccessToken(): Promise<string> {
  const refresh = refreshRequest;
  if (!refresh) throw new Error("Auth transport is not configured");

  if (!refreshPromise) {
    const epoch = sessionEpoch;
    const version = tokenVersion;
    refreshPromise = (async () => {
      try {
        const token = await refresh();
        if (epoch !== sessionEpoch || version !== tokenVersion) {
          throw new Error("Session changed while refreshing");
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
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function installAuthInterceptors(refresh: () => Promise<string>): void {
  refreshRequest = refresh;
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  api.interceptors.request.use(
    (config: AuthRequestConfig) => {
      config._sessionEpoch = sessionEpoch;
      config._tokenVersion = tokenVersion;
      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        config.headers.delete("Authorization");
      }
      if (config.workspace && !config._retry) {
        if (!workspaceId) throw new Error("Workspace is not selected");
        config.headers.set("X-Neira-Workspace-Id", workspaceId);
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
    if (!request || request._retry) throw error;
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
