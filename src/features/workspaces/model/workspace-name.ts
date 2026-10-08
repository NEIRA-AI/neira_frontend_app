export function normalizedWorkspaceName(value: string): string | null {
  const name = value.trim();
  return name.length >= 1 && name.length <= 120 ? name : null;
}
