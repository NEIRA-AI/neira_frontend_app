import { AuthLayout } from "./ui/auth-layout";
import { ResetPasswordForm } from "./ui/reset-password-form";

function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export const Component = ResetPasswordPage;
