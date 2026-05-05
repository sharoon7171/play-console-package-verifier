import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-20 shrink-0 border-b border-slate-900/[0.08] bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_24px_-12px_rgba(2,6,23,0.18)]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 ring-1 ring-inset ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_4px_10px_-2px_rgba(2,6,23,0.40),0_10px_24px_-8px_rgba(2,6,23,0.45)]"
          >
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-extrabold tracking-tight text-slate-950 sm:text-base">
              Play Console Package Verifier
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              Browser-based v1 + v2 APK signing
            </p>
          </div>
        </div>

        <a
          href="https://github.com/sharoon7171/play-console-package-verifier"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(2,6,23,0.08),0_4px_10px_-4px_rgba(2,6,23,0.12)] transition hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.218.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.943.36.31.68.92.68 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </header>
  );
}
