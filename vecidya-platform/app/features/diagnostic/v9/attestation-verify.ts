import {
  DIAGNOSTIC_V9_ATTESTATION_TTL_MS,
  DIAGNOSTIC_V9_ATTESTATION_VERSION,
  type DiagnosticV9AttestationClaims,
} from "./attestation-contract";
import { canonicalizeDiagnosticJson } from "./attestation-json";

const DOMAIN = "vecidya:diagnostic-attestation:v1\n";

function decodeBase64(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  catch { return null; }
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch { return null; }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function verifyDiagnosticV9Attestation(input: {
  readonly result: unknown;
  readonly attestation: unknown;
  readonly publicKeys: Readonly<Record<string, string>>;
  readonly revokedKeyIds?: ReadonlySet<string>;
  readonly now?: number;
}): Promise<boolean> {
  try {
    if (!input || !Number.isSafeInteger(input.now ?? Date.now()) || !input.attestation || typeof input.attestation !== "object" || Array.isArray(input.attestation)) return false;
    const attestation = input.attestation as Record<string, unknown>;
    const keys = ["attestationVersion", "attestationId", "resultDigest", "digestAlgorithm", "signatureAlgorithm", "keyId", "issuedAt", "expiresAt", "signature"];
    if (Object.keys(attestation).length !== keys.length || keys.some((key) => !Object.hasOwn(attestation, key))) return false;
    if (attestation.attestationVersion !== DIAGNOSTIC_V9_ATTESTATION_VERSION || attestation.digestAlgorithm !== "SHA-256" ||
      attestation.signatureAlgorithm !== "Ed25519" || typeof attestation.keyId !== "string" || input.revokedKeyIds?.has(attestation.keyId) ||
      typeof attestation.issuedAt !== "string" || typeof attestation.expiresAt !== "string" ||
      typeof attestation.attestationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attestation.attestationId) ||
      typeof attestation.resultDigest !== "string" || typeof attestation.signature !== "string") return false;
    const issuedMs = Date.parse(attestation.issuedAt);
    const expiresMs = Date.parse(attestation.expiresAt);
    const now = input.now ?? Date.now();
    if (!Number.isSafeInteger(issuedMs) || !Number.isSafeInteger(expiresMs) ||
      new Date(issuedMs).toISOString() !== attestation.issuedAt || new Date(expiresMs).toISOString() !== attestation.expiresAt ||
      expiresMs !== issuedMs + DIAGNOSTIC_V9_ATTESTATION_TTL_MS || issuedMs > now + 60_000 || now >= expiresMs) return false;
    const publicKeyBytes = typeof input.publicKeys[attestation.keyId] === "string" ? decodeBase64(input.publicKeys[attestation.keyId]!) : null;
    const signature = decodeBase64Url(attestation.signature);
    if (!publicKeyBytes || !signature) return false;
    const claims: DiagnosticV9AttestationClaims = {
      attestationVersion: DIAGNOSTIC_V9_ATTESTATION_VERSION,
      attestationId: attestation.attestationId,
      resultDigest: attestation.resultDigest,
      digestAlgorithm: "SHA-256",
      signatureAlgorithm: "Ed25519",
      keyId: attestation.keyId,
      issuedAt: attestation.issuedAt,
      expiresAt: attestation.expiresAt,
    };
    const digest = toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalizeDiagnosticJson(input.result)))));
    if (digest !== claims.resultDigest) return false;
    const key = await crypto.subtle.importKey("spki", publicKeyBytes, { name: "Ed25519" }, false, ["verify"]);
    const message = new TextEncoder().encode(`${DOMAIN}${canonicalizeDiagnosticJson(claims)}`);
    return crypto.subtle.verify({ name: "Ed25519" }, key, signature, message);
  } catch { return false; }
}
