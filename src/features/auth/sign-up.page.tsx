import { AuthLayout } from "./ui/auth-layout";
import { SignUpForm } from "./ui/sign-up-form";

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}

export const Component = SignUpPage;
