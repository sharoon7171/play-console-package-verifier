import { useId, useMemo, useState } from "react";
import { Download, FileArchive, KeyRound, Loader2 } from "lucide-react";
import { signApk } from "../lib/apkSigner";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Field from "./ui/Field";
import FileInput from "./ui/FileInput";
import Input from "./ui/Input";
import PasswordInput from "./ui/PasswordInput";
import SectionHeading from "./ui/SectionHeading";
import StatusBanner, { type StatusVariant } from "./ui/StatusBanner";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

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

  const canSubmit = useMemo(
    () =>
      !!apkFile &&
      !!keystoreFile &&
      password.length > 0 &&
      snippetPath.trim().length > 0 &&
      snippetContent.length > 0 &&
      status.kind !== "working",
    [apkFile, keystoreFile, password, snippetPath, snippetContent, status]
  );

  async function handleSign() {
    if (!apkFile || !keystoreFile) return;
    setStatus({ kind: "working", message: "Starting..." });

    try {
      const { blob, filename } = await signApk({
        apkFile,
        keystoreFile,
        password,
        alias: alias.trim() || undefined,
        snippetPath: snippetPath.trim(),
        snippetContent,
        onProgress: (message) => setStatus({ kind: "working", message }),
      });

      triggerDownload(blob, filename);
      setStatus({
        kind: "success",
        message: `Verification APK ready. Downloaded as ${filename}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message });
    }
  }

  return (
    <Card>
      <div className="space-y-3.5">
        <div className="space-y-2">
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

        <div className="space-y-2">
          <SectionHeading title="Keystore credentials" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Password" htmlFor={passwordId} required>
              <PasswordInput
                id={passwordId}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Keystore password"
                autoComplete="off"
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

        <div className="space-y-2">
          <SectionHeading title="Verification snippet" />
          <Field
            label="File path inside APK"
            htmlFor={pathId}
            hint="Default matches Play Console's verification requirement."
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

        <div className="space-y-2 border-t border-zinc-200 pt-3">
          <Button fullWidth disabled={!canSubmit} onClick={handleSign}>
            {status.kind === "working" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Generate verification APK
              </>
            )}
          </Button>

          {status.kind !== "idle" && (
            <StatusBanner variant={STATUS_VARIANT[status.kind]}>
              {status.message}
            </StatusBanner>
          )}
        </div>
      </div>
    </Card>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
