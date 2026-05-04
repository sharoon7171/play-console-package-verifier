import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-950",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
