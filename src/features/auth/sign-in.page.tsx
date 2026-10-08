import { useLocation } from "react-router";

import { AuthLayout } from "./ui/auth-layout";
import { SignInForm } from "./ui/sign-in-form";

function SignInPage() {
  const { state } = useLocation();
  const logoutFailed =
    typeof state === "object" &&
    state !== null &&
    "logoutFailed" in state &&
    state.logoutFailed === true;

  return (
    <AuthLayout>
      <SignInForm logoutFailed={logoutFailed} />
    </AuthLayout>
  );
}

export const Component = SignInPage;
