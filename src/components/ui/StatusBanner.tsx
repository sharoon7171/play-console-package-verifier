import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type StatusVariant = "info" | "success" | "error";

interface StatusBannerProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantCls: Record<StatusVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  error: "border-rose-300 bg-rose-50 text-rose-950",
};

const iconCls: Record<StatusVariant, string> = {
  info: "text-blue-600",
  success: "text-emerald-600",
  error: "text-rose-600",
};

function VariantIcon({ variant }: { variant: StatusVariant }) {
  if (variant === "success") return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
  if (variant === "error") return <AlertCircle className="h-4 w-4" aria-hidden="true" />;
  return <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />;
}

export default function StatusBanner({ variant, children }: StatusBannerProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-semibold leading-snug shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(2,6,23,0.05)]",
        variantCls[variant]
      )}
    >
      <span className={cn("mt-px shrink-0", iconCls[variant])}>
        <VariantIcon variant={variant} />
      </span>
      <span className="min-w-0 break-words whitespace-pre-wrap">{children}</span>
    </div>
  );
}
