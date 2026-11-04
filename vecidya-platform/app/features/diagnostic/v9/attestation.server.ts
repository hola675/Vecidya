import {
  replayDiagnosticV9Transiently,
} from "./transient-replay.server";
import {
  DIAGNOSTIC_V9_ATTESTATION_TTL_MS,
  DIAGNOSTIC_V9_ATTESTATION_VERSION,
  DIAGNOSTIC_V9_RESULT_VERSION,
  type DiagnosticV9Attestation,
  type DiagnosticV9AttestationClaims,
  type DiagnosticV9CanonicalResult,
} from "./attestation-contract";
import { canonicalizeDiagnosticJson } from "./attestation-json";
export { canonicalizeDiagnosticJson } from "./attestation-json";
const DOMAIN = "vecidya:diagnostic-attestation:v1\n";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  catch { return null; }
}

function randomUuidV4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export type SignDiagnosticV9Input = {
  readonly scoringVersion: string;
  readonly session: unknown;
  readonly keyId: string;
  /** Base64-encoded PKCS#8 Ed25519 private key, supplied only from a Worker Secret. */
  readonly privateKeyPkcs8: string;
  /** Versioned public key matching keyId; an unregistered signer fails closed. */
  readonly publicKeySpki: string;
  readonly now?: number;
};

export type SignDiagnosticV9Result =
  | { readonly ok: true; readonly result: DiagnosticV9CanonicalResult; readonly attestation: DiagnosticV9Attestation }
  | { readonly ok: false; readonly reason: "request" | "replay" | "key" | "signing" };

export async function finalizeAndAttestDiagnosticV9(input: SignDiagnosticV9Input): Promise<SignDiagnosticV9Result> {
  if (!input || typeof input !== "object" || !/^[A-Za-z0-9._-]{1,64}$/.test(input.keyId) ||
    !Number.isSafeInteger(input.now ?? Date.now())) return { ok: false, reason: "request" };
  const replay = replayDiagnosticV9Transiently({ scoringVersion: input.scoringVersion, session: input.session }, input.now ?? Date.now());
  if (!replay.ok) return { ok: false, reason: "replay" };
  const result = JSON.parse(JSON.stringify({
    resultVersion: DIAGNOSTIC_V9_RESULT_VERSION,
    completedAt: new Date(replay.completedAt).toISOString(),
    core: replay.core,
  })) as DiagnosticV9CanonicalResult;
  const keyBytes = fromBase64(input.privateKeyPkcs8);
  const publicKeyBytes = fromBase64(input.publicKeySpki);
  if (!keyBytes || !publicKeyBytes) return { ok: false, reason: "key" };
  try {
    const key = await crypto.subtle.importKey("pkcs8", keyBytes, { name: "Ed25519" }, false, ["sign"]);
    const issuedMs = input.now ?? Date.now();
    const resultDigest = toBase64Url(new Uint8Array(await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonicalizeDiagnosticJson(result)),
    )));
    const claims: DiagnosticV9AttestationClaims = {
      attestationVersion: DIAGNOSTIC_V9_ATTESTATION_VERSION,
      attestationId: randomUuidV4(),
      resultDigest,
      digestAlgorithm: "SHA-256",
      signatureAlgorithm: "Ed25519",
      keyId: input.keyId,
      issuedAt: new Date(issuedMs).toISOString(),
      expiresAt: new Date(issuedMs + DIAGNOSTIC_V9_ATTESTATION_TTL_MS).toISOString(),
    };
    const message = new TextEncoder().encode(`${DOMAIN}${canonicalizeDiagnosticJson(claims)}`);
    const signature = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, key, message));
    const verifier = await crypto.subtle.importKey("spki", publicKeyBytes, { name: "Ed25519" }, false, ["verify"]);
    if (!await crypto.subtle.verify({ name: "Ed25519" }, verifier, signature, message)) return { ok: false, reason: "key" };
    return { ok: true, result, attestation: { ...claims, signature: toBase64Url(signature) } };
  } catch {
    return { ok: false, reason: "signing" };
  }
}

export { verifyDiagnosticV9Attestation } from "./attestation-verify";
