import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type StatusRead = components["schemas"]["StatusRead"];
export type FunnelRead = components["schemas"]["FunnelRead"];
export type CreateFunnelInput = components["schemas"]["FunnelCreate"];
export type UpdateFunnelInput = components["schemas"]["FunnelUpdate"];

export const funnelsQueryKey = (workspaceId: string) =>
  ["private", "funnels", workspaceId] as const;

export async function listFunnels(): Promise<FunnelRead[]> {
  const { data } = await api.get<FunnelRead[]>("/funnels", { workspace: true });
  return data;
}

export async function getFunnel(id: string): Promise<FunnelRead> {
  const { data } = await api.get<FunnelRead>(
    `/funnels/${encodeURIComponent(id)}`,
    {
      workspace: true,
    },
  );
  return data;
}

export async function createFunnel(
  input: CreateFunnelInput,
): Promise<FunnelRead> {
  const { data } = await api.post<FunnelRead>("/funnels", input, {
    workspace: true,
  });
  return data;
}

export async function updateFunnel(
  input: { id: string } & UpdateFunnelInput,
): Promise<FunnelRead> {
  const { id, ...changes } = input;
  const { data } = await api.patch<FunnelRead>(
    `/funnels/${encodeURIComponent(id)}`,
    changes,
    { workspace: true },
  );
  return data;
}

export async function deleteFunnel(id: string): Promise<void> {
  await api.delete(`/funnels/${encodeURIComponent(id)}`, { workspace: true });
}

export async function updateStatus(
  input: {
    funnelId: string;
    statusId: string;
  } & components["schemas"]["StatusUpdate"],
): Promise<FunnelRead> {
  const { data } = await api.patch<FunnelRead>(
    `/funnels/${encodeURIComponent(input.funnelId)}/statuses/${encodeURIComponent(input.statusId)}`,
    {
      name: input.name,
      description: input.description ?? null,
      color: input.color,
    },
    { workspace: true },
  );
  return data;
}

export async function deleteStatus(input: {
  funnelId: string;
  statusId: string;
}): Promise<void> {
  await api.delete(
    `/funnels/${encodeURIComponent(input.funnelId)}/statuses/${encodeURIComponent(input.statusId)}`,
    { workspace: true },
  );
}

export async function reorderStatuses(input: {
  funnelId: string;
  statusIds: string[];
}): Promise<FunnelRead> {
  const { data } = await api.put<FunnelRead>(
    `/funnels/${encodeURIComponent(input.funnelId)}/statuses/order`,
    { status_ids: input.statusIds },
    { workspace: true },
  );
  return data;
}

export async function makeEntryStatus(input: {
  funnelId: string;
  statusId: string;
}): Promise<FunnelRead> {
  const { data } = await api.post<FunnelRead>(
    `/funnels/${encodeURIComponent(input.funnelId)}/statuses/${encodeURIComponent(input.statusId)}/make-entry`,
    undefined,
    { workspace: true },
  );
  return data;
}
