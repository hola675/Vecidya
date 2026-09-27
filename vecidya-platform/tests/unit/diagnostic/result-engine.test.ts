import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import {
  buildResultFacts,
  deriveActiveAnswers,
  deriveContext,
  explainRecommendations,
  explainResult,
  getApplicableQuestions,
  goalIds,
  ISSUE_IDS,
  profileIds,
  runDiagnostic,
  scoreDimensions,
  stageIds,
  teamIds,
  type IssueId,
} from "../../../app/features/diagnostic/index.ts";
import { explainPrioritization, explainStateClassification, generateIssues, toScores } from "../../../app/features/diagnostic/result.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-05: pruebas de contrato del Result Engine — `ResultFacts`/`explainResult` como único
 * mecanismo de explicación (§24), serializabilidad (§40), IDs de hallazgo válidos y sin huérfanos
 * (§11), respuestas invalidadas excluidas del pipeline completo, no solo de una función aislada
 * (§35), y orden-independencia (§34).
 */

test("explainResult(...).result === runDiagnostic(...) exactamente, para todas las personas reales y adversariales", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    assert.deepEqual(explainResult(raw as never)?.result, runDiagnostic(raw as never));
  }
});

test("buildResultFacts/explainResult devuelven null exactamente cuando runDiagnostic devuelve null (sin perfil)", () => {
  assert.equal(buildResultFacts({} as never), null);
  assert.equal(explainResult({} as never), null);
  assert.equal(runDiagnostic({} as never), null);
});

/**
 * Recorre el árbol y falla ante cualquier valor que JSON no represente fielmente: funciones,
 * símbolos, `Map`/`Set` sin normalizar, cualquier instancia de clase (prototype distinto de
 * `Object.prototype`/`null`), o `undefined` DENTRO de un array (donde `JSON.stringify` lo
 * convierte silenciosamente en `null`, un cambio de valor real, no solo de forma). Un `undefined`
 * como valor de una propiedad de objeto NO se marca aquí: `JSON.stringify` omite esa clave por
 * completo (equivalente a que nunca hubiera existido) y esa es la convención ya establecida en
 * todo el dominio (`LicenseFit.notYet?`, `Issue.after?`, `DiagnosticResult.goalNote?`, …),
 * verificada además por `result.test.ts` (`!json.includes("undefined")` sobre el string real).
 * `JSON.stringify` OMITE en silencio las claves problemáticas en vez de lanzar, así que comparar
 * un string contra sí mismo (o su propio round-trip) nunca detecta el problema — de ahí que esta
 * función recorra el valor ORIGINAL, no su serialización.
 */
function assertSerializable(value: unknown, path: string): void {
  if (value === null || value === undefined || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return;
  if (typeof value === "function") assert.fail(`${path}: función no serializable`);
  if (typeof value === "symbol") assert.fail(`${path}: symbol no serializable`);
  if (value instanceof Map || value instanceof Set) assert.fail(`${path}: Map/Set sin normalizar`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assert.notEqual(item, undefined, `${path}[${index}]: undefined dentro de un array se convierte en null al serializar`);
      assertSerializable(item, `${path}[${index}]`);
    });
    return;
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    assert.ok(prototype === Object.prototype || prototype === null, `${path}: instancia de clase (${prototype?.constructor?.name}), no un objeto plano`);
    for (const [key, item] of Object.entries(value)) assertSerializable(item, `${path}.${key}`);
    return;
  }
  assert.fail(`${path}: tipo no serializable (${typeof value})`);
}

test("ResultFacts y el resultado completo son JSON-serializables sin pérdida (sin funciones, clases, Symbols, Maps ni Sets)", () => {
  for (const raw of Object.values(personas)) {
    const trace = explainResult(raw as never);
    assert.ok(trace);
    assertSerializable(trace, "trace");
  }
});

test("un round-trip JSON del resultado completo no cambia su digesto (ninguna clave se pierde al serializar dos veces)", () => {
  for (const raw of Object.values(personas)) {
    const trace = explainResult(raw as never);
    assert.ok(trace);
    const once = JSON.stringify(trace);
    const twice = JSON.stringify(JSON.parse(once));
    assert.equal(createHash("sha256").update(once).digest("hex"), createHash("sha256").update(twice).digest("hex"));
  }
});

test("todo hallazgo emitido usa un ID registrado en ISSUE_IDS; el barrido de personas ejercita al menos una vez cada ID sin huérfanos declarados", () => {
  const seen = new Set<IssueId>();
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const facts = buildResultFacts(raw as never);
    if (!facts) continue;
    for (const draft of facts.issueDrafts) {
      assert.ok((ISSUE_IDS as readonly string[]).includes(draft.id), `ID de hallazgo no registrado: ${draft.id}`);
      seen.add(draft.id);
    }
  }
  let seed = 20260929;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      for (const team of teamIds) {
        for (const goal of goalIds) {
          const answers: Record<string, string | string[]> = { profile, stage, team, goal };
          for (let iteration = 0; iteration < 8; iteration += 1) {
            for (const question of getApplicableQuestions(answers as never)) {
              if (answers[question.id] !== undefined) continue;
              const options = question.options;
              if (question.type === "single") {
                answers[question.id] = options[Math.floor(random() * options.length)].value;
              } else {
                const picked = options.filter(() => random() < 0.4).map((option) => option.value);
                answers[question.id] = picked.length ? picked : [options[0].value];
              }
            }
          }
          const facts = buildResultFacts(answers as never);
          if (!facts) continue;
          for (const draft of facts.issueDrafts) seen.add(draft.id);
        }
      }
    }
  }
  const unreachable = ISSUE_IDS.filter((id) => !seen.has(id));
  assert.deepEqual(unreachable, [], `IDs de ISSUE_IDS nunca producidos por el barrido: ${unreachable.join(", ")} (si son legítimos, deben documentarse explícitamente, no ignorarse)`);
});

test("ningún caso produce el mismo ID de hallazgo dos veces en el mismo resultado (sin duplicados)", () => {
  for (const raw of [...Object.values(personas), ...Object.values(adversarial)]) {
    const facts = buildResultFacts(raw as never);
    if (!facts) continue;
    const ids = facts.issueDrafts.map((draft) => draft.id);
    assert.equal(new Set(ids).size, ids.length, `hallazgos duplicados para ${JSON.stringify(raw)}: ${ids.join(",")}`);
  }
});

test("una respuesta invalidada por routing no produce evidencia, hallazgo, prioridad ni recomendación (pipeline completo, no una función aislada)", () => {
  // stage=regular habilita sources/capture; cambiar a idea invalida ambas. `capture: "no"` SÍ
  // produciría el hallazgo "capture_inquiries" si sobreviviera a la invalidación (a diferencia de
  // un valor neutro como "always"), así que este fixture puede realmente detectar una fuga.
  const withData = { profile: "business", stage: "regular", sources: ["social"], capture: "no" } as never;
  const invalidated = explainResult({ ...withData, stage: "idea" } as never);
  assert.ok(invalidated);
  assert.ok(!invalidated!.facts.evidence.some((item) => item.source.question.id === "sources" || item.source.question.id === "capture"));
  assert.ok(!invalidated!.facts.issueDrafts.some((draft) => draft.id === "capture_inquiries"));
  assert.ok(!invalidated!.issues.some((issue) => issue.id === "capture_inquiries"));
});

test("orden-independencia: invertir el orden de claves de un objeto de respuestas YA activo no cambia hallazgos, prioridades ni recomendación", () => {
  // Igual que en `scoring-trace.test.ts` (DIAG-V3-04, revisión final): `deriveActiveAnswers` ya
  // normaliza el orden de claves, así que comparar dos llamadas a `explainResult` con distinto
  // orden de entrada no demostraría nada (ambas pasarían por la misma normalización). Aquí se deriva
  // el activo UNA sola vez y se invierten sus claves directamente, sin una segunda invalidación.
  for (const raw of Object.values(personas)) {
    const active = deriveActiveAnswers(raw as never);
    const reversed = Object.fromEntries(Object.entries(active).reverse()) as typeof active;
    const context = deriveContext(active);
    const applicable = getApplicableQuestions(active);
    const dimensions = scoreDimensions(active, applicable);
    const scores = toScores(dimensions);
    const state = explainStateClassification(context, scores, dimensions).state;

    const drafts = generateIssues(context, scores);
    const draftsReversed = generateIssues(deriveContext(reversed), scores);
    assert.deepEqual(draftsReversed, drafts, "el orden de claves de las respuestas activas no debe afectar los hallazgos generados");

    const priorities = explainPrioritization(drafts, context).map((trace) => trace.issue);
    const prioritiesReversed = explainPrioritization(draftsReversed, context).map((trace) => trace.issue);
    assert.deepEqual(prioritiesReversed, priorities, "el orden de claves no debe afectar las prioridades");

    const { recommendation } = explainRecommendations(context, scores, priorities, state);
    const { recommendation: recommendationReversed } = explainRecommendations(context, scores, prioritiesReversed, state);
    assert.deepEqual(recommendationReversed, recommendation, "el orden de claves no debe afectar la recomendación");
  }
});
