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
