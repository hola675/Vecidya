import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { EVIDENCE_MAPPING } from "../../../app/features/diagnostic/qbv2-coverage";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import {
  REVIEWED_APPOINTMENT_REBOOKING_EVIDENCE_V3 as batch,
  REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate,
  REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary,
  REVIEWED_EVIDENCE_V3 as registry,
} from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const rebooking = "q2_appointments_rebooking";
const reminders = "q2_appointments_confirmation_reminders";
const booking = "q2_appointments_booking_friction";
const quote = "q2_service_quote_followup";
const generic = "q2_followup_general_process";
const attendance = "q2_appointments_noshow";
const byId = (id: string, bank: readonly (typeof candidate)[number][] = candidate) => bank.find((question) => question.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const appointmentRoute: AnswersV2 = {
  q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat",
  q2_monetization: "services", q2_delivery: ["appointments"], q2_goal: "stop_losing", q2_friction: "follow_up",
  q2_appointments_noshow: "often", q2_appointments_lead_to_booking: "few",
};

test("R3M migrates only appointment rebooking atomically and closes one ledger entry", () => {
  assert.deepEqual(summary, { total: 38, migrated: 21, pending: 17 });
  assert.deepEqual(batch.map(({ questionId }) => questionId), [rebooking]);
  assert.ok(registry.some(({ questionId, questionVersion }) => questionId === rebooking && questionVersion === 2));
  assert.equal(byId(rebooking).version, 2);
  assert.equal(byId(rebooking).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionEvidenceV3(byId(rebooking)), []);
  assert.deepEqual(Object.keys(byId(rebooking).evidenceV3!.dimensions[0]!.answers).sort(), byId(rebooking).options.map(({ value }) => value).sort());
  assert.deepEqual(validateQuestionBankV2(candidate), []);
});

test("R3M maps every explicit answer to one direct Relationship capability state", () => {
  for (const [answer, state, contribution] of [
    ["proactive", "established", 0.75],
    ["partial", "partial", 0.5],
    ["reactive", "weak", 0.25],
    ["not_applicable", "not_applicable", null],
    ["unknown", "uncertainty", null],
  ] as const) {
    const evidence = derive({ [rebooking]: answer });
    assert.equal(evidence.length, 1);
    assert.deepEqual(
      [evidence[0]!.dimension, evidence[0]!.directness, evidence[0]!.state, evidence[0]!.contribution],
      ["relationship_recurrence", "direct", state, contribution],
    );
    assert.equal(evidence[0]!.questionVersion, 2);
    assert.equal(evidence[0]!.migrationIdentity, `${rebooking}@v2`);
    assert.deepEqual(evidence[0]!.answer, [answer]);
  }
});

test("R3M rebooking is a capability answer and never a repeat-visit outcome", () => {
  const route = resolveEligibleQuestionsV2(appointmentRoute, candidate);
  assert.ok(route.eligibleQuestionIds.includes(rebooking));
  assert.deepEqual(derive({ [attendance]: "often" }), []);
  assert.deepEqual(derive({ [attendance]: "rarely" }), []);
  assert.deepEqual(derive({ [rebooking]: "proactive" }).map(({ questionId, state }) => [questionId, state]), [[rebooking, "established"]]);
  assert.deepEqual(derive({ [rebooking]: "reactive" }).map(({ questionId, state }) => [questionId, state]), [[rebooking, "weak"]]);
});

test("R3M rebooking and reminders diverge in both directions with distinct identities", () => {
  const remindersStrong = derive({ ...appointmentRoute, [reminders]: "consistent", [rebooking]: "reactive" });
  const rebookingStrong = derive({ ...appointmentRoute, [reminders]: "rarely", [rebooking]: "proactive" });
  assert.deepEqual(remindersStrong.map(({ questionId, state }) => [questionId, state]), [
    [reminders, "established"], [rebooking, "weak"],
  ]);
  assert.deepEqual(rebookingStrong.map(({ questionId, state }) => [questionId, state]), [
    [reminders, "weak"], [rebooking, "established"],
  ]);
  assert.notEqual(remindersStrong[0]!.observationId, remindersStrong[1]!.observationId);
});

test("R3M future-cycle capability stays separate from current booking friction", () => {
  const bothApplicable = resolveEligibleQuestionsV2(appointmentRoute, candidate).eligibleQuestionIds;
  assert.ok(bothApplicable.includes(rebooking));
  assert.ok(bothApplicable.includes(booking));
  const easyBookingWeakRebooking = derive({ ...appointmentRoute, [booking]: "rarely", [rebooking]: "reactive" });
  const difficultBookingStrongRebooking = derive({ ...appointmentRoute, [booking]: "often", [rebooking]: "proactive" });
  assert.deepEqual(easyBookingWeakRebooking.map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [booking, "conversion_access", "established"], [rebooking, "relationship_recurrence", "weak"],
  ]);
  assert.deepEqual(difficultBookingStrongRebooking.map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [booking, "conversion_access", "weak"], [rebooking, "relationship_recurrence", "established"],
  ]);
});

test("R3M remains distinct from generic and quote follow-up, with routing boundaries intact", () => {
  const hybrid: AnswersV2 = {
    ...appointmentRoute, q2_delivery: ["appointments", "travels"], q2_goal: "opportunities",
  };
  const eligible = resolveEligibleQuestionsV2(hybrid, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(quote));
  assert.ok(!eligible.includes(generic));
  assert.equal(byId(rebooking).appliesWhen, undefined);
  assert.ok(byId(rebooking).materialAppliesWhen);
  assert.deepEqual(derive({ ...hybrid, [rebooking]: "proactive", [quote]: "rarely" }).map(({ questionId, dimension, state }) => [questionId, dimension, state]), [
    [quote, "relationship_recurrence", "weak"], [rebooking, "relationship_recurrence", "established"],
  ]);
});

test("R3M does not create retail contactability or activate recurrence DEFER neighbors", () => {
  assert.deepEqual(derive({ [rebooking]: "proactive" }).map(({ dimension }) => dimension), ["relationship_recurrence"]);
  for (const id of ["q2_local_repeat_customers", "q2_ecommerce_repeat_purchase"]) {
    assert.ok(decisions.DEFER.includes(id));
    assert.ok(!candidate.some((question) => question.id === id));
    assert.deepEqual(derive({ [id]: "high", [rebooking]: "proactive" }).map(({ questionId }) => questionId), [rebooking]);
  }
});

test("R3M candidate mapping fails closed on wrong identity and stays neutral to tools and automation", () => {
  const question = byId(rebooking);
  const wrongVersion = { ...question, version: 1 as const };
  assert.ok(validateQuestionEvidenceV3(wrongVersion).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [rebooking]: "proactive" }, [wrongVersion]), []);
  const expected = derive({ [rebooking]: "partial" }).filter(({ questionId }) => questionId === rebooking);
  for (const detail of ["CRM", "calendar", "booking_platform", "automation", "SMS", "email", "manual", "recall_list"]) {
    assert.deepEqual(
      derive({ [rebooking]: "partial", unrelated_tool_fixture: detail, [attendance]: "often" }).filter(({ questionId }) => questionId === rebooking),
      expected,
    );
  }
});

test("R3M preserves candidate wording, gates, legacy mapping and runtime bank", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...question }: (typeof candidate)[number]) => question;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(byId(rebooking).routingRole, "adaptive");
  assert.deepEqual(byId(rebooking).materialAppliesWhen, frozen.find((question) => question.id === rebooking)!.materialAppliesWhen);
  assert.ok(!candidate.some((question) => [...decisions.REMOVE, ...decisions.DEFER].includes(question.id)));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
  assert.deepEqual(EVIDENCE_MAPPING[rebooking]?.dimensions, ["relationship_recurrence"]);
  const old = legacy.find((question) => question.id === rebooking)!;
  assert.equal(old.version, 1);
  assert.equal(old.evidenceMigration, undefined);
  assert.equal(old.evidenceV3, undefined);
  assert.deepEqual(deriveContextualEvidence({ [rebooking]: "yes_proactive" }, legacy).map(({ questionId, dimension }) => [questionId, dimension]), [
    [rebooking, "relationship_recurrence"],
  ]);
  assert.deepEqual(derive({ [rebooking]: "proactive" }).map(({ migrationIdentity }) => migrationIdentity), [`${rebooking}@v2`]);
});
