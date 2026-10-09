import axios from "axios";

type ChannelErrorDetail = { code?: string; message?: string };

export function channelErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const detail: unknown = error.response?.data?.detail;
  if (typeof detail === "object" && detail !== null) {
    const { code } = detail as ChannelErrorDetail;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function channelFailureKey(code: string | null) {
  switch (code) {
    case "invalid_token":
      return "invalidToken" as const;
    case "missing_permissions":
      return "missingPermissions" as const;
    case "invalid_group":
      return "invalidVkCommunity" as const;
    case "provider_unavailable":
    case "webhook_not_configured":
    case "channel_credentials_unavailable":
      return "providerUnavailable" as const;
    case "webhook_conflict":
      return "webhookSetupFailed" as const;
    case "invalid_funnel":
      return "invalidFunnel" as const;
    case "webhook_replaced":
      return "webhookReplaced" as const;
    case "connection_unavailable":
      return "connectionNeedsReconnect" as const;
    case "connection_superseded":
      return "connectionSuperseded" as const;
    case "webhook_removal_failed":
      return "webhookRemovalFailed" as const;
    case "funnel_deleted":
      return "funnelDeleted" as const;
    case "channel_identity_changed":
      return "channelIdentityChanged" as const;
    default:
      return null;
  }
}
