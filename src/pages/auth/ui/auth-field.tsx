import type { ReactNode } from "react";

interface AuthFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function AuthField({ id, label, children }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
