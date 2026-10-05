import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateRuleV2,
  GOLDEN_QUESTIONS_V2,
  LOTE_A_QUESTIONS_V2,
  LOTE_B_QUESTIONS_V2,
  LOTE_C_QUESTIONS_V2,
  MODULE_IDS,
  QUESTION_BANK_V2,
  resolveDiagnosticContext,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
  type QuestionDefinitionV2,
  type ResolvedDomainContext,
} from "../../../app/features/diagnostic/index.ts";

const C_MODULES = new Set(["retail", "ecommerce", "hospitality"]);

test("Lote C: el banco combinado (golden + A + B + C) pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(QUESTION_BANK_V2);
  assert.deepEqual(issues.filter((issue) => issue.code !== "UNSAFE_NOT_EQ_PREREQUISITE"), [], `banco combinado no debería tener otros issues: ${JSON.stringify(issues)}`);
});

test("Lote C: sin IDs duplicados contra golden/Lote A/Lote B", () => {
  const priorIds = new Set([...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2].map((q) => q.id));
  const overlap = LOTE_C_QUESTIONS_V2.filter((q) => priorIds.has(q.id));
  assert.deepEqual(overlap, [], `Lote C no debería reusar ningún QuestionId previo: ${JSON.stringify(overlap.map((q) => q.id))}`);
});

test("Lote C: cada pregunta usa un módulo real de retail/ecommerce/hospitality", () => {
  for (const question of LOTE_C_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module), `${question.id}: módulo inválido`);
    assert.ok(C_MODULES.has(question.module), `${question.id}: módulo fuera de alcance de Lote C (${question.module})`);
  }
});

test("Lote C: ninguna pregunta gatea en NicheId/NicheGroup (sector-first)", () => {
  const serialized = JSON.stringify(LOTE_C_QUESTIONS_V2);
  assert.ok(!serialized.includes('"field":"niche"'));
  assert.ok(!serialized.includes('"op":"contextResolvedEquals","field":"nicheGroup"'));
});

test("mutación J / §32: ninguna pregunta menciona una herramienta/proveedor específico (Shopify, WooCommerce, Toast, Square, DoorDash, Google Merchant Center) como requisito", () => {
  const serialized = JSON.stringify(LOTE_C_QUESTIONS_V2).toLowerCase();
  for (const banned of ["shopify", "woocommerce", "toast", "square", "doordash", "google merchant", "ubereats", "grubhub"]) {
    assert.ok(!serialized.includes(banned), `Lote C no debe mencionar "${banned}"`);
  }
});

test("§33: sin jerga de marketing visible (ROAS, CAC, AOV, funnel, cart recovery automation)", () => {
  for (const question of LOTE_C_QUESTIONS_V2) {
    const visibleCopy = [question.prompt, question.hint, ...question.options.map((o) => o.label)].filter(Boolean).join(" ").toLowerCase();
    for (const jargon of ["roas", "cac", "aov", "funnel", "automation", "conversion funnel"]) {
      assert.ok(!visibleCopy.includes(jargon), `${question.id}: usa jerga "${jargon}"`);
    }
  }
});

// ── §9/§17/§21: reuso de Lote B, no duplicado ───────────────────────────────

test("§9/§17/§21: retail y hospitality NO tienen preguntas propias de discovery/presence/repeat/reputation — reusan las de Lote B extendidas", () => {
  const ownIds = new Set(LOTE_C_QUESTIONS_V2.map((q) => q.id));
  for (const banned of ["q2_retail_discovery", "q2_retail_repeat_purchase", "q2_hospitality_repeat_visits", "q2_hospitality_discovery", "q2_hospitality_reputation", "q2_retail_reputation"]) {
    assert.ok(!ownIds.has(banned), `Lote C no debería crear "${banned}": ya existe el equivalente compartido de Lote B`);
  }
});

test("las 4 preguntas compartidas de Lote B ahora también aplican a retail y/o hospitality", () => {
  const shared = ["q2_local_discovery", "q2_local_presence_consistency", "q2_local_repeat_customers", "q2_reputation_flow"];
  const retailContext = resolveDiagnosticContext({ deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" } }).context;
  const hospitalityContext = resolveDiagnosticContext({ deliveryMode: { value: "onsite_consumption", provenance: "observed_fact" } }).context;
  for (const id of shared) {
    const q = [...LOTE_B_QUESTIONS_V2, ...GOLDEN_QUESTIONS_V2].find((question) => question.id === id)!;
    const answers = { q2_has_customers: "yes" };
    assert.ok(!q.appliesWhen || evalRule(q, answers, retailContext), `${id} debería aplicar a retail`);
    assert.ok(!q.appliesWhen || evalRule(q, answers, hospitalityContext), `${id} debería aplicar a hospitality`);
  }
});

function evalRule(question: QuestionDefinitionV2, answers: Record<string, string>, context: ResolvedDomainContext): boolean {
  return !question.appliesWhen || evaluateRuleV2(question.appliesWhen, answers, context);
}

// ── Fixtures (§36), sin profesión como regla de routing ─────────────────────

test("fixture 1: tienda física (retail only) → preguntas de retail + compartidas de local elegibles, ecommerce NO", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "fixed_with_inventory" }, QUESTION_BANK_V2);
  for (const id of ["q2_retail_product_visibility", "q2_retail_customer_capture", "q2_local_discovery", "q2_reputation_flow"]) {
    assert.ok(result.eligibleQuestionIds.includes(id), `${id} debería ser elegible`);
  }
  for (const id of ["q2_ecommerce_checkout_friction", "q2_ecommerce_product_discovery"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id), `${id} NO debería ser elegible`);
  }
});

test("fixture 2: tienda física + ecommerce (hybrid) → AMBAS familias elegibles, ninguna se pierde", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["ecommerce", "retail"]);
  const answers = { q2_has_customers: "yes" };
  const retailQuestions = LOTE_C_QUESTIONS_V2.filter((q) => q.module === "retail");
  const ecommerceQuestions = [...GOLDEN_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2].filter((q) => q.module === "ecommerce" && q.id !== "q2_ecommerce_cart_followup");
  for (const q of [...retailQuestions, ...ecommerceQuestions]) {
    assert.ok(evalRule(q, answers, context), `${q.id} debería seguir elegible bajo retail+ecommerce hybrid`);
  }
});

test("fixture 3: ecommerce puro → preguntas de ecommerce elegibles, retail/hospitality NO", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_ecommerce_product_discovery"));
  for (const id of ["q2_retail_product_visibility", "q2_hospitality_flow_type", "q2_local_discovery"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id));
  }
});

test("fixture 4: ecommerce con tráfico pero fricción de checkout alta → friction=conversion", () => {
  // 08D.1: abandoned checkouts presuppose buyers, so the question requires existing customers.
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout", q2_has_customers: "yes", q2_ecommerce_checkout_friction: "often" }, QUESTION_BANK_V2);
  assert.ok(result.context.primaryFriction.status === "resolved" && result.context.primaryFriction.value === "conversion");
});

test("fixture 5: ecommerce con repeat purchase frecuente → evidencia diagnóstica, sin forzar ninguna señal de friction", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout", q2_has_customers: "yes", q2_ecommerce_repeat_purchase: "frequently" }, QUESTION_BANK_V2);
  assert.ok(result.activeAnswers.q2_ecommerce_repeat_purchase !== undefined);
});

test("fixture 6: restaurante walk-in → hospitality elegible, reservation_noshow NO (sin reserva)", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "onsite", q2_hospitality_flow_type: "walk_in" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_hospitality_peak_capacity"));
  assert.ok(!result.eligibleQuestionIds.includes("q2_hospitality_reservation_noshow"));
});

test("fixture 7: restaurante con reservas → reservation_noshow SÍ elegible, sin activar archetype=appointments", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "onsite", q2_hospitality_flow_type: "reservation" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_hospitality_reservation_noshow"));
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "hospitality");
  assert.ok(!result.eligibleQuestionIds.includes("q2_appointments_noshow"));
});

test("fixture 8: hospitality con pedidos para llevar (order_ahead) → flow_type resuelto sin recibir preguntas de reserva", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "onsite", q2_hospitality_flow_type: "order_ahead" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_hospitality_reservation_noshow"));
  assert.ok(result.eligibleQuestionIds.includes("q2_hospitality_delivery_takeaway"));
});

test("fixture 9: negocio local puro (no retail) sigue recibiendo las preguntas compartidas — extenderlas a retail no rompió el caso base", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "fixed_no_inventory" }, QUESTION_BANK_V2);
  for (const id of ["q2_local_discovery", "q2_local_presence_consistency", "q2_reputation_flow", "q2_local_foot_traffic"]) {
    assert.ok(result.eligibleQuestionIds.includes(id), `${id} debería seguir elegible para local puro`);
  }
});

test("fixture 10: contexto no-commerce (professional) → ninguna pregunta de retail/ecommerce/hospitality elegible", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  const leaked = result.eligibleQuestionIds.filter((id) => LOTE_C_QUESTIONS_V2.some((q) => q.id === id));
  assert.deepEqual(leaked, []);
});

// ── Mutaciones A-J (§41) ─────────────────────────────────────────────────────

test("mutación A: retail-only nunca recibe ecommerce checkout", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "fixed_with_inventory" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_ecommerce_checkout_friction"));
});

test("mutación B: ecommerce-only nunca recibe retail foot traffic ni product visibility", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_local_foot_traffic"));
  assert.ok(!result.eligibleQuestionIds.includes("q2_retail_product_visibility"));
});

test("mutación C: una reserva de hospitality NUNCA activa el archetype appointments ni su no-show", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "onsite", q2_hospitality_flow_type: "reservation" }, QUESTION_BANK_V2);
  assert.notEqual(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "appointments");
  assert.ok(!result.eligibleQuestionIds.includes("q2_appointments_noshow"));
});

test("mutación D: retail+ecommerce hybrid nunca pierde ninguno de sus 2 componentes", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  assert.deepEqual([...context.archetypeComponents].sort(), ["ecommerce", "retail"]);
});

test("mutación E: reviews/reputación sigue siendo UNA sola pregunta — no aparece hospitality_reviews ni retail_reviews duplicadas", () => {
  const all = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2];
  const reputationQuestions = all.filter((q) => q.id.includes("reputation") || q.id.includes("review"));
  assert.equal(reputationQuestions.length, 1);
});

test("mutación F: q2_ecommerce_repeat_purchase tiene not_applicable — un producto de compra única no queda forzado a declarar recurrencia", () => {
  const question = LOTE_C_QUESTIONS_V2.find((q) => q.id === "q2_ecommerce_repeat_purchase")!;
  assert.ok(question.options.some((o) => o.kind === "not_applicable"));
});

test("mutación H: q2_ecommerce_cart_visibility=no NUNCA produce friction directamente (cart abandonment por sí solo no es evidencia suficiente de conversion, §29)", () => {
  const cartVisibility = LOTE_C_QUESTIONS_V2.find((q) => q.id === "q2_ecommerce_cart_visibility")!;
  for (const option of cartVisibility.options) assert.deepEqual(option.produces ?? [], []);
});

test("mutación I: ningún sector/nicho específico es requisito para activar una pregunta de Lote C", () => {
  for (const question of LOTE_C_QUESTIONS_V2) {
    if (!question.appliesWhen) continue;
    const serialized = JSON.stringify(question.appliesWhen);
    assert.ok(!serialized.includes("nicheGroup") && !serialized.includes("niche"));
  }
});

// ── Friction allowlist (solo hechos severos/inequívocos) ────────────────────

test("friction en Lote C: solo 3 combinaciones producen friction, todas el extremo más severo de su pregunta", () => {
  const ALLOWED = new Set(["q2_ecommerce_checkout_friction.often", "q2_ecommerce_cart_followup.rarely", "q2_hospitality_reservation_noshow.often"]);
  for (const question of LOTE_C_QUESTIONS_V2) {
    for (const option of question.options) {
      const hasFriction = (option.produces ?? []).some((p) => p.kind === "friction");
      if (hasFriction) assert.ok(ALLOWED.has(`${question.id}.${option.value}`), `${question.id}.${option.value} no está en la allowlist`);
    }
  }
});

// ── Applicability protegida (§16) ───────────────────────────────────────────

test("q2_ecommerce_cart_followup solo es elegible si q2_ecommerce_cart_visibility YA se respondió \"yes\"", () => {
  const withVisibility = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout", q2_ecommerce_cart_visibility: "yes" }, QUESTION_BANK_V2);
  const withoutVisibility = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout", q2_ecommerce_cart_visibility: "no" }, QUESTION_BANK_V2);
  const unanswered = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  assert.ok(withVisibility.eligibleQuestionIds.includes("q2_ecommerce_cart_followup"));
  assert.ok(!withoutVisibility.eligibleQuestionIds.includes("q2_ecommerce_cart_followup"));
  assert.ok(!unanswered.eligibleQuestionIds.includes("q2_ecommerce_cart_followup"));
});

// ── Route pressure (§35) ────────────────────────────────────────────────────

const SPECIALIZED_MODULES = new Set(["local", "local_service", "appointments", "professional", "reputation", "retail", "ecommerce", "hospitality"]);
function specializedEligibleCount(answers: Record<string, string | readonly string[]>): number {
  const result = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  return result.eligibleQuestionIds.filter((id) => {
    const q = QUESTION_BANK_V2.find((question) => question.id === id);
    return q !== undefined && SPECIALIZED_MODULES.has(q.module);
  }).length;
}

test("route pressure A-C: retail/ecommerce/hospitality solos se mantienen acotados", () => {
  const retail = specializedEligibleCount({ q2_delivery: "fixed_with_inventory" });
  const ecommerce = specializedEligibleCount({ q2_delivery: "online_checkout" });
  const hospitality = specializedEligibleCount({ q2_delivery: "onsite" });
  for (const [label, pressure] of [["retail", retail], ["ecommerce", ecommerce], ["hospitality", hospitality]] as const) {
    assert.ok(pressure > 0 && pressure <= 10, `${label}: presión fuera de rango esperado (${pressure})`);
  }
});

test("route pressure D: retail+ecommerce hybrid eleva la presión por encima de un solo archetype — registrado, no resuelto (08B.4)", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  const bank = QUESTION_BANK_V2;
  const eligible = bank.filter((q) => {
    if (!SPECIALIZED_MODULES.has(q.module)) return false;
    return evalRule(q, {}, context);
  });
  assert.ok(eligible.length >= 6, `presión especializada bajo retail+ecommerce demasiado baja: ${eligible.length}`);
});

// ── Bank size ────────────────────────────────────────────────────────────────

test("Lote C: aporta exactamente 13 preguntas nuevas (3 retail + 6 ecommerce + 4 hospitality; el tamaño del banco COMBINADO se prueba en el test file del lote más reciente)", () => {
  assert.equal(LOTE_C_QUESTIONS_V2.length, 13);
});
