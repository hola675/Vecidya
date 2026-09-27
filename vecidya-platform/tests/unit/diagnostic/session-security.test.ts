import assert from "node:assert/strict";
import { test } from "node:test";

import { generateSessionId, generateWriteToken, hashWriteToken, verifyWriteToken } from "../../../server/diagnostic/session-security.server.ts";

/**
 * DIAG-V3-06 §9/§43: el write token nunca se guarda en claro; solo su hash se compara, en tiempo
 * constante, y nunca contra el token mismo.
 */

test("generateSessionId produce un UUID v4 válido, distinto en cada llamada", () => {
  const a = generateSessionId();
  const b = generateSessionId();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(a, b);
});

test("generateWriteToken produce un secreto de alta entropía distinto en cada llamada", () => {
  const a = generateWriteToken();
  const b = generateWriteToken();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40, "256 bits en base64url deben rendir un string largo");
  assert.doesNotMatch(a, /[+/=]/, "debe ser base64url, no base64 con caracteres reservados en URL");
});

test("hashWriteToken es determinista y no reversible en forma (no contiene el token)", async () => {
  const token = generateWriteToken();
  const [hashA, hashB] = await Promise.all([hashWriteToken(token), hashWriteToken(token)]);
  assert.equal(hashA, hashB);
  assert.match(hashA, /^[0-9a-f]{64}$/);
  assert.notEqual(hashA, token);
  assert.equal(hashA.includes(token), false);
});

test("verifyWriteToken: token correcto → true", async () => {
  const token = generateWriteToken();
  const hash = await hashWriteToken(token);
  assert.equal(await verifyWriteToken(token, hash), true);
});

test("verifyWriteToken: token incorrecto → false", async () => {
  const hash = await hashWriteToken(generateWriteToken());
  assert.equal(await verifyWriteToken(generateWriteToken(), hash), false);
});

test("verifyWriteToken: token ausente o vacío → false, nunca lanza", async () => {
  const hash = await hashWriteToken(generateWriteToken());
  assert.equal(await verifyWriteToken("", hash), false);
  assert.equal(await verifyWriteToken(undefined as unknown as string, hash), false);
});

test("mutación F: comparar el token en claro contra el hash almacenado nunca coincide", async () => {
  const token = generateWriteToken();
  const hash = await hashWriteToken(token);
  assert.notEqual(token, hash, "un intento de guardar/comparar el token raw debe fallar esta aserción");
});
