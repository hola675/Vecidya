import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { ANSWER_SEMANTICS, deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { EVIDENCE_MAPPING } from "../../../app/features/diagnostic/qbv2-coverage";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LOCAL_APPOINTMENTS_PROFESSIONAL_QUESTIONS_V2 as reviewed } from "../../../app/features/diagnostic/qbv2-reviewed-local-appointments-professional";
import { buildQuestionPlan, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const ids = [
  "q2_service_response_speed", "q2_service_quote_followup", "q2_appointments_booking_friction",
  "q2_appointments_confirmation_reminders", "q2_appointments_lead_to_booking", "q2_appointments_rebooking",
  "q2_professional_authority_signals", "q2_professional_intake_flow",
] as const;
const get = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((question) => question.id === id)!;
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const expectedLegacyEvidence = Object.fromEntries(ids.map((id) => [id, EVIDENCE_MAPPING[id]]));
const expectedLegacySemantics = Object.fromEntries(ids.map((id) => [id, ANSWER_SEMANTICS[id]]));

test("R2G candidate contains only reviewed KEEP questions; REMOVE and DEFER constructs stay out", () => {
  assert.deepEqual(reviewed.map(({ id }) => id), ids);
  assert.ok(ids.every((id) => candidate.some((question) => question.id === id)));
  for (const id of [
    "q2_local_foot_traffic", "q2_local_discovery", "q2_local_repeat_customers", "q2_service_area_clarity",
    "q2_service_quote_practice", "q2_service_repeat_referral", "q2_appointments_booking_method",
    "q2_professional_referral_dependency", "q2_professional_followup_after_consult",
  ]) assert.ok(!candidate.some((question) => question.id === id), `${id} must remain excluded`);
  assert.deepEqual(Object.fromEntries(reviewed.map(({ id, version }) => [id, version])), Object.fromEntries(ids.map((id) => [id, 2])));
  for (const question of reviewed) {
    assert.equal(question.evidenceMigration, "pending", question.id);
    assert.equal(question.scoringReadiness, undefined, question.id);
  }
  assert.equal(ROUTE_HARD_CAP, 24);
});

test("R2G candidate evidence stays pending while legacy evidence maps and semantics remain intact", () => {
  for (const id of ids) {
    const question = get(id);
    const value = question.options.find((option) => option.kind !== "unknown" && option.kind !== "not_applicable")!.value;
    assert.deepEqual(deriveContextualEvidence({ [id]: value }, candidate), [], `candidate ${id}`);
    assert.ok(deriveContextualEvidence({ [id]: get(id, QUESTION_BANK_V2).options[0]!.value }, QUESTION_BANK_V2).some((item) => item.questionId === id), `legacy ${id}`);
  }
  assert.deepEqual(Object.fromEntries(ids.map((id) => [id, EVIDENCE_MAPPING[id]])), expectedLegacyEvidence);
  assert.deepEqual(Object.fromEntries(ids.map((id) => [id, ANSWER_SEMANTICS[id]])), expectedLegacySemantics);
  assert.equal(QUESTION_BANK_V2.length, 85);
});

test("local service questions require an active local-service context and do not turn unknown into friction", () => {
  const prelaunch = resolve({ q2_has_customers: "no", q2_delivery: ["travels"] });
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_service_response_speed"));
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_service_quote_followup"));
  const active = resolve({ q2_has_customers: "yes", q2_delivery: ["travels"] });
  assert.equal(active.context.archetype.value, "local_service");
  assert.ok(active.eligibleQuestionIds.includes("q2_service_response_speed"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_service_quote_followup"));
  assert.ok(resolve({ q2_has_customers: "yes", q2_delivery: ["travels"], q2_service_response_speed: "weak" }).eligibleQuestionIds.includes("q2_service_quote_followup"));
  const unknown = resolve({ q2_has_customers: "yes", q2_delivery: ["travels"], q2_service_response_speed: "unknown" });
  assert.equal(unknown.context.primaryFriction.status, "unresolved");
  assert.deepEqual(deriveContextualEvidence({ q2_service_response_speed: "unknown" }, candidate), []);
  assert.ok(!resolve({ q2_has_customers: "yes", q2_delivery: ["appointments"] }).eligibleQuestionIds.includes("q2_service_response_speed"));
});

test("appointment outcome and process are separated; reminders require an observed attendance concern", () => {
  const base = { q2_has_customers: "yes", q2_delivery: ["appointments"] } as const;
  const active = resolve(base);
  assert.equal(active.context.archetype.value, "appointments");
  assert.ok(active.eligibleQuestionIds.includes("q2_appointments_lead_to_booking"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_appointments_rebooking"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_appointments_confirmation_reminders"));

  const mixedOutcome = resolve({ ...base, q2_appointments_lead_to_booking: "mixed" });
  assert.ok(mixedOutcome.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  assert.equal(get("q2_appointments_booking_friction").routingRole, "adaptive");
  assert.equal(buildQuestionPlan({ answers: { ...base, q2_appointments_lead_to_booking: "most" }, bank: candidate }).trace.find((item) => item.questionId === "q2_appointments_booking_friction")?.selected, undefined);
  const deepening = buildQuestionPlan({ answers: { ...base, q2_appointments_lead_to_booking: "mixed", q2_goal: "opportunities" }, bank: candidate });
  const deepeningTrace = deepening.trace.find((item) => item.questionId === "q2_appointments_booking_friction");
  assert.equal(deepeningTrace?.selectedIn, "material");
  assert.equal(deepeningTrace?.required, false);
  assert.ok(resolve({ ...base, q2_goal: "stop_losing" }).eligibleQuestionIds.includes("q2_appointments_rebooking"));

  const attendanceConcern = resolve({ ...base, q2_appointments_noshow: "sometimes" });
  assert.ok(attendanceConcern.eligibleQuestionIds.includes("q2_appointments_confirmation_reminders"));
  const noConcern = resolve({ ...base, q2_appointments_noshow: "rarely" });
  assert.ok(!noConcern.eligibleQuestionIds.includes("q2_appointments_confirmation_reminders"));
  const prelaunch = resolve({ q2_has_customers: "no", q2_delivery: ["appointments"] });
  for (const id of ids.slice(2, 6)) assert.ok(!prelaunch.eligibleQuestionIds.includes(id), id);

  const unknownOutcome = resolve({ ...base, q2_appointments_lead_to_booking: "unknown" });
  assert.equal(unknownOutcome.context.primaryFriction.status, "unresolved");
  assert.deepEqual(deriveContextualEvidence({ q2_appointments_lead_to_booking: "unknown" }, candidate), []);
});

test("professional questions use active reviewed sector context without assuming appointments", () => {
  const prelaunch = resolve({ q2_has_customers: "no", q2_sector: "legal" });
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_professional_authority_signals"));
  assert.ok(!prelaunch.eligibleQuestionIds.includes("q2_professional_intake_flow"));

  const active = resolve({ q2_has_customers: "yes", q2_sector: "legal" });
  assert.ok(active.eligibleQuestionIds.includes("q2_professional_intake_flow"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_appointments_lead_to_booking"));
  assert.ok(!active.eligibleQuestionIds.includes("q2_appointments_noshow"));

  const weakProof = resolve({ q2_has_customers: "yes", q2_sector: "legal", q2_goal: "trust" });
  assert.ok(weakProof.eligibleQuestionIds.includes("q2_professional_authority_signals"));
  const noDeclaredTrustNeed = resolve({ q2_has_customers: "yes", q2_sector: "legal", q2_reputation_flow: "weak" });
  assert.ok(!noDeclaredTrustNeed.eligibleQuestionIds.includes("q2_professional_authority_signals"));
  const unknownProof = resolve({ q2_has_customers: "yes", q2_sector: "legal", q2_professional_authority_signals: "unknown" });
  assert.deepEqual(deriveContextualEvidence({ q2_professional_authority_signals: "unknown" }, candidate), []);
});

test("representative reviewed routes stay under cap and do not select every eligible adaptive question", () => {
  const cases: Record<string, AnswersV2> = {
    local_service: { q2_has_customers: "yes", q2_delivery: ["travels"] },
    appointments: { q2_has_customers: "yes", q2_delivery: ["appointments"] },
    professional: { q2_has_customers: "yes", q2_sector: "legal", q2_goal: "opportunities" },
  };
  const localCounts: Record<string, number> = {};
  for (const [name, answers] of Object.entries(cases)) {
    const plan = buildQuestionPlan({ answers, bank: candidate });
    assert.ok(plan.selectedQuestionIds.length <= ROUTE_HARD_CAP, name);
    assert.ok(plan.selectedQuestionIds.length < ROUTE_HARD_CAP, name);
    localCounts[name] = plan.selectedQuestionIds.filter((id) => ids.includes(id as typeof ids[number])).length;
    assert.ok(localCounts[name] <= 3, `${name}: ${localCounts[name]} R2G questions selected`);
    assert.ok(plan.trace.filter((entry) => ids.includes(entry.questionId as typeof ids[number])).every((entry) => !entry.required), name);
  }
  assert.deepEqual(localCounts, { local_service: 1, appointments: 1, professional: 1 });
});
