import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDiagnostics,
  diagnosticProcessSummary,
  describeSqlOperation,
  redactDiagnosticText,
  sqlInList,
} from "../../e2e/authorization-harness-diagnostics.mjs";

test("las trazas progresivas acotan operaciones, etapas y checks pendientes", () => {
  const lines: string[] = [];
  let time = 100;
  const diagnostics = createDiagnostics({
    runId: "run-test",
    totalChecks: 2,
    log: (line: string) => lines.push(line),
    now: () => time,
  });

  assert.ok(lines.some((line) => line.includes("RUN START") && line.includes("checksExpected=2")));
  diagnostics.startStage("matrix");
  const finishOperation = diagnostics.startOperation("D1", "read-members", 5_000);
  time += 25;
  finishOperation({ outcome: "ok", status: 0 });
  diagnostics.recordCheck(true, "owner may read members");
  time += 10;
  diagnostics.finish("BLOCKED");

  assert.ok(lines.some((line) => line.includes("STAGE START matrix")));
  assert.ok(lines.some((line) => line.includes("D1 START run-test-D1-1") && line.includes("timeoutMs=5000")));
  assert.ok(lines.some((line) => line.includes("D1 END run-test-D1-1") && line.includes("durationMs=25") && line.includes("status=0")));
  assert.ok(lines.some((line) => line.includes("CHECK 1/2") && line.includes("pending=1")));
  assert.ok(lines.some((line) => line.includes("STAGE END matrix") && line.includes("durationMs=35")));
  assert.ok(lines.some((line) => line.includes("RUN END BLOCKED") && line.includes("durationMs=35") && line.includes("checks=1/2") && line.includes("pending=1")));
});

test("las trazas redactan cookies, credenciales y tokens, y diagnostican el proceso Wrangler", () => {
  const sensitive = "Authorization: Bearer full-bearer-token\nCookie: session=full-cookie-token\npassword=test-password token=full-token";
  const safe = redactDiagnosticText(sensitive);

  for (const value of ["full-bearer-token", "full-cookie-token", "test-password", "full-token"]) {
    assert.equal(safe.includes(value), false, `la traza expuso ${value}`);
  }

  const summary = diagnosticProcessSummary({
    pid: 42,
    status: null,
    signal: "SIGTERM",
    error: { code: "ETIMEDOUT" },
    stderr: "Cookie: session=full-cookie-token",
    externalState: "still-running",
    timedOut: true,
  });

  assert.match(summary, /pid=42/);
  assert.match(summary, /error=ETIMEDOUT/);
  assert.match(summary, /external=still-running/);
  assert.match(summary, /timedOut=true/);
  assert.equal(summary.includes("full-cookie-token"), false);
});

test("el alcance SQL vacío no se convierte en una eliminación global y los IDs se escapan", () => {
  assert.equal(sqlInList([]), "SELECT NULL WHERE 0");
  assert.equal(sqlInList(["run-id", "id'with-quote"]), "'run-id', 'id''with-quote'");
});

test("la etiqueta D1 identifica sentencias y tablas sin imprimir valores del fixture", () => {
  const label = describeSqlOperation("UPDATE user SET email = 'private@example.test' WHERE id = 'secret-id'; DELETE FROM member WHERE user_id = 'secret-id';");
  assert.equal(label, "UPDATE user + DELETE FROM member");
  assert.equal(label.includes("private@example.test"), false);
  assert.equal(label.includes("secret-id"), false);
});
