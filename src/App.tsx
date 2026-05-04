import { ShieldCheck } from "lucide-react";
import HelpInfo from "./components/HelpInfo";
import SignerForm from "./components/SignerForm";

export default function App() {
  return (
    <main className="min-h-screen px-4 py-5 sm:py-7">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-4 text-center">
          <div className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm">
            <ShieldCheck className="h-4.5 w-4.5 text-zinc-900" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Play Console Package Verifier
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-600 sm:text-sm">
            Generate a verification APK to prove ownership of your package
            name and signing key.
          </p>
        </header>

        <div className="space-y-3">
          <SignerForm />
          <HelpInfo />
        </div>

        <footer className="mt-4 flex flex-col items-center gap-0.5 text-center text-[11px] text-zinc-500">
          <p>Runs entirely in your browser. Files never leave your device.</p>
          <p>
            Developed by{" "}
            <a
              href="https://www.sqtech.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 transition hover:underline"
            >
              SQ Tech
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
