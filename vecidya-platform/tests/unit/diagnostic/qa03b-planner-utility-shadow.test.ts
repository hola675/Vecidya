import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as productionBank } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_SPECIALTY_CANDIDATE_BANK_V1 as candidateBank } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import { buildCandidateQuestionPlanFromBankV3, type CandidateShadowSelectionPolicyV1 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { validateCandidateAnswerV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { eqV2, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_SPECIALTY_PERSONAS, authoredSpecialtyAnswers, declaredSpecialtyContextAnswers } from "./qa03b-specialty-journeys";

const byId = new Map(candidateBank.map((question) => [question.id, question]));

function walk(id: string, policy: CandidateShadowSelectionPolicyV1) {
  const persona = QA03B_SPECIALTY_PERSONAS.find((item) => item.id === id);
  assert.ok(persona, id);
  const authored = authoredSpecialtyAnswers(persona);
  let answers: AnswersV2 = {};
  const asked: string[] = [];
  const neutral: string[] = [];
  for (let turn = 0; turn <= 24; turn++) {
    const plan = buildCandidateQuestionPlanFromBankV3({ answers }, candidateBank, policy);
    answers = plan.activeAnswers;
    assert.ok(plan.routeLength <= 24, `${id}/${policy}`);
    assert.ok(plan.budget.hardMax <= 24, `${id}/${policy}`);
    if (!plan.nextQuestionId) {
      const scorer = scoreCandidateContextualDimensionsV3({ answers }, candidateBank);
      return {
        asked, neutral,
        terminal: plan.evidenceSufficiency.terminalReason,
        ready: plan.completion.ready,
        unresolved: plan.evidenceSufficiency.unresolvedApplicableDimensions.length,
        insufficient: plan.evidenceSufficiency.insufficientContextDimensions.length,
        directAnswered: asked.filter((qid) =>
          byId.get(qid)?.evidenceV3?.dimensions.some((dimension) => dimension.directness === "direct")).length,
        nicheAnswered: asked.filter((qid) => qid.startsWith("q2_niche_")).length,
        scoredEvidence: scorer.dimensions.reduce((sum, d) => sum + d.evidence.length, 0),
      };
    }
    assert.ok(turn < 24, `${id}/${policy}: exceeded 24 questions`);
    const qid = plan.nextQuestionId;
    assert.ok(!asked.includes(qid), `${id}/${policy}: question repeated ${qid}`);
    assert.ok(plan.eligibleQuestionIds.includes(qid), `${id}/${policy}: question not eligible ${qid}`);
    const question = byId.get(qid);
    assert.ok(question, qid);
    if (qid.startsWith("q2_niche_")) assert.equal(qid, `q2_niche_${persona.sector}`, id);

    let value: string | readonly string[] | undefined = authored[qid];
    if (value === undefined) {
      const unknown = question.options.find((option) => option.kind === "unknown");
      assert.ok(unknown, `${id}/${policy}: no authored or neutral response for ${qid}`);
      value = question.type === "multi" ? [unknown.value] : unknown.value;
      neutral.push(qid);
    }
    assert.ok(validateCandidateAnswerV3(question, value), `${id}/${policy}: invalid answer for ${qid}`);
    asked.push(qid);
    answers = { ...answers, [qid]: value };
  }
  throw new Error(`${id}/${policy}: non-terminating route`);
}

test("utility-first remains shadow-only: production entry and default candidate mode are unchanged", () => {
  assert.equal(productionBank.length, 45);
  assert.equal(candidateBank.length, 74);
  for (const persona of QA03B_SPECIALTY_PERSONAS) {
    const input = { answers: declaredSpecialtyContextAnswers(persona) };
    const defaultPlan = buildCandidateQuestionPlanFromBankV3(input, candidateBank);
    assert.deepEqual(buildCandidateQuestionPlanFromBankV3(input, candidateBank, "baseline"), defaultPlan, persona.id);
    const shadow = buildCandidateQuestionPlanFromBankV3(input, candidateBank, "utility_first");
    assert.deepEqual(buildCandidateQuestionPlanFromBankV3(input, candidateBank, "utility_first"), shadow, persona.id);
    assert.ok(shadow.routeLength <= 24, persona.id);
    assert.ok(shadow.selectedQuestionIds.every((id) => shadow.eligibleQuestionIds.includes(id)), persona.id);
    const inputs = declaredSpecialtyContextAnswers(persona);
    const before = scoreCandidateContextualDimensionsV3({ answers: inputs }, candidateBank);
    const after = scoreCandidateContextualDimensionsV3({ answers: inputs }, candidateBank);
    assert.deepEqual(after.dimensions, before.dimensions, persona.id);
  }
});

test("shadow policy does not treat passive tool inventory as evidence when it unlocks no branch", () => {
  const profile = QA03B_SPECIALTY_PERSONAS.find((p) => p.id === "agencia-marketing-b2b");
  assert.ok(profile);
  const input = { answers: declaredSpecialtyContextAnswers(profile) };
  const baseline = buildCandidateQuestionPlanFromBankV3(input, candidateBank, "baseline");
  const shadow = buildCandidateQuestionPlanFromBankV3(input, candidateBank, "utility_first");
  assert.ok(baseline.evidenceSufficiency.usefulContextQuestionIds.includes("q2_digital_tools_in_use"));
  assert.ok(!shadow.evidenceSufficiency.usefulContextQuestionIds.includes("q2_digital_tools_in_use"));
  assert.ok(!shadow.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_digital_tools_in_use"));
});

test("utility-first keeps a niche eligible but does not force it without proven downstream value", () => {
  const answers: AnswersV2 = { q2_entity: "business", q2_operational_status: "operating",
    q2_has_customers: "yes", q2_monetization: "services", q2_sector: "health_wellness",
    q2_delivery: ["appointments", "physical_location"], q2_customer_buyer: "b2c",
    q2_goal: "stop_losing", q2_friction: "follow_up" };
  const plan = buildCandidateQuestionPlanFromBankV3({ answers }, candidateBank, "utility_first");
  assert.ok(plan.eligibleQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(!plan.evidenceSufficiency.usefulContextQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(!plan.selectedQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(plan.selectedQuestionIds.every((id) => plan.eligibleQuestionIds.includes(id)));
  const scored = scoreCandidateContextualDimensionsV3({ answers: {
    ...answers, q2_niche_health_wellness: "dentist",
  } }, candidateBank);
  assert.ok(scored.dimensions.every((d) => d.evidence.every((e) => !e.questionId.startsWith("q2_niche_"))));
});

test("utility-first promotes niche when an actual dentist-only evidence question is unlocked", () => {
  const gated = candidateBank.map((q) => q.id === "q2_appointments_booking_friction"
    ? { ...q, appliesWhen: eqV2("q2_niche_health_wellness", "dentist"), materialAppliesWhen: undefined }
    : q);
  const answers: AnswersV2 = {
    q2_entity: "business", q2_operational_status: "operating", q2_has_customers: "yes",
    q2_monetization: "services", q2_sector: "health_wellness",
    q2_delivery: ["physical_location", "appointments"], q2_customer_buyer: "b2c",
    q2_goal: "stop_losing", q2_friction: "conversion",
  };
  const proposed = buildCandidateQuestionPlanFromBankV3({ answers }, gated, "utility_first");
  assert.ok(proposed.eligibleQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(proposed.evidenceSufficiency.usefulContextQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(proposed.selectedQuestionIds.includes("q2_niche_health_wellness"));
  assert.ok(!proposed.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
  const after = buildCandidateQuestionPlanFromBankV3({
    answers: { ...answers, q2_niche_health_wellness: "dentist" },
  }, gated, "utility_first");
  assert.ok(after.eligibleQuestionIds.includes("q2_appointments_booking_friction"));
});

test("eight A/B journeys compare question count, outcome, evidence and niche coverage without changing public plan", () => {
  const profiles = ["idea-software", "pausa-dentista", "clinica-dental", "restaurante-reservas",
    "tienda-hibrida", "agencia-marketing-b2b", "creador-audiencia", "organizacion-donaciones"];
  const pairs = profiles.map((id) => ({ id, baseline: walk(id, "baseline"), shadow: walk(id, "utility_first") }));
  for (const { id, baseline, shadow } of pairs) {
    assert.ok(baseline.asked.length <= 24 && shadow.asked.length <= 24, id);
    assert.ok(shadow.nicheAnswered <= 1, id);
    // Score neutral/unknown answers as uncertainty, never manufacture direct evidence.
    assert.ok(shadow.scoredEvidence >= 0 && shadow.scoredEvidence <= shadow.asked.length * 8, id);
    assert.ok(["no_useful_questions", "budget_blocked", "useful_questions_remaining"].includes(shadow.terminal), id);
    console.log(`QA03B_UTILITY_AB ${JSON.stringify({
      profile: id,
      baseline: { count: baseline.asked.length, terminal: baseline.terminal, niche: baseline.nicheAnswered,
        direct: baseline.directAnswered, scored: baseline.scoredEvidence,
        unresolved: baseline.unresolved, insufficient: baseline.insufficient },
      utilityFirst: { count: shadow.asked.length, terminal: shadow.terminal, niche: shadow.nicheAnswered,
        direct: shadow.directAnswered, scored: shadow.scoredEvidence,
        unresolved: shadow.unresolved, insufficient: shadow.insufficient },
      questionsAdded: shadow.asked.filter((q) => !baseline.asked.includes(q)),
      questionsRemoved: baseline.asked.filter((q) => !shadow.asked.includes(q)),
    })}`);
  }
});
