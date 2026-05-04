import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const inputBaseCls =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50 disabled:cursor-not-allowed";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...rest }, ref) {
    return <input ref={ref} type={type} className={cn(inputBaseCls, className)} {...rest} />;
  }
);

export default Input;
