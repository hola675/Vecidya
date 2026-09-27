import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatRecoveryCode,
  generateRecoveryCode,
  hashRecoveryCode,
  normalizeRecoveryCode,
  RECOVERY_CODE_LENGTH,
} from "../../../server/diagnostic/recovery-code.server.ts";

/**
 * DIAG-V3-07 §9/§10/§12/§47: recovery code Crockford Base32 de 12 caracteres (60 bits), nunca guardado
 * en claro — solo su HMAC-SHA-256 (dominio criptográfico propio, distinto del hash de `writeToken`).
 */

const CROCKFORD_CHARS = /^[0-9A-HJKMNP-TV-Z]+$/;

test("generateRecoveryCode produce 12 caracteres Crockford Base32, sin I/L/O/U", () => {
  const code = generateRecoveryCode();
  assert.equal(code.length, RECOVERY_CODE_LENGTH);
  assert.match(code, CROCKFORD_CHARS);
  assert.doesNotMatch(code, /[ILOU]/);
});

test("generateRecoveryCode produce códigos distintos en cada llamada (alta entropía)", () => {
  const codes = new Set(Array.from({ length: 50 }, () => generateRecoveryCode()));
  assert.equal(codes.size, 50);
});

test("formatRecoveryCode presenta XXXX-XXXX-XXXX y normalizeRecoveryCode lo revierte exactamente", () => {
  const code = generateRecoveryCode();
  const formatted = formatRecoveryCode(code);
  assert.match(formatted, /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  assert.equal(normalizeRecoveryCode(formatted), code);
});

test("normalizeRecoveryCode ignora mayúsculas/minúsculas, guiones y espacios", () => {
  const code = generateRecoveryCode();
  const messy = ` ${code.slice(0, 4).toLowerCase()}-${code.slice(4, 8)} ${code.slice(8)}`;
  assert.equal(normalizeRecoveryCode(messy), code);
});

test("normalizeRecoveryCode rechaza longitud incorrecta, caracteres inválidos y entrada no-string", () => {
  assert.equal(normalizeRecoveryCode("ABCD-1234"), null);
  assert.equal(normalizeRecoveryCode("ILOU" + "0".repeat(8)), null);
  assert.equal(normalizeRecoveryCode(undefined), null);
  assert.equal(normalizeRecoveryCode(123456789012), null);
  assert.equal(normalizeRecoveryCode(""), null);
});

test("hashRecoveryCode es determinista, hexadecimal, y nunca contiene el código en claro", async () => {
  const code = generateRecoveryCode();
  const [digestA, digestB] = await Promise.all([hashRecoveryCode("secret-1", code), hashRecoveryCode("secret-1", code)]);
  assert.equal(digestA, digestB);
  assert.match(digestA, /^[0-9a-f]{64}$/);
  assert.equal(digestA.includes(code), false);
});

test("hashRecoveryCode separa dominios: distinta clave o distinto código producen digests distintos", async () => {
  const code = generateRecoveryCode();
  const withSecretA = await hashRecoveryCode("secret-a", code);
  const withSecretB = await hashRecoveryCode("secret-b", code);
  assert.notEqual(withSecretA, withSecretB);

  const otherCode = generateRecoveryCode();
  const otherDigest = await hashRecoveryCode("secret-a", otherCode);
  assert.notEqual(withSecretA, otherDigest);
});

test("mutación B: comparar el código en claro contra su digest almacenado nunca coincide", async () => {
  const code = generateRecoveryCode();
  const digest = await hashRecoveryCode("secret", code);
  assert.notEqual(code, digest);
});
