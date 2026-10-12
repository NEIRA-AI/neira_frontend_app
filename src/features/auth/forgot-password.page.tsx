import { AuthLayout } from "./ui/auth-layout";
import { ForgotPasswordForm } from "./ui/forgot-password-form";

function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export const Component = ForgotPasswordPage;
