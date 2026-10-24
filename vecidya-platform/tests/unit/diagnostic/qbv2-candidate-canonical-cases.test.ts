import test from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_CASE_IDENTITY_V3, runCanonicalRouteV3, type CanonicalCaseV3 } from "./qbv2-candidate-case-runner";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { producedContextFields } from "./qbv2-candidate-qa-harness";
import { buildCandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { narrativeBlocks } from "../../../app/features/diagnostic/qbv2-narrative";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-A canonical candidate case certification. Asserts only ASSERTED TRUTH (stable semantic
 * contracts), never calibration numbers. OBSERVED CALIBRATION (scores, bands, confidence) is reported for
 * R8, never frozen here as golden values — see the "Calibration observations" test at the end.
 */

const MIGRATED = BANK.filter((q) => q.evidenceMigration === "migrated");
const DIRECT_IDS = new Set(MIGRATED.filter((q) => q.evidenceV3!.dimensions.some((d) => d.directness === "direct")).map((q) => q.id));
const SUPPORTING_ONLY_IDS = new Set(MIGRATED.filter((q) => q.evidenceV3!.dimensions.some((d) => d.directness === "supporting") && !q.evidenceV3!.dimensions.some((d) => d.directness === "direct")).map((q) => q.id));
const PENDING_IDS = new Set(BANK.filter((q) => q.evidenceMigration === "pending").map((q) => q.id));

function runFullChain(caseDef: CanonicalCaseV3) {
  const route = runCanonicalRouteV3(caseDef);
  const result = buildCandidateCommercialBoundaryV3({ answers: route.finalAnswers });
  return { route, result };
}

test("R7-A: canonical case identity is a test-only label", () => {
  assert.equal(CANONICAL_CASE_IDENTITY_V3, "diag-v3-canonical-cases-v1");
});

test("R7-A: the interactive runner never falls back — a missing authored answer is a hard failure", () => {
  const incomplete: CanonicalCaseV3 = { id: "INCOMPLETE", description: "deliberately missing answers", answerScript: {} };
  assert.throws(() => runCanonicalRouteV3(incomplete), /has no authored answer/);
});

test("R7-A: 25 explicit candidate-native canonical cases exist", () => {
  assert.ok(CANONICAL_CASES_V3.length >= 20, `expected at least 20 cases, found ${CANONICAL_CASES_V3.length}`);
  assert.equal(new Set(CANONICAL_CASES_V3.map((c) => c.id)).size, CANONICAL_CASES_V3.length, "case IDs must be unique");
});

test("R7-A: every case routes to a clean terminal — no hard-cap hits, no budget_blocked", () => {
  for (const caseDef of CANONICAL_CASES_V3) {
    const { route } = runFullChain(caseDef);
    assert.equal(route.plan.completion.hardCapReached, false, `${caseDef.id}: must not hit the hard cap`);
    assert.notEqual(route.plan.evidenceSufficiency.terminalReason, "budget_blocked", `${caseDef.id}: must not terminate budget_blocked`);
  }
});

test("R7-A: 21/21 migrated, 19/19 direct, 2/2 supporting evidence sources are exercised across the canonical set", () => {
  const coverage = new Map<string, string[]>(MIGRATED.map((q) => [q.id, []]));
  for (const caseDef of CANONICAL_CASES_V3) {
    const { route } = runFullChain(caseDef);
    for (const id of coverage.keys()) if (route.finalAnswers[id] !== undefined) coverage.get(id)!.push(caseDef.id);
  }
  const missing = [...coverage.entries()].filter(([, cases]) => cases.length === 0).map(([id]) => id);
  assert.deepEqual(missing, [], `migrated questions never exercised: ${missing.join(", ")}`);
  assert.equal([...coverage.keys()].filter((id) => DIRECT_IDS.has(id)).every((id) => coverage.get(id)!.length > 0), true);
  assert.equal([...coverage.keys()].filter((id) => SUPPORTING_ONLY_IDS.has(id)).every((id) => coverage.get(id)!.length > 0), true);
  assert.equal(DIRECT_IDS.size, 19);
  assert.equal(SUPPORTING_ONLY_IDS.size, 2);
});

test("R7-A: stable semantic truths hold across every canonical case (never calibration)", () => {
  for (const caseDef of CANONICAL_CASES_V3) {
    const { route, result } = runFullChain(caseDef);
    const label = caseDef.id;

    // Recommendation authority: count/order must equal certified priorities.
    assert.deepEqual(result.recommendations.items.map((r) => r.rank), result.narrative.priorities.map((p) => p.rank), `${label}: recommendation order`);

    // not_applicable / insufficient_context must never read as a capability.
    for (const dim of result.narrative.dimensions) {
      const scored = result.scoring.dimensions.find((d) => d.id === dim.dimension)!;
      if (scored.applicability === "not_applicable" || scored.applicability === "insufficient_context") {
        assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(dim.status), `${label}/${dim.dimension}: ${scored.applicability} must never read as a capability`);
      }
      // Structural invariant only: null score never becomes a capability reading; numeric score stays in [0,100].
      if (scored.score === null) assert.ok(!["strong", "positive_signal", "partial", "weak"].includes(dim.status), `${label}/${dim.dimension}: null score must never read as a capability`);
      else assert.ok(scored.score >= 0 && scored.score <= 100, `${label}/${dim.dimension}: score out of [0,100]`);
    }

    // unknown/N/A neutrality: every uncertainty fact stays uncertainty, never a weakness/strength.
    for (const fact of result.semanticFacts.facts) {
      if (fact.type === "uncertainty") assert.ok(!["strength", "weakness", "partial"].includes(fact.type));
    }

    // Supporting-only evidence can never independently close a null score (structural, not calibration).
    for (const dim of result.scoring.dimensions) {
      const hasDirect = dim.evidence.some((e) => DIRECT_IDS.has(e.questionId) && e.directness === "direct");
      if (!hasDirect) assert.equal(dim.score, null, `${label}/${dim.id}: supporting-only evidence must never produce a score`);
    }

    // Verify never produces a concrete solution; solution=null never produces a commercial item.
    for (const rec of result.recommendations.items.filter((r) => r.mode === "verify")) {
      const match = result.solutions.find((s) => s.recommendationId === rec.id)!;
      assert.equal(match.solution, null, `${label}: verify recommendation ${rec.id} must never produce a concrete solution`);
    }
    const hasNonNullSolution = result.solutions.some((m) => m.solution !== null);
    for (const item of [...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements]) {
      assert.ok(hasNonNullSolution, `${label}: commercial item ${item.id} exists with no non-null solution anywhere in the chain`);
    }

    // Context-only / later-review (pending) questions must never become capability provenance.
    const provenanceIds = new Set<string>();
    for (const block of narrativeBlocks(result.narrative)) for (const id of block.sourceQuestionIds) {
      // R7-B certified triage (applied here in R8-B, when a calibration made the branch reachable for C20): a block
      // quoting a declaration cites the declaring context question and tags its field in `sourceContext` —
      // declaration provenance, not capability evidence. Any other pending citation still fails.
      const question = BANK.find((q) => q.id === id);
      if (question && PENDING_IDS.has(id) && [...producedContextFields(question)].some((field) => block.sourceContext.includes(field))) continue;
      provenanceIds.add(id);
    }
    for (const rec of result.recommendations.items) for (const id of rec.sourceQuestionIds) provenanceIds.add(id);
    const pendingLeaks = [...provenanceIds].filter((id) => PENDING_IDS.has(id));
    assert.deepEqual(pendingLeaks, [], `${label}: pending questions leaked into capability provenance: ${pendingLeaks.join(", ")}`);

    // No stale provenance: every provenance question must be an active answer.
    for (const id of provenanceIds) assert.ok(route.finalAnswers[id] !== undefined, `${label}: provenance question ${id} must be active`);

    // recommendedLicense is always null or one of the three canonical licenses.
    assert.ok(result.commercial.licenseFit.recommendedLicense === null || ["cuadra", "barrio", "ciudad"].includes(result.commercial.licenseFit.recommendedLicense), `${label}: invalid license value`);
  }
});

test("R7-A: commercial outcome coverage — null, Cuadra, Barrio are reachable from the canonical set; Ciudad requires clarification", () => {
  const licenses = new Set<string>();
  for (const caseDef of CANONICAL_CASES_V3) {
    const { result } = runFullChain(caseDef);
    licenses.add(result.commercial.licenseFit.recommendedLicense ?? "null");
  }
  assert.ok(licenses.has("null"), "no-license must be reachable");
  assert.ok(licenses.has("cuadra"), "Cuadra must be reachable from evidence-backed work_organization");
  assert.ok(licenses.has("barrio"), "Barrio must be reachable from a certified recurring solution");
  assert.ok(!licenses.has("ciudad"), "Ciudad must never be reachable from diagnostic context alone, without clarification");
});

test("QA-03C: canonical sufficiency battery distinguishes unknown, N/A, uncertainty, sector context, and justified abstention", () => {
  const unknown = runFullChain(CANONICAL_CASES_V3.find((item) => item.id === "C16")!);
  assert.ok(unknown.result.scoring.dimensions.some((dimension) => dimension.applicability === "insufficient_context"));
  assert.equal(unknown.result.commercial.licenseFit.recommendedLicense, null);

  const nA = runFullChain({
    id: "QA03C-NA",
    description: "Business with no historical recurring interaction: Relationship is not applicable by the approved applicability rule.",
    answerScript: { q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "professional_services", q2_operational_status: "operating", q2_has_customers: "no", q2_goal: "explain", q2_customer_reach: "local", q2_customer_buyer: "b2c" },
  });
  assert.ok(nA.result.scoring.dimensions.some((dimension) => dimension.applicability === "not_applicable"));
  assert.ok(nA.result.scoring.dimensions.some((dimension) => dimension.applicability === "applicable"));

  const uncertain = runFullChain(CANONICAL_CASES_V3.find((item) => item.id === "C20")!);
  assert.ok(uncertain.result.semanticFacts.facts.some((fact) => fact.type === "contradiction" && fact.semanticCode === "declared_friction_not_observed"));

  const advanced = runFullChain(CANONICAL_CASES_V3.find((item) => item.id === "C02")!);
  assert.ok(advanced.result.scoring.dimensions.some((dimension) => dimension.score !== null));

  const nontraditional = runFullChain(CANONICAL_CASES_V3.find((item) => item.id === "C23")!);
  assert.ok(nontraditional.result.scoring.dimensions.some((dimension) => dimension.id === "digital_readiness" && dimension.score !== null));

  const noCommercialNeed = runFullChain(CANONICAL_CASES_V3.find((item) => item.id === "C11")!);
  assert.equal(noCommercialNeed.result.commercial.licenseFit.recommendedLicense, null);
});

test("R7-A: Ciudad canonical case — explicit clarification, with the complete diagnostic byte-identical before/after", () => {
  const caseDef = CANONICAL_CASES_V3.find((c) => c.id === "C09")!;
  const { route } = runFullChain(caseDef);
  const barrio = buildCandidateCommercialBoundaryV3({ answers: route.finalAnswers });
  assert.equal(barrio.commercial.licenseFit.recommendedLicense, "barrio");
  const ciudad = buildCandidateCommercialBoundaryV3({ answers: route.finalAnswers, clarificationAnswer: "multiple_coordinated_processes" });
  assert.equal(ciudad.commercial.licenseFit.recommendedLicense, "ciudad");
  for (const key of ["scoring", "priorities", "semanticFacts", "narrative", "overall", "recommendations", "solutions"] as const) {
    assert.deepEqual(ciudad[key], barrio[key], `${key} must stay byte-identical across commercial clarification`);
  }
});

test("R7-A: Measurement canonical case (C15) — unobservable gap through the full chain", () => {
  const caseDef = CANONICAL_CASES_V3.find((c) => c.id === "C15")!;
  const { result } = runFullChain(caseDef);
  const measurement = result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  const gapFact = result.semanticFacts.facts.find((f) => f.dimension === "measurement_optimization" && f.type === "evidence_gap");
  assert.equal(gapFact?.gap?.kind, "unobservable_in_context");
  const rec = result.recommendations.items.find((r) => r.dimension === "measurement_optimization");
  if (rec) {
    assert.equal(rec.mode, "verify");
    assert.equal(result.solutions.find((s) => s.recommendationId === rec.id)!.solution, null);
  }
  assert.equal(result.commercial.licenseFit.recommendedLicense, null);
});

test("R7-A: Discovery canonical case (C18) — weakness never implies a channel", () => {
  const caseDef = CANONICAL_CASES_V3.find((c) => c.id === "C18")!;
  const { result } = runFullChain(caseDef);
  const rec = result.recommendations.items.find((r) => r.dimension === "discovery")!;
  const match = result.solutions.find((s) => s.recommendationId === rec.id)!;
  assert.equal(match.solution, null);
  for (const item of [...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements]) {
    assert.ok(!["seo", "ads", "social", "local-listing"].some((bad) => item.id.toLowerCase().includes(bad)));
  }
});

test("R7-A: website-only (C19) and declared-friction-unconfirmed (C20) canonical cases", () => {
  const website = runFullChain(CANONICAL_CASES_V3.find((c) => c.id === "C19")!).result;
  assert.equal(website.commercial.licenseFit.recommendedLicense, null);
  assert.ok(website.commercial.now.services.some((s) => s.name === "Web & Conversión"));

  const declared = runFullChain(CANONICAL_CASES_V3.find((c) => c.id === "C20")!).result;
  const rec = declared.recommendations.items.find((r) => r.dimension === "relationship_recurrence");
  if (rec) {
    assert.equal(rec.mode, "verify", "a healthy capability may surface only a low-confidence verify item, never improve");
    assert.equal(declared.solutions.find((s) => s.recommendationId === rec.id)!.solution, null);
  }
});

test("R7-A: hybrid canonical cases (C13 retail+ecommerce, C14 professional+appointments) — both components represented", () => {
  const hybridRetail = runFullChain(CANONICAL_CASES_V3.find((c) => c.id === "C13")!).route;
  assert.ok(hybridRetail.finalAnswers.q2_retail_product_visibility !== undefined || hybridRetail.finalAnswers.q2_local_presence_consistency !== undefined);
  assert.ok(hybridRetail.finalAnswers.q2_ecommerce_product_discovery !== undefined);

  const hybridProfessional = runFullChain(CANONICAL_CASES_V3.find((c) => c.id === "C14")!).route;
  assert.ok(hybridProfessional.finalAnswers.q2_professional_intake_flow !== undefined);
  assert.ok(hybridProfessional.finalAnswers.q2_appointments_booking_friction !== undefined || hybridProfessional.finalAnswers.q2_appointments_confirmation_reminders !== undefined);
});

test("R7-A: determinism — repeated run, answer-key order, and save/resume", () => {
  for (const id of ["C01", "C09", "C12", "C15", "C20"]) {
    const caseDef = CANONICAL_CASES_V3.find((c) => c.id === id)!;
    const first = runFullChain(caseDef);
    const second = runFullChain(caseDef);
    assert.deepEqual(second.result.commercial, first.result.commercial, `${id}: repeated run must be identical`);
    assert.deepEqual(second.route.asked, first.route.asked, `${id}: repeated route must ask the same questions in the same order`);

    const reversedAnswers = Object.fromEntries(Object.entries(first.route.finalAnswers).reverse()) as AnswersV2;
    const reversed = buildCandidateCommercialBoundaryV3({ answers: reversedAnswers });
    assert.deepEqual(reversed.commercial, first.result.commercial, `${id}: reversed answer-key order must not change output`);

    const restored = buildCandidateCommercialBoundaryV3({ answers: JSON.parse(JSON.stringify(first.route.finalAnswers)) as AnswersV2 });
    assert.deepEqual(restored.commercial, first.result.commercial, `${id}: save/resume must reproduce identical output`);
  }
});

test("R7-A: branch invalidation — changing an early structural answer removes stale downstream output", () => {
  const caseDef = CANONICAL_CASES_V3.find((c) => c.id === "C04")!;
  const { route, result: before } = runFullChain(caseDef);
  assert.equal(before.commercial.licenseFit.recommendedLicense, "barrio");
  const after = buildCandidateCommercialBoundaryV3({ answers: { ...route.finalAnswers, q2_delivery: ["online_checkout"] } });
  assert.equal(after.activeAnswers.q2_appointments_booking_friction, undefined);
  assert.notEqual(after.commercial.licenseFit.recommendedLicense, "barrio");
  const provenanceIds = new Set<string>();
  for (const block of narrativeBlocks(after.narrative)) for (const id of block.sourceQuestionIds) provenanceIds.add(id);
  assert.ok(!provenanceIds.has("q2_appointments_booking_friction"));
});

test("R7-A: calibration observations (OBSERVATIONAL — FOR R8, NOT FROZEN)", () => {
  const observations = CANONICAL_CASES_V3.map((caseDef) => {
    const { route, result } = runFullChain(caseDef);
    return {
      case: caseDef.id,
      questionsAsked: route.asked.length,
      activeAnswers: Object.keys(route.finalAnswers).length,
      overallRawScore: result.overall.index.rawScore,
      overallDisplayScore: result.overall.index.displayScore,
      publicLabel: result.overall.publicLabel,
      coverage: result.overall.index.coverage,
      confidence: result.overall.confidence.level,
      license: result.commercial.licenseFit.recommendedLicense,
    };
  });
  // This test only records the distribution for the R8 handoff manifest; it asserts nothing about
  // whether any of these numbers are "correct" — that is explicitly out of R7-A's scope.
  assert.equal(observations.length, CANONICAL_CASES_V3.length);
});
