import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export default function Card({ className, children, ...rest }: CardProps) {
  return (
    <section
      className={cn(
        "relative rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.08]",
        "shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_1px_2px_rgba(2,6,23,0.06),0_2px_4px_rgba(2,6,23,0.04),0_12px_28px_-8px_rgba(2,6,23,0.18),0_36px_72px_-32px_rgba(2,6,23,0.32)]",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
