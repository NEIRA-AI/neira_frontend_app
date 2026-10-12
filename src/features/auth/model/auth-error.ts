import axios from "axios";

export function authErrorKey(error: unknown, action: "login" | "register") {
  if (!axios.isAxiosError(error)) return "common.requestFailed" as const;
  const status = error.response?.status;
  if (status === 429) return "common.tryLater" as const;
  if (action === "login" && status === 401) {
    return "login.invalidCredentials" as const;
  }
  if (
    action === "login" &&
    status === 403 &&
    error.response?.data?.detail === "EMAIL_VERIFICATION_REQUIRED"
  ) {
    return "login.emailUnverified" as const;
  }
  if (action === "register") {
    const detail = error.response?.data?.detail;
    if (status === 404 && detail === "Invitation not found") {
      return "register.invitationNotFound" as const;
    }
    if (status === 403 && detail === "Invitation email mismatch") {
      return "register.invitationEmailMismatch" as const;
    }
    if (status === 409) {
      return detail === "Invitation unavailable"
        ? ("register.invitationUnavailable" as const)
        : ("register.emailTaken" as const);
    }
  }
  if (status === 422) return "common.invalidForm" as const;
  return "common.requestFailed" as const;
}
