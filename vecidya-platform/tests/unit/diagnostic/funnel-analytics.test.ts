import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  FUNNEL_ANALYTICS_CONTRACT_VERSION,
  FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION,
  FUNNEL_ANALYTICS_EVENTS,
  isBrowserFunnelAnalyticsEvent,
  isFunnelAnalyticsEvent,
  isLoopbackDevelopmentHost,
  utcAnalyticsDay,
} from "../../../app/features/diagnostic/funnel-analytics-contract";

test("el contrato de analítica admite únicamente los seis eventos de funnel", () => {
  assert.deepEqual(FUNNEL_ANALYTICS_EVENTS, [
    "diagnostic_started",
    "diagnostic_completed",
    "detailed_report_cta_clicked",
    "identified_request_created",
    "email_verified",
    "detailed_report_first_opened",
  ]);
  assert.equal(isFunnelAnalyticsEvent("question_answered"), false);
  assert.equal(isFunnelAnalyticsEvent("commercial_contact_requested"), false);
  assert.equal(isFunnelAnalyticsEvent("diagnostic_started"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("diagnostic_started"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("detailed_report_cta_clicked"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("diagnostic_completed"), false);
  assert.equal(isBrowserFunnelAnalyticsEvent({ event: "diagnostic_started" }), false);
});

test("la métrica fija versión de diagnóstico y normaliza el día en UTC", () => {
  assert.equal(FUNNEL_ANALYTICS_CONTRACT_VERSION, 1);
  assert.equal(FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, "diag-v3-public-v1");
  assert.equal(utcAnalyticsDay(new Date("2026-10-17T00:30:00+02:00")), "2026-10-16");
});

test("la telemetría local solo acepta nombres de host loopback", () => {
  assert.equal(isLoopbackDevelopmentHost("localhost"), true);
  assert.equal(isLoopbackDevelopmentHost("LOCALHOST"), true);
  assert.equal(isLoopbackDevelopmentHost("127.0.0.1"), true);
  assert.equal(isLoopbackDevelopmentHost("[::1]"), true);
  assert.equal(isLoopbackDevelopmentHost("192.0.2.10"), false);
  assert.equal(isLoopbackDevelopmentHost("remote.invalid"), false);
  assert.equal(isLoopbackDevelopmentHost("localhost.remote.invalid"), false);
});

test("la deduplicación de primera apertura pertenece a la solicitud, no al grant", () => {
  const schema = readFileSync(new URL("../../../db/schema/diagnostic-identification.ts", import.meta.url), "utf8");
  const requestTable = schema.match(/export const identifiedDiagnosticRequest = sqliteTable\([\s\S]*?\n\}, \(table\) => \[/)?.[0];
  const accessTable = schema.match(/export const diagnosticReportAccess = sqliteTable\([\s\S]*?\n\}, \(table\) => \[/)?.[0];

  assert.ok(requestTable, "la tabla de solicitudes debe estar declarada");
  assert.ok(accessTable, "la tabla de grants debe estar declarada");
  assert.match(requestTable, /firstReportOpenedAt: integer\("first_report_opened_at"/);
  assert.doesNotMatch(accessTable, /firstOpenedAt: integer\("first_opened_at"/);
});

test("0019 conserva el marcador ya registrado antes de retirar la columna del grant", () => {
  const migration = readFileSync(new URL("../../../db/migrations/0019_diagnostic-funnel-request-first-open.sql", import.meta.url), "utf8");
  const backfillPosition = migration.search(/UPDATE\s+`identified_diagnostic_request`/);
  const dropPosition = migration.indexOf("DROP COLUMN `first_opened_at`");

  assert.ok(backfillPosition >= 0, "la migración debe copiar las primeras aperturas existentes");
  assert.ok(dropPosition > backfillPosition, "la columna del grant se retira solo después del backfill");
  assert.match(migration, /MIN\(`first_opened_at`\)/);
  assert.match(migration, /`first_opened_at` IS NOT NULL/);
});


test("la fixture de limpieza no elimina agregados anónimos de otras sesiones", () => {
  const fixture = readFileSync(new URL("../../../app/routes/dev-diagnostic-lifecycle-fixture.ts", import.meta.url), "utf8");
  const cleanup = fixture.match(/if \(op === "cleanup"\) \{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(cleanup, "la fixture debe declarar una operación de limpieza explícita");
  assert.doesNotMatch(cleanup, /DELETE\s+FROM\s+diagnostic_funnel_aggregate/i, "cleanup no puede borrar agregados globales");
  assert.match(cleanup, /DELETE\s+FROM\s+identified_diagnostic_request\s+WHERE\s+id\s*=\s*\?/i, "cleanup debe limitar el borrado al requestId");
  assert.doesNotMatch(fixture, /DELETE\s+FROM\s+diagnostic_funnel_aggregate/i, "ninguna operación de fixture puede eliminar la analítica histórica");
});
