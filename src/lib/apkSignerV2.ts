import forge from "node-forge";

const V2_BLOCK_ID = 0x7109871a;
const V2_MAGIC = "APK Sig Block 42";
const SIG_ALG_RSA_PKCS1_SHA256 = 0x0103;
const CHUNK_SIZE = 1024 * 1024;
const EOCD_SIG = 0x06054b50;

function writeU32LE(out: Uint8Array, offset: number, value: number): void {
  out[offset] = value & 0xff;
  out[offset + 1] = (value >>> 8) & 0xff;
  out[offset + 2] = (value >>> 16) & 0xff;
  out[offset + 3] = (value >>> 24) & 0xff;
}

function readU32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24)
  ) >>> 0;
}

function u32(value: number): Uint8Array {
  const b = new Uint8Array(4);
  writeU32LE(b, 0, value);
  return b;
}

function u64(value: number): Uint8Array {
  const b = new Uint8Array(8);
  const lo = value >>> 0;
  const hi = Math.floor(value / 0x100000000) >>> 0;
  writeU32LE(b, 0, lo);
  writeU32LE(b, 4, hi);
  return b;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function lp(bytes: Uint8Array): Uint8Array {
  return concatBytes([u32(bytes.length), bytes]);
}

function lpSeqOfLp(items: Uint8Array[]): Uint8Array {
  return lp(concatBytes(items.map(lp)));
}

function asn1ToDerBytes(asn1: forge.asn1.Asn1): Uint8Array {
  const der = forge.asn1.toDer(asn1).getBytes();
  return forge.util.binary.raw.decode(der);
}

function findEocd(bytes: Uint8Array): number {
  if (bytes.length < 22) throw new Error("File too small to be a ZIP.");
  const minStart = Math.max(0, bytes.length - 22 - 0xffff);
  for (let i = bytes.length - 22; i >= minStart; i--) {
    if (readU32LE(bytes, i) === EOCD_SIG) {
      const commentLen = bytes[i + 20] | (bytes[i + 21] << 8);
      if (i + 22 + commentLen === bytes.length) return i;
    }
  }
  throw new Error("End of Central Directory not found in APK.");
}

async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  const ab = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;
  const buf = await crypto.subtle.digest("SHA-256", ab);
  return new Uint8Array(buf);
}

async function computeApkV2Digest(sections: Uint8Array[]): Promise<Uint8Array> {
  const chunkDigests: Uint8Array[] = [];
  for (const section of sections) {
    let offset = 0;
    while (offset < section.length) {
      const len = Math.min(CHUNK_SIZE, section.length - offset);
      const buf = new Uint8Array(5 + len);
      buf[0] = 0xa5;
      writeU32LE(buf, 1, len);
      buf.set(section.subarray(offset, offset + len), 5);
      chunkDigests.push(await sha256Bytes(buf));
      offset += len;
    }
  }
  const top = new Uint8Array(5 + chunkDigests.length * 32);
  top[0] = 0x5a;
  writeU32LE(top, 1, chunkDigests.length);
  for (let i = 0; i < chunkDigests.length; i++) {
    top.set(chunkDigests[i], 5 + i * 32);
  }
  return await sha256Bytes(top);
}

export async function addV2Signature(
  apkBytes: Uint8Array,
  privateKey: forge.pki.rsa.PrivateKey,
  certificate: forge.pki.Certificate
): Promise<Uint8Array> {
  const eocdOffset = findEocd(apkBytes);
  const cdOffset = readU32LE(apkBytes, eocdOffset + 16);
  const cdSize = readU32LE(apkBytes, eocdOffset + 12);

  if (cdOffset === 0xffffffff || cdSize === 0xffffffff) {
    throw new Error("ZIP64 APKs are not supported.");
  }
  if (cdOffset + cdSize !== eocdOffset) {
    throw new Error("Unexpected ZIP layout (Central Directory not adjacent to EOCD).");
  }

  const beforeCd = apkBytes.subarray(0, cdOffset);
  const centralDir = apkBytes.subarray(cdOffset, eocdOffset);
  const eocd = apkBytes.subarray(eocdOffset);

  const digest = await computeApkV2Digest([beforeCd, centralDir, eocd]);

  const digestItem = concatBytes([u32(SIG_ALG_RSA_PKCS1_SHA256), lp(digest)]);
  const digestsSeq = lpSeqOfLp([digestItem]);

  const certDer = asn1ToDerBytes(forge.pki.certificateToAsn1(certificate));
  const certsSeq = lpSeqOfLp([certDer]);

  const attrsSeq = lp(new Uint8Array(0));

  const signedData = concatBytes([digestsSeq, certsSeq, attrsSeq]);

  const md = forge.md.sha256.create();
  md.update(forge.util.binary.raw.encode(signedData));
  const sigBytes = forge.util.binary.raw.decode(privateKey.sign(md));

  const signatureItem = concatBytes([u32(SIG_ALG_RSA_PKCS1_SHA256), lp(sigBytes)]);
  const signaturesSeq = lpSeqOfLp([signatureItem]);

  const publicKey = certificate.publicKey as forge.pki.rsa.PublicKey;
  const spkiDer = asn1ToDerBytes(forge.pki.publicKeyToAsn1(publicKey));

  const signer = concatBytes([lp(signedData), signaturesSeq, lp(spkiDer)]);
  const v2Block = lpSeqOfLp([signer]);

  const v2Pair = concatBytes([u64(4 + v2Block.length), u32(V2_BLOCK_ID), v2Block]);
  const blockSize = v2Pair.length + 8 + 16;
  const magicBytes = new TextEncoder().encode(V2_MAGIC);
  const signingBlock = concatBytes([u64(blockSize), v2Pair, u64(blockSize), magicBytes]);

  const newCdOffset = cdOffset + signingBlock.length;
  const newApk = new Uint8Array(apkBytes.length + signingBlock.length);
  newApk.set(beforeCd, 0);
  newApk.set(signingBlock, cdOffset);
  newApk.set(centralDir, newCdOffset);
  newApk.set(eocd, newCdOffset + centralDir.length);
  writeU32LE(newApk, newCdOffset + centralDir.length + 16, newCdOffset);

  return newApk;
}
