type NamedWorkspace = { id: string; name: string };

export function workspaceDisplayName(
  workspace: NamedWorkspace,
  workspaces: readonly NamedWorkspace[],
): string {
  const hasDuplicate = workspaces.some(
    (other) => other.id !== workspace.id && other.name === workspace.name,
  );
  return hasDuplicate
    ? `${workspace.name} · ${workspace.id.slice(0, 8)}`
    : workspace.name;
}
