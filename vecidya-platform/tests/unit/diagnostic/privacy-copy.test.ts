import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

/**
 * GATE A de privacidad (DIAG-V3-06 §63): DIAG-V3-06 no puede cerrarse si la copy local sigue
 * prometiendo que el diagnóstico no guarda respuestas. Esta prueba fija esa reconciliación como
 * regresión: si alguien reintroduce la promesa absoluta, esta prueba debe fallar.
 */

function read(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)), "utf8");
}

const RETIRED_ABSOLUTE_CLAIMS = [
  /no guardamos tus respuestas/i,
  /no guarda respuestas ni resultados/i,
  /vecidya no guarda informacion del diagnostico/i,
  /al cerrar la p[aá]gina,\s*las respuestas desaparecen/i,
];

test("privacy.tsx ya no promete de forma absoluta que el diagnóstico no guarda respuestas", () => {
  const source = read("app/routes/privacy.tsx");
  for (const pattern of RETIRED_ABSOLUTE_CLAIMS) assert.doesNotMatch(source, pattern);
});

test("diagnostic.tsx (copy pública) ya no promete de forma absoluta que no se guardan respuestas", () => {
  const source = read("app/routes/diagnostic.tsx");
  for (const pattern of RETIRED_ABSOLUTE_CLAIMS) assert.doesNotMatch(source, pattern);
});

test("el mailto de contacto ya no afirma que Vecidya no guarda información del diagnóstico", () => {
  const source = read("app/features/diagnostic/index.ts");
  for (const pattern of RETIRED_ABSOLUTE_CLAIMS) assert.doesNotMatch(source, pattern);
});

test("privacy.tsx sigue siendo explícito en que no se exige registro, nombre, correo ni teléfono", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /no exige registro, nombre, correo ni tel[eé]fono/i);
});

test("privacy.tsx explica el identificador aleatorio y la persistencia estructurada del diagnóstico completo", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /identificador aleatorio/i);
  assert.match(source, /guardarse de forma estructurada/i);
});

/**
 * DIAG-V3-07 §31/§32: distinguir el autoguardado temporal (same-browser) de "Guardar para después"
 * (acción explícita con recovery code) y no presentar el código como cifrado de las respuestas.
 */
test("privacy.tsx distingue \"Guardar para después\" del autoguardado temporal y aclara que el código no es un cifrado", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /Guardar para después/);
  assert.match(source, /no es un cifrado/i);
});

/**
 * DIAG-V3-08 (Task 15): la copy debe cubrir la telemetría de interacción anónima (qué preguntas
 * generan dudas, dónde se abandona, contadores de guardado/reanudación) sin afirmar que no se
 * almacena y sin inventar un mecanismo formal de consentimiento (LEGAL-PRIV-001 sigue abierto).
 */
test("privacy.tsx cubre la telemetría anónima de uso del diagnóstico: identificador de sesión, sin contenido de respuestas y plazo objetivo de retención de 180 días", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /m[eé]tricas de uso del propio diagn[oó]stico/i);
  assert.match(source, /ligada al mismo identificador de sesi[oó]n/i);
  assert.match(source, /no incluyen el contenido de tus respuestas/i);
  // 180 días es el plazo objetivo (política), no un borrado automático ya en ejecución: no existe
  // scheduler que invoque `purgeExpiredAnalyticsEvents` todavía (Open Debt), así que la copy no
  // puede afirmar que los registros "se conservan hasta" ese plazo como si se hiciera cumplir.
  assert.match(source, /plazo objetivo de conservaci[oó]n es de 180 d[ií]as/i);
  assert.match(source, /eliminaci[oó]n autom[aá]tica[^.]*todav[ií]a no est[aá] activa/i);
  assert.doesNotMatch(source, /se conservan hasta 180 d[ií]as/i);
  for (const pattern of RETIRED_ABSOLUTE_CLAIMS) assert.doesNotMatch(source, pattern);
});
