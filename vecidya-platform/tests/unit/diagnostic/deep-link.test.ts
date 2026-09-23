import assert from "node:assert/strict";
import { test } from "node:test";

import { buildDiagnosticPath, entryToAnswers, parseDiagnosticEntry, profileIds } from "../../../app/features/diagnostic/index.ts";

test("acepta todos los perfiles válidos por el parámetro canónico perfil", () => {
  for (const profile of profileIds) {
    assert.deepEqual(parseDiagnosticEntry(`?perfil=${profile}`), { profile });
    assert.equal(buildDiagnosticPath({ profile }), `/diagnostico?perfil=${profile}`);
  }
});

test("sin parámetros devuelve una entrada vacía y la ruta base", () => {
  assert.deepEqual(parseDiagnosticEntry(""), {});
  assert.deepEqual(parseDiagnosticEntry(null), {});
  assert.deepEqual(parseDiagnosticEntry(undefined), {});
  assert.deepEqual(parseDiagnosticEntry("?otro=1"), {});
  assert.equal(buildDiagnosticPath(), "/diagnostico");
  assert.equal(buildDiagnosticPath({}), "/diagnostico");
});

test("ignora valores inválidos, inyecciones y perfiles retirados", () => {
  for (const value of ["<script>alert(1)</script>", "public_figure", "idea", "BUSINESS%00", "' OR 1=1", "x".repeat(200), "%E2%9C%93"]) {
    const entry = parseDiagnosticEntry(`?perfil=${encodeURIComponent(value)}`);
    assert.equal(entry.profile, undefined, `no debe aceptar ${value}`);
  }
  assert.equal(parseDiagnosticEntry("?objetivo=<img src=x>").goal, undefined);
});

test("normaliza mayúsculas y espacios sin ampliar la lista permitida", () => {
  assert.equal(parseDiagnosticEntry("?perfil=%20Professional%20").profile, "professional");
  assert.equal(parseDiagnosticEntry("?perfil=PROFESSIONALS").profile, undefined);
});

test("acepta el objetivo opcional y lo convierte en respuestas iniciales", () => {
  const entry = parseDiagnosticEntry("?perfil=business&objetivo=stop_losing");
  assert.deepEqual(entry, { profile: "business", goal: "stop_losing" });
  assert.deepEqual(entryToAnswers(entry), { profile: "business", goal: "stop_losing" });
  assert.equal(buildDiagnosticPath(entry), "/diagnostico?perfil=business&objetivo=stop_losing");
  assert.deepEqual(entryToAnswers(parseDiagnosticEntry("?objetivo=organize")), { goal: "organize" });
});

test("acepta URLSearchParams además de cadenas", () => {
  assert.equal(parseDiagnosticEntry(new URLSearchParams({ perfil: "creator" })).profile, "creator");
});
