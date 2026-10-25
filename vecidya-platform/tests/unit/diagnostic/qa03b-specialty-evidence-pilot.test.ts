import assert from "node:assert/strict";
import test from "node:test";

import { QA03B_SPECIALTY_CANDIDATE_BANK_V1 as bank } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import { QA03B_SPECIALTY_EVIDENCE_PILOT_V1 as pilot } from "../../../app/features/diagnostic/qa03b/specialty-evidence-pilot";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { validateQuestionCopyV2 } from "../../../app/features/diagnostic/qa03b/copy";
import { validateEvidenceMigrationsV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { validateCandidateAnswerV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_SPECIALTY_PERSONAS, authoredSpecialtyAnswers } from "./qa03b-specialty-journeys";

const common = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_customer_reach: "mixed",
  q2_other_staff: "no",
} as const;

test("four specialty evidence pilots are well-formed and keep the candidate isolated", () => {
  assert.equal(pilot.length, 4);
  assert.equal(bank.length, 78);
  assert.equal(new Set(bank.map((q) => q.id)).size, 78);
  assert.deepEqual(validateQuestionCopyV2(bank), []);
  assert.deepEqual(validateEvidenceMigrationsV3(bank), []);
  for (const question of pilot) {
    assert.equal(question.evidenceMigration, "migrated", question.id);
    assert.ok(question.evidenceV3, question.id);
    assert.ok(question.prompt.includes("¿") && question.prompt.endsWith("?"), question.id);
    assert.ok(question.hint && question.hint.length <= 140, question.id);
    assert.equal(question.evidenceV3!.dimensions.length, 1, question.id);
    const states = Object.keys(question.evidenceV3!.dimensions[0]!.answers).sort();
    assert.deepEqual(states, question.options.map((o) => o.value).sort(), question.id);
  }
});

test("software activation evidence exists only for active software_startup", () => {
  const base = {
    ...common, q2_sector: "technology_software", q2_monetization: "recurring",
    q2_delivery: ["remote_service"], q2_customer_buyer: "b2b", q2_goal: "measure", q2_friction: "conversion",
  };
  const noNiche = resolveEligibleQuestionsV2(base, bank);
  assert.ok(!noNiche.eligibleQuestionIds.includes("q2_specialty_software_activation"));
  const software = resolveEligibleQuestionsV2({ ...base, q2_niche_technology_software: "software_startup" }, bank);
  assert.ok(software.eligibleQuestionIds.includes("q2_specialty_software_activation"));
  const marketplace = resolveEligibleQuestionsV2({ ...base, q2_niche_technology_software: "two_sided_marketplace" }, bank);
  assert.ok(!marketplace.eligibleQuestionIds.includes("q2_specialty_software_activation"));
  const preparing = resolveEligibleQuestionsV2({ ...base, q2_operational_status: "preparing", q2_niche_technology_software: "software_startup" }, bank);
  assert.ok(!preparing.eligibleQuestionIds.includes("q2_specialty_software_activation"));

  const scored = scoreCandidateContextualDimensionsV3({ answers: {
    ...base, q2_niche_technology_software: "software_startup",
    q2_specialty_software_activation: "partially_tracked",
  } }, bank);
  const measurement = scored.dimensions.find((d) => d.id === "measurement_optimization");
  assert.equal(measurement?.evidence.find((e) => e.questionId === "q2_specialty_software_activation")?.state, "partial");
});

test("marketplace evidence measures diagnostic visibility, not marketplace success", () => {
  const answers = {
    ...common, q2_sector: "technology_software", q2_monetization: "commission",
    q2_delivery: ["online_checkout"], q2_customer_buyer: "mixed", q2_goal: "measure", q2_friction: "conversion",
    q2_niche_technology_software: "two_sided_marketplace",
  };
  const resolved = resolveEligibleQuestionsV2(answers, bank);
  assert.ok(resolved.eligibleQuestionIds.includes("q2_specialty_marketplace_balance"));
  assert.ok(!resolved.eligibleQuestionIds.includes("q2_specialty_software_activation"));
  const uncertain = scoreCandidateContextualDimensionsV3({ answers: {
    ...answers, q2_specialty_marketplace_balance: "unknown",
  } }, bank);
  assert.equal(
    uncertain.dimensions.find((d) => d.id === "measurement_optimization")
      ?.evidence.find((e) => e.questionId === "q2_specialty_marketplace_balance")?.state,
    "uncertainty",
  );
});

test("tax and insurance lifecycle evidence is mutually exclusive by declared niche", () => {
  const finance = {
    ...common, q2_sector: "financial_tax_insurance", q2_monetization: "services",
    q2_delivery: ["appointments"], q2_customer_buyer: "b2c", q2_goal: "stop_losing", q2_friction: "follow_up",
  };
  const tax = resolveEligibleQuestionsV2({ ...finance, q2_niche_financial_tax_insurance: "tax_preparation" }, bank);
  assert.ok(tax.eligibleQuestionIds.includes("q2_specialty_tax_return_cycle"));
  assert.ok(!tax.eligibleQuestionIds.includes("q2_specialty_insurance_renewal"));
  const insurance = resolveEligibleQuestionsV2({ ...finance, q2_niche_financial_tax_insurance: "insurance_agency" }, bank);
  assert.ok(insurance.eligibleQuestionIds.includes("q2_specialty_insurance_renewal"));
  assert.ok(!insurance.eligibleQuestionIds.includes("q2_specialty_tax_return_cycle"));

  const na = scoreCandidateContextualDimensionsV3({ answers: {
    ...finance, q2_niche_financial_tax_insurance: "tax_preparation",
    q2_specialty_tax_return_cycle: "not_applicable",
  } }, bank);
  assert.equal(
    na.dimensions.find((d) => d.id === "relationship_recurrence")
      ?.evidence.find((e) => e.questionId === "q2_specialty_tax_return_cycle")?.state,
    "not_applicable",
  );
});

test("utility-first asks niche only when it can unlock one of the real specialty evidence pilots", () => {
  const software = {
    ...common, q2_sector: "technology_software", q2_monetization: "recurring",
    q2_delivery: ["remote_service"], q2_customer_buyer: "b2b", q2_goal: "measure", q2_friction: "conversion",
  };
  const plan = buildCandidateQuestionPlanFromBankV3({ answers: software }, bank, "utility_first");
  assert.ok(plan.eligibleQuestionIds.includes("q2_niche_technology_software"));
  assert.ok(plan.evidenceSufficiency.usefulContextQuestionIds.includes("q2_niche_technology_software"));
  assert.ok(plan.selectedQuestionIds.includes("q2_niche_technology_software"));
  assert.ok(!plan.eligibleQuestionIds.includes("q2_specialty_software_activation"));

  const after = buildCandidateQuestionPlanFromBankV3({
    answers: { ...software, q2_niche_technology_software: "software_startup" },
  }, bank, "utility_first");
  assert.ok(after.eligibleQuestionIds.includes("q2_specialty_software_activation"));
  assert.ok(after.evidenceSufficiency.usefulEvidenceQuestionIds.includes("q2_specialty_software_activation"));
});


function walkImpact(profileId: string, routeBank: typeof bank) {
  const persona = QA03B_SPECIALTY_PERSONAS.find((item) => item.id === profileId);
  assert.ok(persona, profileId);
  const authored = authoredSpecialtyAnswers(persona);
  const byId = new Map(routeBank.map((q) => [q.id, q]));
  let answers: AnswersV2 = {};
  const asked: string[] = [];
  for (let turn = 0; turn <= 24; turn++) {
    const plan = buildCandidateQuestionPlanFromBankV3({ answers }, routeBank, "utility_first");
    answers = plan.activeAnswers;
    if (!plan.nextQuestionId) {
      const score = scoreCandidateContextualDimensionsV3({ answers }, routeBank);
      return {
        asked,
        terminal: plan.evidenceSufficiency.terminalReason,
        unresolved: plan.evidenceSufficiency.unresolvedApplicableDimensions,
        insufficient: plan.evidenceSufficiency.insufficientContextDimensions,
        evidence: score.dimensions.flatMap((d) => d.evidence.map((e) => ({
          dimension: d.id, questionId: e.questionId, state: e.state,
        }))),
      };
    }
    assert.ok(turn < 24, `${profileId}: route exceeded 24`);
    const id = plan.nextQuestionId;
    const question = byId.get(id);
    assert.ok(question, id);
    let value: string | readonly string[] | undefined = authored[id];
    if (value === undefined) {
      const neutral = question.options.find((option) => option.kind === "unknown");
      assert.ok(neutral, `${profileId}: no authored or unknown answer for ${id}`);
      value = question.type === "multi" ? [neutral.value] : neutral.value;
    }
    assert.ok(validateCandidateAnswerV3(question, value), `${profileId}: invalid ${id}`);
    answers = { ...answers, [id]: value };
    asked.push(id);
  }
  throw new Error(`${profileId}: non-terminating route`);
}

test("specialty pilot measures its actual cost and evidence delta against the 74-question bank", () => {
  const pilotIds = new Set(pilot.map((q) => q.id));
  const withoutPilot = bank.filter((q) => !pilotIds.has(q.id));
  assert.equal(withoutPilot.length, 74);

  for (const profile of ["software-saas-activo", "marketplace-activo", "impuestos", "seguros"]) {
    const before = walkImpact(profile, withoutPilot);
    const after = walkImpact(profile, bank);
    assert.ok(before.asked.length <= 24 && after.asked.length <= 24, profile);
    assert.ok(after.asked.filter((id) => pilotIds.has(id)).length <= 1, profile);

    const newEvidence = after.evidence.filter((item) =>
      pilotIds.has(item.questionId) && !before.evidence.some((old) =>
        old.questionId === item.questionId && old.state === item.state));
    console.log(`QA03B_SPECIALTY_IMPACT ${JSON.stringify({
      profile,
      before: { count: before.asked.length, terminal: before.terminal,
        evidence: before.evidence.length, unresolved: before.unresolved, insufficient: before.insufficient },
      after: { count: after.asked.length, terminal: after.terminal,
        evidence: after.evidence.length, unresolved: after.unresolved, insufficient: after.insufficient },
      specialtyAsked: after.asked.filter((id) => pilotIds.has(id)),
      addedQuestions: after.asked.filter((id) => !before.asked.includes(id)),
      removedQuestions: before.asked.filter((id) => !after.asked.includes(id)),
      newEvidence,
    })}`);
  }
});
