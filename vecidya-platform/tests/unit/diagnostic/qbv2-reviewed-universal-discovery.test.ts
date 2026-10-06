import assert from "node:assert/strict";
import test from "node:test";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { HINT_MAX_LENGTH, validateQuestionCopyV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { EVIDENCE_MAPPING } from "../../../app/features/diagnostic/qbv2-coverage";
import { ANSWER_SEMANTICS } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { MODULE_IDS, MODULE_REGISTRY, type QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_DISCOVERY_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-discovery";
import { REVIEWED_LOCAL_TRUST_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-local-trust";
import { andV2, archetypeIncludesAny, contextEquals, contextUnresolved, evaluateRuleV2, notEqV2, eqV2, CONTEXT_FIELD_REFS, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { buildQuestionPlan, DEFAULT_ROUTE_BUDGET_V1, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { signalProductionContextFields } from "../../../app/features/diagnostic/qbv2-signals";
import { validateAnswerV3 } from "../../../app/features/diagnostic/qbv2-session";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const question = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((item) => item.id === id)!;
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const activeBusiness = { q2_entity: "business", q2_has_customers: "yes" } as const;

test("R2F candidate foundation remains stable, keeps deferred IDs out, and adds declarative discovery", () => {
  assert.deepEqual(candidate.slice(0, 20).map(({ id }) => id), [
    "q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers",
    "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_appointments_noshow",
    "q2_ecommerce_traffic_sources", "q2_b2b_pipeline", "q2_sector", "q2_customer_reach", "q2_customer_buyer",
    "q2_process_systemization", "q2_capacity_signal", "q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow",
  ]);
  assert.deepEqual(candidate.slice(20).map(({ id }) => id), [
    "q2_service_response_speed", "q2_service_quote_followup", "q2_appointments_booking_friction",
    "q2_appointments_confirmation_reminders", "q2_appointments_lead_to_booking", "q2_appointments_rebooking",
    "q2_professional_authority_signals", "q2_professional_intake_flow",
  ]);
  assert.equal(candidate.length, 28);
  for (const id of ["q2_local_foot_traffic", "q2_local_discovery", "q2_local_repeat_customers"]) {
    assert.ok(QUESTION_BANK_V2.some((item) => item.id === id), `${id} remains in frozen legacy bank`);
    assert.ok(!candidate.some((item) => item.id === id), `${id} is not in reviewed candidate`);
  }
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.ok(!QUESTION_BANK_V2.some(({ module }) => module === "discovery"));
  assert.ok((MODULE_IDS as readonly string[]).includes("discovery"));
  const discoveryModule = MODULE_REGISTRY.filter(({ id }) => id === "discovery");
  assert.equal(discoveryModule.length, 1);
  assert.deepEqual(discoveryModule[0], { id: "discovery", purpose: "Medir si existe una forma confiable de llegar a personas nuevas.", relevantWhen: {}, targetQuestionRange: { min: 0, max: 1 } });
  assert.equal(DEFAULT_ROUTE_BUDGET_V1.moduleMax.discovery, 1);
  assert.equal(ROUTE_HARD_CAP, 24);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
});

test("universal Discovery is eligible only for active businesses and independent of goal, friction, sector or archetype", () => {
  const id = "q2_discovery_reliable_reach";
  const discovery = question(id);
  assert.equal(discovery.version, 1);
  assert.equal(discovery.evidenceMigration, "pending");
  assert.equal(discovery.module, "discovery");
  assert.equal(discovery.type, "single");
  assert.equal(discovery.routingRole, "adaptive");
  assert.equal(discovery.priority, "normal");
  assert.equal(discovery.prompt, "En los últimos meses, ¿qué tan confiable ha sido la forma que tienes de llegar a personas nuevas interesadas en lo que ofreces?");
  assert.equal(HINT_MAX_LENGTH, 140);
  assert.equal(discovery.hint, "Piensa si llegas a personas nuevas con cierta constancia, sin importar si vienen por Google, redes, recomendaciones, anuncios u otra vía.");
  assert.equal(discovery.hint?.length, 137);
  assert.ok(discovery.hint!.length <= HINT_MAX_LENGTH);
  assert.deepEqual(validateQuestionCopyV2(candidate), []);
  assert.deepEqual(discovery.appliesWhen, contextEquals("activity", "active"));
  assert.deepEqual(discovery.options.map(({ value }) => value), ["reliable", "irregular", "weak", "not_seeking", "unknown"]);

  const prelaunch = resolve({ ...activeBusiness, q2_has_customers: "no" });
  assert.equal(prelaunch.context.activity.value, "prelaunch");
  assert.ok(!prelaunch.eligibleQuestionIds.includes(id));
  assert.ok(!resolve({}).eligibleQuestionIds.includes(id));
  for (const answers of [
    { ...activeBusiness, q2_goal: "other", q2_friction: "trust" },
    { ...activeBusiness, q2_delivery: ["physical_location"] },
    { ...activeBusiness, q2_delivery: ["online_checkout"] },
    { ...activeBusiness, q2_customer_buyer: "b2b" },
    { ...activeBusiness, q2_sector: "health_wellness" },
  ] as const) {
    const state = resolve(answers);
    assert.ok(state.eligibleQuestionIds.includes(id), JSON.stringify(answers));
    assert.equal(buildQuestionPlan({ answers, bank: candidate }).trace.find((entry) => entry.questionId === id)?.required, false);
  }
});

test("Discovery answers complete the signal → context → trace → DSL path without diagnostic or domain inference", () => {
  const id = "q2_discovery_reliable_reach";
  const expected = ["reliable", "irregular", "weak", "not_seeking"] as const;
  for (const value of expected) {
    const state = resolve({ ...activeBusiness, [id]: value });
    assert.deepEqual(state.context.discoveryReachReliability, { status: "resolved", value, source: "signal" });
    assert.deepEqual(state.trace.discoveryReachReliability, {
      status: "resolved", field: "discoveryReachReliability", value,
      supportingSignals: ["discoveryReachReliability"], resolutionReason: "confiabilidad declarada para llegar a personas nuevas",
    });
    assert.equal(evaluateRuleV2(contextEquals("discoveryReachReliability", value), state.activeAnswers, state.context), true);
    assert.equal(evaluateRuleV2(contextUnresolved("discoveryReachReliability"), state.activeAnswers, state.context), false);
    assert.ok(!state.eligibleQuestionIds.includes(id), "an answered question is not asked again");
    assert.deepEqual(deriveContextualEvidence({ ...activeBusiness, [id]: value }, candidate).filter((entry) => entry.questionId === id), []);
    assert.deepEqual(state.context.primaryFriction, { status: "unresolved", reason: "not_asked", candidates: [] });
    assert.equal(state.context.archetype.status, "unresolved");
    assert.equal(state.context.businessModel.status, "unresolved");
    assert.deepEqual(state.context.growthStage, resolve(activeBusiness).context.growthStage, "Discovery must not change growth-stage resolution");
  }

  const unknown = resolve({ ...activeBusiness, [id]: "unknown" });
  assert.deepEqual(unknown.context.discoveryReachReliability, { status: "unresolved", reason: "declared_unknown", candidates: [] });
  assert.deepEqual(unknown.trace.discoveryReachReliability, {
    status: "unresolved", field: "discoveryReachReliability", reason: "declared_unknown", candidates: [],
    missingSignals: [], supportingSignals: ["discoveryReachReliabilityUnknown"],
  });
  assert.equal(evaluateRuleV2(contextUnresolved("discoveryReachReliability"), unknown.activeAnswers, unknown.context), true);
  assert.ok(!unknown.eligibleQuestionIds.includes(id));
  const q = question(id);
  const unknownProduction = q.options.find(({ value }) => value === "unknown")!.produces![0]!;
  assert.deepEqual(signalProductionContextFields(unknownProduction), ["discoveryReachReliability"]);
  assert.equal(CONTEXT_FIELD_REFS.filter((field) => field === "discoveryReachReliability").length, 1);
  assert.ok((CONTEXT_FIELD_REFS as readonly string[]).includes("discoveryReachReliability"));
  for (const option of question(id).options) {
    for (const production of option.produces ?? []) {
      assert.deepEqual(signalProductionContextFields(production), ["discoveryReachReliability"]);
      assert.ok((CONTEXT_FIELD_REFS as readonly string[]).includes(signalProductionContextFields(production)[0]!));
    }
  }
});

test("q20 local presence applies only to active local, retail or hospitality businesses", () => {
  const q20 = question("q2_local_presence_consistency");
  assert.equal(q20.version, 2);
  assert.equal(q20.evidenceMigration, "pending");
  assert.equal(q20.module, "local");
  assert.equal(q20.routingRole, "adaptive");
  assert.equal(q20.prompt, "Cuando alguien busca tu negocio en internet, ¿encuentra información correcta y actualizada para ubicarte o contactarte?");
  assert.equal(q20.hint, "Piensa en datos como teléfono, WhatsApp, dirección u horario, solo cuando apliquen a tu negocio.");
  assert.deepEqual(q20.appliesWhen, andV2(contextEquals("activity", "active"), {
    op: "or", rules: [
      { op: "archetypeIncludes", value: "local" },
      { op: "archetypeIncludes", value: "retail" },
      { op: "archetypeIncludes", value: "hospitality" },
    ],
  }));
  assert.deepEqual(q20.options.map(({ value }) => value), ["consistent", "partial", "no", "unknown"]);
  assert.deepEqual(q20.options.map(({ label }) => label), [
    "Sí, la información principal está correcta y actualizada",
    "Hay algunos datos desactualizados, diferentes o incompletos",
    "No, esa información es difícil de encontrar o todavía está incompleta",
    "No lo he revisado",
  ]);
  assert.deepEqual(q20.options.find(({ value }) => value === "unknown")?.kind, "unknown");

  for (const mode of ["physical_location", "retail", "onsite"] as const) {
    const answers = { ...activeBusiness, q2_delivery: [mode] };
    const state = resolve(answers);
    assert.ok(state.eligibleQuestionIds.includes(q20.id), mode);
    assert.equal(buildQuestionPlan({ answers, bank: candidate }).trace.find((entry) => entry.questionId === q20.id)?.required, false);
  }
  assert.ok(!resolve({ ...activeBusiness, q2_has_customers: "no", q2_delivery: ["physical_location"] }).eligibleQuestionIds.includes(q20.id));
  for (const mode of ["online_checkout", "appointments", "travels"] as const) {
    assert.ok(!resolve({ ...activeBusiness, q2_delivery: [mode] }).eligibleQuestionIds.includes(q20.id), mode);
  }
  assert.ok(resolve({ ...activeBusiness, q2_delivery: ["appointments", "physical_location"] }).eligibleQuestionIds.includes(q20.id), "hybrid businesses qualify when a physical component is present");
  assert.equal(validateAnswerV3(q20, "unknown").ok, true);
  assert.deepEqual(deriveContextualEvidence({ ...activeBusiness, q2_local_presence_consistency: "consistent" }, candidate), []);
  assert.equal(q20.scoringReadiness, undefined);
});

test("q22 visible social proof is active-business wide, adaptive, and does not inherit legacy scoring", () => {
  const q22 = question("q2_reputation_flow");
  assert.equal(q22.version, 3);
  assert.equal(q22.evidenceMigration, "pending");
  assert.equal(q22.module, "reputation");
  assert.equal(q22.routingRole, "adaptive");
  assert.equal(q22.prompt, "¿Tienes reseñas, testimonios u opiniones visibles de personas que ya tuvieron experiencia contigo?");
  assert.equal(q22.hint, "Piensa en reseñas de Google, testimonios en tu web, redes u otros lugares que una persona nueva pueda consultar.");
  assert.deepEqual(q22.appliesWhen, contextEquals("activity", "active"));
  assert.deepEqual(q22.options.map(({ value }) => value), ["strong", "partial", "weak", "unknown"]);
  assert.deepEqual(q22.options.map(({ label }) => label), [
    "Sí, tengo varias y siguen llegando nuevas",
    "Sí, pero son pocas o llevan tiempo sin actualizarse",
    "Casi no tengo reseñas o testimonios visibles",
    "No lo sé o no lo he revisado",
  ]);
  assert.equal(JSON.stringify(q22.appliesWhen).includes('"op":"notEq"'), false);
  for (const answers of [
    activeBusiness,
    { ...activeBusiness, q2_delivery: ["online_checkout"] },
    { ...activeBusiness, q2_customer_buyer: "b2b" },
    { q2_entity: "organization", q2_has_customers: "yes" },
  ] as const) assert.ok(resolve(answers).eligibleQuestionIds.includes(q22.id), JSON.stringify(answers));
  assert.ok(!resolve({ ...activeBusiness, q2_has_customers: "no" }).eligibleQuestionIds.includes(q22.id));
  assert.equal(validateAnswerV3(q22, "unknown").ok, true);
  assert.deepEqual(deriveContextualEvidence({ ...activeBusiness, q2_reputation_flow: "strong" }, candidate).filter((entry) => entry.questionId === q22.id), []);
  assert.equal(q22.scoringReadiness, undefined);
});

test("pending version guard preserves historical q20/q22 evidence only for legacy definitions", () => {
  const reviewedQ20 = question("q2_local_presence_consistency");
  const reviewedQ22 = question("q2_reputation_flow");
  const legacyQ20 = question("q2_local_presence_consistency", QUESTION_BANK_V2);
  const legacyQ22 = question("q2_reputation_flow", QUESTION_BANK_V2);

  assert.equal(legacyQ20.version, 1);
  assert.deepEqual(legacyQ20.options.map(({ value, label }) => [value, label]), [
    ["consistent", "Sí, todo está correcto y coincide"],
    ["partial", "Una parte está desactualizada o incompleta"],
    ["no", "No, es difícil encontrar esa información"],
    ["unknown", "No lo he revisado"],
  ]);
  assert.deepEqual(legacyQ20.appliesWhen, archetypeIncludesAny(["local", "retail", "hospitality"]));
  assert.equal(legacyQ20.materialAppliesWhen, undefined);
  assert.equal(legacyQ22.version, 2);
  assert.deepEqual(legacyQ22.options.map(({ value, label }) => [value, label]), [
    ["steady", "Me llegan con cierta regularidad"],
    ["occasional", "De vez en cuando, pero no de forma constante"],
    ["rare", "Muy rara vez o nunca"],
    ["unknown", "No lo sé, no lo reviso seguido"],
  ]);
  assert.deepEqual(legacyQ22.appliesWhen, andV2(archetypeIncludesAny(["local", "appointments", "professional", "retail", "hospitality"]), notEqV2("q2_has_customers", "no")));
  assert.deepEqual(legacyQ22.materialAppliesWhen, eqV2("q2_has_customers", "yes"));

  assert.deepEqual(deriveContextualEvidence({ q2_local_presence_consistency: "consistent" }, candidate).filter((entry) => entry.questionId === reviewedQ20.id), []);
  assert.deepEqual(deriveContextualEvidence({ q2_reputation_flow: "steady" }, candidate).filter((entry) => entry.questionId === reviewedQ22.id), []);
  assert.ok(deriveContextualEvidence({ q2_local_presence_consistency: "consistent" }, QUESTION_BANK_V2).some((entry) => entry.questionId === legacyQ20.id));
  assert.ok(deriveContextualEvidence({ q2_reputation_flow: "steady" }, QUESTION_BANK_V2).some((entry) => entry.questionId === legacyQ22.id));
  assert.deepEqual(EVIDENCE_MAPPING.q2_local_presence_consistency?.dimensions, ["digital_foundation", "discovery"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_reputation_flow?.dimensions, ["trust_reputation"]);
  assert.deepEqual(ANSWER_SEMANTICS.q2_reputation_flow, { values: { steady: "established", occasional: "partial", rare: "weak" } });
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("R2F adaptive questions remain optional; no route selects all three merely because they are eligible", () => {
  const answers = { ...activeBusiness, q2_delivery: ["physical_location"] } as const;
  const plan = buildQuestionPlan({ answers, bank: candidate.slice(0, 20) });
  for (const id of ["q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow"]) {
    assert.equal(question(id).routingRole, "adaptive");
    assert.equal(plan.trace.find((entry) => entry.questionId === id)?.required, false, id);
  }
  assert.ok(plan.selectedQuestionIds.filter((id) => ["q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow"].includes(id)).length < 3);
  const trustNeed = buildQuestionPlan({ answers: { ...answers, q2_goal: "trust" }, bank: candidate.slice(0, 20) });
  assert.ok(trustNeed.selectedQuestionIds.includes("q2_reputation_flow"), "visible proof is selected for an explicit Trust need");
});
