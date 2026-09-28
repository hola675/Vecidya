import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GOLDEN_QUESTIONS_V2,
  LOTE_A_QUESTIONS_V2,
  MODULE_IDS,
  QUESTION_BANK_V2,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

// ── DIAG-V3-08B.3, Lote A: core/classification/maturity/goal_friction ──────

test("Lote A: el banco combinado (golden + Lote A) pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(QUESTION_BANK_V2);
  assert.deepEqual(issues, [], `banco combinado no debería tener issues: ${JSON.stringify(issues)}`);
});

test("Lote A: sin IDs duplicados entre golden y Lote A", () => {
  const goldenIds = new Set(GOLDEN_QUESTIONS_V2.map((q) => q.id));
  const overlap = LOTE_A_QUESTIONS_V2.filter((q) => goldenIds.has(q.id));
  assert.deepEqual(overlap, [], `Lote A no debería reusar ningún QuestionId de golden: ${JSON.stringify(overlap.map((q) => q.id))}`);
});

test("Lote A: cada pregunta usa un módulo real y solo módulos de fundación (core/classification/maturity/goal_friction)", () => {
  const FOUNDATION_MODULES = new Set(["core", "classification", "maturity", "goal_friction"]);
  for (const question of LOTE_A_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module), `${question.id}: módulo inválido`);
    assert.ok(FOUNDATION_MODULES.has(question.module), `${question.id}: Lote A no debe tocar módulos especializados todavía (módulo real: ${question.module})`);
  }
});

test("Lote A: ninguna pregunta gatea en un archetype/nicho (regla sector-first, §1-13 del checkpoint: Lote A es universal, no especializado)", () => {
  const serialized = JSON.stringify(LOTE_A_QUESTIONS_V2);
  assert.ok(!serialized.includes('"op":"contextResolvedEquals","field":"archetype"'), "Lote A no debe gatear en archetype todavía (eso es Lote B en adelante)");
  assert.ok(!serialized.includes('"field":"nicheGroup"'), "Lote A no debe gatear NINGUNA pregunta en nicheGroup: nicheGroup se PRODUCE aquí, no se consume todavía");
});

// ── Cobertura de señales (§40 del checkpoint original: cada signal necesario debe tener un productor real) ──

test("Lote A: nicheGroup/customerReach/customerBuyer/systemization/capacityPressure/capacityExpansion tienen al menos un productor real en el banco", () => {
  const serialized = JSON.stringify(QUESTION_BANK_V2);
  for (const kind of ["nicheGroup", "customerReach", "customerBuyer", "systemization", "capacityPressure", "capacityExpansion"]) {
    assert.ok(serialized.includes(`"kind":"${kind}"`), `ninguna pregunta produce la señal "${kind}"`);
  }
});

// ── Regla sector-first: NicheGroup se resuelve sin necesitar un NicheId específico ──

test("sector-first: responder q2_sector solo resuelve nicheGroup, sin necesitar ningún NicheId ni pregunta de archetype", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "business", q2_sector: "health_wellness" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "health_wellness", source: "signal" });
  assert.equal(result.context.niche.status, "unresolved");
});

test("sector-first: elegir \"Ninguna de las anteriores\" en q2_sector resuelve nicheGroup a other explícitamente", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "other" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "other", source: "signal" });
});

// ── Reachability (§47: toda pregunta productiva debe ser alcanzable en al menos un fixture) ──

test("reachability: q2_sector/q2_customer_reach/q2_customer_buyer son elegibles sin ninguna respuesta previa (anclas universales)", () => {
  const result = resolveEligibleQuestionsV2({}, QUESTION_BANK_V2);
  for (const id of ["q2_sector", "q2_customer_reach", "q2_customer_buyer"]) {
    assert.ok(result.eligibleQuestionIds.includes(id), `${id} debería ser elegible sin respuestas previas`);
  }
});

test("reachability: q2_team_systemization y q2_capacity_signal son alcanzables cuando hay clientes reales y operación regular", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_team_systemization"), "q2_team_systemization debería ser elegible tras q2_has_customers=yes");
  assert.ok(result.eligibleQuestionIds.includes("q2_capacity_signal"), "q2_capacity_signal debería ser elegible tras q2_regularity=regular");
});

test("reachability: q2_team_systemization y q2_capacity_signal NO son elegibles para una idea sin clientes (§44: idea/prelaunch no recibe preguntas de operación madura)", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_team_systemization"), "una idea sin clientes no debería recibir la pregunta de sistematización");
  assert.ok(!result.eligibleQuestionIds.includes("q2_capacity_signal"), "una idea sin clientes no debería recibir la pregunta de capacidad");
});

// ── Señales observadas: capacidad estable produce AMBAS señales en false desde una sola opción ──

test("q2_capacity_signal: \"stable\" (sin demandTrend) resuelve growthStage=operating — la operacionalización de capacityPressure/capacityExpansion cierra el bloqueante de 08B.1 sin necesitar demandTrend", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["stable"] }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
});

test("q2_capacity_signal: \"waitlist_growing\" por sí solo (sin demandTrend) ya es evidencia suficiente de growing", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["waitlist_growing"] }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("q2_team_systemization=defined + evidencia de crecimiento → growthStage=scaling (systemization desempata growing vs scaling, §12 del checkpoint original)", () => {
  const result = resolveEligibleQuestionsV2(
    { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["expanded"], q2_team_systemization: "defined" },
    QUESTION_BANK_V2,
  );
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "scaling", source: "signal" });
});

test("q2_capacity_signal: waitlist_growing y expanded pueden coexistir (multi, ambas señales independientes)", () => {
  const bank = QUESTION_BANK_V2;
  const answers = { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["waitlist_growing", "expanded"] };
  const result = resolveEligibleQuestionsV2(answers, bank);
  assert.ok(result.activeAnswers.q2_capacity_signal !== undefined, "la respuesta multi debería seguir activa (ambas opciones son elegibles a la vez)");
});

// ── Tamaño del bank en progreso (Lote A) — no es el target final de 100-120 todavía ──

test("Lote A: el banco combinado tiene 19 preguntas (14 golden + 5 de Lote A); todavía lejos del target editorial de 100-120", () => {
  assert.equal(QUESTION_BANK_V2.length, 19);
});
