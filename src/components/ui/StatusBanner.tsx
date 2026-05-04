import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type StatusVariant = "info" | "success" | "error";

interface StatusBannerProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantCls: Record<StatusVariant, string> = {
  info: "border-zinc-200 bg-zinc-50 text-zinc-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

const iconCls: Record<StatusVariant, string> = {
  info: "text-zinc-500",
  success: "text-emerald-600",
  error: "text-red-600",
};

function VariantIcon({ variant }: { variant: StatusVariant }) {
  if (variant === "success") return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />;
  if (variant === "error") return <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />;
}

export default function StatusBanner({ variant, children }: StatusBannerProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-[11px] leading-snug",
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
