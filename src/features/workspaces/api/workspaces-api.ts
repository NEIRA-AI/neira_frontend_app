import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type WorkspaceSummary = components["schemas"]["WorkspaceSummary"];
export type WorkspacesResponse = components["schemas"]["WorkspacesResponse"];
export type WorkspaceNameInput = components["schemas"]["WorkspaceNameRequest"];

export async function listWorkspaces(): Promise<WorkspacesResponse> {
  const { data } = await api.get<WorkspacesResponse>("/workspaces");
  return data;
}

export async function createWorkspace(
  input: WorkspaceNameInput,
): Promise<WorkspaceSummary> {
  const { data } = await api.post<WorkspaceSummary>("/workspaces", input);
  return data;
}

export async function renameWorkspace({
  id,
  name,
}: WorkspaceNameInput & { id: string }): Promise<WorkspaceSummary> {
  const { data } = await api.patch<WorkspaceSummary>(
    `/workspaces/${encodeURIComponent(id)}`,
    { name },
  );
  return data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await api.delete(`/workspaces/${encodeURIComponent(id)}`);
}
