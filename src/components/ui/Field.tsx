import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const fallbackHintId = useId();
  const fallbackErrorId = useId();
  const hintId = hint ? fallbackHintId : undefined;
  const errorId = error ? fallbackErrorId : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const childWithAria = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const props: Record<string, unknown> = {
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : undefined,
      "aria-required": required || undefined,
    };
    return cloneElement(child as ReactElement, props);
  });

  return (
    <div className={cn("flex flex-col", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold tracking-tight text-slate-900"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-rose-500">
            *
          </span>
        ) : null}
      </label>
      {childWithAria}
      {hint ? (
        <p id={hintId} className="mt-1 text-[11px] font-medium leading-snug text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-[11px] font-bold text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
