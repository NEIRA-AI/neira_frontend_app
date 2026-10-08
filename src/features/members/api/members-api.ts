import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type EditableMemberRole =
  components["schemas"]["MemberRoleRequest"]["role"];
export type WorkspaceMember = components["schemas"]["MemberSummary"];
export type WorkspaceInvitation = components["schemas"]["InvitationSummary"];
export type WorkspaceMembersResponse = components["schemas"]["MembersResponse"];

export const workspaceMembersQueryKey = (workspaceId: string) =>
  ["private", "workspace-members", workspaceId] as const;

function workspacePath(workspaceId: string) {
  return `/workspaces/${encodeURIComponent(workspaceId)}`;
}

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMembersResponse> {
  const { data } = await api.get<WorkspaceMembersResponse>(
    `${workspacePath(workspaceId)}/members`,
    { workspace: true },
  );
  return data;
}

export async function createWorkspaceInvitation(
  workspaceId: string,
  input: components["schemas"]["InvitationCreateRequest"],
): Promise<WorkspaceInvitation> {
  const { data } = await api.post<WorkspaceInvitation>(
    `${workspacePath(workspaceId)}/invitations`,
    input,
    { workspace: true },
  );
  return data;
}

export async function renewWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<WorkspaceInvitation> {
  const { data } = await api.post<WorkspaceInvitation>(
    `${workspacePath(workspaceId)}/invitations/${encodeURIComponent(invitationId)}/renew`,
    undefined,
    { workspace: true },
  );
  return data;
}

export async function deleteWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<void> {
  await api.delete(
    `${workspacePath(workspaceId)}/invitations/${encodeURIComponent(invitationId)}`,
    { workspace: true },
  );
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: EditableMemberRole,
): Promise<WorkspaceMember> {
  const { data } = await api.patch<WorkspaceMember>(
    `${workspacePath(workspaceId)}/members/${encodeURIComponent(userId)}`,
    { role },
    { workspace: true },
  );
  return data;
}

export async function deleteWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<void> {
  await api.delete(
    `${workspacePath(workspaceId)}/members/${encodeURIComponent(userId)}`,
    { workspace: true },
  );
}

export async function leaveWorkspace(workspaceId: string): Promise<void> {
  await api.delete(`${workspacePath(workspaceId)}/members/me`, {
    workspace: true,
  });
}
