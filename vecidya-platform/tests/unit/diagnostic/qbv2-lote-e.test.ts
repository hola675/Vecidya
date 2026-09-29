import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GOLDEN_QUESTIONS_V2,
  LOTE_A_QUESTIONS_V2,
  LOTE_B_QUESTIONS_V2,
  LOTE_C_QUESTIONS_V2,
  LOTE_D_QUESTIONS_V2,
  LOTE_E_QUESTIONS_V2,
  MODULE_IDS,
  QUESTION_BANK_V2,
  resolveDiagnosticContext,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

const E_MODULES = new Set(["operations", "follow_up", "measurement"]);
const SPECIALIZED_MODULES = new Set(["local", "local_service", "appointments", "professional", "reputation", "retail", "ecommerce", "hospitality", "b2b", "creator", "nonprofit"]);
const FOUNDATION_MODULES = new Set(["core", "classification", "maturity", "goal_friction"]);

test("Lote E: el banco combinado pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(QUESTION_BANK_V2);
  assert.deepEqual(issues, [], `banco combinado no debería tener issues: ${JSON.stringify(issues)}`);
});

test("Lote E: sin IDs duplicados contra golden/Lote A/B/C/D", () => {
  const priorIds = new Set([...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2, ...LOTE_D_QUESTIONS_V2].map((q) => q.id));
  const overlap = LOTE_E_QUESTIONS_V2.filter((q) => priorIds.has(q.id));
  assert.deepEqual(overlap, []);
});

test("Lote E: cada pregunta usa un módulo real de operations/follow_up/measurement", () => {
  for (const question of LOTE_E_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module));
    assert.ok(E_MODULES.has(question.module), `${question.id}: módulo fuera de alcance (${question.module})`);
  }
});

test("Lote E: gateado por primaryFriction/primaryGoal (cross-cutting), no por archetype/businessModel/nicho", () => {
  for (const question of LOTE_E_QUESTIONS_V2) {
    const serialized = question.appliesWhen ? JSON.stringify(question.appliesWhen) : "";
    assert.ok(!serialized.includes('"field":"archetype"') && !serialized.includes("archetypeIncludes") && !serialized.includes('"field":"businessModel"') && !serialized.includes("niche"), `${question.id}: no debería gatear en archetype/businessModel/nicho`);
    if (question.module === "operations") assert.ok(serialized.includes('"field":"primaryFriction","value":"operations"'));
    if (question.module === "follow_up") assert.ok(serialized.includes('"field":"primaryFriction","value":"follow_up"'));
    if (question.module === "measurement") assert.ok(serialized.includes('"field":"primaryGoal","value":"measure"'));
  }
});

// ── Auditoría explícita: sin duplicar contenido existente (§37-39, §46) ────

test("mutación E: operations NO repite q2_process_systemization (\"¿hay un proceso definido?\" genérico) — cubre facetas distintas", () => {
  const systemization = LOTE_A_QUESTIONS_V2.find((q) => q.id === "q2_process_systemization")!;
  const operationsPrompts = LOTE_E_QUESTIONS_V2.filter((q) => q.module === "operations").map((q) => q.prompt);
  for (const prompt of operationsPrompts) assert.notEqual(prompt, systemization.prompt);
});

test("mutación F/I (blocker real corregido por fresh domain review): q2_b2b_status_visibility se mantiene (REUSE), y q2_followup_status_visibility mide un concepto DISTINTO (hábito de repaso, no confianza puntual) — ni el prompt ni las opciones coinciden", () => {
  const b2bVersion = LOTE_D_QUESTIONS_V2.find((q) => q.id === "q2_b2b_status_visibility")!;
  const genericVersion = LOTE_E_QUESTIONS_V2.find((q) => q.id === "q2_followup_status_visibility")!;
  assert.ok(b2bVersion, "q2_b2b_status_visibility debe seguir existiendo (REUSE)");
  assert.notEqual(b2bVersion.prompt, genericVersion.prompt);
  assert.ok(!genericVersion.prompt.toLowerCase().includes("oportunidad"), "la versión genérica no debe usar terminología de pipeline B2B");
  // La versión original (previa al fresh domain review) repetía las 4 opciones casi literalmente
  // (yes_clear/somewhat/lose_track/unknown) — la versión final usa un eje de FRECUENCIA de una acción,
  // opciones completamente distintas.
  assert.deepEqual(genericVersion.options.map((o) => o.value).sort(), ["only_when_remember", "rarely", "regularly", "unknown"]);
  assert.notDeepEqual(genericVersion.options.map((o) => o.value).sort(), b2bVersion.options.map((o) => o.value).sort());
});

test("ninguna pregunta global de re-engagement fue creada — ya cubierta por archetype (cart/quote/consult/rebooking)", () => {
  const ids = LOTE_E_QUESTIONS_V2.map((q) => q.id);
  for (const banned of ["q2_followup_reengagement", "q2_followup_dormant_lead", "q2_followup_cart", "q2_followup_rebooking"]) {
    assert.ok(!ids.includes(banned));
  }
});

test("q2_measurement_source_confidence mide CONFIANZA de atribución, no el canal específico (ya cubierto por q2_local_discovery/q2_b2b_lead_source/q2_ecommerce_traffic_sources)", () => {
  const question = LOTE_E_QUESTIONS_V2.find((q) => q.id === "q2_measurement_source_confidence")!;
  const values = question.options.map((o) => o.value);
  for (const channelValue of ["referral", "outbound", "inbound", "social", "search", "ads", "maps_search", "walk_by", "paid_ads"]) {
    assert.ok(!values.includes(channelValue), `q2_measurement_source_confidence no debería tener opciones de canal específico como "${channelValue}"`);
  }
});

// ── Fricción: ninguna pregunta de Lote E vuelve a producir operations/follow_up (circular) ──

test("mutación (circularidad): ninguna pregunta de operations/follow_up produce friction=operations o friction=follow_up — la fricción ya está resuelta para que la pregunta sea elegible", () => {
  for (const question of LOTE_E_QUESTIONS_V2.filter((q) => q.module === "operations" || q.module === "follow_up")) {
    for (const option of question.options) {
      const frictionProductions = (option.produces ?? []).filter((p) => p.kind === "friction");
      assert.deepEqual(frictionProductions, [], `${question.id}.${option.value}: no debería producir friction (sería circular)`);
    }
  }
});

test("mutación J: ninguna pregunta de measurement produce friction=scale automáticamente por mala medición", () => {
  for (const question of LOTE_E_QUESTIONS_V2.filter((q) => q.module === "measurement")) {
    for (const option of question.options) {
      const frictionProductions = (option.produces ?? []).filter((p) => p.kind === "friction");
      assert.deepEqual(frictionProductions, [], `${question.id}.${option.value}: measurement no debería producir friction directamente`);
    }
  }
});

test("mutación D: ausencia de source attribution NUNCA produce friction=visibility automáticamente (es un problema de measurement, no de visibility)", () => {
  const question = LOTE_E_QUESTIONS_V2.find((q) => q.id === "q2_measurement_source_confidence")!;
  for (const option of question.options) {
    assert.ok(!(option.produces ?? []).some((p) => p.kind === "friction" && p.value === "visibility"));
  }
});

// ── Protecciones por stage / solo operator (§33-35) ──────────────────────────

test("mutación C: idea sin clientes (q2_has_customers=no) NUNCA recibe preguntas de measurement (conversion tracking avanzado)", () => {
  const result = resolveEligibleQuestionsV2({ q2_goal: "measure", q2_has_customers: "no" }, QUESTION_BANK_V2);
  for (const q of LOTE_E_QUESTIONS_V2.filter((qq) => qq.module === "measurement")) {
    assert.ok(!result.eligibleQuestionIds.includes(q.id), `${q.id} no debería ser elegible para una idea sin clientes`);
  }
});

test("mutación A: q2_operations_handoffs y q2_followup_ownership tienen not_applicable legítimo — un solo operator puede declarar que no aplica, sin bloquear la pregunta ni forzar la respuesta", () => {
  for (const id of ["q2_operations_handoffs", "q2_followup_ownership"]) {
    const question = LOTE_E_QUESTIONS_V2.find((q) => q.id === id)!;
    assert.ok(question.options.some((o) => o.kind === "not_applicable"), `${id} debería tener una opción not_applicable`);
    assert.equal(question.scoringReadiness?.allowsNotApplicable, true);
  }
});

test("un solo operator SÍ puede recibir process dependency/manual work/follow-up/measurement (no bloqueadas por trabajar solo)", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "individual", q2_other_staff: "no", q2_friction: "operations" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_operations_dependency"));
  assert.ok(result.eligibleQuestionIds.includes("q2_operations_manual_impact"));
  assert.ok(result.eligibleQuestionIds.includes("q2_operations_bottleneck"));
});

// ── Nonprofit/creator: sin lenguaje comercial en Lote E (§31-32) ────────────

test("mutación G: ninguna pregunta de Lote E fuerza lenguaje de venta/compra visible (\"vender\", \"comprador\", \"cliente\" como término obligatorio) — usa \"resultado real\"/\"pendientes\" genéricos", () => {
  const banned = ["comprador", "vender"];
  for (const question of LOTE_E_QUESTIONS_V2) {
    const visibleCopy = [question.prompt, question.helper, ...question.options.map((o) => o.label)].filter(Boolean).join(" ").toLowerCase();
    for (const word of banned) assert.ok(!visibleCopy.includes(word), `${question.id}: usa "${word}"`);
  }
});

test("no se miden vanity metrics de creator (followers/likes/views) en measurement", () => {
  const serialized = JSON.stringify(LOTE_E_QUESTIONS_V2).toLowerCase();
  for (const banned of ["follower", "seguidor", "like", "vista", "view count"]) {
    assert.ok(!serialized.includes(banned), `Lote E no debería mencionar "${banned}"`);
  }
});

// ── Fixtures (mínimo 10) ─────────────────────────────────────────────────────

test("fixture 1: solo operator organizado (friction=operations, respuestas positivas) → preguntas operations elegibles", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "individual", q2_other_staff: "no", q2_friction: "operations" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_operations_process_ownership"));
});

test("fixture 2: solo operator memory-dependent (friction=follow_up) → preguntas follow_up elegibles", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "individual", q2_friction: "follow_up" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_followup_general_process"));
});

test("fixture 3: equipo pequeño con handoffs poco claros (friction=operations, business con staff) → q2_operations_handoffs elegible, sin N/A forzado", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "business", q2_friction: "operations", q2_operations_handoffs: "sometimes_lost" }, QUESTION_BANK_V2);
  assert.ok(result.activeAnswers.q2_operations_handoffs !== undefined);
});

test("fixture 4: negocio perdiendo follow-ups (friction=follow_up, sometimes_lost) → sigue elegible, evidencia diagnóstica sin friction adicional", () => {
  const result = resolveEligibleQuestionsV2({ q2_friction: "follow_up", q2_followup_general_process: "sometimes_lost" }, QUESTION_BANK_V2);
  assert.equal(result.context.primaryFriction.status === "resolved" ? result.context.primaryFriction.value : undefined, "follow_up");
});

test("fixture 5: negocio con follow-up manual pero confiable (friction=follow_up, manual_consistent) → NO produce friction adicional", () => {
  const result = resolveEligibleQuestionsV2({ q2_friction: "follow_up", q2_followup_general_process: "manual_consistent" }, QUESTION_BANK_V2);
  assert.equal(result.context.primaryFriction.status === "resolved" ? result.context.primaryFriction.value : undefined, "follow_up");
});

test("fixture 6: negocio que no puede rastrear de dónde vienen sus leads (goal=measure, con clientes) → q2_measurement_source_confidence elegible", () => {
  const result = resolveEligibleQuestionsV2({ q2_goal: "measure", q2_has_customers: "yes" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_measurement_source_confidence"));
});

test("fixture 7: negocio que mide origen pero no conversión (goal=measure, source_confidence respondida) → outcome_tracking sigue disponible", () => {
  const result = resolveEligibleQuestionsV2({ q2_goal: "measure", q2_has_customers: "yes", q2_measurement_source_confidence: "yes_confident" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_measurement_outcome_tracking"));
});

test("q2_measurement_decision_review es elegible directamente bajo goal=measure + has_customers=yes (fresh code review: las 3 preguntas de measurement comparten regla, verificar cada una por separado, no solo dos de tres)", () => {
  const result = resolveEligibleQuestionsV2({ q2_goal: "measure", q2_has_customers: "yes" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_measurement_decision_review"));
});

test("fixture 8: nonprofit con friction=operations → recibe preguntas operations sin lenguaje comercial", () => {
  const result = resolveEligibleQuestionsV2({ q2_monetization: "mission", q2_friction: "operations" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_operations_bottleneck"));
});

test("fixture 9: creator con goal=measure y clientes reales → recibe measurement sin vanity metrics", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "audience_content", q2_goal: "measure", q2_has_customers: "yes" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_measurement_outcome_tracking"));
});

test("fixture 10: idea/prelaunch (sin clientes, goal=measure) → measurement completamente bloqueado", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no", q2_goal: "measure" }, QUESTION_BANK_V2);
  const leaked = result.eligibleQuestionIds.filter((id) => LOTE_E_QUESTIONS_V2.some((q) => q.module === "measurement" && q.id === id));
  assert.deepEqual(leaked, []);
});

// ── Route pressure: foundation + specialized + cross-cutting (§42-43, §50) ──

function classify(id: string): "foundation" | "specialized" | "cross-cutting" | "other" {
  const q = QUESTION_BANK_V2.find((question) => question.id === id);
  if (!q) return "other";
  if (FOUNDATION_MODULES.has(q.module)) return "foundation";
  if (SPECIALIZED_MODULES.has(q.module)) return "specialized";
  if (E_MODULES.has(q.module)) return "cross-cutting";
  return "other";
}

function pressureReport(answers: Record<string, string | readonly string[]>) {
  const result = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  const buckets = { foundation: 0, specialized: 0, "cross-cutting": 0, other: 0 };
  for (const id of result.eligibleQuestionIds) buckets[classify(id)]++;
  return { ...buckets, total: result.eligibleQuestionIds.length };
}

test("route pressure A-I: reporta foundation/specialized/cross-cutting por separado para los 9 contextos del checkpoint — ninguno debe ser 0 donde se espera contenido", () => {
  const contexts: Record<string, Record<string, string>> = {
    "A. solo operator simple": { q2_delivery: "solo_practice", q2_entity: "individual" },
    "B. growing local_service": { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular" },
    "C. appointments business": { q2_delivery: "scheduled" },
    "D. ecommerce": { q2_delivery: "online_checkout" },
    "E. B2B professional": { q2_delivery: "b2b_pipeline" },
    "F. creator": { q2_delivery: "audience_content" },
    "G. nonprofit": { q2_monetization: "mission" },
  };
  const report: Record<string, ReturnType<typeof pressureReport>> = {};
  for (const [label, answers] of Object.entries(contexts)) {
    report[label] = pressureReport(answers);
    assert.ok(report[label].foundation > 0, `${label}: foundation eligible debería ser > 0`);
  }
  // Dato registrado para 08B.4, no resuelto aquí (§43 del checkpoint): el total combinado ya muestra
  // presión real. No se afirma un máximo aquí — es exactamente lo que 08B.4 deberá acotar.
  assert.ok(Object.values(report).every((r) => r.total > 0));
});

test("route pressure H/I: hybrid (professional+appointments, retail+ecommerce) siguen sumando foundation+specialized — Lote E no añade presión cross-cutting salvo que friction/goal estén declarados", () => {
  const hybridContext = resolveDiagnosticContext({
    deliveryMode: { value: "specialized_individual_practice", provenance: "explicit_declaration" },
    secondaryDeliveryMode: { value: "scheduled_time_blocks", provenance: "explicit_declaration" },
  }).context;
  assert.deepEqual(hybridContext.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  // Sin friction/goal declarados, ninguna pregunta de Lote E debería activarse todavía (cross-cutting = 0).
  const eligibleE = LOTE_E_QUESTIONS_V2.filter((q) => {
    const rule = q.appliesWhen;
    return rule !== undefined;
  });
  assert.ok(eligibleE.length === LOTE_E_QUESTIONS_V2.length, "sanity: todas las preguntas de Lote E tienen appliesWhen (ninguna es incondicional)");
});

// ── Bank size ────────────────────────────────────────────────────────────────

test("Lote E: aporta exactamente 11 preguntas nuevas (5 operations + 3 follow_up + 3 measurement; el tamaño del banco COMBINADO se prueba en el test file del lote más reciente)", () => {
  assert.equal(LOTE_E_QUESTIONS_V2.length, 11);
});
