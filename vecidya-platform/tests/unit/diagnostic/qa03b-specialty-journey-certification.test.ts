import assert from "node:assert/strict";
import test from "node:test";

import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as productionBank } from "../../../app/features/diagnostic/qa03b/bank";
import { QA03B_SPECIALTY_CANDIDATE_BANK_V1 as candidateBank } from "../../../app/features/diagnostic/qa03b/specialty-candidate-bank";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qa03b/engine";
import { buildCandidateQuestionPlanFromBankV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-planner";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qa03b/v9-candidate-scoring";
import { validateCandidateAnswerV3, createCandidateSessionV3, parseCandidateSessionV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session";
import { SESSION_SCHEMA, SESSION_KEY, QUESTION_BANK_ID } from "../../../app/features/diagnostic/qa03b/contract";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { NICHE_REGISTRY } from "../../../app/features/diagnostic/taxonomy";
import { QA03B_SPECIALTY_PERSONAS, authoredSpecialtyAnswers, declaredSpecialtyContextAnswers, type QA03BSpecialtyPersona } from "./qa03b-specialty-journeys";

const byId = new Map(candidateBank.map((q) => [q.id, q]));
const selectedProfile = (id: string): QA03BSpecialtyPersona => {
  const persona = QA03B_SPECIALTY_PERSONAS.find((item) => item.id === id);
  assert.ok(persona, id);
  return persona;
};

const assertProfileEligibility = (persona: QA03BSpecialtyPersona, eligible: readonly string[]) => {
  const set = new Set(eligible);
  const active = persona.status === "operating" && persona.history === "yes";
  const components = new Set(persona.delivery);
  if (persona.status !== "preparing") {
    assert.ok(!set.has("q2_startup_problem_clarity"), persona.id);
    assert.ok(!set.has("q2_startup_validation_evidence"), persona.id);
    assert.ok(!set.has("q2_startup_demand_signal"), persona.id);
  }
  if (!active) {
    for (const id of ["q2_ecommerce_cart_visibility", "q2_ecommerce_cart_followup",
      "q2_hospitality_flow_type", "q2_hospitality_reservation_noshow",
      "q2_b2b_qualification", "q2_measurement_source_confidence"]) {
      assert.ok(!set.has(id), `${persona.id}: ${id} must not ask about current operations`);
    }
  }
  if (!components.has("online_checkout")) {
    for (const id of ["q2_ecommerce_cart_visibility", "q2_ecommerce_checkout_friction", "q2_ecommerce_cart_followup"]) {
      assert.ok(!set.has(id), `${persona.id}: ${id} requires checkout`);
    }
  }
  if (!components.has("onsite")) {
    for (const id of ["q2_hospitality_flow_type", "q2_hospitality_reservation_noshow", "q2_hospitality_peak_capacity"]) {
      assert.ok(!set.has(id), `${persona.id}: ${id} requires onsite hospitality`);
    }
  }
  if (persona.buyer !== "b2b" && persona.buyer !== "mixed") {
    assert.ok(!set.has("q2_b2b_qualification"), persona.id);
  }
  if (persona.entity !== "organization" && persona.monetization !== "mission") {
    for (const id of ["q2_nonprofit_support_type", "q2_nonprofit_membership_lifecycle", "q2_nonprofit_donation_clarity"]) {
      assert.ok(!set.has(id), persona.id);
    }
  }
  const applicableSelectors = eligible.filter((id) => id.startsWith("q2_niche_"));
  assert.ok(applicableSelectors.every((id) => id === `q2_niche_${persona.sector}`), persona.id);
};

test("30 authored personas resolve valid niche, entity, stage and sector without inferring capabilities", () => {
  assert.equal(QA03B_SPECIALTY_PERSONAS.length, 30);
  assert.equal(new Set(QA03B_SPECIALTY_PERSONAS.map((p) => p.id)).size, 30);
  assert.equal(productionBank.length, 45);
  assert.equal(candidateBank.length, 74);

  for (const persona of QA03B_SPECIALTY_PERSONAS) {
    const source = declaredSpecialtyContextAnswers(persona);
    const result = resolveEligibleQuestionsV2(source, candidateBank);
    assertProfileEligibility(persona, result.eligibleQuestionIds);
    assert.equal(result.activeAnswers.q2_operational_status, persona.status, persona.id);
    assert.equal(result.activeAnswers.q2_sector, persona.sector, persona.id);
    assert.deepEqual(result.activeAnswers.q2_delivery, persona.delivery, persona.id);

    if (persona.niche !== null) {
      const expectedNiche = NICHE_REGISTRY.find((n) => n.id === persona.niche);
      assert.equal(expectedNiche?.group, persona.sector, persona.id);
      assert.equal(result.context.niche.status, "resolved", persona.id);
      if (result.context.niche.status === "resolved") assert.equal(result.context.niche.value, persona.niche);
    } else {
      assert.equal(result.context.niche.status, "unresolved", persona.id);
    }
    if (persona.id === "autonomo-dentista") {
      assert.ok(!result.context.archetypeComponents.includes("appointments"), "dentist niche alone never implies multiple providers");
    }
    // A newly declared niche can legitimately change R4 *applicability*.
    // It cannot, by itself, manufacture direct diagnostic evidence.
    const after = scoreCandidateContextualDimensionsV3({ answers: source }, candidateBank);
    for (const dimension of after.dimensions) {
      assert.ok(
        dimension.evidence.every((item) => !item.questionId.startsWith("q2_niche_")),
        `${persona.id}: sector and niche declarations are not scored evidence`,
      );
    }
  }
});

test("30 persona snapshots preserve route limits, deterministic decisions and sector-specific selection", () => {
  for (const persona of QA03B_SPECIALTY_PERSONAS) {
    const input = { answers: declaredSpecialtyContextAnswers(persona) };
    const first = buildCandidateQuestionPlanFromBankV3(input, candidateBank);
    const again = buildCandidateQuestionPlanFromBankV3(input, candidateBank);
    assert.deepEqual(first, again, `${persona.id}: candidate plan must be deterministic`);
    assert.ok(first.routeLength <= first.budget.hardMax, persona.id);
    assert.ok(first.budget.hardMax <= 24, persona.id);
    assert.ok(first.selectedQuestionIds.every((id) => first.eligibleQuestionIds.includes(id)), persona.id);
    assertProfileEligibility(persona, first.eligibleQuestionIds);
    for (const id of first.selectedQuestionIds) {
      assert.ok(!id.startsWith("q2_niche_") || id === `q2_niche_${persona.sector}`, persona.id);
      assert.ok(first.trace.some((entry) => entry.questionId === id && entry.selected), persona.id);
    }
  }
});

/**
 * Synthetic route walk:
 * - Begins from an empty interview, following the REAL candidate planner.
 * - Uses only explicitly authored answers, or the question's explicit unknown
 *   option for unobserved capabilities. No hidden first-option fallback.
 * - Reconstructs on each step, as the browser orchestrator does.
 */
function walk(persona: QA03BSpecialtyPersona) {
  const authored = authoredSpecialtyAnswers(persona);
  let answers: AnswersV2 = {};
  const asked: string[] = [];
  const neutrals: string[] = [];
  for (let turn = 0; turn <= 24; turn++) {
    const plan = buildCandidateQuestionPlanFromBankV3({ answers }, candidateBank);
    assert.ok(plan.budget.hardMax <= 24, persona.id);
    assert.ok(plan.routeLength <= 24, persona.id);
    answers = plan.activeAnswers;
    const id = plan.nextQuestionId;
    if (id === undefined) return { asked, neutrals, answers, finalPlan: plan };
    assert.ok(turn < 24, `${persona.id}: route exceeded hard cap`);
    assert.ok(!asked.includes(id), `${persona.id}: repeated question ${id}`);
    assert.ok(plan.eligibleQuestionIds.includes(id), `${persona.id}: ineligible ${id}`);
    const question = byId.get(id);
    assert.ok(question, id);
    if (id.startsWith("q2_niche_")) assert.equal(id, `q2_niche_${persona.sector}`, persona.id);
    let value: string | readonly string[] | undefined = authored[id];
    if (value === undefined) {
      const neutral = question.options.find((option) => option.kind === "unknown");
      assert.ok(neutral, `${persona.id}: no authored answer or neutral for ${id}`);
      value = question.type === "multi" ? [neutral.value] : neutral.value;
      neutrals.push(id);
    }
    assert.ok(validateCandidateAnswerV3(question, value), `${persona.id}: invalid authored answer for ${id}: ${JSON.stringify(value)}`);
    answers = { ...answers, [id]: value };
    asked.push(id);
  }
  throw new Error(`${persona.id}: route did not terminate`);
}

test("eight sector-specific journeys terminate with explicit ready or budget-blocked reason within 24 questions", () => {
  const cases = [
    "idea-software", "pausa-dentista", "clinica-dental", "restaurante-reservas",
    "tienda-hibrida", "agencia-marketing-b2b", "creador-audiencia", "organizacion-donaciones",
  ];
  for (const id of cases) {
    const result = walk(selectedProfile(id));
    assert.ok(result.asked.length <= 24, id);
    assert.equal(new Set(result.asked).size, result.asked.length, id);
    assert.equal(result.finalPlan.nextQuestionId, undefined, id);
    const end = result.finalPlan.evidenceSufficiency.terminalReason;
    if (!result.finalPlan.completion.ready) {
      // Explicit terminal in the current browser session contract: the route
      // cannot add a useful question within module/budget limits. This is NOT
      // permission to declare the evidence sufficient or invent a score.
      assert.equal(end, "budget_blocked", `${id}: unsupported incomplete route`);
      assert.equal(result.finalPlan.selectedQuestionIds.length, 0, id);
      assert.ok(result.finalPlan.evidenceSufficiency.usefulQuestionsRemaining, id);
    }
    assert.ok(result.finalPlan.completion.ready || end === "budget_blocked", id);
    // Audit-friendly synthetic trace: preserve unresolved evidence for follow-up
    // without changing the planner or letting a pending question consume slots.
    console.log(`QA03B_SHADOW_JOURNEY ${JSON.stringify({
      profile: id,
      answered: result.asked.length,
      terminal: end,
      completionReady: result.finalPlan.completion.ready,
      unresolved: result.finalPlan.evidenceSufficiency.unresolvedApplicableDimensions,
      insufficientContext: result.finalPlan.evidenceSufficiency.insufficientContextDimensions,
      blocked: result.finalPlan.trace.filter((entry) =>
        !entry.selected && ["module_budget", "base_budget", "hard_cap"].includes(entry.skipReason ?? "")
      ).map((entry) => ({ id: entry.questionId, reason: entry.skipReason })),
    })}`);
    assertProfileEligibility(selectedProfile(id), resolveEligibleQuestionsV2(result.answers, candidateBank).eligibleQuestionIds);
  }
});

test("history and buyer edits fail closed and remove newly ineligible answers", () => {
  const ecom = declaredSpecialtyContextAnswers(selectedProfile("ecommerce-puro"));
  const initial = resolveEligibleQuestionsV2({ ...ecom, q2_ecommerce_cart_visibility: "yes", q2_ecommerce_cart_followup: "always" }, candidateBank);
  assert.equal(initial.activeAnswers.q2_ecommerce_cart_followup, "always");

  const paused = resolveEligibleQuestionsV2({ ...initial.activeAnswers, q2_operational_status: "paused" }, candidateBank);
  assert.equal(paused.activeAnswers.q2_ecommerce_cart_visibility, undefined);
  assert.equal(paused.activeAnswers.q2_ecommerce_cart_followup, undefined);

  const b2b = declaredSpecialtyContextAnswers(selectedProfile("agencia-marketing-b2b"));
  const sales = resolveEligibleQuestionsV2({ ...b2b, q2_b2b_qualification: "yes_clear" }, candidateBank);
  assert.equal(sales.activeAnswers.q2_b2b_qualification, "yes_clear");
  const consumer = resolveEligibleQuestionsV2({ ...sales.activeAnswers, q2_customer_buyer: "b2c" }, candidateBank);
  assert.equal(consumer.activeAnswers.q2_b2b_qualification, undefined);

  const restaurant = declaredSpecialtyContextAnswers(selectedProfile("restaurante-reservas"));
  const reservations = resolveEligibleQuestionsV2({ ...restaurant, q2_hospitality_flow_type: "reservation", q2_hospitality_reservation_noshow: "often" }, candidateBank);
  assert.equal(reservations.activeAnswers.q2_hospitality_reservation_noshow, "often");
  const walkIn = resolveEligibleQuestionsV2({ ...reservations.activeAnswers, q2_hospitality_flow_type: "walk_in" }, candidateBank);
  assert.equal(walkIn.activeAnswers.q2_hospitality_reservation_noshow, undefined);
});

test("public session parser rejects staged niche/wave-2 answers and retains v8 storage boundary", () => {
  assert.equal(SESSION_SCHEMA, 8);
  assert.equal(QUESTION_BANK_ID, "reviewed-evidence-v8");
  assert.equal(SESSION_KEY, "vecidya.diagnostic.v3.candidate.session.8");
  const session = createCandidateSessionV3({ sessionId: "compat-test-v8", writerId: "test", now: 1_000 });
  assert.equal(session.questionBankIdentity, QUESTION_BANK_ID);
  assert.ok(parseCandidateSessionV3(JSON.stringify(session), 1_000));

  const withNiche = { ...session, answers: { q2_niche_food_hospitality: "restaurant" }, answeredQuestionIds: ["q2_niche_food_hospitality"] };
  assert.equal(parseCandidateSessionV3(JSON.stringify(withNiche), 1_000), null);
  const withRecovery = { ...session, answers: { q2_ecommerce_cart_followup: "always" }, answeredQuestionIds: ["q2_ecommerce_cart_followup"] };
  assert.equal(parseCandidateSessionV3(JSON.stringify(withRecovery), 1_000), null);
  const spoofedFutureBank = { ...session, questionBankIdentity: "qa03b-specialties-v9" };
  assert.equal(parseCandidateSessionV3(JSON.stringify(spoofedFutureBank), 1_000), null);
});
