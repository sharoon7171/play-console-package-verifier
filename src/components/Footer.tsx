import { Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-20 shrink-0 border-t border-slate-900/[0.08] bg-white/85 backdrop-blur-md shadow-[0_-1px_0_rgba(255,255,255,0.6)_inset,0_-8px_24px_-12px_rgba(2,6,23,0.18)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-1 px-4 py-2.5 text-xs sm:flex-row">
        <p className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
          <Lock className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          Runs entirely in your browser. Files never leave your device.
        </p>
        <p className="font-medium text-slate-500">
          Built by{" "}
          <a
            href="https://www.sqtech.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold text-slate-950 underline-offset-2 transition hover:text-blue-700 hover:underline"
          >
            SQ Tech
          </a>
        </p>
      </div>
    </footer>
  );
}
