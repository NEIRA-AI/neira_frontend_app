import { z, type ZodError } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "emailRequired")
  .email("emailInvalid")
  .max(254, "emailInvalid")
  .transform((value) => value.toLowerCase());

const password = z.string().min(8, "passwordLength").max(128, "passwordLength");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "nameLength").max(120, "nameLength"),
  email,
  telegram: z
    .string()
    .trim()
    .refine((value) => !value || /^@?[a-zA-Z0-9_]{5,32}$/.test(value), {
      message: "telegramInvalid",
    })
    .transform((value) => (value ? `@${value.replace(/^@/, "")}` : undefined)),
  password,
  accepted_terms: z.literal(true, "consentRequired"),
  accepted_privacy: z.literal(true, "consentRequired"),
});

export type AuthFieldErrors = Record<string, string>;

const validationKeys = {
  emailRequired: "validation.emailRequired",
  emailInvalid: "validation.emailInvalid",
  passwordRequired: "validation.passwordRequired",
  passwordLength: "validation.passwordLength",
  nameLength: "validation.nameLength",
  telegramInvalid: "validation.telegramInvalid",
  consentRequired: "validation.consentRequired",
} as const;

export function validationKey(code: string) {
  return (
    validationKeys[code as keyof typeof validationKeys] ?? "validation.invalid"
  );
}

export function fieldErrors(error: ZodError): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}
