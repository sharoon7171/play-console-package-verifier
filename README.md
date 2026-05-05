# Play Console Package Verifier

Generate the proof-of-ownership APK that **Google Play Console** and **Android Developer Console** require for [Android developer verification](https://developer.android.com/developer-verification/guides) — directly in your browser. Adds the `assets/adi-registration.properties` snippet to an APK and signs it with your private signing key, producing both an [APK Signature Scheme v1 (JAR)](https://docs.oracle.com/javase/8/docs/technotes/guides/jar/jar.html#Signed_JAR_File) and [v2](https://source.android.com/docs/security/features/apksigning/v2) signature — the combination `apksigner` produces by default. No Android Studio, no Gradle, no `jarsigner`, no `apksigner`, no `keytool`, no command line.

**Live tool:** https://play-console-package-verifier.vercel.app

Everything runs locally in your browser. Your APK, keystore, and password never leave your device.

---

## Why this exists

When you create a new app in Google Play Console, Play tries to **automatically register the package name** for you. If that package name is already known to Android (because someone else — or you — has used it off-Play), Play tells you the package name is not available and you have to formally **register the package name** in [Android Developer Console](https://developer.android.com/developer-verification/guides/android-developer-console) before you can keep using it.

That registration requires **proof that you own the private signing key** for the package. The official process ([docs](https://support.google.com/android-developer-console/answer/16640821)) is:

1. Provide the SHA-256 fingerprint of your signing certificate.
2. Build a release APK that contains a file at exactly `assets/adi-registration.properties` with the snippet Android Developer Console gives you.
3. Sign that APK with the corresponding **private** signing key.
4. Upload it. Android verifies the signature and registers the package name to your verified developer identity.

The same flow is required when [adding an additional key](https://support.google.com/android-developer-console/answer/16641418) to an already-registered package name.

Doing it the official way means an IDE / Gradle project (or `jarsigner` on the command line) just to insert one tiny properties file and re-sign. This tool collapses that into a single page in your browser.

## Features

- Browser-only — no install, no upload, no server.
- Uses your real keystore (`.jks`, `.keystore`, `.p12`, `.pfx`) — the same one that holds the private key for your package’s signing certificate.
- Auto-detects the key alias, or accepts an explicit one.
- Inserts the snippet at exactly `assets/adi-registration.properties` (path is editable in case the console asks for a different location).
- Produces a v1 (JAR) + v2 (APK Signature Scheme v2) signed APK — the same combination `apksigner` produces by default — which Android Developer Console / Play Console accepts as proof of private key ownership.
- Downloads the result as `<your-apk-name>-verification.apk`.
- Works offline once the page is loaded.

## How it works

1. Open the [tool](https://play-console-package-verifier.vercel.app).
2. Select an APK for the package name you’re registering. It can be your real release APK, or a release APK from an empty project with the same package name (per the [official guidance](https://support.google.com/android-developer-console/answer/16641418)).
3. Select the keystore that holds the private key for that signing certificate, and enter its password.
4. Paste the snippet shown by Android Developer Console / Play Console. The file path is pre-filled to `assets/adi-registration.properties`.
5. Click **Generate verification APK** and upload the downloaded file to the console.

Under the hood the APK is opened with JSZip, the snippet is written to the path you specified, the existing `META-INF/` signatures are stripped, a new `MANIFEST.MF` and `.SF` are produced (with the `X-Android-APK-Signed: 2` rollback-protection attribute), and the `.RSA` PKCS#7 block is generated with `node-forge` using your private key. An [APK Signature Scheme v2](https://source.android.com/docs/security/features/apksigning/v2) signing block is then computed (chunked SHA-256 over the ZIP entries, central directory, and EOCD per the AOSP spec) and spliced in before the central directory — yielding a v1 + v2 signed APK equivalent to what `apksigner` produces.

## Privacy and security

- 100% client-side. The page makes **no network requests** with your APK, keystore, or password.
- Source is open — read [`src/lib/apkSigner.ts`](src/lib/apkSigner.ts) to verify exactly what runs.
- You can disconnect from the internet after the page loads and it will still work.

## Local development

```bash
git clone https://github.com/sharoon7171/play-console-package-verifier.git
cd play-console-package-verifier
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Technology Stack

This project is built using the following technologies:

- **React 19** – UI development framework
- **TypeScript** – Static type checking for JavaScript
- **Vite** – Fast frontend build tool and development server
- **Tailwind CSS** – Utility-first CSS framework for rapid UI styling
- **JSZip** – In-browser ZIP file processing
- **node-forge** – JavaScript implementation of cryptographic utilities
- **lucide-react** – Icon library for React applications

## FAQ

**Play Console says my package name is not available when I try to create a new app — what do I do?**
That happens when Android already knows the package name from somewhere else. To keep using the name you have to register it in Android Developer Console, which requires uploading a release APK that contains `assets/adi-registration.properties` and is signed with the corresponding private key. This tool produces exactly that APK.

**Does this work for the Android Developer Console “add additional keys” proof of ownership step?**
Yes. The “add a key to a registered package” flow uses the same `adi-registration.properties` proof, and this tool generates the same artifact.

**Which keystore formats are supported?**
PKCS#12 keystores (`.p12`, `.pfx`) and the `.jks` / `.keystore` formats Android uses by default.

**Is the generated APK installable as a real app?**
It does not need to be. Android Developer Console only inspects the signature and the properties file. It is not published to users.

**Do I need Android Studio, the Android SDK, Gradle, `jarsigner`, `apksigner`, `zipalign`, or `keytool`?**
No. The whole pipeline runs in your browser.

**Is my keystore password sent anywhere?**
No. The page has no backend. Open DevTools → Network and confirm — nothing leaves your machine.

**The console gave me a different path for the snippet — can I change it?**
Yes. The file path field is editable. Use whatever the console shows you.

**Where is the official Google sample for the snippet placement?**
The Android team publishes one here: [`android/security-samples/AndroidDeveloperVerificationAPKSigningExample`](https://github.com/android/security-samples/tree/main/AndroidDeveloperVerificationAPKSigningExample). This tool produces the same on-disk layout.

**Which APK signature schemes are produced?**
Both [v1 (JAR signing)](https://docs.oracle.com/javase/8/docs/technotes/guides/jar/jar.html#Signed_JAR_File) and [v2 (APK Signature Scheme v2)](https://source.android.com/docs/security/features/apksigning/v2) — the same default combination `apksigner` produces. The v1 `.SF` includes the spec-required `X-Android-APK-Signed: 2` rollback-protection attribute, and the v2 signing block is inserted directly before the ZIP central directory per the [AOSP specification](https://source.android.com/docs/security/features/apksigning/v2). Android Developer Console requires a valid v2 signature; both schemes are written in a single pass.

## Author

Built by [SQ Tech](https://www.sqtech.dev/). Issues and PRs welcome.
