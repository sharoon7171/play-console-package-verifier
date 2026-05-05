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
  "inline-flex select-none items-center justify-center gap-1.5 rounded-lg font-bold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none";

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-slate-950 text-white",
    "ring-1 ring-inset ring-white/10",
    "shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_2px_4px_rgba(2,6,23,0.20),0_8px_20px_-4px_rgba(2,6,23,0.40),0_16px_32px_-12px_rgba(2,6,23,0.50)]",
    "hover:bg-slate-800",
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_-1px_0_rgba(0,0,0,0.5)_inset,0_4px_10px_rgba(2,6,23,0.25),0_12px_28px_-6px_rgba(2,6,23,0.50),0_24px_44px_-16px_rgba(2,6,23,0.55)]",
    "active:translate-y-px active:bg-slate-950"
  ),
  secondary: cn(
    "border border-slate-300 bg-white text-slate-900",
    "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(2,6,23,0.08),0_4px_10px_-4px_rgba(2,6,23,0.10)]",
    "hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50 active:translate-y-0 active:bg-slate-100"
  ),
  ghost:
    "bg-transparent font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900",
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
