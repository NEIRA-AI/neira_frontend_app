import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ChannelRead = components["schemas"]["ChannelRead"];
export type ChannelProvider = ChannelRead["provider"];
export type ChannelStatus = ChannelRead["status"];

export type ValidateChannelInput =
  | (components["schemas"]["ChannelValidate"] & {
      provider: "telegram_bot";
      group_id?: never;
    })
  | (components["schemas"]["ChannelValidate"] & {
      provider: "vk_community";
      group_id: number;
    });

export type ValidatedChannel = components["schemas"]["ChannelValidationRead"];

export type ConnectChannelInput = components["schemas"]["ChannelCreate"] &
  ValidateChannelInput;

export type UpdateChannelInput = components["schemas"]["ChannelUpdate"] & {
  id: string;
};

export const channelsQueryKey = (workspaceId: string) =>
  ["private", "channels", workspaceId] as const;

export const channelQueryKey = (workspaceId: string, channelId: string) =>
  ["private", "channels", workspaceId, channelId] as const;

export async function listChannels(): Promise<ChannelRead[]> {
  const { data } = await api.get<ChannelRead[]>("/channels", {
    workspace: true,
  });
  return data;
}

export async function getChannel(id: string): Promise<ChannelRead> {
  const { data } = await api.get<ChannelRead>(
    `/channels/${encodeURIComponent(id)}`,
    { workspace: true },
  );
  return data;
}

export async function validateChannel(
  input: ValidateChannelInput,
): Promise<ValidatedChannel> {
  const { data } = await api.post<ValidatedChannel>(
    "/channels/validate",
    input,
    {
      workspace: true,
    },
  );
  return data;
}

export async function connectChannel(
  input: ConnectChannelInput,
): Promise<ChannelRead> {
  const { data } = await api.post<ChannelRead>("/channels", input, {
    workspace: true,
  });
  return data;
}

export async function reconnectChannel(input: {
  id: string;
  token: string;
}): Promise<ChannelRead> {
  const { id, token } = input;
  const { data } = await api.post<ChannelRead>(
    `/channels/${encodeURIComponent(id)}/reconnect`,
    { token },
    { workspace: true },
  );
  return data;
}

export async function updateChannel({
  id,
  ...changes
}: UpdateChannelInput): Promise<ChannelRead> {
  const { data } = await api.patch<ChannelRead>(
    `/channels/${encodeURIComponent(id)}`,
    changes,
    { workspace: true },
  );
  return data;
}

export async function checkChannel(id: string): Promise<ChannelRead> {
  const { data } = await api.post<ChannelRead>(
    `/channels/${encodeURIComponent(id)}/check`,
    undefined,
    { workspace: true },
  );
  return data;
}

export async function refreshChannel(id: string): Promise<ChannelRead> {
  const { data } = await api.post<ChannelRead>(
    `/channels/${encodeURIComponent(id)}/refresh`,
    undefined,
    { workspace: true },
  );
  return data;
}

export async function disconnectChannel(id: string): Promise<ChannelRead> {
  const { data } = await api.post<ChannelRead>(
    `/channels/${encodeURIComponent(id)}/disconnect`,
    undefined,
    { workspace: true },
  );
  return data;
}

export async function deleteChannel(id: string): Promise<void> {
  await api.delete(`/channels/${encodeURIComponent(id)}`, {
    workspace: true,
  });
}
