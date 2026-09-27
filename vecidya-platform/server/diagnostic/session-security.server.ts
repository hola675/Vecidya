/**
 * Seguridad de sesión anónima del Diagnóstico (DIAG-V3-06 §8/§9). El `sessionId` es público (va en la
 * URL de las llamadas de la API); el `writeToken` es una credencial efímera de sesión —no una cuenta—
 * que el navegador recibe una sola vez. D1 guarda únicamente `SHA-256(token)`, nunca el token en claro.
 */

const WRITE_TOKEN_BYTES = 32; // 256 bits de entropía.

export function generateSessionId(): string {
  return crypto.randomUUID();
}

/** Secreto aleatorio de alta entropía, generado con `crypto.getRandomValues` (no `Math.random`). */
export function generateWriteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(WRITE_TOKEN_BYTES));
  return base64UrlEncode(bytes);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** SHA-256 hexadecimal del token en claro. Es lo único que D1 debe guardar (spec §9). */
export async function hashWriteToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(digest);
}

function toHex(digest: ArrayBuffer): string {
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Verificación centralizada y de tiempo constante (spec §9/§43): nunca compara el token en claro
 * contra nada persistido, solo el hash resultante, byte a byte, sin salir antes ante una discrepancia
 * temprana.
 */
export async function verifyWriteToken(candidateToken: string, storedHash: string): Promise<boolean> {
  if (typeof candidateToken !== "string" || !candidateToken) return false;
  const candidateHash = await hashWriteToken(candidateToken);
  return constantTimeEqual(candidateHash, storedHash);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}
