import type { ReactNode } from "react";

interface AuthFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
}

export function AuthField({ id, label, children, error }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-danger" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
