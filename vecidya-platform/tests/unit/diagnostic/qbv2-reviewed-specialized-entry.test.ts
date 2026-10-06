import assert from "node:assert/strict";
import test from "node:test";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { EVIDENCE_MAPPING } from "../../../app/features/diagnostic/qbv2-coverage";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { CONTEXT_FIELD_REFS, contextEquals, contextUnresolved, evaluateRuleV2, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { foldSignalProductions, signalProductionContextFields } from "../../../app/features/diagnostic/qbv2-signals";
import { validateAnswerV3 } from "../../../app/features/diagnostic/qbv2-session";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import type { SignalProduction } from "../../../app/features/diagnostic/qbv2-signals";

const byId = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((question) => question.id === id)!;
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const appt = { q2_entity: "business", q2_delivery: ["appointments"], q2_has_customers: "yes" } as const;
const ecommerce = { q2_entity: "business", q2_delivery: ["online_checkout"], q2_has_customers: "yes" } as const;
const b2b = { q2_entity: "business", q2_has_customers: "yes", q2_customer_buyer: "b2b" } as const;

test("R2E candidate has the reviewed q10–q12 slice, versions and no unsafe gates", () => {
  const questions = candidate.slice(9, 12);
  assert.deepEqual(questions.map(({ id }) => id), ["q2_appointments_noshow", "q2_ecommerce_traffic_sources", "q2_b2b_pipeline"]);
  assert.deepEqual(questions.map(({ version }) => version), [2, 3, 2]);
  assert.ok(questions.every(({ routingRole }) => routingRole === "adaptive"));
  assert.ok(!candidate.some(({ id }) => id === "q2_local_foot_traffic"));
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.equal(byId("q2_appointments_noshow").prompt, "¿Qué tan seguido tus clientes faltan a una cita?");
  assert.equal(byId("q2_appointments_noshow").hint, "Piensa en los últimos meses en general, no en una semana aislada.");
  assert.equal(byId("q2_appointments_noshow").variants?.[0]?.prompt, "¿Qué tan seguido tus pacientes faltan a una cita?");
  assert.deepEqual(byId("q2_appointments_noshow").options.map(({ value, label }) => [value, label]), [["rarely", "Casi nunca"], ["sometimes", "Pasa algunas veces"], ["often", "Pasa con frecuencia"], ["unknown", "No lo sé o no lo he revisado"]]);
  assert.equal(byId("q2_ecommerce_traffic_sources").prompt, "¿Por cuáles canales suelen llegar personas a tu tienda online?");
  assert.equal(byId("q2_ecommerce_traffic_sources").hint, "Marca todos los canales que te traen personas de forma habitual. No cuentes algo que pasó solo una vez.");
  assert.deepEqual(byId("q2_ecommerce_traffic_sources").options.map(({ value }) => value), ["social", "search", "ads", "referral", "marketplace", "messaging", "email", "direct", "other", "unknown"]);
  assert.equal(byId("q2_b2b_pipeline").prompt, "Cuando aparece una oportunidad de venta, ¿tienes una forma clara de darle seguimiento hasta saber qué pasó?");
  assert.equal(byId("q2_b2b_pipeline").hint, "No importa si usas una hoja, una agenda o un CRM. Lo importante es si el seguimiento se hace de una forma clara y repetible.");
  assert.deepEqual(byId("q2_b2b_pipeline").options.map(({ value }) => value), ["defined", "partial", "informal", "unknown"]);
  const legacyQ11 = byId("q2_ecommerce_traffic_sources", QUESTION_BANK_V2);
  assert.equal(byId("q2_ecommerce_traffic_sources").version, 3);
  assert.ok(byId("q2_ecommerce_traffic_sources").version > legacyQ11.version);
  for (const question of questions) {
    assert.ok(!JSON.stringify(question.appliesWhen).includes('"op":"notEq"'), question.id);
  }
});

test("q10 route, canonical attendance context, trace and no generic friction inference", () => {
  const eligible = resolve(appt);
  assert.ok(eligible.eligibleQuestionIds.includes("q2_appointments_noshow"));
  assert.ok(!resolve({ ...appt, q2_has_customers: "no" }).eligibleQuestionIds.includes("q2_appointments_noshow"));
  assert.ok(!resolve({ q2_entity: "business", q2_has_customers: "yes" }).eligibleQuestionIds.includes("q2_appointments_noshow"));
  const plan = buildQuestionPlan({ answers: appt, bank: candidate });
  const entry = plan.trace.find(({ questionId }) => questionId === "q2_appointments_noshow");
  assert.equal(entry?.required, false);
  assert.equal(entry?.reason, "specialized_evidence");
  assert.deepEqual(plan.selectedQuestionIds, ["q2_monetization", "q2_customer_buyer", "q2_customer_reach", "q2_sector", "q2_goal", "q2_regularity", "q2_appointments_lead_to_booking", "q2_appointments_noshow", "q2_discovery_reliable_reach", "q2_process_systemization"]);
  const refs = CONTEXT_FIELD_REFS.filter((field) => field === "appointmentAttendance");
  assert.deepEqual(refs, ["appointmentAttendance"]);
  for (const value of ["rarely", "sometimes", "often"] as const) {
    const result = resolve({ ...appt, q2_appointments_noshow: value });
    assert.deepEqual(result.context.appointmentAttendance, { status: "resolved", value, source: "signal" });
    assert.equal(result.context.primaryFriction.status, "unresolved");
    assert.equal(evaluateRuleV2(contextEquals("appointmentAttendance", value), {}, result.context), true);
  }
  const unknown = resolve({ ...appt, q2_appointments_noshow: "unknown" });
  assert.equal(unknown.context.appointmentAttendance.reason, "declared_unknown");
  assert.equal(evaluateRuleV2(contextUnresolved("appointmentAttendance"), {}, unknown.context), true);
  const notAsked = resolve(appt);
  assert.equal(notAsked.context.appointmentAttendance.reason, "not_asked");
  const answeredPlan = buildQuestionPlan({ answers: { ...appt, q2_appointments_noshow: "unknown" }, bank: candidate });
  assert.ok(!answeredPlan.trace.some(({ questionId, selected }) => questionId === "q2_appointments_noshow" && selected));
});

test("q11 multi-select accepts messaging and keeps unknown exclusive without inventing context", () => {
  const question = byId("q2_ecommerce_traffic_sources");
  assert.equal(question.type, "multi");
  assert.ok(question.options.some(({ value }) => value === "messaging"));
  assert.equal(validateAnswerV3(question, ["social", "messaging", "search"]).ok, true);
  assert.equal(validateAnswerV3(question, ["unknown"]).ok, true);
  assert.equal(validateAnswerV3(question, ["unknown", "social"]).ok, false);
  assert.equal(validateAnswerV3(question, ["social", "social"]).ok, false);
  assert.ok(resolve(ecommerce).eligibleQuestionIds.includes(question.id));
  assert.ok(!resolve({ ...ecommerce, q2_has_customers: "no", q2_ecommerce_traffic_sources: ["social"] }).eligibleQuestionIds.includes(question.id));
  assert.ok(!resolve({ q2_entity: "business", q2_delivery: ["retail"], q2_has_customers: "yes" }).eligibleQuestionIds.includes(question.id));
  const result = resolve(ecommerce);
  assert.equal(result.context.archetype.status, "resolved");
  assert.deepEqual(result.context.growthStage, { status: "resolved", value: "starting", source: "signal" });
  assert.deepEqual(deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["social", "messaging"] }, candidate), []);
  assert.deepEqual(buildQuestionPlan({ answers: ecommerce, bank: candidate }).selectedQuestionIds, ["q2_monetization", "q2_customer_buyer", "q2_customer_reach", "q2_sector", "q2_goal", "q2_regularity", "q2_ecommerce_product_discovery", "q2_ecommerce_traffic_sources", "q2_discovery_reliable_reach", "q2_process_systemization"]);
});

test("q12 applies to B2B/mixed context, resolves its own fact, and does not infer follow-up friction", () => {
  const question = byId("q2_b2b_pipeline");
  for (const buyer of ["b2b", "mixed"] as const) {
    assert.ok(resolve({ ...b2b, q2_customer_buyer: buyer }).eligibleQuestionIds.includes(question.id));
  }
  assert.ok(!resolve({ ...b2b, q2_customer_buyer: "b2c" }).eligibleQuestionIds.includes(question.id));
  assert.ok(!resolve({ ...b2b, q2_has_customers: "no" }).eligibleQuestionIds.includes(question.id));
  assert.deepEqual(CONTEXT_FIELD_REFS.filter((field) => field === "b2bFollowupProcess"), ["b2bFollowupProcess"]);
  for (const value of ["defined", "partial", "informal"] as const) {
    const result = resolve({ ...b2b, q2_b2b_pipeline: value });
    assert.deepEqual(result.context.b2bFollowupProcess, { status: "resolved", value, source: "signal" });
    assert.equal(result.context.primaryFriction.status, "unresolved");
    assert.equal(evaluateRuleV2(contextEquals("b2bFollowupProcess", value), {}, result.context), true);
    assert.deepEqual(deriveContextualEvidence({ q2_b2b_pipeline: value }, candidate), []);
  }
  const unknown = resolve({ ...b2b, q2_b2b_pipeline: "unknown" });
  assert.equal(unknown.context.b2bFollowupProcess.reason, "declared_unknown");
  assert.equal(evaluateRuleV2(contextUnresolved("b2bFollowupProcess"), {}, unknown.context), true);
  assert.equal(resolve(b2b).context.b2bFollowupProcess.reason, "not_asked");
  const answeredPlan = buildQuestionPlan({ answers: { ...b2b, q2_b2b_pipeline: "unknown" }, bank: candidate });
  assert.ok(!answeredPlan.trace.some(({ questionId, selected }) => questionId === "q2_b2b_pipeline" && selected));
  assert.deepEqual(buildQuestionPlan({ answers: b2b, bank: candidate }).selectedQuestionIds, ["q2_delivery", "q2_monetization", "q2_customer_reach", "q2_sector", "q2_goal", "q2_regularity", "q2_b2b_pipeline", "q2_discovery_reliable_reach", "q2_process_systemization"]);
});

test("pending reviewed evidence is suppressed only when the candidate version differs from legacy", () => {
  const samples: readonly [string, string | readonly string[]][] = [
    ["q2_appointments_noshow", "often"],
    ["q2_ecommerce_traffic_sources", ["social", "messaging"]],
    ["q2_b2b_pipeline", "informal"],
  ];
  for (const [id, value] of samples) {
    assert.deepEqual(deriveContextualEvidence({ [id]: value }, candidate).filter((item) => item.questionId === id), [], id);
    const copiedQuestion = { ...byId(id) };
    const copiedBank = candidate.map((question) => question.id === id ? copiedQuestion : question);
    assert.deepEqual(deriveContextualEvidence({ [id]: value }, copiedBank).filter((item) => item.questionId === id), [], `${id} copied candidate definition`);
    const legacy = deriveContextualEvidence({ [id]: id === "q2_ecommerce_traffic_sources" ? ["social"] : id === "q2_appointments_noshow" ? "often" : "no" }, QUESTION_BANK_V2);
    if (id === "q2_ecommerce_traffic_sources" || id === "q2_b2b_pipeline") assert.ok(legacy.some((item) => item.questionId === id), id);
  }
  assert.equal(byId("q2_appointments_noshow", QUESTION_BANK_V2).version, 1);
  assert.equal(byId("q2_ecommerce_traffic_sources", QUESTION_BANK_V2).version, 2);
  assert.equal(byId("q2_b2b_pipeline", QUESTION_BANK_V2).version, 1);
  assert.deepEqual(byId("q2_appointments_noshow", QUESTION_BANK_V2).options.map(({ value }) => value), ["rarely", "sometimes", "often"]);
  assert.deepEqual(byId("q2_b2b_pipeline", QUESTION_BANK_V2).options.map(({ value }) => value), ["yes", "no", "unknown"]);
  assert.deepEqual(byId("q2_ecommerce_traffic_sources", QUESTION_BANK_V2).options.map(({ value }) => value), ["social", "search", "ads", "referral", "marketplace", "email", "direct", "other", "unknown"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_ecommerce_traffic_sources?.dimensions, ["discovery", "measurement_optimization"]);
  assert.deepEqual(EVIDENCE_MAPPING.q2_b2b_pipeline?.dimensions, ["digital_readiness"]);
  assert.ok(byId("q2_appointments_noshow", QUESTION_BANK_V2).options.find(({ value }) => value === "often")?.produces?.some(({ kind, value: signal }) => kind === "friction" && signal === "operations"));
  assert.ok(byId("q2_b2b_pipeline", QUESTION_BANK_V2).options.find(({ value }) => value === "no")?.produces?.some(({ kind, value: signal }) => kind === "friction" && signal === "follow_up"));
  assert.equal(JSON.stringify(byId("q2_appointments_noshow", QUESTION_BANK_V2).appliesWhen).includes('"op":"notEq"'), true);
  assert.equal(JSON.stringify(byId("q2_b2b_pipeline", QUESTION_BANK_V2).appliesWhen).includes('"op":"notEq"'), true);
  assert.equal(JSON.stringify(byId("q2_ecommerce_traffic_sources", QUESTION_BANK_V2).appliesWhen).includes('"op":"eq"'), true);
  assert.deepEqual(deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["social"], q2_b2b_pipeline: "no" }, QUESTION_BANK_V2).map(({ questionId, dimension }) => [questionId, dimension]), [
    ["q2_ecommerce_traffic_sources", "discovery"], ["q2_ecommerce_traffic_sources", "measurement_optimization"], ["q2_b2b_pipeline", "digital_readiness"],
  ]);
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("signal productions map to canonical fields; trace and planner keep q10–q12 adaptive", () => {
  const pairs: readonly [SignalProduction, string][] = [
    [{ kind: "appointmentAttendance", value: "often", provenance: "explicit_declaration" }, "appointmentAttendance"],
    [{ kind: "appointmentAttendanceUnknown", value: true, provenance: "explicit_declaration" }, "appointmentAttendance"],
    [{ kind: "b2bFollowupProcess", value: "defined", provenance: "explicit_declaration" }, "b2bFollowupProcess"],
    [{ kind: "b2bFollowupProcessUnknown", value: true, provenance: "explicit_declaration" }, "b2bFollowupProcess"],
  ];
  for (const [production, field] of pairs) {
    assert.deepEqual(signalProductionContextFields(production), [field]);
    assert.equal(CONTEXT_FIELD_REFS.filter((ref) => ref === field).length, 1);
  }
  const selectedProductions = [
    ...byId("q2_appointments_noshow").options.find(({ value }) => value === "often")!.produces!,
    ...byId("q2_b2b_pipeline").options.find(({ value }) => value === "defined")!.produces!,
  ];
  const signals = foldSignalProductions(selectedProductions.map((production, index) => ({
    origin: { questionId: index < 1 ? "q2_appointments_noshow" : "q2_b2b_pipeline", optionId: index < 1 ? "often" : "defined" },
    production,
  })));
  assert.equal(signals.appointmentAttendance?.value, "often");
  assert.equal(signals.b2bFollowupProcess?.value, "defined");
  const context = resolveDiagnosticContext(signals);
  assert.equal(context.context.appointmentAttendance.value, "often");
  assert.equal(context.trace.appointmentAttendance.field, "appointmentAttendance");
  assert.equal(context.context.b2bFollowupProcess.value, "defined");
  assert.equal(context.trace.b2bFollowupProcess.field, "b2bFollowupProcess");
  for (const id of ["q2_appointments_noshow", "q2_ecommerce_traffic_sources", "q2_b2b_pipeline"]) {
    const question = byId(id);
    assert.equal(question.routingRole, "adaptive");
    const answers = id === "q2_appointments_noshow" ? appt : id === "q2_ecommerce_traffic_sources" ? ecommerce : b2b;
    const plan = buildQuestionPlan({ answers, bank: candidate });
    assert.equal(plan.trace.find((entry) => entry.questionId === id)?.required, false, id);
  }
});
