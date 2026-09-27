import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

/**
 * Mutación H (spec §65): "borrar KV antes de D1 y simular fallo → el test debe detectar el orden
 * incorrecto". La garantía real es de ORDEN DE CÓDIGO (D1 primero, confirmado; KV después,
 * best-effort — spec §29), así que se protege leyendo la fuente de la ruta de finalización: la
 * llamada de borrado de KV debe aparecer textualmente DESPUÉS de `completeDiagnosticSession`, nunca
 * antes. Si alguien invierte el orden, esta prueba falla.
 */

const routePath = fileURLToPath(new URL("../../../app/routes/api-diagnostic-session-complete.ts", import.meta.url));
const source = readFileSync(routePath, "utf8");

test("la ruta de finalización llama a completeDiagnosticSession antes que a deleteDiagnosticSnapshotBestEffort", () => {
  const completionIndex = source.indexOf("completeDiagnosticSession(database");
  const kvDeleteIndex = source.indexOf("deleteDiagnosticSnapshotBestEffort(");
  assert.notEqual(completionIndex, -1, "la ruta debe llamar a completeDiagnosticSession");
  assert.notEqual(kvDeleteIndex, -1, "la ruta debe llamar a deleteDiagnosticSnapshotBestEffort");
  assert.ok(completionIndex < kvDeleteIndex, "D1 debe confirmarse antes de intentar borrar el snapshot de KV (spec §29)");
});

test("el borrado de KV solo se intenta cuando la finalización terminó en estado 'completed'", () => {
  assert.match(source, /outcome\.status === "completed"[\s\S]{0,300}deleteDiagnosticSnapshotBestEffort/);
});
