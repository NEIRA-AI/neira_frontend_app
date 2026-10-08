import { ROUTES } from "@/shared/config/routes";
import { generatePath } from "react-router";

export type InvitationAuthDetails = {
  token: string;
  email: string;
  workspaceName: string;
};

const invitationTokenPattern = /^[A-Za-z0-9._~-]{20,128}$/;

function invitationPath(token: string): string {
  return generatePath("/invites/:token", { token });
}

export function authReturnPath(state: unknown): string {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return ROUTES.HOME;
  }
  const from = state.from;
  if (
    typeof from !== "string" ||
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from.includes("\\") ||
    from.startsWith("/auth/")
  ) {
    return ROUTES.HOME;
  }
  return from;
}

export function invitationAuthDetails(
  state: unknown,
): InvitationAuthDetails | null {
  if (
    typeof state !== "object" ||
    state === null ||
    !("invitation" in state) ||
    typeof state.invitation !== "object" ||
    state.invitation === null
  ) {
    return null;
  }

  const invitation = state.invitation;
  if (
    !("token" in invitation) ||
    typeof invitation.token !== "string" ||
    !invitationTokenPattern.test(invitation.token) ||
    !("email" in invitation) ||
    typeof invitation.email !== "string" ||
    !("workspaceName" in invitation) ||
    typeof invitation.workspaceName !== "string"
  ) {
    return null;
  }

  return {
    token: invitation.token,
    email: invitation.email,
    workspaceName: invitation.workspaceName,
  };
}

export function invitationSignInState(invitation: InvitationAuthDetails) {
  return { from: invitationPath(invitation.token), invitation };
}

export function invitationSignUpState(invitation: InvitationAuthDetails) {
  // Registration accepts the invitation atomically, so the next stop is the app.
  return { from: ROUTES.SETTINGS, invitation };
}
