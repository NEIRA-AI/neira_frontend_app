import { useState } from "react";
import { useNavigate } from "react-router";

import { ROUTES } from "@/shared/config/routes";

import { useAuth } from "./auth-context";

export function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    let logoutFailed = false;
    try {
      await logout();
    } catch {
      logoutFailed = true;
    }

    await navigate(ROUTES.SIGN_IN, {
      replace: true,
      state: { logoutFailed },
    });
  }

  return { signOut, signingOut };
}
