/**
 * Recovery code de "Guardar para después" (DIAG-V3-07 §9/§10/§12). Es una capability credential
 * anónima — no cifra las respuestas ni identifica a la persona (spec §32): quien lo posee puede
 * recuperar esa sesión, igual que el `writeToken` autoriza escribirla. D1 guarda únicamente
 * `HMAC-SHA-256(secret, code)` (`recovery_lookup_digest`); el código en claro nunca se persiste
 * (spec §12). El dominio criptográfico de este HMAC es distinto al de `session-security.server.ts`
 * (hash de `writeToken`, sin clave): usar la MISMA clave para ambos propósitos mezclaría dos secretos
 * con amenazas distintas, por eso este módulo tiene su propia clave server-side (`DIAGNOSTIC_RECOVERY_HMAC_KEY`).
 */

/** Crockford Base32: excluye I/L/O/U (ambiguos al escribir o leer a mano). */
const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
/** 12 caracteres × 5 bits = 60 bits de entropía (spec §9). */
export const RECOVERY_CODE_LENGTH = 12;
/** 64 bits aleatorios de origen; solo se consumen los 60 más significativos (spec §10: no predecible sin secreto). */
const RECOVERY_CODE_SOURCE_BYTES = 8;
const RECOVERY_CODE_SOURCE_BITS = RECOVERY_CODE_SOURCE_BYTES * 8;

/** Genera un código nuevo, criptográficamente aleatorio (`crypto.getRandomValues`, nunca `Math.random`). */
export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RECOVERY_CODE_SOURCE_BYTES));
  let bits = 0n;
  for (const byte of bytes) bits = (bits << 8n) | BigInt(byte);

  let code = "";
  for (let index = 0; index < RECOVERY_CODE_LENGTH; index += 1) {
    const shift = BigInt(RECOVERY_CODE_SOURCE_BITS - (index + 1) * 5);
    const fiveBits = Number((bits >> shift) & 0b11111n);
    code += CROCKFORD_ALPHABET[fiveBits];
  }
  return code;
}

/** Presentación para UI (spec §9): `XXXX-XXXX-XXXX`. Puramente cosmético; `normalizeRecoveryCode` lo revierte. */
export function formatRecoveryCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}

/**
 * Normaliza una entrada de usuario a la forma canónica que se hashea y compara (spec §9):
 * mayúsculas/minúsculas equivalentes, guiones/espacios ignorados. Devuelve `null` si, tras
 * normalizar, no tiene la forma de un código real — nunca lanza sobre entrada arbitraria.
 */
export function normalizeRecoveryCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const stripped = input.toUpperCase().replace(/[\s-]/g, "");
  if (stripped.length !== RECOVERY_CODE_LENGTH) return null;
  for (const char of stripped) if (!CROCKFORD_ALPHABET.includes(char)) return null;
  return stripped;
}

/**
 * `HMAC-SHA-256(secret, "recover:" + code normalizado)` en hexadecimal, vía Web Crypto (spec §12).
 * El prefijo de dominio separa este propósito de cualquier otro uso futuro de la misma clave.
 */
export async function hashRecoveryCode(secret: string, normalizedCode: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`recover:${normalizedCode}`));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
