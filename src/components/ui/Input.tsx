import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const inputBaseCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 placeholder:font-medium placeholder:text-slate-400 outline-none transition shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_1px_2px_rgba(2,6,23,0.06),0_2px_4px_-2px_rgba(2,6,23,0.06)] hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...rest }, ref) {
    return <input ref={ref} type={type} className={cn(inputBaseCls, className)} {...rest} />;
  }
);

export default Input;
