import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANSWER_SEMANTICS, DEFAULT_ROUTE_BUDGET_V1, EVIDENCE_DIRECTNESS, EVIDENCE_MAPPING, GOLDEN_PERSONAS, MATERIAL_EVIDENCE_TARGET, QUESTION_BANK_V2, ROUTE_BANDS, ROUTE_HARD_CAP,
  buildQuestionPlan, resolveEligibleQuestionsV2, runGoldenPersonaPipeline, validateAnswerSemantics, validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";
import { evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules.ts";

const NEW_QUESTIONS = ["q2_conversion_interest_to_action", "q2_operations_information_base", "q2_operations_automation_adoption"];
const REGATED = ["q2_local_discovery", "q2_professional_authority_signals", "q2_reputation_flow", "q2_ecommerce_acquisition_dependency", "q2_ecommerce_checkout_friction"];
const question = (id: string) => QUESTION_BANK_V2.find((item) => item.id === id)!;
const isDirect = (id: string, dimension: string) => (EVIDENCE_MAPPING[id]?.dimensions as readonly string[] | undefined)?.includes(dimension) && (EVIDENCE_DIRECTNESS[id]?.[dimension as never] ?? EVIDENCE_MAPPING[id]!.semanticRole) === "direct";
const nativelyEligible = (id: string, answers: Record<string, unknown>) => {
  const resolved = resolveEligibleQuestionsV2(answers as never, QUESTION_BANK_V2);
  const item = question(id);
  return item.appliesWhen ? evaluateRuleV2(item.appliesWhen, resolved.activeAnswers, resolved.context) : !item.materialAppliesWhen;
};

test("08D.1/08E.2 budget contract: base cap 18, material extension 20, hard cap 24", () => {
  assert.equal(ROUTE_HARD_CAP, 24);
  assert.deepEqual(ROUTE_BANDS, { base: 18, materialExtension: 20, hardCap: 24 });
  assert.equal(DEFAULT_ROUTE_BUDGET_V1.hardMax, 24);
  assert.equal(DEFAULT_ROUTE_BUDGET_V1.materialEvidenceReserve, 6, "every slot past the base route is material evidence");
  assert.equal(DEFAULT_ROUTE_BUDGET_V1.targetMax, 16, "the normal selection target is unchanged; 24 is not a target");
  assert.deepEqual(MATERIAL_EVIDENCE_TARGET, { friction: 2, goal: 1, prerequisite: 1, capacity_gate: 1 });
});

test("new questions are justified evidence: valid, direct, semantically declared and documented for help", () => {
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(validateQuestionBankV2(QUESTION_BANK_V2), []);
  assert.deepEqual(validateAnswerSemantics(), []);
  const expected: Record<string, string> = { q2_conversion_interest_to_action: "conversion_access", q2_operations_information_base: "digital_readiness", q2_operations_automation_adoption: "digital_readiness" };
  for (const id of NEW_QUESTIONS) {
    assert.deepEqual(EVIDENCE_MAPPING[id]?.dimensions, [expected[id]], id);
    assert.ok(isDirect(id, expected[id]!), `${id} is direct evidence`);
    assert.ok(ANSWER_SEMANTICS[id], `${id} declares answer semantics`);
    assert.ok(question(id).options.some((option) => option.kind === "unknown"), `${id} allows an honest unknown`);
  }
  for (const id of [...NEW_QUESTIONS, ...REGATED]) assert.ok(question(id).helpIntent?.understand && question(id).helpIntent?.distinction, `${id} records helpIntent`);
});

test("gates: transactional ecommerce questions need customers; material-only scopes never enter the base route", () => {
  const ideaEcommerce = { q2_entity: "project", q2_has_customers: "no", q2_delivery: "online_checkout" };
  const operatingEcommerce = { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "online_checkout" };
  for (const id of ["q2_ecommerce_traffic_sources", "q2_ecommerce_acquisition_dependency", "q2_ecommerce_checkout_friction"]) {
    assert.equal(resolveEligibleQuestionsV2(ideaEcommerce, QUESTION_BANK_V2).eligibleQuestionIds.includes(id), false, `${id} without customers`);
    assert.equal(resolveEligibleQuestionsV2(operatingEcommerce, QUESTION_BANK_V2).eligibleQuestionIds.includes(id), true, `${id} with customers`);
  }
  const creator = (friction: string) => ({ q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "audience_content", q2_monetization: "audience", q2_friction: friction });
  const cases = [
    { id: "q2_professional_authority_signals", trust: creator("trust"), other: creator("visibility") },
    { id: "q2_reputation_flow", trust: creator("trust"), other: creator("visibility") },
    { id: "q2_conversion_interest_to_action", trust: creator("conversion"), other: creator("visibility") },
    { id: "q2_local_discovery", trust: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "travels", q2_friction: "visibility" }, other: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "travels", q2_friction: "trust" } },
  ];
  for (const item of cases) {
    assert.equal(resolveEligibleQuestionsV2(item.trust, QUESTION_BANK_V2).eligibleQuestionIds.includes(item.id), true, `${item.id} eligible when its dimension is declared`);
    assert.equal(nativelyEligible(item.id, item.trust), false, `${item.id} is material-only there`);
    // 08E.1: trust and local-discovery scopes describe where the question applies; the planner's material
    // need (declared or prerequisite) decides when. Outside a need they stay material-only, never base.
    // 08E.3: the conversion scope also describes applicability only (e.g. goal stop_losing while starting).
    assert.equal(nativelyEligible(item.id, item.other), false, `${item.id} never native otherwise`);
  }
  assert.equal(resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_friction: "conversion" }, QUESTION_BANK_V2).eligibleQuestionIds.includes("q2_conversion_interest_to_action"), false, "appointments already observe lead-to-booking");
});

test("material needs follow declared goal/friction and close once observed", () => {
  const cases = [
    { answers: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "b2b_pipeline", q2_friction: "conversion" }, dimension: "conversion_access", source: "friction", target: 2 },
    { answers: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "travels", q2_goal: "be_found" }, dimension: "discovery", source: "goal", target: 1 },
    { answers: { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "solo_practice", q2_friction: "operations" }, dimension: "digital_readiness", source: "friction", target: 2 },
  ] as const;
  for (const item of cases) {
    const need = buildQuestionPlan({ answers: item.answers, bank: QUESTION_BANK_V2 }).materialEvidence.find((entry) => entry.dimension === item.dimension);
    assert.deepEqual(need && { source: need.source, target: need.target, observed: need.observed }, { source: item.source, target: item.target, observed: 0 }, item.dimension);
  }
  assert.deepEqual(buildQuestionPlan({ answers: {}, bank: QUESTION_BANK_V2 }).materialEvidence, [], "no declaration, no need");
});

test("golden routes: no material routing hole, material-only questions only in the tail, never past the hard cap", () => {
  for (const persona of GOLDEN_PERSONAS) {
    const answers: Record<string, unknown> = { ...persona.answers, ...persona.preexistingAnswers };
    for (let batch = 0; batch < ROUTE_HARD_CAP; batch += 1) {
      const plan = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 });
      const fresh = plan.selectedQuestionIds.filter((id) => answers[id] === undefined);
      // Within one plan, a question eligible only via materialAppliesWhen follows every natively eligible selection.
      const firstMaterialOnly = fresh.findIndex((id) => !nativelyEligible(id, answers));
      if (firstMaterialOnly >= 0) assert.ok(fresh.slice(firstMaterialOnly).every((id) => !nativelyEligible(id, answers) || plan.trace.find((entry) => entry.questionId === id)?.materialEvidence), `${persona.id}: material-only question displaced base evidence`);
      assert.ok(plan.routeLength <= ROUTE_HARD_CAP, `${persona.id}: hard cap`);
      if (fresh.length === 0) break;
      for (const id of fresh) answers[id] = persona.answerProfile[id];
    }
    const final = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 });
    const resolved = resolveEligibleQuestionsV2(answers as never, QUESTION_BANK_V2);
    for (const need of final.materialEvidence.filter((entry) => entry.observed === 0 && entry.source !== "prerequisite")) {
      const available = resolved.eligibleQuestionIds.filter((id) => answers[id] === undefined && isDirect(id, need.dimension));
      assert.deepEqual(available, [], `${persona.id}: declared ${need.dimension} left unmeasured while ${available} was available`);
    }
    assert.deepEqual(runGoldenPersonaPipeline(persona).unansweredSelectedQuestionIds, []);
  }
});
