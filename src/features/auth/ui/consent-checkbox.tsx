import type { ReactNode } from "react";

interface ConsentCheckboxProps {
  name: string;
  children: ReactNode;
  invalid?: boolean;
}

export function ConsentCheckbox({
  name,
  children,
  invalid = false,
}: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        aria-labelledby={`${name}-description`}
        aria-invalid={invalid}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        id={name}
        name={name}
        required
        type="checkbox"
      />
      <p className="text-sm leading-5 text-muted" id={`${name}-description`}>
        {children}
      </p>
    </div>
  );
}
