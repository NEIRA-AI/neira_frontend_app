import { useState, type FormEvent } from "react";

import { authErrorKey } from "./auth-error";
import { fieldErrors, loginSchema, type AuthFieldErrors } from "./auth-forms";
import { useAuth } from "./auth-context";

export function useSignIn() {
  const { login } = useAuth();
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [submitError, setSubmitError] = useState<ReturnType<
    typeof authErrorKey
  > | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const result = loginSchema.safeParse({
      email: data.get("email"),
      password: data.get("password"),
    });

    setSubmitError(null);
    if (!result.success) {
      const nextErrors = fieldErrors(result.error);
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      (
        form.elements.namedItem(firstField ?? "") as HTMLElement | null
      )?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await login(result.data);
    } catch (error) {
      setSubmitError(authErrorKey(error, "login"));
    } finally {
      setSubmitting(false);
    }
  }

  function clearFieldError(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  }

  return {
    clearFieldError,
    errors,
    handleSubmit,
    submitError,
    submitting,
  };
}
