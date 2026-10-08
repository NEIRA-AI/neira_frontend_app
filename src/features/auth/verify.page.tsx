import { AuthLayout } from "./ui/auth-layout";
import { VerifyForm } from "./ui/verify-form";

function VerifyPage() {
  return (
    <AuthLayout>
      <VerifyForm />
    </AuthLayout>
  );
}

export const Component = VerifyPage;
