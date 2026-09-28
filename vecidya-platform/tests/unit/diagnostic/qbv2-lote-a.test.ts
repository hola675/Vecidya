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

test("demandTrend YA tiene productor real desde golden (q2_demand_trend) — Lote A no lo duplica, solo lo complementa con capacityPressure/capacityExpansion", () => {
  const demandTrendQuestion = GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_demand_trend");
  assert.ok(demandTrendQuestion, "q2_demand_trend debería existir en el banco golden");
  const serialized = JSON.stringify(demandTrendQuestion);
  assert.ok(serialized.includes('"kind":"demandTrend"'), "q2_demand_trend debería producir la señal demandTrend");
  assert.ok(serialized.includes("decreasing_observed"), "q2_demand_trend debería tener una opción que produzca decreasing_observed (§9 del checkpoint de revisión)");
});

// ── Regla sector-first: NicheGroup se resuelve sin necesitar un NicheId específico ──

test("sector-first: responder q2_sector solo resuelve nicheGroup, sin necesitar ningún NicheId ni pregunta de archetype", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "business", q2_sector: "health_wellness" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "health_wellness", source: "signal" });
  assert.equal(result.context.niche.status, "unresolved");
});

test("sector-first: elegir \"Otro sector, no encaja en los anteriores\" en q2_sector resuelve nicheGroup a other explícitamente", () => {
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

test("reachability: q2_process_systemization y q2_capacity_signal son alcanzables cuando hay clientes reales y operación regular", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_process_systemization"), "q2_process_systemization debería ser elegible tras q2_has_customers=yes");
  assert.ok(result.eligibleQuestionIds.includes("q2_capacity_signal"), "q2_capacity_signal debería ser elegible tras q2_regularity=regular");
});

test("reachability: q2_process_systemization y q2_capacity_signal NO son elegibles para una idea sin clientes (§44: idea/prelaunch no recibe preguntas de operación madura)", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_process_systemization"), "una idea sin clientes no debería recibir la pregunta de sistematización");
  assert.ok(!result.eligibleQuestionIds.includes("q2_capacity_signal"), "una idea sin clientes no debería recibir la pregunta de capacidad");
});

// ── GrowthStage: capacityPressure/capacityExpansion son ADICIONALES a demandTrend, no un sustituto ──

test("q2_capacity_signal: \"stable\" (sin demandTrend) resuelve growthStage=operating — la operacionalización de capacityPressure/capacityExpansion cierra el bloqueante de 08B.1 sin necesitar demandTrend", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["stable"] }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
});

test("q2_capacity_signal: \"waitlist_growing\" por sí solo (sin demandTrend) ya es evidencia suficiente de growing", () => {
  const result = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["waitlist_growing"] }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("q2_demand_trend=increasing + q2_capacity_signal=stable → growthStage=growing (demanda creciente sin presión de capacidad SIGUE siendo evidencia de growing, §7 del checkpoint de revisión)", () => {
  const result = resolveEligibleQuestionsV2(
    { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing", q2_capacity_signal: ["stable"] },
    QUESTION_BANK_V2,
  );
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("q2_demand_trend=decreasing NUNCA resuelve growing, ni siquiera combinado con capacidad estable (§9: decreasing no colapsa en growing/starting/operating de forma falsa)", () => {
  const result = resolveEligibleQuestionsV2(
    { q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "decreasing", q2_capacity_signal: ["stable"] },
    QUESTION_BANK_V2,
  );
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "operating", source: "signal" });
  assert.ok(JSON.stringify(result.trace.growthStage).includes("decreasing_observed"), "el trace debe distinguir explícitamente el declive, aunque GrowthStage resuelva operating (deuda documentada en 08B.1, no resuelta aquí)");
});

test("q2_process_systemization=documented_process + evidencia de crecimiento → growthStage=scaling (systemization desempata growing vs scaling, §12 del checkpoint original)", () => {
  const result = resolveEligibleQuestionsV2(
    { q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["expanded"], q2_process_systemization: "documented_process" },
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

// ── systemization es independiente de tamaño de equipo (§12 del checkpoint de revisión R1) ──

test("systemization: un individual solo (q2_entity=individual, sin staff continuo) con proceso documentado resuelve scaling igual que una empresa con staff — systemization=true no depende de tener equipo (§12)", () => {
  const soloWithProcess = resolveEligibleQuestionsV2(
    { q2_entity: "individual", q2_other_staff: "no", q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["expanded"], q2_process_systemization: "documented_process" },
    QUESTION_BANK_V2,
  );
  assert.deepEqual(soloWithProcess.context.growthStage, { status: "resolved", value: "scaling", source: "signal" });
  assert.equal(soloWithProcess.context.entity.status === "resolved" ? soloWithProcess.context.entity.value : undefined, "individual");

  const staffedWithoutProcess = resolveEligibleQuestionsV2(
    { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_capacity_signal: ["expanded"], q2_process_systemization: "memory_dependent" },
    QUESTION_BANK_V2,
  );
  assert.deepEqual(staffedWithoutProcess.context.growthStage, { status: "resolved", value: "growing", source: "signal" }, "una empresa con evidencia de crecimiento pero SIN proceso documentado resuelve growing, no scaling — el tamaño/tipo de entidad no decide esto, el proceso sí");
});

// ── CustomerReach: geografía pura, casos obligatorios A-G del checkpoint de revisión R1 (§5) ──

test("CustomerReach caso A: restaurante local → local (geografía pura, sin mencionar canal)", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "local" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "local", source: "signal" });
});

test("CustomerReach caso B: consultor que atiende en línea a clientes de todo el país → national (el canal en línea es un eje aparte, no cambia la geografía)", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "national", q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "national", source: "signal" });
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "ecommerce");
});

test("CustomerReach caso D: SaaS internacional → global", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "global" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "global", source: "signal" });
});

test("CustomerReach caso E: empresa B2B regional → regional + b2b, ejes independientes", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "regional", q2_customer_buyer: "b2b" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "regional", source: "signal" });
  assert.deepEqual(result.context.customerModel.buyer, { status: "resolved", value: "b2b", source: "signal" });
});

test("CustomerReach caso F/G: alcance nacional/global NUNCA implica ecommerce por sí solo, y un archetype no-ecommerce puede tener reach nacional (§6: no confundir reach con archetype)", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "national", q2_delivery: "fixed_with_inventory" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "national", source: "signal" });
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "retail");
});

test("CustomerReach: \"mixed\" es una combinación real declarada, no una zona nueva ni incertidumbre", () => {
  const result = resolveEligibleQuestionsV2({ q2_customer_reach: "mixed" }, QUESTION_BANK_V2);
  assert.deepEqual(result.context.customerModel.reach, { status: "resolved", value: "mixed", source: "signal" });
});

// ── Cobertura de goal_friction (§22-23 del checkpoint de revisión: reportar, no asumir) ──

test("goal_friction: 2 preguntas en el banco (ambas de golden, q2_goal + q2_friction), Lote A no añade ninguna todavía", () => {
  const goalFrictionQuestions = QUESTION_BANK_V2.filter((q) => q.module === "goal_friction");
  assert.deepEqual(
    goalFrictionQuestions.map((q) => q.id).sort(),
    ["q2_friction", "q2_goal"],
  );
});

test("matriz de PrimaryFriction: los 6 valores (visibility/trust/conversion/follow_up/operations/scale) son todos declarables desde q2_friction (foundation); operations y follow_up además tienen refuerzo diagnóstico en golden (appointments/b2b)", () => {
  const frictionQuestion = GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_friction")!;
  const declarable = new Set(
    frictionQuestion.options.flatMap((option) => (option.produces ?? []).filter((p) => p.kind === "friction").map((p) => (p as { value: string }).value)),
  );
  for (const value of ["visibility", "trust", "conversion", "follow_up", "operations", "scale"]) {
    assert.ok(declarable.has(value), `PrimaryFriction "${value}" no es declarable desde q2_friction`);
  }
  // Refuerzo diagnóstico ya existente (golden, fuera de goal_friction): confirma que "operations"/"follow_up" no dependen solo de la autopercepción.
  const reinforcedOperations = QUESTION_BANK_V2.some((q) => JSON.stringify(q).includes('"kind":"friction","value":"operations"') && q.module !== "goal_friction");
  const reinforcedFollowUp = QUESTION_BANK_V2.some((q) => JSON.stringify(q).includes('"kind":"friction","value":"follow_up"') && q.module !== "goal_friction");
  assert.ok(reinforcedOperations, "operations debería tener refuerzo diagnóstico fuera de goal_friction (q2_appointments_noshow)");
  assert.ok(reinforcedFollowUp, "follow_up debería tener refuerzo diagnóstico fuera de goal_friction (q2_b2b_pipeline)");
});

// ── Tamaño del bank en progreso (Lote A) — no es el target final de 100-120 todavía ──

test("Lote A: el banco combinado tiene 19 preguntas (14 golden + 5 de Lote A); todavía lejos del target editorial de 100-120", () => {
  assert.equal(QUESTION_BANK_V2.length, 19);
});
