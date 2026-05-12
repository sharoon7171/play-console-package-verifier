import { useEffect, useId, useMemo, useState } from "react";
import {
  Download,
  FileArchive,
  FileSignature,
  KeyRound,
  Loader2,
  RotateCw,
} from "lucide-react";
import { signApk } from "../lib/apkSigner";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Field from "./ui/Field";
import FileInput from "./ui/FileInput";
import Input from "./ui/Input";
import SectionHeading from "./ui/SectionHeading";
import StatusBanner, { type StatusVariant } from "./ui/StatusBanner";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

interface CachedResult {
  blob: Blob;
  filename: string;
  url: string;
  signingCertSha256Colon: string;
  embeddedSnippetContent: string;
}

const STATUS_VARIANT: Record<Exclude<Status["kind"], "idle">, StatusVariant> = {
  working: "info",
  success: "success",
  error: "error",
};

const DEFAULT_VERIFICATION_PATH = "assets/adi-registration.properties";

export default function SignerForm() {
  const apkId = useId();
  const ksId = useId();
  const passwordId = useId();
  const aliasId = useId();
  const pathId = useId();
  const snippetId = useId();

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [keystoreFile, setKeystoreFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [snippetPath, setSnippetPath] = useState(DEFAULT_VERIFICATION_PATH);
  const [snippetContent, setSnippetContent] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [cached, setCached] = useState<CachedResult | null>(null);

  useEffect(() => {
    if (!cached) return;
    return () => {
      URL.revokeObjectURL(cached.url);
    };
  }, [cached]);

  const isWorking = status.kind === "working";

  const canSubmit = useMemo(
    () =>
      !!apkFile &&
      !!keystoreFile &&
      password.length > 0 &&
      snippetPath.trim().length > 0 &&
      snippetContent.length > 0 &&
      !isWorking,
    [apkFile, keystoreFile, password, snippetPath, snippetContent, isWorking]
  );

  async function handleSign() {
    if (!apkFile || !keystoreFile) return;
    setStatus({ kind: "working", message: "Starting..." });

    try {
      const {
        blob,
        filename,
        signingCertSha256Colon,
        embeddedSnippetContent,
      } = await signApk({
        apkFile,
        keystoreFile,
        password,
        alias: alias.trim() || undefined,
        snippetPath: snippetPath.trim(),
        snippetContent,
        onProgress: (message) => setStatus({ kind: "working", message }),
      });

      const url = URL.createObjectURL(blob);
      setCached({
        blob,
        filename,
        url,
        signingCertSha256Colon,
        embeddedSnippetContent,
      });
      triggerDownloadFromUrl(url, filename);
      setStatus({
        kind: "success",
        message: `Your verification APK is ready: ${filename}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message });
    }
  }

  function handleDownloadAgain() {
    if (!cached) return;
    triggerDownloadFromUrl(cached.url, cached.filename);
  }

  return (
    <Card aria-labelledby="signer-title">
      <header className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white ring-1 ring-inset ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_4px_10px_-2px_rgba(2,6,23,0.40)]"
        >
          <FileSignature className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="signer-title"
            className="text-base font-extrabold tracking-tight text-slate-950"
          >
            Generate verification APK
          </h2>
          <p className="text-xs font-medium leading-snug text-slate-600">
            Sign your APK with v1 + v2 schemes and embed the registration
            snippet — locally, in your browser.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="space-y-2.5">
          <SectionHeading title="Source files" />
          <Field label="APK file" htmlFor={apkId} required>
            <FileInput
              id={apkId}
              accept=".apk,application/vnd.android.package-archive"
              file={apkFile}
              onChange={setApkFile}
              placeholder="Select your .apk file"
              icon={<FileArchive className="h-3.5 w-3.5" aria-hidden="true" />}
            />
          </Field>
          <Field
            label="Signing keystore"
            htmlFor={ksId}
            required
            hint="Must be the same keystore originally used to publish this app."
          >
            <FileInput
              id={ksId}
              accept=".jks,.keystore,.p12,.pfx"
              file={keystoreFile}
              onChange={setKeystoreFile}
              placeholder="Select keystore (.jks / .keystore / .p12)"
              icon={<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />}
            />
          </Field>
        </div>

        <div className="space-y-2.5">
          <SectionHeading title="Keystore credentials" />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Field label="Password" htmlFor={passwordId} required>
              <Input
                id={passwordId}
                name="keystore-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Keystore password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
              />
            </Field>
            <Field
              label="Key alias"
              htmlFor={aliasId}
              hint="Optional. Leave empty to auto-detect."
            >
              <Input
                id={aliasId}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Auto-detect"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2.5">
          <SectionHeading title="Verification snippet" />
          <Field
            label="File path inside APK"
            htmlFor={pathId}
            hint="Case-sensitive; use exactly the path Play Console shows. Default is assets/adi-registration.properties."
            required
          >
            <Input
              id={pathId}
              value={snippetPath}
              onChange={(e) => setSnippetPath(e.target.value)}
            />
          </Field>
          <Field
            label="Snippet from Play Console"
            htmlFor={snippetId}
            hint="Paste the exact value shown in Play Console."
            required
          >
            <Input
              id={snippetId}
              value={snippetContent}
              onChange={(e) => setSnippetContent(e.target.value)}
              placeholder="Paste verification snippet"
            />
          </Field>
        </div>

        <div className="space-y-2.5 border-t border-slate-200 pt-4">
          {cached ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button onClick={handleDownloadAgain}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download again
              </Button>
              <Button
                variant="secondary"
                disabled={!canSubmit}
                onClick={handleSign}
              >
                {isWorking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                    Generate new APK
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button fullWidth disabled={!canSubmit} onClick={handleSign}>
              {isWorking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Generate verification APK
                </>
              )}
            </Button>
          )}

          {status.kind !== "idle" && (
            <StatusBanner variant={STATUS_VARIANT[status.kind]}>
              {status.message}
            </StatusBanner>
          )}

          {cached && (
            <div
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 text-xs text-slate-800 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]"
              aria-labelledby="generated-apk-details-title"
            >
              <h3
                id="generated-apk-details-title"
                className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600"
              >
                Generated APK details
              </h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="font-bold text-slate-950">Snippet added</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-all font-mono text-[11px] text-slate-700">
                    {cached.embeddedSnippetContent}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-950">
                    SHA-256 (signing certificate)
                  </dt>
                  <dd className="mt-0.5 break-all font-mono text-[11px] text-slate-700">
                    {cached.signingCertSha256Colon}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function triggerDownloadFromUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
