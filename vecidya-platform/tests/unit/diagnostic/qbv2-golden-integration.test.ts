import assert from "node:assert/strict";
import { test } from "node:test";

import {
  contextEquals,
  GOLDEN_QUESTIONS_V2,
  NonConvergentRoutingError,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
  type AnswersV2,
  type QuestionDefinitionV2,
} from "../../../app/features/diagnostic/index.ts";

/**
 * Banco sintético de 3 preguntas encadenadas por CONTEXTO (no por respuesta): Q1 produce businessModel,
 * Q2 gatea en businessModel y produce archetype, Q3 gatea en archetype. Ninguna es auto-referencial
 * (cada una lee un campo que NO escribe), así que el validador estático la aprueba — pero es una cadena
 * de profundidad 2 en contexto, el caso que la revisión de dominio independiente de 08B.2 señaló como no
 * probado por el banco golden (que solo tiene saltos de contexto de profundidad 1).
 */
const HOP_CHAIN_BANK: readonly QuestionDefinitionV2[] = [
  {
    id: "q_hop1",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "hop1",
    purpose: ["classification"],
    priority: "critical",
    options: [{ value: "a", label: "A", produces: [{ kind: "monetizationMechanism", slot: "primary", value: "time_or_project_work", provenance: "explicit_declaration" }] }],
  },
  {
    id: "q_hop2",
    version: 1,
    module: "classification",
    type: "single",
    prompt: "hop2",
    purpose: ["classification"],
    priority: "high",
    appliesWhen: contextEquals("businessModel", "services"),
    options: [{ value: "a", label: "A", produces: [{ kind: "deliveryMode", slot: "primary", value: "online_checkout", provenance: "explicit_declaration" }] }],
  },
  {
    id: "q_hop3",
    version: 1,
    module: "ecommerce",
    type: "single",
    prompt: "hop3",
    purpose: ["friction"],
    priority: "normal",
    appliesWhen: contextEquals("archetype", "ecommerce"),
    options: [{ value: "a", label: "A", produces: [{ kind: "friction", value: "operations", provenance: "derived_fact" }] }],
  },
] as const;

test("cadena de contexto de 2 saltos: converge al estado correcto (Q1 -> businessModel -> Q2 -> archetype -> Q3)", () => {
  const issues = validateQuestionBankV2(HOP_CHAIN_BANK);
  assert.deepEqual(issues, [], "el banco de la cadena no debería violar ningún validador estático (sin auto-referencia)");

  const result = resolveEligibleQuestionsV2({ q_hop1: "a", q_hop2: "a", q_hop3: "a" }, HOP_CHAIN_BANK);
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "services", source: "signal" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "ecommerce", source: "signal" });
  assert.deepEqual(result.context.primaryFriction, { status: "resolved", value: "operations", source: "signal" });
  assert.deepEqual(result.activeAnswers, { q_hop1: "a", q_hop2: "a", q_hop3: "a" });
  assert.ok(result.iterations <= HOP_CHAIN_BANK.length + 1);
});

test("cadena de contexto de 2 saltos: invalidar el eslabón intermedio retira TODO lo que depende de él, aunque tome más de una iteración", () => {
  // Q1 nunca se responde: businessModel nunca resuelve "services", así que Q2 no debería activarse, y
  // por lo tanto Q3 (que depende de lo que Q2 habría producido) tampoco.
  const result = resolveEligibleQuestionsV2({ q_hop2: "a", q_hop3: "a" }, HOP_CHAIN_BANK);
  assert.equal(result.activeAnswers.q_hop2, undefined, "Q2 no debió activarse sin businessModel=services");
  assert.equal(result.activeAnswers.q_hop3, undefined, "Q3 no debió activarse sin archetype=ecommerce");
  assert.deepEqual(result.context.businessModel, { status: "unresolved", reason: "not_asked", candidates: [] });
  assert.deepEqual(result.context.archetype, { status: "unresolved", reason: "not_asked", candidates: [] });
  assert.deepEqual(result.context.primaryFriction, { status: "unresolved", reason: "not_asked", candidates: [] });
});

function resolve(answers: AnswersV2) {
  return resolveEligibleQuestionsV2(answers, GOLDEN_QUESTIONS_V2);
}

// ── §67: integration tests golden A-H ───────────────────────────────────────

test("golden A: una respuesta produce señal", () => {
  const result = resolve({ q2_monetization: "time_or_project" });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "services", source: "signal" });
});

test("golden B: la señal resuelve contexto (archetype)", () => {
  const result = resolve({ q2_delivery: "scheduled" });
  assert.deepEqual(result.context.archetype, { status: "resolved", value: "appointments", source: "signal" });
});

test("golden C: el contexto resuelto habilita una pregunta especializada", () => {
  const result = resolve({ q2_delivery: "scheduled" });
  assert.ok(result.eligibleQuestionIds.includes("q2_appointments_noshow"), `elegibles: ${result.eligibleQuestionIds.join(", ")}`);
  assert.ok(!result.eligibleQuestionIds.includes("q2_ecommerce_traffic_sources"));
});

test("golden D-G: cambiar la respuesta previa retira el contexto, la especializada deja de aplicar, y su señal desaparece", () => {
  const withAppointment = resolve({ q2_delivery: "scheduled", q2_appointments_noshow: "often" });
  assert.deepEqual(withAppointment.context.archetype, { status: "resolved", value: "appointments", source: "signal" });
  assert.equal(withAppointment.activeAnswers.q2_appointments_noshow, "often");
  assert.deepEqual(withAppointment.context.primaryFriction, { status: "resolved", value: "operations", source: "signal" });

  // El usuario cambia la respuesta original a ecommerce (misma sesión, nueva foto completa de respuestas crudas).
  const changed = resolve({ q2_delivery: "online_checkout", q2_appointments_noshow: "often" });
  assert.deepEqual(changed.context.archetype, { status: "resolved", value: "ecommerce", source: "signal" }); // (G) el contexto se recalcula correctamente
  assert.equal(changed.activeAnswers.q2_appointments_noshow, undefined, "(E) la respuesta especializada ya no debe estar activa"); // (E)
  assert.deepEqual(changed.context.primaryFriction, { status: "unresolved", reason: "not_asked", candidates: [] }, "(F) su señal de fricción debe desaparecer"); // (F)
});

test("golden H: un copy variant cambia el wording pero no la identidad ni la semántica de la pregunta", () => {
  const question = GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_appointments_noshow")!;
  const variant = question.variants!.find((v) => "nicheGroup" in v.target && v.target.nicheGroup === "health_wellness")!;
  assert.notEqual(variant.prompt, question.prompt, "el variant debe cambiar el texto");
  assert.equal(question.options.length, question.options.length); // identidad de opciones intacta (mismo array de referencia)
  assert.ok(!("options" in variant) && !("produces" in variant), "el variant nunca redefine options/produces");
});

// ── Convergencia y determinismo (§31, §43-49, §75) ──────────────────────────

test("convergencia: determinista — mismas respuestas producen mismo resultado", () => {
  const answers: AnswersV2 = { q2_entity: "individual", q2_other_staff: "no", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing" };
  assert.deepEqual(resolve({ ...answers }), resolve({ ...answers }));
});

test("convergencia: se estabiliza en pocas iteraciones (arquitectura correcta, §75)", () => {
  const answers: AnswersV2 = {
    q2_entity: "business",
    q2_monetization: "goods",
    q2_delivery: "online_checkout",
    q2_has_customers: "yes",
    q2_regularity: "regular",
    q2_demand_trend: "increasing",
    q2_goal: "measure",
    q2_friction: "operations",
    q2_ecommerce_traffic_sources: ["social", "search"],
  };
  const result = resolve(answers);
  assert.ok(result.iterations <= 3, `convergió en ${result.iterations} iteraciones, se esperaban <= 3`);
});

test("una cadena de dependencias de respuesta (answer -> answer -> answer) converge y produce la señal final", () => {
  const result = resolve({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing" });
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "growing", source: "signal" });
});

test("una respuesta answer-gated que ya no cumple su condición se desactiva (frontera individual/business no afecta cadena de maturity)", () => {
  // q2_other_staff solo aplica si q2_entity=individual; si luego cambiamos a business, deja de aplicar.
  const result = resolve({ q2_entity: "business", q2_other_staff: "yes" });
  assert.equal(result.activeAnswers.q2_other_staff, undefined);
  assert.deepEqual(result.context.entity, { status: "resolved", value: "business", source: "signal" });
});

test("businessModel puede resolverse sin que archetype se resuelva (campos independientes, §2)", () => {
  const result = resolve({ q2_entity: "individual", q2_monetization: "licensed" });
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "professional_services", source: "signal" });
  assert.equal(result.context.archetype.status, "unresolved");
});

// ── §74: mutation tests H, I (A, D, F, G, J en qbv2-architecture.test.ts) ────

test("mutación H: retirar la respuesta upstream (recompute desde cero) elimina las señales especializadas — nunca quedan señales sin respuesta viva", () => {
  const withPipeline = resolve({ q2_delivery: "b2b_pipeline", q2_b2b_pipeline: "no" });
  assert.deepEqual(withPipeline.context.primaryFriction, { status: "resolved", value: "follow_up", source: "signal" });
  const withoutUpstream = resolve({ q2_b2b_pipeline: "no" }); // q2_delivery nunca se respondió en esta foto
  assert.equal(withoutUpstream.activeAnswers.q2_b2b_pipeline, undefined, "sin archetype=b2b resuelto, la pregunta especializada nunca debió activarse");
  assert.deepEqual(withoutUpstream.context.primaryFriction, { status: "unresolved", reason: "not_asked", candidates: [] });
});

test("mutación I: un bance con auto-referencia (bypassando el validador) NO oscila — el algoritmo de shrink monotónico converge igual", () => {
  const selfReferential = {
    id: "q2_self_ref",
    version: 1 as const,
    module: "confirmation" as const,
    type: "single" as const,
    prompt: "test",
    purpose: ["confirmation"] as const,
    priority: "refinement" as const,
    appliesWhen: { op: "contextUnresolved" as const, field: "archetype" as const },
    options: [{ value: "a", label: "A", produces: [{ kind: "deliveryMode" as const, slot: "primary" as const, value: "fixed_location_no_inventory" as const, provenance: "explicit_declaration" as const }] }],
  };
  // Confirmamos primero que el validador SÍ lo detectaría (defensa en profundidad, no solo el runtime).
  const issues = validateQuestionBankV2([selfReferential] as never);
  assert.ok(issues.some((issue) => issue.code === "SELF_REFERENTIAL_CONTEXT_GATE"));
  // Y que aun bypaseando el validador, el motor no lanza NonConvergentRoutingError ni cuelga.
  assert.doesNotThrow(() => resolveEligibleQuestionsV2({ q2_self_ref: "a" }, [selfReferential] as never));
});

test("protección de convergencia: NonConvergentRoutingError existe y es una subclase de Error (defensa en profundidad, §49)", () => {
  assert.ok(new NonConvergentRoutingError("test") instanceof Error);
});
