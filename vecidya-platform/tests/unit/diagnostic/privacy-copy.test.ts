import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

/**
 * FUNNEL-01B: la copy de privacidad debe reflejar el diagnóstico V3: respuestas locales durante la
 * sesión, cálculo del resumen en Worker sin persistir respuestas/resultados, sin recovery code y
 * sin analítica. Las promesas de la era QBV1 (identificador de sesión en servidor, "Guardar para
 * después" con recovery code, retención de analítica de 180 días) quedaron retiradas junto con el
 * backend que las sostenía (DIAG-V3-06/07/08, nunca desplegado — ver `STATUS.md`
 * `DIAG-V3-RECOVERY-SECRET-001`); afirmarlas ahora sería falso. Esta prueba fija la reconciliación
 * como regresión: si alguien reintroduce una promesa retirada (absoluta o del backend ya retirado),
 * o deja de afirmar la realidad actual, esta prueba debe fallar.
 */

function read(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)), "utf8");
}

/** Promesas que ya no son ciertas: ni la promesa absoluta original, ni el backend retirado que la reemplazó. */
const RETIRED_CLAIMS = [
  /no guardamos tus respuestas/i,
  /no guarda respuestas ni resultados/i,
  /vecidya no guarda informacion del diagnostico/i,
  /al cerrar la p[aá]gina,\s*las respuestas desaparecen/i,
  /identificador aleatorio/i,
  /guardarse de forma estructurada/i,
  /guardar para despu[eé]s/i,
  /c[oó]digo de recuperaci[oó]n|recovery code/i,
  /no es un cifrado/i,
  /m[eé]tricas de uso del propio diagn[oó]stico/i,
  /180 d[ií]as/i,
];

test("privacy.tsx no promete ni describe ninguna función retirada del diagnóstico (ni la promesa absoluta original, ni el backend QBV1 que la reemplazó)", () => {
  const source = read("app/routes/privacy.tsx");
  for (const pattern of RETIRED_CLAIMS) assert.doesNotMatch(source, pattern, pattern.source);
});

test("diagnostic.tsx (ruta pública) no promete de forma absoluta que no se guardan respuestas ni describe el backend retirado", () => {
  const source = read("app/routes/diagnostic.tsx");
  for (const pattern of RETIRED_CLAIMS) assert.doesNotMatch(source, pattern, pattern.source);
});

test("el mailto de contacto del diagnóstico no afirma nada sobre guardar o no guardar información", () => {
  const source = read("app/features/diagnostic/index.ts");
  for (const pattern of RETIRED_CLAIMS) assert.doesNotMatch(source, pattern, pattern.source);
});

test("privacy.tsx sigue siendo explícito en que no se exige registro, nombre, correo ni teléfono", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /no exige registro, nombre, correo ni tel[eé]fono/i);
});

test("privacy.tsx describe con exactitud el guardado local y cálculo transitorio del resumen", () => {
  const source = read("app/routes/privacy.tsx");
  assert.match(source, /respuestas se guardan en este navegador/i, "answers remain in the browser during the session");
  assert.match(source, /se env[ií]an temporalmente al servidor para calcular el resumen an[oó]nimo/i, "transient Worker calculation is disclosed");
  assert.match(source, /no se guardan all[ií]/i, "Worker does not persist the anonymous payload");
  assert.match(source, /14 d[ií]as/i, "matches DIAGNOSTIC_SESSION_V3_TTL_MS");
  assert.match(source, /empiezas de nuevo/i, "no cross-device recovery: honest about the real limitation");
  assert.match(source, /no recogemos m[eé]tricas de uso del diagn[oó]stico/i, "no analytics collected today");
  assert.match(source, /descarga del resumen y el acceso al informe completo todav[ií]a no est[aá]n disponibles/i, "future report/download are not presented as active");
});

test("la copy pública del diagnóstico menciona el guardado local sin abrumar la pantalla de inicio", () => {
  const flowCopy = read("app/components/diagnostic-flow/flow-copy.ts");
  assert.match(flowCopy, /se guardan solo en este navegador/i);
});
