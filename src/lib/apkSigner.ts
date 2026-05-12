import JSZip from "jszip";
import forge from "node-forge";
import { addV2Signature } from "./apkSignerV2";

export interface SignOptions {
  apkFile: File;
  keystoreFile: File;
  password: string;
  alias?: string;
  snippetPath: string;
  snippetContent: string;
  onProgress?: (msg: string) => void;
}

export interface SignResult {
  blob: Blob;
  filename: string;
  signingCertSha256Colon: string;
  embeddedSnippetContent: string;
}

const CRLF = "\r\n";

function toBase64(bytes: string): string {
  return forge.util.encode64(bytes);
}

function sha256Base64(bytes: string): string {
  const md = forge.md.sha256.create();
  md.update(bytes);
  return toBase64(md.digest().bytes());
}

function formatAttribute(key: string, value: string): string {
  const line = `${key}: ${value}`;
  if (line.length <= 70) return line + CRLF;

  const out: string[] = [];
  let remaining = line;
  out.push(remaining.slice(0, 70));
  remaining = remaining.slice(70);
  while (remaining.length > 0) {
    out.push(" " + remaining.slice(0, 69));
    remaining = remaining.slice(69);
  }
  return out.join(CRLF) + CRLF;
}

function buildManifest(entries: Array<{ name: string; data: string }>): {
  manifestBytes: string;
  perFileSections: Map<string, string>;
} {
  const main =
    formatAttribute("Manifest-Version", "1.0") +
    formatAttribute("Created-By", "play-console-package-verifier") +
    CRLF;

  const perFileSections = new Map<string, string>();
  let body = "";
  for (const e of entries) {
    const section =
      formatAttribute("Name", e.name) +
      formatAttribute("SHA-256-Digest", sha256Base64(e.data)) +
      CRLF;
    perFileSections.set(e.name, section);
    body += section;
  }

  return { manifestBytes: main + body, perFileSections };
}

function buildSignatureFile(
  manifestBytes: string,
  perFileSections: Map<string, string>
): string {
  const main =
    formatAttribute("Signature-Version", "1.0") +
    formatAttribute("Created-By", "play-console-package-verifier") +
    formatAttribute("SHA-256-Digest-Manifest", sha256Base64(manifestBytes)) +
    formatAttribute("X-Android-APK-Signed", "2") +
    CRLF;

  let body = "";
  for (const [name, sectionBytes] of perFileSections.entries()) {
    body +=
      formatAttribute("Name", name) +
      formatAttribute("SHA-256-Digest", sha256Base64(sectionBytes)) +
      CRLF;
  }

  return main + body;
}

function loadKeystore(
  derBytes: string,
  password: string,
  preferredAlias?: string
): {
  privateKey: forge.pki.rsa.PrivateKey;
  certificate: forge.pki.Certificate;
  alias: string;
} {
  const asn1 = forge.asn1.fromDer(derBytes);
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

  const allKeyBags = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] ?? [];
  const allCertBags = certBags[forge.pki.oids.certBag] ?? [];

  if (allKeyBags.length === 0) throw new Error("No private key found in keystore.");
  if (allCertBags.length === 0) throw new Error("No certificate found in keystore.");

  let chosenKeyBag = allKeyBags[0];
  let chosenCertBag = allCertBags[0];
  let chosenAlias =
    chosenKeyBag.attributes?.friendlyName?.[0] ??
    chosenCertBag.attributes?.friendlyName?.[0] ??
    "CERT";

  if (preferredAlias) {
    const target = preferredAlias.toLowerCase();
    const matchedKey = allKeyBags.find(
      (b) => b.attributes?.friendlyName?.[0]?.toLowerCase() === target
    );
    const matchedCert = allCertBags.find(
      (b) => b.attributes?.friendlyName?.[0]?.toLowerCase() === target
    );
    if (matchedKey && matchedCert) {
      chosenKeyBag = matchedKey;
      chosenCertBag = matchedCert;
      chosenAlias = preferredAlias;
    }
  }

  if (!chosenKeyBag.key) throw new Error("Selected entry has no private key.");
  if (!chosenCertBag.cert) throw new Error("Selected entry has no certificate.");

  return {
    privateKey: chosenKeyBag.key as forge.pki.rsa.PrivateKey,
    certificate: chosenCertBag.cert,
    alias: chosenAlias,
  };
}

function certificateSha256Colon(cert: forge.pki.Certificate): string {
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const md = forge.md.sha256.create();
  md.update(der);
  const hex = forge.util.bytesToHex(md.digest().bytes()).toUpperCase();
  const pairs = hex.match(/.{2}/g);
  if (!pairs) return "";
  return pairs.join(":");
}

function pkcs7DetachedSign(
  content: string,
  privateKey: forge.pki.rsa.PrivateKey,
  certificate: forge.pki.Certificate
): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(content);
  p7.addCertificate(certificate);
  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date().toString() },
    ],
  });
  p7.sign({ detached: true });
  return forge.asn1.toDer(p7.toAsn1()).getBytes();
}

function makeOutputName(input: string): string {
  const dot = input.lastIndexOf(".");
  const base = dot >= 0 ? input.slice(0, dot) : input;
  const ext = dot >= 0 ? input.slice(dot) : ".apk";
  return `${base}-verification${ext}`;
}

async function readFileAsBinaryString(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return forge.util.binary.raw.encode(new Uint8Array(buf));
}

export async function signApk(opts: SignOptions): Promise<SignResult> {
  const log = opts.onProgress ?? (() => {});

  log("Opening your APK...");
  const apkBuf = await opts.apkFile.arrayBuffer();
  const sourceZip = await JSZip.loadAsync(apkBuf);

  log("Loading your keystore...");
  const ksBytes = await readFileAsBinaryString(opts.keystoreFile);
  const { privateKey, certificate, alias } = loadKeystore(
    ksBytes,
    opts.password,
    opts.alias?.trim() || undefined
  );
  const signingCertSha256Colon = certificateSha256Colon(certificate);
  log(`Verified keystore. Using key alias: ${alias}`);

  log("Preparing APK for re-signing...");
  const outZip = new JSZip();
  const entries: Array<{ name: string; data: string }> = [];

  const fileList = Object.values(sourceZip.files).filter((f) => !f.dir);
  for (const f of fileList) {
    if (f.name.toUpperCase().startsWith("META-INF/")) continue;
    const data = await f.async("binarystring");
    outZip.file(f.name, data, { binary: true });
    entries.push({ name: f.name, data });
  }

  log(`Adding verification file: ${opts.snippetPath}`);
  outZip.file(opts.snippetPath, opts.snippetContent);
  entries.push({ name: opts.snippetPath, data: opts.snippetContent });

  log("Computing file digests...");
  const { manifestBytes, perFileSections } = buildManifest(entries);

  log("Building signature manifest...");
  const sfBytes = buildSignatureFile(manifestBytes, perFileSections);

  log("Signing JAR manifest with your keystore...");
  const rsaBytes = pkcs7DetachedSign(sfBytes, privateKey, certificate);

  const safeAlias = (alias || "CERT")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .slice(0, 8) || "CERT";

  outZip.file("META-INF/MANIFEST.MF", manifestBytes, { binary: true });
  outZip.file(`META-INF/${safeAlias}.SF`, sfBytes, { binary: true });
  outZip.file(`META-INF/${safeAlias}.RSA`, rsaBytes, { binary: true });

  log("Packaging APK...");
  const v1Bytes = await outZip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  log("Adding APK Signature Scheme v2 block...");
  const finalBytes = await addV2Signature(v1Bytes, privateKey, certificate);

  const blob = new Blob([finalBytes as unknown as ArrayBuffer], {
    type: "application/vnd.android.package-archive",
  });

  return {
    blob,
    filename: makeOutputName(opts.apkFile.name),
    signingCertSha256Colon,
    embeddedSnippetContent: opts.snippetContent,
  };
}
