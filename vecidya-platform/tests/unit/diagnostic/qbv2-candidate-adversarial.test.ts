import test from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3, type AdversarialCaseV3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import {
  BANK, DIRECT_SOURCES, PENDING_IDS, PRE_COMMERCIAL_KEYS, QUESTION_BY_ID, SUPPORTING_SOURCES, LATER_REVIEW_IDS, CONTEXT_ONLY_IDS,
  commercialItemIds, dimensionOf, runChain, solutionIds, structuralViolations, without,
} from "./qbv2-candidate-qa-harness";
import { resolveCandidateLicenseFitV3, matchCandidateCommercialOfferingsV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { DEFAULT_CONTRADICTION_RULES_V1, validateContradictionRulesV1 } from "../../../app/features/diagnostic/qbv2-contradictions";
import { SCORING_MODEL } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import { narrativeBlocks } from "../../../app/features/diagnostic/qbv2-narrative";
import { ROUTE_BANDS, ROUTE_HARD_CAP, ADAPTIVE_PLANNER_VERSION } from "../../../app/features/diagnostic/qbv2-planner";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION } from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-B explicit adversarial QA. Attempts to falsify contracts certified by R3–R7-A; never tunes
 * calibration, never snapshots percentages. Any failure here is a finding to triage (see TESTING.md R7-B):
 * an implementation violation of an already-certified contract BLOCKS R7-B and is owned by its phase.
 */

const byId = (id: string) => ADVERSARIAL_CASES_V3.find((c) => c.id === id)!;
const run = (c: AdversarialCaseV3) => runChain(c.answers);
const NEGATIVE = new Set(["missing", "weak", "partial", "dependency"]);
const CAPABILITY_FACTS = new Set(["strength", "partial", "weakness"]);
const AUTOMATION = new Set(["operational_automation", "follow_up_automation"]);

function readingOf(result: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId): string | undefined {
  return result.semanticFacts.facts.find((f) => f.dimension === dimension && CAPABILITY_FACTS.has(f.type))?.type;
}
function recFor(result: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId) {
  return result.recommendations.items.find((r) => r.dimension === dimension);
}
function solutionFor(result: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId) {
  const rec = recFor(result, dimension);
  return rec ? result.solutions.find((s) => s.recommendationId === rec.id)!.solution?.id ?? null : undefined;
}
function stateOf(result: CandidateCommercialBoundaryV3, questionId: string): string | undefined {
  for (const d of result.scoring.dimensions) for (const e of d.evidence) if (e.questionId === questionId) return e.state;
  return undefined;
}
const CANONICAL_FINAL = new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c).finalAnswers]));
let allCases: { label: string; result: CandidateCommercialBoundaryV3 }[] | undefined;
/** Adversarial + near-miss (injected) and the 25 R7-A canonical routes, computed once per file. */
const ALL_CASES = () => (allCases ??= [
  ...ADVERSARIAL_CASES_V3.map((c) => ({ label: c.id, result: run(c) })),
  ...NEAR_MISS_PAIRS_V3.map((c) => ({ label: c.id, result: runChain(c.answers) })),
  ...CANONICAL_CASES_V3.map((c) => ({ label: c.id, result: runChain(CANONICAL_FINAL.get(c.id)!) })),
]);

// --- Fixture integrity -------------------------------------------------------------------------------

test("R7-B: 20+ explicit candidate-native adversarial cases with unique ids", () => {
  const ids = ADVERSARIAL_CASES_V3.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (let n = 1; n <= 20; n += 1) assert.ok(ids.includes(`A${String(n).padStart(2, "0")}`), `missing A${n}`);
  assert.ok(NEAR_MISS_PAIRS_V3.length >= 8);
});

test("R7-B: every authored adversarial answer is a valid candidate option and structurally eligible (no FIXTURE_ERROR)", () => {
  for (const c of [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3]) {
    for (const [id, value] of Object.entries({ ...c.answers, ...("pollution" in c ? c.pollution : {}) })) {
      const q = QUESTION_BY_ID.get(id);
      assert.ok(q, `${c.id}: unknown question ${id}`);
      for (const item of Array.isArray(value) ? value : [value]) assert.ok(q!.options.some((o) => o.value === item), `${c.id}: invalid option ${id}=${item}`);
      assert.equal(Array.isArray(value), q!.type === "multi", `${c.id}: ${id} answer shape must match question type`);
    }
    const result = runChain(c.answers);
    const dropped = Object.keys(c.answers).filter((id) => result.activeAnswers[id] === undefined);
    assert.deepEqual(dropped, [], `${c.id}: authored answers must all be eligible`);
  }
});

test("R7-B: every adversarial case also routes interactively — no hard cap, duplicate ask, invalid answer, budget_blocked or legacy contradiction", () => {
  for (const c of [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3]) {
    const route = runCanonicalRouteV3({ id: c.id, description: c.purpose, answerScript: c.answers as Record<string, string | readonly string[]> });
    const asked = route.asked.map((a) => a.id);
    assert.equal(route.plan.completion.hardCapReached, false, `${c.id}: hard cap`);
    assert.notEqual(route.plan.evidenceSufficiency.terminalReason, "budget_blocked", `${c.id}: budget_blocked in an explicit adversarial case`);
    const routed = runChain(route.finalAnswers);
    assert.deepEqual(structuralViolations(routed, { route: { asked, plan: route.plan } }), [], `${c.id}: routed structural violations`);
    assert.deepEqual(structuralViolations(runChain(c.answers)), [], `${c.id}: injected structural violations`);
  }
});

// --- Explicit adversarial matrix (A01–A20) ----------------------------------------------------------

test("A01: strong public base stays a strength; the broken follow-up process stays visible", () => {
  const r = run(byId("A01"));
  for (const d of ["digital_foundation", "discovery", "trust_reputation"] as const) assert.equal(readingOf(r, d), "strength", `${d} must remain a strength`);
  assert.equal(readingOf(r, "relationship_recurrence"), "weakness");
  const rec = recFor(r, "relationship_recurrence");
  assert.ok(rec && rec.mode === "improve" && rec.sourceQuestionIds.includes("q2_followup_general_process"), "public strength must not hide the commercial-process weakness");
});

test("A02: weak public base, strong relationship — no CRM/follow-up intervention from the website gap", () => {
  const r = run(byId("A02"));
  assert.equal(readingOf(r, "digital_foundation"), "weakness");
  assert.equal(readingOf(r, "relationship_recurrence"), "strength");
  assert.equal(recFor(r, "relationship_recurrence"), undefined);
  assert.ok(!solutionIds(r).some((id) => ["crm_follow_up", "follow_up_automation"].includes(id)));
  assert.notEqual(r.commercial.licenseFit.recommendedLicense, "barrio");
});

test("A03: one direct weakness survives among strengths; recommendation stays evidence-specific", () => {
  const r = run(byId("A03"));
  assert.equal(readingOf(r, "conversion_access"), "weakness");
  for (const d of r.scoring.dimensions) if (d.id !== "conversion_access" && d.score !== null) assert.notEqual(readingOf(r, d.id), "weakness", `${d.id} must not become a weakness`);
  const rec = recFor(r, "conversion_access")!;
  assert.deepEqual(rec.sourceQuestionIds, ["q2_appointments_booking_friction"]);
  assert.equal(solutionFor(r, "conversion_access"), "online_booking");
});

test("A04: a genuine strength survives broad weakness — the system never flattens everything into weak", () => {
  const r = run(byId("A04"));
  assert.equal(readingOf(r, "discovery"), "strength");
  assert.ok(r.narrative.strengths.some((b) => b.dimension === "discovery"));
  assert.ok(r.semanticFacts.facts.filter((f) => f.type === "weakness").length >= 2);
});

test("A05: mostly-unknown — unknown never becomes missing/weakness, no fabricated intervention, no forced license", () => {
  const r = run(byId("A05"));
  for (const d of r.scoring.dimensions) for (const e of d.evidence) assert.equal(e.state, "uncertainty", `${e.questionId}: unknown must stay uncertainty`);
  assert.ok(!r.semanticFacts.facts.some((f) => CAPABILITY_FACTS.has(f.type)));
  assert.ok(!r.recommendations.items.some((rec) => rec.mode === "improve"));
  assert.deepEqual(solutionIds(r), []);
  assert.deepEqual(commercialItemIds(r), []);
  assert.equal(r.commercial.licenseFit.recommendedLicense, null);
});

test("A06: N/A-heavy — neutrality, no zero-fill, no negative fact, no sale generated from N/A", () => {
  for (const id of ["A06", "A06b"]) {
    const c = byId(id);
    const r = run(c);
    const naIds = Object.entries(c.answers).filter(([q, v]) => QUESTION_BY_ID.get(q)!.options.find((o) => o.value === v)?.kind === "not_applicable").map(([q]) => q);
    assert.ok(naIds.length >= 2, `${id}: fixture must be N/A-heavy`);
    for (const q of naIds) {
      assert.equal(stateOf(r, q), "not_applicable");
      for (const f of r.semanticFacts.facts.filter((f) => f.type === "weakness")) assert.ok(!(f.signals?.negative ?? []).some((s) => s.questionId === q), `${id}: N/A ${q} became a weakness signal`);
      for (const rec of r.recommendations.items) if (rec.sourceQuestionIds.includes(q)) assert.notEqual(rec.mode, "improve", `${id}: improve built on N/A ${q}`);
    }
    for (const d of r.scoring.dimensions) {
      const direct = d.evidence.filter((e) => e.directness === "direct");
      if (direct.length > 0 && direct.every((e) => e.state === "not_applicable")) assert.equal(d.score, null, `${id}/${d.id}: N/A-only must never zero-fill`);
    }
  }
});

test("A07 + §41: declared friction against healthy direct evidence never manufactures a weakness or an improve intervention", () => {
  const target: Record<string, DigitalDimensionId> = { A07: "relationship_recurrence", A07b: "trust_reputation", A07c: "conversion_access", A07d: "digital_readiness", A07e: "discovery" };
  for (const [id, dimension] of Object.entries(target)) {
    const r = run(byId(id));
    assert.notEqual(readingOf(r, dimension), "weakness", `${id}: healthy ${dimension} downgraded`);
    const rec = recFor(r, dimension);
    if (rec) {
      assert.equal(rec.mode, "verify", `${id}: at most verify against healthy evidence`);
      assert.equal(solutionFor(r, dimension), null);
    }
    assert.ok(r.context.primaryFriction.status === "resolved", `${id}: declared friction stays context`);
  }
});

test("A08: automate goal with an undefined process — no maturity created, no automation, goal never creates a license", () => {
  const r = run(byId("A08"));
  assert.equal(readingOf(r, "digital_readiness"), "weakness");
  assert.ok(!solutionIds(r).some((id) => AUTOMATION.has(id)), "automation selected without a defined process");
  assert.ok(r.commercial.licenseFit.recommendedLicense !== "barrio" && r.commercial.licenseFit.recommendedLicense !== "ciudad");
  const organize = runChain({ ...byId("A08").answers, q2_goal: "organize" });
  assert.equal(organize.commercial.licenseFit.recommendedLicense, r.commercial.licenseFit.recommendedLicense, "goal must not create/remove the license");
});

test("A08b [R6-C contract]: an unrelated Clarity strength must not turn an informal process into an automation sale", () => {
  const r = run(byId("A08b"));
  assert.equal(stateOf(r, "q2_process_systemization"), "weak");
  const readiness = recFor(r, "digital_readiness")!;
  assert.ok(readiness.sourceQuestionIds.includes("q2_process_systemization"));
  assert.ok(!AUTOMATION.has(solutionFor(r, "digital_readiness") ?? ""), `R6-C "automation requires a defined process": informal process selected ${solutionFor(r, "digital_readiness")}`);
  assert.equal(r.commercial.licenseFit.recommendedLicense, run(byId("A08")).commercial.licenseFit.recommendedLicense, "a Clarity strength must not change the operational license fit");
});

test("A09: Discovery weakness stays localized — no SEO/Ads/social/local-listing inference", () => {
  const r = run(byId("A09"));
  assert.equal(readingOf(r, "discovery"), "weakness");
  assert.equal(solutionFor(r, "discovery"), null);
  for (const d of r.scoring.dimensions) if (d.id !== "discovery" && d.score !== null) assert.notEqual(readingOf(r, d.id), "weakness");
  for (const id of commercialItemIds(r)) assert.ok(!/seo|ads|social|listing|content/i.test(id));
});

test("A10: Measurement goal — applicable, null, unobservable, verify-only, no commercial item", () => {
  const r = run(byId("A10"));
  const m = dimensionOf(r, "measurement_optimization");
  assert.equal(m.applicability, "applicable");
  assert.equal(m.score, null);
  assert.equal(r.semanticFacts.facts.find((f) => f.dimension === "measurement_optimization" && f.type === "evidence_gap")?.gap?.kind, "unobservable_in_context");
  assert.ok(!r.semanticFacts.facts.some((f) => f.dimension === "measurement_optimization" && CAPABILITY_FACTS.has(f.type)), "no invented analytics weakness");
  const rec = recFor(r, "measurement_optimization");
  if (rec) { assert.equal(rec.mode, "verify"); assert.equal(solutionFor(r, "measurement_optimization"), null); }
  assert.deepEqual(commercialItemIds(r), []);
  assert.equal(r.commercial.licenseFit.recommendedLicense, null);
});

test("A11–A13: polluted raw answers disappear from activeAnswers and leave the complete result byte-identical", () => {
  for (const id of ["A11", "A12", "A13"]) {
    const c = byId(id);
    const clean = run(c);
    const polluted = runChain({ ...c.answers, ...c.pollution });
    for (const key of Object.keys(c.pollution!)) if (c.answers[key] === undefined) assert.equal(polluted.activeAnswers[key], undefined, `${id}: ${key} survived`);
    assert.deepEqual(polluted, clean, `${id}: pollution changed the candidate result`);
  }
  const prelaunch = run(byId("A11"));
  assert.equal(prelaunch.narrative.lifecycle, "prelaunch");
  assert.ok(!prelaunch.scoring.dimensions.some((d) => d.evidence.some((e) => e.questionId !== "q2_presence_digital_base")), "no operational evidence survives prelaunch");
  assert.equal(prelaunch.commercial.licenseFit.recommendedLicense, null);
});

test("A14: hybrid retail + ecommerce — conflicting component evidence stays traceable, neither erases the other", () => {
  const c = byId("A14");
  const r = run(c);
  const foundation = dimensionOf(r, "digital_foundation");
  assert.deepEqual(foundation.evidence.map((e) => e.questionId).sort(), ["q2_ecommerce_product_discovery", "q2_local_presence_consistency"]);
  const onlyRetail = dimensionOf(runChain(without(c.answers, "q2_ecommerce_product_discovery")), "digital_foundation").score!;
  const onlyEcommerce = dimensionOf(runChain(without(c.answers, "q2_local_presence_consistency")), "digital_foundation").score!;
  assert.ok(foundation.score! > Math.min(onlyRetail, onlyEcommerce) && foundation.score! < Math.max(onlyRetail, onlyEcommerce), "hybrid reading must sit strictly between its components");
  assert.notEqual(readingOf(r, "digital_foundation"), "strength");
  assert.notEqual(readingOf(r, "digital_foundation"), "weakness");
  const signals = r.semanticFacts.facts.flatMap((f) => (f.dimension === "digital_foundation" ? [...(f.signals?.positive ?? []), ...(f.signals?.negative ?? [])] : [])).map((s) => s.questionId);
  assert.ok(signals.includes("q2_ecommerce_product_discovery") && signals.includes("q2_local_presence_consistency"));
});

test("A15: hybrid professional + appointments — intake weakness and booking strength stay in their own dimensions", () => {
  const r = run(byId("A15"));
  assert.deepEqual(dimensionOf(r, "clarity_positioning").evidence.map((e) => e.questionId), ["q2_professional_intake_flow"]);
  assert.deepEqual(dimensionOf(r, "conversion_access").evidence.map((e) => e.questionId), ["q2_appointments_booking_friction"]);
  assert.equal(readingOf(r, "clarity_positioning"), "weakness");
  assert.equal(readingOf(r, "conversion_access"), "strength");
  assert.equal(recFor(r, "conversion_access"), undefined);
});

test("A16: direct weak + supporting strong — supporting refines within its cap, never overturns the direct base", () => {
  for (const id of ["A16", "A16b"]) {
    const c = byId(id);
    const r = run(c);
    const supportingId = id === "A16" ? "q2_operations_handoffs" : "q2_b2b_status_visibility";
    const readiness = dimensionOf(r, "digital_readiness");
    const directOnly = dimensionOf(runChain(without(c.answers, supportingId)), "digital_readiness");
    assert.equal(readiness.explainability.basis, "direct_and_supporting");
    assert.ok(readiness.score! >= directOnly.score!, `${id}: a stronger supporting signal must not lower the score`);
    const share = SCORING_MODEL.supportingCapRatio / (1 + SCORING_MODEL.supportingCapRatio);
    assert.ok(readiness.score! - directOnly.score! <= Math.ceil(100 * share * (0.75 - 0.25)) + 1, `${id}: supporting moved the score past its frozen cap`);
    assert.notEqual(readingOf(r, "digital_readiness"), "strength", `${id}: supporting must not create a strength over a weak direct base`);
  }
});

test("A17: direct unknown + supporting strong — supporting alone never creates a percentage", () => {
  for (const id of ["A17", "A17b"]) {
    const r = run(byId(id));
    const readiness = dimensionOf(r, "digital_readiness");
    assert.equal(readiness.score, null, `${id}: supporting-only must stay null`);
    assert.ok(!r.semanticFacts.facts.some((f) => f.dimension === "digital_readiness" && CAPABILITY_FACTS.has(f.type)));
    const rec = recFor(r, "digital_readiness");
    if (rec) { assert.equal(rec.mode, "verify"); assert.equal(solutionFor(r, "digital_readiness"), null); }
  }
});

test("A18: organization + website gap only — Web & Conversión, recommendedLicense = null, entity never selects Cuadra", () => {
  const c = byId("A18");
  const r = run(c);
  assert.ok(r.commercial.now.services.some((s) => s.name === "Web & Conversión"));
  assert.equal(r.commercial.licenseFit.recommendedLicense, null);
  const business = runChain({ ...c.answers, q2_entity: "business" });
  assert.equal(business.commercial.licenseFit.recommendedLicense, null);
  assert.deepEqual(solutionIds(business), solutionIds(r));
});

test("A19: work-organization + recurring follow-up need — strongest justified recurring contract, no duplicate Cuadra sale, no Ciudad", () => {
  const r = run(byId("A19"));
  assert.deepEqual(solutionIds(r).sort(), ["crm_follow_up", "work_organization"]);
  assert.equal(r.commercial.licenseFit.recommendedLicense, "barrio");
  assert.ok(!(r.commercial.licenseFit.recommendedLicense === "cuadra" && commercialItemIds(r).includes("business_development_organization")));
  for (const spoof of [{ displayScore: 5, publicLabel: "MAL" }, { displayScore: 99, publicLabel: "BIEN" }] as const) {
    const spoofed = { ...r, overall: { ...r.overall, publicLabel: spoof.publicLabel, index: { ...r.overall.index, displayScore: spoof.displayScore } } } as CandidateCommercialBoundaryV3;
    assert.equal(resolveCandidateLicenseFitV3(spoofed, undefined, undefined).recommendedLicense, "barrio", "license order must not follow Digital Health");
  }
});

test("A20: Barrio-capable diagnostic — clarification decides only the commercial axis; not_sure stays unconfirmed [R6-D contract]", () => {
  const answers = byId("A20").answers;
  const unclarified = runChain(answers);
  assert.equal(unclarified.commercial.licenseFit.recommendedLicense, "barrio");
  assert.equal(unclarified.commercial.licenseFit.confidence, "medium");
  assert.equal(runChain(answers, "single_process").commercial.licenseFit.recommendedLicense, "barrio");
  assert.equal(runChain(answers, "multiple_coordinated_processes").commercial.licenseFit.recommendedLicense, "ciudad");
  for (const clarification of ["single_process", "multiple_coordinated_processes", "not_sure"] as const) {
    const clarified = runChain(answers, clarification);
    for (const key of PRE_COMMERCIAL_KEYS) assert.deepEqual(clarified[key], unclarified[key], `${clarification}: ${key} must stay byte-identical`);
  }
  const notSure = runChain(answers, "not_sure").commercial.licenseFit;
  assert.equal(notSure.recommendedLicense, "barrio");
  // R6-C.1/R6-D.2 triage (TEST_ASSUMPTION_ERROR): R7-B first asserted "same confidence as unclarified"; the
  // frozen clarification truth table fixes explicit uncertainty at `to_confirm` (stricter, never `high`).
  assert.equal(notSure.confidence, "to_confirm", "not_sure must not raise confidence as if single_process were confirmed");
  assert.ok(!notSure.evidence.some((ref) => ref.questionId === "commercial_process_scope"), "not_sure must not produce one-process evidence");
  assert.deepEqual(notSure.unresolvedSignals, unclarified.commercial.licenseFit.unresolvedSignals, "not_sure must keep the multiprocess question unresolved");
});

// --- Near misses (§7) --------------------------------------------------------------------------------

test("Near misses: sibling/supporting sources moving in opposite directions both stay traceable", () => {
  for (const pair of NEAR_MISS_PAIRS_V3) {
    const r = runChain(pair.answers);
    const first = QUESTION_BY_ID.get(pair.first)!;
    const second = QUESTION_BY_ID.get(pair.second)!;
    const firstDim = first.evidenceV3!.dimensions[0]!.dimension;
    const secondDim = second.evidenceV3!.dimensions[0]!.dimension;
    assert.ok(dimensionOf(r, firstDim).evidence.some((e) => e.questionId === pair.first), `${pair.id}: ${pair.first} erased`);
    assert.ok(dimensionOf(r, secondDim).evidence.some((e) => e.questionId === pair.second), `${pair.id}: ${pair.second} erased`);
    if (firstDim === secondDim && second.evidenceV3!.dimensions[0]!.directness === "direct" && first.evidenceV3!.dimensions[0]!.directness === "direct") {
      const score = dimensionOf(r, firstDim).score!;
      const a = dimensionOf(runChain(without(pair.answers, pair.second)), firstDim).score!;
      const b = dimensionOf(runChain(without(pair.answers, pair.first)), firstDim).score!;
      assert.ok(score > Math.min(a, b) && score < Math.max(a, b), `${pair.id}: one sibling erased the other`);
      assert.ok(!["strength", "weakness"].includes(readingOf(r, firstDim) ?? ""), `${pair.id}: mixed siblings collapsed into one-sided reading`);
    } else {
      for (const [dim, own] of [[firstDim, pair.first], [secondDim, pair.second]] as const) {
        for (const e of dimensionOf(r, dim).evidence) assert.ok(QUESTION_BY_ID.get(e.questionId)!.evidenceV3!.dimensions.some((d) => d.dimension === dim), `${pair.id}: ${e.questionId} leaked into ${dim} via ${own}`);
      }
    }
  }
});

// --- Contracts reasserted under hostile combinations (§37–§46, §30) ----------------------------------

test("[R6-C/R6-D contract] supporting evidence alone never selects a solution or a license (sole-authority audit)", () => {
  const violations: string[] = [];
  for (const { label, result } of ALL_CASES()) {
    result.recommendations.items.forEach((rec, index) => {
      const solution = result.solutions[index]!.solution;
      if (!solution) return;
      const negativeSources = rec.sourceQuestionIds.filter((id) => NEGATIVE.has(stateOf(result, id) ?? ""));
      const directNegative = negativeSources.filter((id) => DIRECT_SOURCES.some((q) => q.id === id));
      if (negativeSources.length > 0 && directNegative.length === 0) violations.push(`${label}: ${rec.dimension} ${solution.id} from supporting-only ${negativeSources.join(",")} (license ${result.commercial.licenseFit.recommendedLicense})`);
    });
  }
  assert.deepEqual(violations, [], `supporting became the sole authority:\n${violations.join("\n")}`);
});

test("[R6-D contract] work_organization/Cuadra requires below-established direct Readiness evidence", () => {
  // R6-C.1 triage (TEST_ASSUMPTION_ERROR): R7-B first required weak/missing only; the frozen direct-basis rule
  // accepts any DIRECT Readiness source below established (weak, partial or missing — e.g. C23 `partial`).
  const violations: string[] = [];
  for (const { label, result } of ALL_CASES()) {
    if (!solutionIds(result).includes("work_organization")) continue;
    const weakDirect = ["q2_process_systemization", "q2_operations_information_base"].some((id) => NEGATIVE.has(stateOf(result, id) ?? ""));
    if (!weakDirect) violations.push(`${label}: work_organization (license ${result.commercial.licenseFit.recommendedLicense}) without below-established direct Readiness evidence`);
  }
  assert.deepEqual(violations, [], violations.join("\n"));
});

test("[R6-C contract] automation is never selected while the direct process-systemization evidence says the process is informal", () => {
  const violations: string[] = [];
  for (const { label, result } of ALL_CASES()) {
    if (stateOf(result, "q2_process_systemization") !== "weak") continue;
    const automation = solutionIds(result).filter((id) => AUTOMATION.has(id));
    if (automation.length > 0) violations.push(`${label}: ${automation.join(",")} with q2_process_systemization=informal (license ${result.commercial.licenseFit.recommendedLicense})`);
  }
  assert.deepEqual(violations, [], violations.join("\n"));
});

test("§50: downstream invention audit — capability claim / recommendation / solution / commercial item / license, each needs its upstream basis", () => {
  const counts = { capabilityClaimWithoutFact: 0, recommendationWithoutPriority: 0, solutionWithoutSupportedRecommendation: 0, commercialItemWithoutSolution: 0, licenseWithoutRecurringNeed: 0 };
  const detail: string[] = [];
  for (const { label, result } of ALL_CASES()) {
    for (const v of structuralViolations(result)) {
      if (/capability (status|narrative)/.test(v)) counts.capabilityClaimWithoutFact += 1;
      if (/recommendation without matching priority|recommendation ranks/.test(v)) counts.recommendationWithoutPriority += 1;
      if (/solution misaligned|verify recommendation/.test(v)) counts.solutionWithoutSupportedRecommendation += 1;
      if (/commercial item/.test(v)) counts.commercialItemWithoutSolution += 1;
    }
    // A recurring need is evidence-backed only when the license-bearing solution's own recommendation rests on
    // weak/missing/partial DIRECT evidence and, for automation, the process is not declared informal.
    const license = result.commercial.licenseFit.recommendedLicense;
    if (license === "cuadra" || license === "barrio") {
      const backing = result.recommendations.items.filter((rec, i) => {
        const id = result.solutions[i]!.solution?.id;
        if (!id) return false;
        const licenseSolution = license === "cuadra" ? id === "work_organization" : ["crm_follow_up", "follow_up_automation", "online_booking", "operational_automation"].includes(id);
        const directNegative = rec.sourceQuestionIds.some((q) => DIRECT_SOURCES.some((d) => d.id === q) && NEGATIVE.has(stateOf(result, q) ?? ""));
        const automationOnInformal = AUTOMATION.has(id) && stateOf(result, "q2_process_systemization") === "weak";
        return licenseSolution && directNegative && !automationOnInformal;
      });
      if (backing.length === 0) { counts.licenseWithoutRecurringNeed += 1; detail.push(`${label}: ${license}`); }
    }
  }
  console.log(`R7B_DOWNSTREAM_INVENTION ${JSON.stringify({ ...counts, licenseWithoutRecurringNeedCases: detail })}`);
  assert.deepEqual(counts, { capabilityClaimWithoutFact: 0, recommendationWithoutPriority: 0, solutionWithoutSupportedRecommendation: 0, commercialItemWithoutSolution: 0, licenseWithoutRecurringNeed: 0 }, `license without an evidence-backed recurring need: ${detail.join(", ")}`);
});

test("R8 observation manifest (OBSERVATIONAL — NOT FROZEN): reproducible mutation pairs for calibration", () => {
  const pairs: readonly { caseId: string; answers: AnswersV2; mutation: AnswersV2; dimension: DigitalDimensionId; expectation: string; note: string }[] = [
    { caseId: "A03", answers: byId("A03").answers, mutation: { q2_appointments_booking_friction: "rarely" }, dimension: "conversion_access", expectation: "weak→established must not lower the score", note: "single established direct source caps every dimension at 75 (no V3 option maps to `strong`)" },
    { caseId: "A04", answers: byId("A04").answers, mutation: { q2_reputation_flow: "strong" }, dimension: "trust_reputation", expectation: "removing the weakness removes reputation_reviews", note: "overall band moves with one source among four weak ones" },
    { caseId: "A08", answers: byId("A08").answers, mutation: { q2_process_systemization: "defined" }, dimension: "digital_readiness", expectation: "removing the weakness removes Cuadra", note: "overall confidence stays `low` with three established direct sources" },
    { caseId: "A16", answers: byId("A16").answers, mutation: { q2_operations_handoffs: "incomplete" }, dimension: "digital_readiness", expectation: "supporting refines within its cap", note: "supporting refinement can move the reading band (see C24)" },
    { caseId: "C24", answers: CANONICAL_FINAL.get("C24")!, mutation: { q2_b2b_status_visibility: "clear" }, dimension: "digital_readiness", expectation: "supporting partial vs established", note: "a supporting partial alone moves Readiness 75→67 (`partial`), which then drives a priority — numeric side for R8, solution/license side is finding F2" },
    { caseId: "A14", answers: byId("A14").answers, mutation: { q2_local_presence_consistency: "consistent" }, dimension: "digital_foundation", expectation: "weak hybrid component removed", note: "hybrid sibling averaging (weak + established → 50 `partial`)" },
    { caseId: "A07", answers: byId("A07").answers, mutation: { q2_followup_general_process: "sometimes_lost" }, dimension: "relationship_recurrence", expectation: "healthy→weak creates a real weakness", note: "BIEN/REGULAR transition from a single source" },
    { caseId: "A10", answers: byId("A10").answers, mutation: { q2_goal: "organize" }, dimension: "measurement_optimization", expectation: "goal never changes score", note: "Measurement stays applicable/null for every goal — coverage denominator excludes it" },
  ];
  const manifest = pairs.map((p) => {
    const before = runChain(p.answers);
    const after = runChain({ ...p.answers, ...p.mutation });
    const d = (r: CandidateCommercialBoundaryV3) => dimensionOf(r, p.dimension);
    return {
      label: "OBSERVATIONAL — NOT FROZEN", case: p.caseId, mutation: p.mutation, dimension: p.dimension,
      beforeScore: d(before).score, afterScore: d(after).score, beforeConfidence: d(before).confidence.level, afterConfidence: d(after).confidence.level,
      beforeBand: before.overall.publicLabel, afterBand: after.overall.publicLabel, beforeOverall: before.overall.index.displayScore, afterOverall: after.overall.index.displayScore,
      beforeOverallConfidence: before.overall.confidence.level, afterOverallConfidence: after.overall.confidence.level,
      semanticExpectation: p.expectation, calibrationNote: p.note,
    };
  });
  console.log(`R7B_R8_MANIFEST ${JSON.stringify(manifest)}`);
  // Records only; never asserts that any number is correct (R8 owns calibration).
  assert.equal(manifest.length, pairs.length);
});

test("§41/§42: improve is only ever built on below-established evidence; goal changes rank, never truth", () => {
  for (const { label, result } of ALL_CASES()) {
    for (const rec of result.recommendations.items.filter((r) => r.mode === "improve")) {
      assert.ok(rec.sourceQuestionIds.some((id) => NEGATIVE.has(stateOf(result, id) ?? "")), `${label}: improve ${rec.dimension} built on healthy evidence`);
    }
  }
  const weak = run(byId("A09"));
  for (const goal of ["trust", "organize", "measure", "explain"]) {
    const regoaled = runChain({ ...byId("A09").answers, q2_goal: goal });
    assert.equal(readingOf(regoaled, "discovery"), readingOf(weak, "discovery"), `goal ${goal} changed Discovery truth`);
  }
});

test("§37/§40: hostile commercial combinations — Digital Health, website-only, entity, goal, Discovery, verify, uncertainty", () => {
  for (const { label, result } of ALL_CASES()) {
    // Digital Health never chooses the license.
    for (const [displayScore, publicLabel] of [[1, "MAL"], [60, "REGULAR"], [100, "BIEN"]] as const) {
      const spoofed = { ...result, overall: { ...result.overall, publicLabel, index: { ...result.overall.index, displayScore, rawScore: displayScore } } } as CandidateCommercialBoundaryV3;
      const fit = resolveCandidateLicenseFitV3(spoofed, undefined, undefined);
      assert.deepEqual(fit, result.commercial.licenseFit, `${label}: Digital Health changed license fit`);
      assert.deepEqual(matchCandidateCommercialOfferingsV3(spoofed, fit), matchCandidateCommercialOfferingsV3(result, result.commercial.licenseFit), `${label}: Digital Health changed offerings`);
    }
    // Discovery never produces a channel offering.
    const discovery = recFor(result, "discovery");
    if (discovery && result.narrative.lifecycle === "live") assert.equal(solutionFor(result, "discovery"), null, `${label}: Discovery produced a channel`);
    // website-only never forces a license.
    if (solutionIds(result).length > 0 && solutionIds(result).every((id) => id === "website")) assert.equal(result.commercial.licenseFit.recommendedLicense, null, `${label}: website-only forced a license`);
    // Unknown-heavy never reaches Barrio/Ciudad from uncertainty alone.
    const evidence = result.scoring.dimensions.flatMap((d) => d.evidence);
    if (evidence.length > 0 && evidence.every((e) => e.state === "uncertainty" || e.state === "not_applicable")) assert.equal(result.commercial.licenseFit.recommendedLicense, null, `${label}: license from uncertainty`);
  }
  // Organization label alone / goal alone never create a license.
  const sparse: AnswersV2 = { q2_entity: "organization", q2_monetization: "mission", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: ["other"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_sector: "community_social" };
  for (const goal of ["be_found", "opportunities", "explain", "trust", "stop_losing", "organize", "automate", "measure", "other", "unsure"]) {
    assert.equal(runChain({ ...sparse, q2_goal: goal }).commercial.licenseFit.recommendedLicense, null, `goal ${goal} alone forced a license`);
  }
});

test("§39: valid-looking raw answers for the 10 legacy-only commercial questions leave the candidate result identical", () => {
  const legacyOnly = ["q2_professional_followup_after_consult", "q2_ecommerce_cart_followup", "q2_appointments_booking_method", "q2_operations_process_ownership", "q2_followup_ownership", "q2_operations_automation_adoption", "q2_nonprofit_membership_lifecycle", "q2_retail_promotions", "q2_local_discovery", "q2_operations_manual_impact"];
  const noise: Record<string, string | readonly string[]> = {};
  for (const id of legacyOnly) {
    assert.equal(QUESTION_BY_ID.has(id), false, `${id} must stay absent from the candidate bank`);
    const legacy = QUESTION_BANK_V2.find((q) => q.id === id);
    assert.ok(legacy, `${id} must exist in the legacy bank`);
    noise[id] = legacy!.type === "multi" ? [legacy!.options[0]!.value] : legacy!.options[0]!.value;
  }
  for (const c of [...ADVERSARIAL_CASES_V3, ...CANONICAL_CASES_V3.map((k) => ({ id: k.id, answers: CANONICAL_FINAL.get(k.id)! }))]) {
    assert.deepEqual(runChain({ ...c.answers, ...noise }), runChain(c.answers), `${c.id}: legacy-only noise changed the result`);
  }
});

test("§45: narrative never overclaims on unknown / N/A / insufficient_context / unobservable dimensions", () => {
  for (const { label, result } of ALL_CASES()) {
    for (const d of result.scoring.dimensions) {
      const narrative = result.narrative.dimensions.find((n) => n.dimension === d.id)!;
      const neutral = d.score === null || d.applicability !== "applicable";
      if (!neutral) continue;
      assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(narrative.status), `${label}/${d.id}: neutral dimension reads as capability`);
      assert.ok(!result.semanticFacts.facts.some((f) => f.dimension === d.id && CAPABILITY_FACTS.has(f.type)), `${label}/${d.id}: neutral dimension has a capability fact`);
      assert.ok(!/\d\s*%/.test(narrative.interpretation.text), `${label}/${d.id}: percentage printed for a null score`);
    }
    for (const f of result.semanticFacts.facts.filter((f) => f.type === "weakness")) {
      assert.ok((f.signals?.negative ?? []).every((s) => NEGATIVE.has(s.state)), `${label}: weakness fact ${f.id} built on a neutral signal`);
    }
  }
});

test("§46: no generated narrative/recommendation/commercial string implies guaranteed outcomes", () => {
  // Narrow, documented copy patterns: guarantees, promised revenue, promised client counts, certain growth.
  const certainty = /garantiz|asegur(a|amos) (que|resultados)|aumentar[áa]n? (tus |sus )?(ventas|ingresos)|\d+\s*(nuevos\s+)?clientes|crecimiento (seguro|garantizado)|sin falta/i;
  for (const { label, result } of ALL_CASES()) {
    const strings = [
      ...narrativeBlocks(result.narrative).map((b) => b.text),
      ...result.recommendations.items.flatMap((r) => [r.title, r.whatToImprove, r.whyItMatters, r.expectedOutcome]),
      result.commercial.licenseFit.rationale, result.commercial.licenseFit.whyNotLower, result.commercial.licenseFit.whyNotHigher,
      ...[...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements].map((i) => i.rationale),
    ];
    for (const text of strings) assert.ok(!certainty.test(text), `${label}: certainty claim «${text}»`);
    for (const rec of result.recommendations.items) assert.ok(!/\d/.test(rec.expectedOutcome), `${label}: expected outcome must stay qualitative «${rec.expectedOutcome}»`);
  }
});

test("§30: legacy contradiction rules stay structurally unreachable against the candidate bank", () => {
  const flagged = new Set(validateContradictionRulesV1(DEFAULT_CONTRADICTION_RULES_V1, BANK).map((issue) => issue.ruleId));
  assert.equal(flagged.size, DEFAULT_CONTRADICTION_RULES_V1.length, "reachable legacy contradiction rules must remain 0");
});

test("Freeze: R3 38/21/15/2/0, R5 identity/budgets, runtime versions, candidate inactive", async () => {
  assert.equal(BANK.length, 38);
  assert.equal(BANK.filter((q) => q.evidenceMigration === "migrated").length, 21);
  assert.equal(CONTEXT_ONLY_IDS.length, 15);
  assert.equal(LATER_REVIEW_IDS.filter((id) => PENDING_IDS.has(id)).length, 2);
  assert.equal(BANK.filter((q) => q.evidenceMigration !== "migrated" && q.evidenceMigration !== "pending").length, 0);
  assert.equal(DIRECT_SOURCES.length, 19);
  assert.equal(SUPPORTING_SOURCES.length, 2);
  assert.equal(DIGITAL_DIMENSION_IDS.length, 8);
  assert.equal(CANDIDATE_PLANNER_IDENTITY_V3, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.deepEqual([ROUTE_BANDS.base, ROUTE_BANDS.materialExtension, ROUTE_HARD_CAP], [18, 20, 24]);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION], ["2.0", 1, 1, 1, 1, 2]);
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of ["buildCandidateCommercialBoundaryV3", "buildCandidateQuestionPlanV3", "REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3", "scoreCandidateContextualDimensionsV3"]) assert.equal(barrel[symbol], undefined, `${symbol} must not be barrel-exported`);
});
