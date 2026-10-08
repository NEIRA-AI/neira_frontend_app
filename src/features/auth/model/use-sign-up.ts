import { useState, type FormEvent } from "react";

import { authErrorKey } from "./auth-error";
import {
  fieldErrors,
  registerSchema,
  type AuthFieldErrors,
} from "./auth-forms";
import { useAuth } from "./auth-context";

export function useSignUp(invitationToken?: string) {
  const { register } = useAuth();
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
    const result = registerSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      telegram: data.get("telegram"),
      password: data.get("password"),
      accepted_terms: data.has("accept_oferta"),
      accepted_privacy: data.has("accept_privacy"),
    });

    setSubmitError(null);
    if (!result.success) {
      const nextErrors = fieldErrors(result.error);
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      const fieldName =
        firstField === "accepted_terms"
          ? "accept_oferta"
          : firstField === "accepted_privacy"
            ? "accept_privacy"
            : firstField;
      (form.elements.namedItem(fieldName ?? "") as HTMLElement | null)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await register({
        ...result.data,
        ...(invitationToken ? { invitation_token: invitationToken } : {}),
      });
    } catch (error) {
      setSubmitError(authErrorKey(error, "register"));
    } finally {
      setSubmitting(false);
    }
  }

  function clearFieldError(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    const field =
      name === "accept_oferta"
        ? "accepted_terms"
        : name === "accept_privacy"
          ? "accepted_privacy"
          : name;
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  }

  return { clearFieldError, errors, handleSubmit, submitError, submitting };
}
