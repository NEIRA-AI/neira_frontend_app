const SESSION_RECOVERY_KEY = "neira.sessionRecoveryRequired";

export function markSessionRecoveryRequired(): void {
  try {
    sessionStorage.setItem(SESSION_RECOVERY_KEY, "1");
  } catch {
    // Session storage can be unavailable in restrictive browser modes.
  }
}

export function clearSessionRecoveryRequired(): void {
  try {
    sessionStorage.removeItem(SESSION_RECOVERY_KEY);
  } catch {
    // Authentication still succeeds without browser storage.
  }
}

export function isSessionRecoveryRequired(): boolean {
  try {
    return sessionStorage.getItem(SESSION_RECOVERY_KEY) === "1";
  } catch {
    return false;
  }
}
