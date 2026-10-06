import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_APPOINTMENT_REMINDER_EVIDENCE_V3 as reminderBatch, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_EVIDENCE_V3 as registry, REVIEWED_SPECIALIZED_CONTACTABILITY_EVIDENCE_V3 as batch } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const retail = "q2_retail_customer_capture";
const creator = "q2_creator_audience_ownership";
const quote = "q2_service_quote_followup";
const general = "q2_followup_general_process";
const attendance = "q2_appointments_noshow";
const booking = "q2_appointments_booking_friction";
const reminders = "q2_appointments_confirmation_reminders";
const question = (id: string) => candidate.find(q => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const seed: AnswersV2 = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_customer_buyer: "b2c", q2_goal: "other", q2_friction: "follow_up", q2_monetization: "goods", q2_delivery: ["retail"] };
const relationship = (answers: AnswersV2) => scoreContextualDimensions({ answers: {}, context: resolveEligibleQuestionsV2(seed, candidate).context, evidence: derive(answers), bank: candidate }).dimensions.find(d => d.id === "relationship_recurrence")!;

test("R3K migrates reminder atomically, preserves R3J creator pending and ledger 38/19/19", () => {
  assert.deepEqual(summary, { total: 38, migrated: registry.length, pending: 38 - registry.length });
  assert.deepEqual(batch.map(m => m.questionId), [retail]);
  assert.deepEqual(reminderBatch.map(m => m.questionId), [reminders]);
  assert.equal(question(retail).evidenceMigration, "migrated");
  assert.equal(question(creator).version, 2);
  assert.equal(question(creator).evidenceMigration, "pending");
  assert.equal(question(creator).evidenceV3, undefined);
  assert.equal(question(reminders).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionEvidenceV3(question(retail)), []);
  assert.deepEqual(validateQuestionEvidenceV3(question(reminders)), []);
  assert.deepEqual(Object.keys(batch[0].dimensions[0].answers).sort(), question(retail).options.map(o => o.value).sort());
  assert.deepEqual(Object.keys(reminderBatch[0].dimensions[0].answers).sort(), question(reminders).options.map(o => o.value).sort());
  const old = legacy.find(q => q.id === reminders)!;
  assert.equal(old.version, 1);
  assert.equal(old.evidenceMigration, undefined);
  for (const option of old.options) {
    const historical = deriveContextualEvidence({ [reminders]: option.value }, legacy);
    assert.deepEqual(historical, deriveContextualEvidence({ [reminders]: option.value }, [old]));
    assert.ok(historical.every(e => e.questionVersion === undefined));
  }
});

test("R3K every reminder option maps only direct Relationship evidence with v2 identity", () => {
  for (const [answer, state, contribution] of [
    ["consistent", "established", 0.75], ["sometimes", "partial", 0.5], ["rarely", "weak", 0.25],
    ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [reminders]: answer });
    assert.equal(evidence.length, 1);
    const e = evidence[0]!;
    assert.deepEqual([e.questionId, e.dimension, e.directness, e.state, e.contribution], [reminders, "relationship_recurrence", "direct", state, contribution]);
    assert.equal(e.questionVersion, 2);
    assert.equal(e.migrationIdentity, `${reminders}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.deepEqual(e.answer, [answer]);
  }
  assert.deepEqual(derive({ [reminders]: "automatic" }), []);
});

test("R3J every retail answer has only direct Relationship state, contribution and v2 provenance", () => {
  for (const [answer, state, contribution] of [["consistent", "established", 0.75], ["partial", "partial", 0.5], ["no", "missing", 0], ["not_applicable", "not_applicable", null], ["unknown", "uncertainty", null]] as const) {
    const evidence = derive({ [retail]: answer });
    assert.equal(evidence.length, 1);
    const e = evidence[0]!;
    assert.deepEqual([e.questionId, e.dimension, e.directness, e.state, e.contribution], [retail, "relationship_recurrence", "direct", state, contribution]);
    assert.equal(e.questionVersion, 2);
    assert.equal(e.migrationIdentity, `${retail}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.deepEqual(e.answer, [answer]);
  }
  assert.deepEqual(derive({ [retail]: "email" }), []);
});

test("R3J unknown and N/A are neutral, explicit absence alone is missing", () => {
  for (const answer of ["unknown", "not_applicable"]) {
    const result = relationship({ [retail]: answer });
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
    assert.equal(relationship({ [quote]: "consistent", [retail]: answer }).score, relationship({ [quote]: "consistent" }).score);
  }
  assert.equal(derive({ [retail]: "no" })[0]!.state, "missing");
  assert.equal(derive({ [retail]: "partial" })[0]!.state, "partial");
  assert.match(question(retail).options.find(o => o.value === "no")!.label, /no me queda una forma directa/);
});

test("R3J changed identity or incomplete mapping fails closed without legacy fallback", () => {
  const q = question(retail);
  const wrong = { ...q, version: 1 as const };
  assert.ok(validateQuestionEvidenceV3(wrong).length);
  assert.deepEqual(deriveContextualEvidence({ [retail]: "consistent" }, [wrong]), []);
  const reading = q.evidenceV3!.dimensions[0]!;
  const { unknown: _unknown, ...answers } = reading.answers;
  const incomplete = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers }] } };
  assert.ok(validateQuestionEvidenceV3(incomplete).length);
  assert.deepEqual(deriveContextualEvidence({ [retail]: "consistent" }, [incomplete]), []);
});

test("R3J hybrid retail/creator can expose both and cannot guarantee different people", () => {
  const answers = { ...seed, q2_monetization: "audience", q2_delivery: ["retail", "online_checkout"] };
  const result = resolveEligibleQuestionsV2(answers, candidate);
  assert.deepEqual(result.context.businessModel, { status: "resolved", value: "creator_audience", source: "signal" });
  assert.equal(result.context.archetype.status, "resolved");
  assert.ok(result.context.archetypeComponents.includes("retail"));
  assert.ok(result.eligibleQuestionIds.includes(retail));
  assert.ok(result.eligibleQuestionIds.includes(creator));
  // A creator's merch customers may be the same people as its directly reachable audience.
  // Neither gate nor answer declares disjoint populations; keep the second observation pending.
  assert.match(question(retail).prompt, /ese cliente/);
  assert.match(question(creator).prompt, /parte de tu audiencia/);
  for (const option of question(creator).options) {
    assert.deepEqual(derive({ [creator]: option.value }), []);
    assert.deepEqual(derive({ [retail]: "consistent", [creator]: option.value }), derive({ [retail]: "consistent" }));
  }
});

test("R3J contactability and executed quote follow-up diverge on a valid specialist hybrid", () => {
  const applicable = { ...seed, q2_delivery: ["retail", "travels"] };
  const eligible = resolveEligibleQuestionsV2(applicable, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(retail));
  assert.ok(eligible.includes(quote));
  for (const [contact, followup] of [["consistent", "rarely"], ["partial", "consistent"], ["no", "consistent"]] as const) {
    const evidence = derive({ [retail]: contact, [quote]: followup });
    assert.equal(evidence.length, 2);
    assert.equal(new Set(evidence.map(e => e.observationId)).size, 2);
    assert.notEqual(evidence[0]!.state, evidence[1]!.state);
    assert.deepEqual(evidence.filter(e => e.questionId === retail), derive({ [retail]: contact }));
    assert.deepEqual(evidence.filter(e => e.questionId === quote), derive({ [quote]: followup }));
  }
});

test("R3K appointment attendance context never creates or overrides reminder evidence", () => {
  const appointments = { ...seed, q2_delivery: ["appointments"] };
  for (const outcome of ["rarely", "often"] as const) {
    const contextOnly = resolveEligibleQuestionsV2({ ...appointments, [attendance]: outcome }, candidate);
    assert.deepEqual(contextOnly.context.appointmentAttendance, { status: "resolved", value: outcome, source: "signal" });
    assert.equal(contextOnly.eligibleQuestionIds.includes(reminders), outcome === "often");
    assert.deepEqual(derive({ [attendance]: outcome }), []);
    assert.deepEqual(derive({ ...appointments, [attendance]: outcome }), []);
    for (const answer of ["consistent", "rarely"] as const) {
      assert.deepEqual(
        derive({ ...appointments, [attendance]: outcome, [reminders]: answer }),
        derive({ ...appointments, [reminders]: answer }),
      );
    }
  }
  assert.equal(derive({ ...appointments, [attendance]: "rarely", [reminders]: "rarely" })[0]!.state, "weak");
  assert.equal(derive({ ...appointments, [attendance]: "often", [reminders]: "rarely" })[0]!.state, "weak");
});

test("R3K reminder continuity and booking friction remain independent across divergent answers", () => {
  const appointments = { ...seed, q2_monetization: "services", q2_delivery: ["appointments"], [attendance]: "often", q2_appointments_lead_to_booking: "few" };
  const eligible = resolveEligibleQuestionsV2(appointments, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(booking));
  assert.ok(eligible.includes(reminders));
  for (const [bookingAnswer, reminderAnswer, bookingState, reminderState] of [
    ["rarely", "rarely", "established", "weak"],
    ["often", "consistent", "weak", "established"],
  ] as const) {
    const evidence = derive({ ...appointments, [booking]: bookingAnswer, [reminders]: reminderAnswer });
    const bookingEvidence = evidence.find(entry => entry.questionId === booking)!;
    const reminderEvidence = evidence.find(entry => entry.questionId === reminders)!;
    assert.deepEqual([bookingEvidence.dimension, bookingEvidence.directness, bookingEvidence.state], ["conversion_access", "direct", bookingState]);
    assert.deepEqual([reminderEvidence.dimension, reminderEvidence.directness, reminderEvidence.state], ["relationship_recurrence", "direct", reminderState]);
    assert.notEqual(bookingEvidence.observationId, reminderEvidence.observationId);
  }
});

test("R3K scheduled reminders diverge from quote follow-up at a real interaction boundary", () => {
  const hybrid = { ...seed, q2_monetization: "services", q2_delivery: ["appointments", "travels"], q2_goal: "opportunities", q2_appointments_noshow: "often", q2_appointments_lead_to_booking: "few" };
  const eligible = resolveEligibleQuestionsV2(hybrid, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(quote));
  assert.ok(eligible.includes(reminders));
  assert.ok(!eligible.includes(general));
  for (const [reminderAnswer, followupAnswer, reminderState, followupState] of [
    ["rarely", "consistent", "weak", "established"],
    ["consistent", "rarely", "established", "weak"],
  ] as const) {
    const evidence = derive({ ...hybrid, [reminders]: reminderAnswer, [quote]: followupAnswer });
    const reminderEvidence = evidence.find(e => e.questionId === reminders)!;
    const followupEvidence = evidence.find(e => e.questionId === quote)!;
    assert.deepEqual([reminderEvidence.dimension, reminderEvidence.state], ["relationship_recurrence", reminderState]);
    assert.deepEqual([followupEvidence.dimension, followupEvidence.state], ["relationship_recurrence", followupState]);
    assert.notEqual(reminderEvidence.observationId, followupEvidence.observationId);
  }
});

test("R3J generic follow-up stays excluded from retail and creator including hybrids", () => {
  for (const answers of [seed, { ...seed, q2_delivery: ["physical_location"], q2_monetization: "audience" }, { ...seed, q2_delivery: ["retail", "travels"], q2_monetization: "audience" }]) {
    assert.ok(!resolveEligibleQuestionsV2(answers, candidate).eligibleQuestionIds.includes(general));
  }
  assert.ok(resolveEligibleQuestionsV2({ ...seed, q2_delivery: ["physical_location"], q2_monetization: "services" }, candidate).eligibleQuestionIds.includes(general));
});

test("R3J tools, audience volume and public reach do not change contactability evidence", () => {
  for (const tool of ["CRM", "email", "SMS", "spreadsheet", "manual_list", "social_platform", "membership_platform", "automation", "owned_website", "million_followers", "small_list"]) {
    assert.deepEqual(derive({ [retail]: "partial", unrelated_fixture: tool }), derive({ [retail]: "partial" }));
    assert.deepEqual(derive({ [retail]: tool, [creator]: tool }), []);
  }
  for (const reach of ["reliable", "weak"]) {
    assert.deepEqual(derive({ [retail]: "partial", q2_discovery_reliable_reach: reach }).filter(e => e.questionId === retail), derive({ [retail]: "partial" }));
  }
  for (const id of [retail, creator]) assert.ok(!question(id).options.some(o => o.produces?.length));
});

test("R3J contactability creates no recurrence facts and does not reactivate deferred questions", () => {
  for (const answer of question(retail).options.map(o => o.value)) {
    assert.deepEqual(resolveEligibleQuestionsV2({ ...seed, [retail]: answer }, candidate).context, resolveEligibleQuestionsV2(seed, candidate).context);
    assert.deepEqual(derive({ [retail]: answer }).map(e => e.dimension), ["relationship_recurrence"]);
  }
  for (const id of ["q2_local_repeat_customers", "q2_ecommerce_repeat_purchase"]) {
    assert.ok(decisions.DEFER.includes(id));
    assert.ok(!candidate.some(q => q.id === id));
    assert.deepEqual(derive({ [id]: "high" }), []);
  }
  assert.equal(question("q2_appointments_rebooking").evidenceMigration, "pending");
  for (const o of question("q2_appointments_rebooking").options) assert.deepEqual(derive({ q2_appointments_rebooking: o.value }), []);
  const together = derive({ ...seed, q2_delivery: ["appointments"], [reminders]: "consistent", q2_appointments_rebooking: "proactive" });
  assert.deepEqual(together.map(e => e.questionId), [reminders]);
});

test("R3J active retail/creator context and declared needs alone emit no evidence", () => {
  for (const answers of [seed, { ...seed, q2_monetization: "audience" }, { ...seed, q2_goal: "stop_losing" }]) {
    assert.deepEqual(derive(answers), []);
  }
});

test("R3J every legacy retail/creator option preserves historical scoring", () => {
  for (const id of [retail, creator]) {
    const old = legacy.find(q => q.id === id)!;
    assert.equal(old.evidenceMigration, undefined);
    assert.equal(old.evidenceV3, undefined);
    for (const o of old.options) {
      const historical = deriveContextualEvidence({ [id]: o.value }, legacy);
      assert.deepEqual(historical, deriveContextualEvidence({ [id]: o.value }, [old]));
      assert.ok(historical.every(e => e.questionVersion === undefined));
    }
  }
});

test("R3J freezes all R2 candidate fields, unanswered plans, exclusions and active runtime", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  for (const id of [retail, creator]) assert.equal(question(id).routingRole, "adaptive");
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some(q => q.id === id));
  for (const answers of [seed, { ...seed, q2_monetization: "audience" }, { ...seed, q2_has_customers: "no" }]) {
    assert.deepEqual(resolveEligibleQuestionsV2(answers, candidate), resolveEligibleQuestionsV2(answers, frozen));
    assert.deepEqual(buildQuestionPlan({ answers, bank: candidate }).selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
  }
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
