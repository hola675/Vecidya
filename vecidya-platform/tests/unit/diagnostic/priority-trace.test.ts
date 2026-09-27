import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveActiveAnswers, getApplicableQuestions, PRIORITY_LIMIT, runDiagnostic, scoreDimensions } from "../../../app/features/diagnostic/index.ts";
import { explainPrioritization, generateIssues, GOAL_BOOST_FACTOR, goalBoost, prioritize, toScores } from "../../../app/features/diagnostic/result.ts";
import { deriveContext } from "../../../app/features/diagnostic/answers.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-V3-05 §16/§17/§18/§19: `explainPrioritization` es la única evaluación real de prioridad;
 * `prioritize` es un envoltorio. Cubre paridad, el impulso de objetivo (×1.3, exclusivo de esta
 * etapa), determinismo de empates y el límite de 3 prioridades visibles.
 */

function draftsFor(raw: Record<string, string | string[]>) {
  const active = deriveActiveAnswers(raw as never);
  const applicable = getApplicableQuestions(active);
  const dimensions = scoreDimensions(active, applicable);
  const scores = toScores(dimensions);
  const context = deriveContext(active);
  return { context, drafts: generateIssues(context, scores) };
}

test("explainPrioritization().issue coincide exactamente con prioritize() para todas las personas reales", () => {
  for (const raw of Object.values(personas)) {
    const { context, drafts } = draftsFor(raw as Record<string, string | string[]>);
    const traced = explainPrioritization(drafts, context).map((trace) => trace.issue);
    const direct = prioritize(drafts, context);
    assert.deepEqual(traced, direct);
  }
});

test("goal boost: el mismo hallazgo tiene mayor prioridad cuando el objetivo lo relaciona (×1.3), y solo entonces", () => {
  const base = personas.localBusinessLeaks as Record<string, string | string[]>;
  const { context: unrelatedContext, drafts: unrelatedDrafts } = draftsFor({ ...base, goal: "unsure" });
  const { context: relatedContext, drafts: relatedDrafts } = draftsFor({ ...base, goal: "stop_losing" });

  const unrelatedTrace = explainPrioritization(unrelatedDrafts, unrelatedContext).find((trace) => trace.id === "capture_inquiries");
  const relatedTrace = explainPrioritization(relatedDrafts, relatedContext).find((trace) => trace.id === "capture_inquiries");
  assert.ok(unrelatedTrace && relatedTrace, "ambos casos deben producir el hallazgo capture_inquiries");

  assert.equal(unrelatedTrace!.goalBoosted, false);
  assert.equal(relatedTrace!.goalBoosted, true);
  assert.equal(relatedTrace!.basePriority, unrelatedTrace!.basePriority, "la severidad base no cambia por el objetivo: el boost vive en priorización, no en scoring");
  assert.ok(Math.abs(relatedTrace!.afterGoalBoost - unrelatedTrace!.basePriority * GOAL_BOOST_FACTOR) < 1e-9, "el impulso aplica exactamente ×1.3 sobre la prioridad base");
});

test("goal boost no cambia qué goals se consideran relacionados ni el factor ×1.3 (caracteriza la tabla completa, no solo la constante)", () => {
  assert.equal(GOAL_BOOST_FACTOR, 1.3);
  // Caracterización exacta de la tabla actual (DIAG-V3-05 §17): si alguien añade, quita o mueve un
  // ID entre goals, este test lo detecta directamente, sin depender de qué persona se use como
  // fixture ni de qué issue exista en sus prioridades.
  assert.deepEqual(goalBoost, {
    be_found: ["improve_discoverability", "check_discoverability", "diversify_sources", "build_presence"],
    explain: ["define_offer"],
    trust: ["show_proof", "ask_reviews", "post_sale_loop"],
    opportunities: ["improve_discoverability", "define_contact_path", "diversify_sources"],
    stop_losing: ["capture_inquiries", "speed_up_response", "structure_follow_up", "define_contact_path"],
    organize: ["capture_inquiries", "track_pipeline", "structure_follow_up", "assign_responsibilities"],
    automate: ["automate_repetitive", "structure_follow_up"],
    measure: ["start_measuring", "track_pipeline"],
    unsure: [],
  });
});

test("goal boost: para cada goal, exactamente los IDs de su fila en `goalBoost` reciben el impulso, ningún otro", () => {
  for (const [goal, boostedIds] of Object.entries(goalBoost)) {
    const { context, drafts } = draftsFor({ ...(personas.localBusinessLeaks as Record<string, string | string[]>), goal });
    for (const trace of explainPrioritization(drafts, context)) {
      assert.equal(trace.goalBoosted, boostedIds.includes(trace.id), `${trace.id} con goal=${goal}: goalBoosted debería ser ${boostedIds.includes(trace.id)}`);
    }
  }
});

test("empates de prioridad se resuelven de forma determinista: mismo orden en corridas repetidas y por peso de tipo, luego por ID", () => {
  const { context, drafts } = draftsFor(personas.multiSourceTeam as Record<string, string | string[]>);
  const runs = Array.from({ length: 5 }, () => JSON.stringify(explainPrioritization(drafts, context).map((trace) => trace.id)));
  assert.ok(runs.every((run) => run === runs[0]), "el orden de prioridad debe ser idéntico en corridas repetidas");

  const traces = explainPrioritization(drafts, context);
  for (let i = 1; i < traces.length; i += 1) {
    const previous = traces[i - 1];
    const current = traces[i];
    const orderedByPriority = previous.finalPriority > current.finalPriority;
    const tiedByPriority = previous.finalPriority === current.finalPriority;
    const orderedByWeight = tiedByPriority && previous.kindWeight > current.kindWeight;
    const tiedByWeight = tiedByPriority && previous.kindWeight === current.kindWeight;
    const orderedById = tiedByWeight && previous.id.localeCompare(current.id) <= 0;
    assert.ok(orderedByPriority || orderedByWeight || orderedById, `orden inesperado entre ${previous.id} y ${current.id}`);
  }
});

test("máximo 3 prioridades visibles en el resultado final (PRIORITY_LIMIT)", () => {
  assert.equal(PRIORITY_LIMIT, 3);
  for (const raw of Object.values(personas)) {
    const result = runDiagnostic(raw as never);
    assert.ok(result);
    assert.ok(result!.priorities.length <= PRIORITY_LIMIT);
  }
});

test("un hallazgo bloqueado (dependencia sin resolver con severidad ≥ 0.5) recibe el factor ×0.5, visible en la traza", () => {
  const { context, drafts } = draftsFor({ ...(personas.localBusinessLeaks as Record<string, string | string[]>), follow_up: "none" });
  const traces = explainPrioritization(drafts, context);
  const followUp = traces.find((trace) => trace.id === "structure_follow_up");
  assert.ok(followUp, "structure_follow_up debe generarse cuando follow_up=none");
  if (followUp!.blocked) {
    assert.ok(followUp!.blockers.length > 0);
    assert.ok(Math.abs(followUp!.finalPriority - Math.round(followUp!.afterTentative * 0.5 * 1000) / 1000) < 1e-9);
  }
});
