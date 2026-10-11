import { useState, type FormEvent } from "react";

import { authErrorKey } from "./auth-error";
import { fieldErrors, loginSchema, type AuthFieldErrors } from "./auth-forms";
import { useAuth } from "./auth-context";

export function useSignIn() {
  const { login, completeTwoFactorLogin } = useAuth();
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [submitError, setSubmitError] = useState<ReturnType<
    typeof authErrorKey
  > | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<
    "required" | "invalid" | "requestFailed" | "tryLater" | null
  >(null);

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
      const response = await login(result.data);
      if (response.twoFactorRequired) {
        setChallengeToken(response.challengeToken);
      }
    } catch (error) {
      setSubmitError(authErrorKey(error, "login"));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !challengeToken) return;
    const code = verificationCode.trim();
    if (!code) {
      setVerificationError("required");
      return;
    }

    setSubmitting(true);
    setVerificationError(null);
    try {
      await completeTwoFactorLogin({ challenge_token: challengeToken, code });
    } catch (error) {
      const key = authErrorKey(error, "login");
      setVerificationError(
        key === "common.tryLater"
          ? "tryLater"
          : key === "login.invalidCredentials"
            ? "invalid"
            : "requestFailed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetChallenge() {
    setChallengeToken(null);
    setVerificationCode("");
    setVerificationError(null);
    setSubmitError(null);
  }

  function clearFieldError(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  }

  return {
    clearFieldError,
    challengeToken,
    errors,
    handleSubmit,
    resetChallenge,
    submitError,
    submitting,
    verificationCode,
    verificationError,
    setVerificationCode,
    setVerificationError,
    verifyCode,
  };
}
