export type RealtimeChange = {
  kind: string;
  action?: string;
  workspace_id?: string;
  contact_id?: string;
  inquiry_id?: string;
  funnel_id?: string;
  channel_id?: string;
  conversation_id?: string;
  message_id?: string;
  direction?: "inbound" | "outbound";
};

export type RealtimeEnvelope = {
  scope: "user" | "workspace";
  workspace_id?: string;
  version: number;
  changes: RealtimeChange[];
};

export type RealtimeState = {
  user_version: number;
  workspace_version: number | null;
};

export function parseRealtimeState(value: unknown): RealtimeState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Record<string, unknown>;
  if (
    typeof state.user_version !== "number" ||
    !Number.isSafeInteger(state.user_version) ||
    state.user_version < 0 ||
    (state.workspace_version !== null &&
      (typeof state.workspace_version !== "number" ||
        !Number.isSafeInteger(state.workspace_version) ||
        state.workspace_version < 0))
  )
    return null;
  return {
    user_version: state.user_version,
    workspace_version: state.workspace_version as number | null,
  };
}

export type QueueRealtimeInvalidation = (
  queryKey: readonly unknown[],
  exact?: boolean,
) => void;
