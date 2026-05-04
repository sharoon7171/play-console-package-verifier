import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export default function Card({ className, children, ...rest }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
