/**
 * SHA-256 hexadecimal, vía Web Crypto (disponible en Workers y en Node ≥18). Compartido entre
 * `persistence.ts` (hash de finalización/save) y `route-signature.ts` (DIAG-V3-08 §22): un único
 * primitivo de hashing, sin reimplementarlo por módulo.
 */
export async function sha256Hex(payload: string): Promise<string> {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
