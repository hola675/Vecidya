import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const bundleRoots = ["build/client", "build/server"].map((path) => resolve(path));
const textExtensions = new Set([".cjs", ".html", ".js", ".json", ".map", ".mjs"]);

function textFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return textFiles(path);
    return textExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

const bundleFiles = bundleRoots.flatMap((root) => {
  const files = textFiles(root);
  assert.ok(files.length > 0, `el build productivo contiene archivos de texto en ${relative(process.cwd(), root)}`);
  return files;
});

const forbiddenBundleMarkers = [
  "api-diagnostic-funnel-analytics",
  "api-diagnostic-report-requests",
  "api-diagnostic-report-request-resend",
  "api-diagnostic-email-verify",
  "/__dev/diagnostico/",
  "qa-funnel@example.invalid",
  "other@example.invalid",
  "inspect_funnel_aggregate",
  "PURGE_EXPIRED_IDENTIFIED_DIAGNOSTICS",
];

for (const file of bundleFiles) {
  const contents = readFileSync(file, "utf8");
  const filePath = relative(process.cwd(), file);
  for (const marker of forbiddenBundleMarkers) {
    assert.ok(!filePath.includes(marker) && !contents.includes(marker), `el bundle de producción no contiene ${marker} (${filePath})`);
  }
}
// Los nombres de módulos en el manifiesto SSR no demuestran que una ruta esté registrada.
// La prueba HTTP inferior verifica el aislamiento real de las rutas dev-only.
console.log(`PASS production bundles: ${bundleFiles.length} archivos inspeccionados; sin módulos, rutas ni fixtures dev-only`);

const publicDiagnostic = await fetch(new URL("/diagnostico", baseUrl));
assert.equal(publicDiagnostic.status, 200, "el diagnóstico público permanece disponible en el Worker local de producción");

const requestId = randomUUID();
const devOnlyPaths = [
  "/api/diagnostic/funnel-analytics",
  "/api/diagnostic/report-requests",
  "/api/diagnostic/email/verify",
  "/api/diagnostic/report-requests/00000000-0000-4000-8000-000000000000/resend",
  `/__dev/diagnostico/lifecycle/fixture/${requestId}`,
  "/__dev/diagnostico/lifecycle/purge-expired",
  `/__dev/diagnostico/buzon/${requestId}`,
  "/diagnostico/verificar",
  `/diagnostico/informe/${requestId}`,
];

for (const path of devOnlyPaths) {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  const body = await response.text();
  assert.equal(response.status, 404, `${path} no está registrada/disponible en producción para una petición anónima`);
  assert.ok(!body.includes("qa-funnel@example.invalid"), `${path} no filtra el correo de fixture`);
  assert.ok(!body.includes("inspect_funnel_aggregate"), `${path} no filtra metadata de fixture`);
}

console.log(`PASS production Worker: ${devOnlyPaths.length} rutas dev-only devuelven 404; el informe detallado no se entrega anónimamente`);
