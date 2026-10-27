import assert from "node:assert/strict";
import test from "node:test";

import {
  applyClassificationInteractionV9,
  buildCandidateQuestionPlanV9Prototype,
  countVisibleInteractionsV9,
  replayClassificationInteractionsV9,
  type ClassificationInteractionEventV9,
} from "../../../app/features/diagnostic/qa03b/v9-classification-bundle";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-planner";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { QUESTION_BANK_ID, SESSION_SCHEMA, SESSION_KEY } from "../../../app/features/diagnostic/qa03b/contract";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const restaurantContext: AnswersV2 = {
  q2_entity: "business",
  q2_operational_status: "operating",
  q2_has_customers: "yes",
  q2_monetization: "goods",
  q2_delivery: ["onsite"],
  q2_customer_buyer: "b2c",
  q2_customer_reach: "local",
  q2_goal: "explain",
  q2_friction: "conversion",
  q2_presence_digital_base: "reliable_presence",
};

test("V9 classification bundle stores sector and specialty as explicit answers but one visible interaction", () => {
  const result = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "restaurant",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.answers.q2_sector, "food_hospitality");
  assert.equal(result.answers.q2_niche_food_hospitality, "restaurant");
  assert.equal(result.event.sectorQuestionId, "q2_sector");
  assert.equal(result.event.nicheQuestionId, "q2_niche_food_hospitality");
  assert.equal(
    countVisibleInteractionsV9(result.answers, [result.event]),
    Object.keys(result.answers).length - 1,
  );

  const candidate = buildCandidateQuestionPlanV9Prototype(result.answers, [result.event]);
  assert.equal(candidate.visibleInteractionCount, Object.keys(candidate.activeAnswers).length - 1);
  assert.ok(candidate.plan.routeLength <= 24);
});

test("sectors with a specialty selector require a concrete, other or unknown specialty in the same interaction", () => {
  const missing = applyClassificationInteractionV9(restaurantContext, { sector: "food_hospitality" });
  assert.deepEqual(missing, { ok: false, reason: "niche_required_for_sector" });

  const other = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "other",
  });
  assert.equal(other.ok, true);
  if (other.ok) assert.equal(other.answers.q2_niche_food_hospitality, "other");

  const unknown = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "unknown",
  });
  assert.equal(unknown.ok, true);
  if (unknown.ok) assert.equal(unknown.answers.q2_niche_food_hospitality, "unknown");
});

test("V9 rejects cross-sector and nonexistent specialty values instead of inferring a niche", () => {
  assert.deepEqual(
    applyClassificationInteractionV9(restaurantContext, {
      sector: "food_hospitality",
      niche: "dentist",
    }),
    { ok: false, reason: "invalid_niche" },
  );
  assert.deepEqual(
    applyClassificationInteractionV9(restaurantContext, {
      sector: "__not_a_sector__",
    }),
    { ok: false, reason: "invalid_sector" },
  );
  assert.deepEqual(
    applyClassificationInteractionV9(restaurantContext, {
      sector: "legal",
      niche: "restaurant",
    }),
    { ok: false, reason: "niche_not_available_for_sector" },
  );
});

test("editing sector atomically removes old niche and stale specialty answers", () => {
  const existing: AnswersV2 = {
    ...restaurantContext,
    q2_sector: "food_hospitality",
    q2_niche_food_hospitality: "restaurant",
    q2_food_menu_visibility: "unclear",
  };
  const changed = applyClassificationInteractionV9(existing, {
    sector: "b2b_services",
    niche: "marketing_agency",
  });
  assert.equal(changed.ok, true);
  if (!changed.ok) return;

  assert.equal(changed.answers.q2_sector, "b2b_services");
  assert.equal(changed.answers.q2_niche_b2b_services, "marketing_agency");
  assert.equal(changed.answers.q2_niche_food_hospitality, undefined);
  assert.equal(changed.answers.q2_food_menu_visibility, undefined);
  assert.equal(changed.answers.q2_marketing_agency_scope_clarity, undefined);
});

test("classification event replay is deterministic and fails closed on tampered companion IDs", () => {
  const first = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "restaurant",
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;

  const second = applyClassificationInteractionV9(first.answers, {
    sector: "b2b_services",
    niche: "marketing_agency",
  });
  assert.equal(second.ok, true);
  if (!second.ok) return;

  const events: readonly ClassificationInteractionEventV9[] = [first.event, second.event];
  assert.deepEqual(replayClassificationInteractionsV9(restaurantContext, events), second.answers);

  const tampered: ClassificationInteractionEventV9 = {
    ...second.event,
    nicheQuestionId: "q2_niche_food_hospitality",
  };
  assert.equal(replayClassificationInteractionsV9(restaurantContext, [first.event, tampered]), null);
});

test("interaction budgeting can recover one visible slot while the public V8 planner ignores the seam", () => {
  const bundled = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "restaurant",
  });
  assert.equal(bundled.ok, true);
  if (!bundled.ok) return;

  const raw = buildCandidateQuestionPlanFromBankV3(
    { answers: bundled.answers },
    QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2,
    "utility_first",
  );
  const v9 = buildCandidateQuestionPlanV9Prototype(bundled.answers, [bundled.event]);
  assert.equal(v9.visibleInteractionCount, Object.keys(v9.activeAnswers).length - 1);
  assert.ok(v9.plan.routeLength <= raw.routeLength);
  assert.ok(v9.plan.routeLength <= 24);

  const publicDefault = buildCandidateQuestionPlanV3({ answers: restaurantContext });
  const publicSpoofed = buildCandidateQuestionPlanV3({
    answers: restaurantContext,
    answeredInteractionCount: 0,
  });
  assert.deepEqual(publicSpoofed, publicDefault);
  assert.equal(QUESTION_BANK_ID, "reviewed-evidence-v8");
  assert.equal(SESSION_SCHEMA, 8);
  assert.equal(SESSION_KEY, "vecidya.diagnostic.v3.candidate.session.8");
});

test("classification replay validates sector question identity", () => {
  const applied = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality",
    niche: "restaurant",
  });
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  const invalidEvent = {
    ...applied.event,
    sectorQuestionId: "q2_goal",
  } as unknown as ClassificationInteractionEventV9;
  assert.equal(replayClassificationInteractionsV9(restaurantContext, [invalidEvent]), null);
  assert.deepEqual(replayClassificationInteractionsV9(restaurantContext, [applied.event]), applied.answers);
});

test("switching specialty within a sector clears stale specialist evidence", () => {
  const existing: AnswersV2 = {
    ...restaurantContext,
    q2_sector: "food_hospitality",
    q2_niche_food_hospitality: "restaurant",
    q2_food_menu_visibility: "unclear",
  };
  const changed = applyClassificationInteractionV9(existing, {
    sector: "food_hospitality",
    niche: "other",
  });
  assert.equal(changed.ok, true);
  if (!changed.ok) return;
  assert.equal(changed.answers.q2_sector, "food_hospitality");
  assert.equal(changed.answers.q2_niche_food_hospitality, "other");
  assert.equal(changed.answers.q2_food_menu_visibility, undefined);
  assert.equal(changed.answers.q2_goal, existing.q2_goal);
  assert.equal(changed.answers.q2_has_customers, existing.q2_has_customers);
});

test("visible interaction count does not reuse an old matching sector event", () => {
  const first = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = applyClassificationInteractionV9(first.answers, {
    sector: "b2b_services", niche: "marketing_agency",
  });
  assert.equal(second.ok, true);
  if (!second.ok) return;
  const staleAnswers: AnswersV2 = {
    ...second.answers,
    q2_sector: "food_hospitality",
    q2_niche_food_hospitality: "restaurant",
  };
  assert.equal(
    countVisibleInteractionsV9(staleAnswers, [first.event, second.event]),
    Object.keys(staleAnswers).length,
  );
  assert.equal(
    countVisibleInteractionsV9(first.answers, [first.event]),
    Object.keys(first.answers).length - 1,
  );
});

test("visible interaction count rejects mismatched specialty selector in latest event", () => {
  const applied = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  const forged = {
    ...applied.event,
    nicheQuestionId: "q2_niche_b2b_services",
  } as ClassificationInteractionEventV9;
  const answers: AnswersV2 = {
    ...applied.answers,
    q2_niche_b2b_services: "restaurant",
  };
  assert.equal(countVisibleInteractionsV9(answers, [forged]), Object.keys(answers).length);
  assert.equal(
    countVisibleInteractionsV9(applied.answers, [applied.event]),
    Object.keys(applied.answers).length - 1,
  );
});

test("visible count rejects an invalid specialty value in a matching selector", () => {
  const applied = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  const forged: ClassificationInteractionEventV9 = {
    ...applied.event,
    niche: "not_a_specialty",
  };
  const answers: AnswersV2 = {
    ...applied.answers,
    q2_niche_food_hospitality: "not_a_specialty",
  };
  assert.equal(countVisibleInteractionsV9(answers, [forged]), Object.keys(answers).length);
});

test("visible count does not discount a missing sector answer", () => {
  const applied = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  const incomplete: AnswersV2 = { ...applied.answers };
  delete incomplete.q2_sector;
  assert.equal(
    countVisibleInteractionsV9(incomplete, [applied.event]),
    Object.keys(incomplete).length,
  );
});

test("classification replay rejects an event with a mismatched specialty value", () => {
  const applied = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(applied.ok, true);
  if (!applied.ok) return;
  const invalid: ClassificationInteractionEventV9 = {
    ...applied.event,
    niche: "dentist",
  };
  assert.equal(replayClassificationInteractionsV9(restaurantContext, [invalid]), null);
  assert.deepEqual(
    replayClassificationInteractionsV9(restaurantContext, [applied.event]),
    applied.answers,
  );
});

test("classification replay remains deterministic after returning to a previous sector", () => {
  const first = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = applyClassificationInteractionV9(first.answers, {
    sector: "b2b_services", niche: "marketing_agency",
  });
  assert.equal(second.ok, true);
  if (!second.ok) return;
  const third = applyClassificationInteractionV9(second.answers, {
    sector: "food_hospitality", niche: "other",
  });
  assert.equal(third.ok, true);
  if (!third.ok) return;
  const events = [first.event, second.event, third.event];
  assert.deepEqual(replayClassificationInteractionsV9(restaurantContext, events), third.answers);
  assert.equal(third.answers.q2_niche_b2b_services, undefined);
  assert.equal(third.answers.q2_niche_food_hospitality, "other");
  assert.equal(
    countVisibleInteractionsV9(third.answers, events),
    Object.keys(third.answers).length - 1,
  );
});

test("V9 planner respects historical interaction floor after a bundled classification", () => {
  const result = applyClassificationInteractionV9(restaurantContext, {
    sector: "food_hospitality", niche: "restaurant",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const withoutHistory = buildCandidateQuestionPlanV9Prototype(result.answers, [result.event]);
  const withHistory = buildCandidateQuestionPlanV9Prototype(result.answers, [result.event], 24);
  assert.equal(withHistory.visibleInteractionCount, 24);
  assert.ok(withHistory.visibleInteractionCount >= withoutHistory.visibleInteractionCount);
  assert.ok(withHistory.plan.routeLength <= 24);
});

test("P2: escenarios sectoriales sustituyen elegibilidad genérica y respetan presupuesto", () => {
  const scenarios = [
    {
      name: "odontología",
      sector: "health_wellness",
      niche: "dentist",
      context: { q2_goal: "stop_losing", q2_monetization: "services", q2_delivery: ["appointments"] },
      specialized: "q2_dental_care_continuation",
      generic: "q2_appointments_rebooking",
    },
    {
      name: "alimentación",
      sector: "food_hospitality",
      niche: "restaurant",
      context: { q2_goal: "explain", q2_presence_digital_base: "reliable_presence" },
      specialized: "q2_food_menu_visibility",
      generic: "q2_presence_offer_clarity",
    },
    {
      name: "agencia",
      sector: "b2b_services",
      niche: "marketing_agency",
      context: { q2_goal: "explain", q2_customer_buyer: "b2b", q2_presence_digital_base: "reliable_presence" },
      specialized: "q2_marketing_agency_scope_clarity",
      generic: "q2_presence_offer_clarity",
    },
  ] as const;
  for (const scenario of scenarios) {
    const classified = applyClassificationInteractionV9(
      { ...restaurantContext, ...scenario.context },
      { sector: scenario.sector, niche: scenario.niche },
    );
    assert.equal(classified.ok, true, scenario.name);
    if (!classified.ok) continue;
    const { plan, visibleInteractionCount } = buildCandidateQuestionPlanV9Prototype(
      classified.answers, [classified.event],
    );
    const eligible = resolveEligibleQuestionsV2(classified.answers, QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2);
    assert.ok(eligible.eligibleQuestionIds.includes(scenario.specialized),
      scenario.name + ": pregunta especializada no elegible");
    assert.ok(!eligible.eligibleQuestionIds.includes(scenario.generic),
      scenario.name + ": pregunta genérica no sustituida");
    assert.ok(plan.routeLength <= 24, scenario.name + ": presupuesto excedido");
    assert.equal(visibleInteractionCount, Object.keys(classified.answers).length - 1);
  }
});

test("P2: cambiar de odontología a restaurante elimina la evidencia anterior y activa la rama nueva", () => {
  const dental = applyClassificationInteractionV9({
    ...restaurantContext,
    q2_monetization: "services",
    q2_delivery: ["appointments"],
    q2_goal: "stop_losing",
  }, { sector: "health_wellness", niche: "dentist" });
  assert.equal(dental.ok, true);
  if (!dental.ok) return;

  const withEvidence: AnswersV2 = {
    ...dental.answers,
    q2_dental_care_continuation: "proactive",
  };
  const switched = applyClassificationInteractionV9({
    ...withEvidence,
    q2_goal: "explain",
    q2_monetization: "goods",
    q2_delivery: ["onsite"],
  }, { sector: "food_hospitality", niche: "restaurant" });
  assert.equal(switched.ok, true);
  if (!switched.ok) return;

  assert.equal(switched.answers.q2_dental_care_continuation, undefined);
  assert.equal(switched.answers.q2_niche_health_wellness, undefined);
  assert.equal(switched.answers.q2_niche_food_hospitality, "restaurant");
  const eligible = resolveEligibleQuestionsV2(switched.answers, QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2);
  assert.ok(eligible.eligibleQuestionIds.includes("q2_food_menu_visibility"));
  assert.ok(!eligible.eligibleQuestionIds.includes("q2_presence_offer_clarity"));
  const plan = buildCandidateQuestionPlanV9Prototype(switched.answers, [dental.event, switched.event]);
  assert.ok(plan.plan.routeLength <= 24);
});
