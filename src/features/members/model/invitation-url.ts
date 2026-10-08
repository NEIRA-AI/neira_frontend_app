export function invitationUrl(token: string) {
  return `${window.location.origin}/invites/${encodeURIComponent(token)}`;
}
