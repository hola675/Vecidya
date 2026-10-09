import assert from "node:assert/strict";
import test from "node:test";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_R8B_V2 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3, CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3, computeCandidateDigitalPresenceIndexV3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import { buildDigitalPresenceStatus, computeDigitalPresenceIndex, computeOverallConfidence, displayScoreForBands, type DigitalPresenceIndex, type OverallIndexModel } from "../../../app/features/diagnostic/qbv2-overall";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { answerValue, mulberry32, pick, runPolicyRoute } from "./qbv2-candidate-qa-harness";
import { r7CorpusV3 } from "./qbv2-r8-calibration-qa";
import { holdoutCorpusV3 as r8bHoldoutV3 } from "./qbv2-r8b-calibration-experiments";
import { familyTagsV3, r8cContextLimitWitnessV3, r8cHoldoutV3 } from "./qbv2-r8c-overall-calibration-experiments";

type Hypothesis = "H0_BANK_OBSERVABLE" | "H1_CONTEXT_OBSERVABLE" | "H2_ROUTE_REACHABLE" | "H3_R5_OPPORTUNITY";
type Snapshot = { readonly indexed: boolean; readonly denominator: number; readonly observed: number; readonly coverage: number; readonly confidence: string; readonly provisional: boolean; readonly caveat: string | null; readonly raw: number | null; readonly display: number | null; readonly band: string | null; readonly priorities: string; readonly facts: string; readonly recommendations: string; readonly solutions: string; readonly license: string | null; readonly offerings: string };
const round2 = (n: number) => Math.round(n * 100) / 100;
const items = (r: CandidateCommercialBoundaryV3) => [...r.commercial.now.services, ...r.commercial.now.complements, ...r.commercial.later.services, ...r.commercial.later.complements].map((x) => x.id).sort().join(",");
const model = CANDIDATE_CALIBRATION_R8B_V2.overall;
const FAMILY_HOLDOUT_SEEDS = [
  { id: "professional", seed: 0x8c10, forced: { q2_entity: "individual", q2_monetization: "services", q2_delivery: ["appointments"], q2_sector: "professional_services", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "trust", q2_friction: "trust" } },
  { id: "creator", seed: 0x8c11, forced: { q2_entity: "individual", q2_monetization: "audience", q2_delivery: ["online_checkout"], q2_sector: "creative_media", q2_has_customers: "yes", q2_regularity: "regular", q2_customer_reach: "global", q2_goal: "explain" } },
  { id: "nonprofit", seed: 0x8c12, forced: { q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_sector: "community_social", q2_has_customers: "yes", q2_regularity: "regular", q2_customer_buyer: "mixed", q2_goal: "be_found" } },
  { id: "hybrid", seed: 0x8c13, forced: { q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" } },
] as const;

function familyInteractiveRoutes() {
  return FAMILY_HOLDOUT_SEEDS.map(({ id, seed, forced }) => {
    const rng = mulberry32(seed);
    const route = runPolicyRoute((question) => {
      const answer = forced[question.id as keyof typeof forced];
      if (answer !== undefined) {
        const values = Array.isArray(answer) ? answer : [answer];
        for (const value of values) assert.ok(question.options.some((option) => option.value === value), `${id}/${question.id}: seeded value ${String(value)} is a real option`);
        return answer;
      }
      const options = question.options.filter((option) => option.kind !== "not_applicable" && !(option.exclusive && question.type === "multi"));
      return answerValue(question, pick(rng, options.length > 0 ? options : question.options).value);
    });
    return { id: `family/${id}/${seed.toString(16)}`, answers: route.finalAnswers, expectedFamily: id };
  });
}

function snapshot(r: CandidateCommercialBoundaryV3, index: DigitalPresenceIndex, denominator: number, confidence = computeOverallConfidence(r.scoring, index, model)): Snapshot {
  const status = buildDigitalPresenceStatus({
    scoring: r.scoring, priorities: r.priorities, semanticFacts: r.semanticFacts, narrative: r.narrative,
    computeIndex: () => index, computeConfidence: () => confidence, bands: model.bands,
  });
  return {
    indexed: index.rawScore !== null, denominator, observed: index.scoredDimensions.length,
    coverage: index.coverage, confidence: confidence.level, provisional: status.provisional, caveat: status.caveat?.reason ?? null,
    raw: index.rawScore, display: index.displayScore, band: status.publicLabel,
    priorities: r.priorities.priorities.map((x) => `${x.dimension}:${x.severity}:${x.certainty}`).join("|"),
    facts: r.semanticFacts.facts.map((x) => `${x.id}:${x.type}`).join("|"),
    recommendations: r.recommendations.items.map((x) => `${x.dimension}:${x.mode}:${x.urgency}`).join("|"),
    solutions: r.solutions.map((x) => x.solution?.id ?? "null").join("|"),
    license: r.commercial.licenseFit.recommendedLicense, offerings: items(r),
  };
}

function indexForDenominator(r: CandidateCommercialBoundaryV3, denominator: number, m: OverallIndexModel = model): DigitalPresenceIndex {
  const prelaunch = r.narrative.lifecycle === "prelaunch";
  const base = computeDigitalPresenceIndex(r.scoring, { prelaunch, model: m });
  const observed = base.scoredDimensions.length;
  const coverage = denominator === 0 ? base.coverage : round2(observed / denominator);
  const sufficient = !prelaunch && observed >= m.minScoredDimensions && denominator > 0 && observed / denominator >= m.minCoverage;
  const rawScore = sufficient ? base.scoredDimensions.reduce((sum, id) => sum + r.scoring.dimensions.find((d) => d.id === id)!.score!, 0) / observed : null;
  return { ...base, coverage, sufficient, rawScore, displayScore: rawScore === null ? null : displayScoreForBands(rawScore, m.bands) };
}

function evaluate(r: CandidateCommercialBoundaryV3): Record<Hypothesis, Snapshot> {
  const contextual = r.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  const bankDenominator = contextual.applicableDimensions.filter((id) => !CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id)).length;
  const routePlan = buildCandidateQuestionPlanV3({ answers: r.activeAnswers });
  const routeQuestionIds = new Set([...Object.keys(r.activeAnswers), ...routePlan.selectedQuestionIds]);
  const routeDimensions = contextual.dimensionObservability.filter((d) => d.applicable && d.directSourceQuestionIds.some((id) => routeQuestionIds.has(id))).length;
  const bank = indexForDenominator(r, bankDenominator);
  const route = indexForDenominator(r, routeDimensions);
  const context = contextual as unknown as DigitalPresenceIndex;
  const h0 = snapshot(r, bank, bankDenominator);
  const h1 = snapshot(r, context, contextual.observableApplicableDimensions.length);
  const h2 = snapshot(r, route, routeDimensions);
  return { H0_BANK_OBSERVABLE: h0, H1_CONTEXT_OBSERVABLE: h1, H2_ROUTE_REACHABLE: h2, H3_R5_OPPORTUNITY: h1 };
}

function summarize(cases: readonly { readonly id: string; readonly answers: AnswersV2 }[]) {
  const report: Record<Hypothesis, { n: number; indexed: number; confidence: Record<string, number>; provisional: number; bands: Record<string, number>; caveats: Record<string, number> }> = {
    H0_BANK_OBSERVABLE: { n: 0, indexed: 0, confidence: {}, provisional: 0, bands: {}, caveats: {} },
    H1_CONTEXT_OBSERVABLE: { n: 0, indexed: 0, confidence: {}, provisional: 0, bands: {}, caveats: {} },
    H2_ROUTE_REACHABLE: { n: 0, indexed: 0, confidence: {}, provisional: 0, bands: {}, caveats: {} },
    H3_R5_OPPORTUNITY: { n: 0, indexed: 0, confidence: {}, provisional: 0, bands: {}, caveats: {} },
  };
  const changes: Record<`${Hypothesis}->H1_CONTEXT_OBSERVABLE`, Record<string, number>> = {
    "H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE": {},
    "H1_CONTEXT_OBSERVABLE->H1_CONTEXT_OBSERVABLE": {},
    "H2_ROUTE_REACHABLE->H1_CONTEXT_OBSERVABLE": {},
    "H3_R5_OPPORTUNITY->H1_CONTEXT_OBSERVABLE": {},
  };
  const witnessRows: Record<string, unknown>[] = [];
  const corpusStats = { casesWithLowerDenominator: 0, unreadApplicableDimensionsWithNoContextDirectOpportunity: 0, h0LowWithoutRespondentGap: 0, h1LowWithoutRespondentGap: 0 };
  for (const { id, answers } of cases) {
    const result = buildCandidateCommercialBoundaryV3({ answers, calibration: CANDIDATE_CALIBRATION_R8B_V2 });
    const outcomes = evaluate(result);
    const observability = (result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability;
    if (outcomes.H1_CONTEXT_OBSERVABLE.denominator < outcomes.H0_BANK_OBSERVABLE.denominator) corpusStats.casesWithLowerDenominator += 1;
    corpusStats.unreadApplicableDimensionsWithNoContextDirectOpportunity += observability.filter((d) => d.applicable && !d.observedDirect && d.reason === "no_direct_source_in_context").length;
    const noRespondentGap = !observability.some((d) => ["respondent_unknown", "respondent_not_applicable", "respondent_non_scoring_answer"].includes(d.reason));
    if (noRespondentGap && outcomes.H0_BANK_OBSERVABLE.confidence === "low") corpusStats.h0LowWithoutRespondentGap += 1;
    if (noRespondentGap && outcomes.H1_CONTEXT_OBSERVABLE.confidence === "low") corpusStats.h1LowWithoutRespondentGap += 1;
    for (const [hypothesis, value] of Object.entries(outcomes) as [Hypothesis, Snapshot][]) {
      const row = report[hypothesis]; row.n += 1; row.indexed += Number(value.indexed); row.provisional += Number(value.provisional);
      row.confidence[value.confidence] = (row.confidence[value.confidence] ?? 0) + 1;
      row.bands[String(value.band)] = (row.bands[String(value.band)] ?? 0) + 1;
      row.caveats[String(value.caveat)] = (row.caveats[String(value.caveat)] ?? 0) + 1;
    }
    for (const hypothesis of ["H0_BANK_OBSERVABLE", "H2_ROUTE_REACHABLE"] as const) {
      const from = outcomes[hypothesis], to = outcomes.H1_CONTEXT_OBSERVABLE;
      for (const field of ["denominator", "coverage", "indexed", "confidence", "provisional", "caveat", "raw", "display", "band", "priorities", "facts", "recommendations", "solutions", "license", "offerings"] as const) {
        if (from[field] !== to[field]) changes[`${hypothesis}->H1_CONTEXT_OBSERVABLE`][field] = (changes[`${hypothesis}->H1_CONTEXT_OBSERVABLE`][field] ?? 0) + 1;
      }
    }
    if (id === "route#24") witnessRows.push({ id, H0: outcomes.H0_BANK_OBSERVABLE, H1: outcomes.H1_CONTEXT_OBSERVABLE, reasons: (result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability.filter((d) => d.applicable).map((d) => [d.dimension, d.reason]) });
  }
  return { report, changes, witnessRows, corpusStats };
}

test("R8-O6: decision selects deterministic R5 opportunity observability and keeps instrument gaps separate", () => {
  assert.equal(CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3, "diag-v3-candidate-context-observability-v1");
  const witness = r8cContextLimitWitnessV3();
  const result = buildCandidateCommercialBoundaryV3({ answers: witness.answers });
  const index = result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  const denominator = index.observableApplicableDimensions.length;
  assert.equal(witness.id, "route#24");
  assert.equal(witness.answers.q2_entity !== undefined, true);
  assert.deepEqual([index.scoredDimensions.length, denominator, index.coverage, result.overall.confidence.level, result.overall.provisional], [3, 3, 1, "medium", false]);
  const bankIndex = computeDigitalPresenceIndex(result.scoring, { model });
  const bankDenominator = bankIndex.applicableDimensions.filter((id) => !CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id)).length;
  assert.deepEqual([bankDenominator, round2(3 / bankDenominator)], [7, 0.43]);
  console.log("R8-O6 0x8c01 witness", JSON.stringify({ route: witness.id, h0: [3, bankDenominator, round2(3 / bankDenominator), "low", true], h1: [index.scoredDimensions.length, denominator, index.coverage, result.overall.confidence.level, result.overall.provisional], dimensions: index.dimensionObservability.filter((d) => d.applicable).map((d) => [d.dimension, d.reason]) }));
  assert.ok(index.dimensionObservability.some((d) => d.applicable && d.reason === "no_direct_source_in_context"));
  assert.ok(index.dimensionObservability.some((d) => d.dimension === "measurement_optimization" && d.applicable && d.reason === "no_direct_source_in_bank"));
  assert.deepEqual(index.scoredDimensions, index.dimensionObservability.filter((d) => d.observedDirect).map((d) => d.dimension));
  assert.equal(index.rawScore, result.scoring.dimensions.filter((d) => d.score !== null).reduce((s, d) => s + d.score!, 0) / index.scoredDimensions.length);
});

test("R8-O6: closed reason matrix preserves respondent, budget and instrument gaps", () => {
  const answerBags = r7CorpusV3().map(({ id, answers }) => ({ id, answers }));
  const reasons = new Set<string>();
  const familyCases: Record<string, number> = {};
  for (const { answers } of answerBags) {
    const result = buildCandidateCommercialBoundaryV3({ answers });
    const index = result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
    for (const row of index.dimensionObservability) reasons.add(row.reason);
    const archetype = String(result.context.archetype.status === "resolved" ? result.context.archetype.value : "unresolved");
    familyCases[archetype] = (familyCases[archetype] ?? 0) + 1;
    for (const row of index.dimensionObservability) {
      if (row.reason === "respondent_unknown" || row.reason === "respondent_not_applicable" || row.reason === "respondent_non_scoring_answer" || row.reason === "budget_blocked" || row.reason === "hard_cap_blocked") {
        assert.ok(index.observableApplicableDimensions.includes(row.dimension), `${row.dimension}/${row.reason} must stay in denominator`);
      }
      assert.equal(row.observedDirect, result.scoring.dimensions.find((d) => d.id === row.dimension)!.score !== null && result.scoring.dimensions.find((d) => d.id === row.dimension)!.confidence.direct > 0);
    }
  }
  assert.ok(reasons.has("no_direct_source_in_context"));
  assert.ok(reasons.has("no_direct_source_in_bank"));
  assert.ok(reasons.has("observed_direct"));
  assert.ok(Object.keys(familyCases).length >= 6, "R7 includes distinct operational archetypes/families");
  assert.equal(CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has("measurement_optimization"), true);
});

test("R8-O6: H0 bank, H1 context, H2 route and H3 planner opportunity are compared on R7 only", () => {
  const report = summarize(r7CorpusV3());
  assert.deepEqual([report.report.H0_BANK_OBSERVABLE.n, report.report.H1_CONTEXT_OBSERVABLE.n, report.report.H2_ROUTE_REACHABLE.n, report.report.H3_R5_OPPORTUNITY.n], [61, 61, 61, 61]);
  assert.deepEqual(report.report.H1_CONTEXT_OBSERVABLE, report.report.H3_R5_OPPORTUNITY);
  assert.ok(report.report.H1_CONTEXT_OBSERVABLE.indexed >= report.report.H0_BANK_OBSERVABLE.indexed);
  assert.deepEqual(report.corpusStats, { casesWithLowerDenominator: 61, unreadApplicableDimensionsWithNoContextDirectOpportunity: 138, h0LowWithoutRespondentGap: 2, h1LowWithoutRespondentGap: 2 });
  assert.deepEqual([report.report.H0_BANK_OBSERVABLE.indexed, report.report.H1_CONTEXT_OBSERVABLE.indexed], [56, 56]);
  assert.ok(report.changes["H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE"].coverage > 0, "the selected model changes coverage on R7 cases");
  for (const field of ["raw", "display", "band", "priorities", "facts", "recommendations", "solutions", "license", "offerings"] as const) assert.equal(report.changes["H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE"][field] ?? 0, 0, `${field} remains independent of coverage`);
  assert.ok(report.changes["H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE"].confidence >= 0);
  assert.ok(report.changes["H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE"].license === undefined, "coverage does not select a commercial license");
  assert.ok(report.changes["H0_BANK_OBSERVABLE->H1_CONTEXT_OBSERVABLE"].offerings === undefined, "coverage does not select commercial offerings");
  console.log("R8-O6 R7 matrix", JSON.stringify(report));
});

test("R8-O6: deterministic holdout uses independent seeds, interactive routes, answer bags and context families", () => {
  const r8c = r8cHoldoutV3();
  const familyRoutes = familyInteractiveRoutes();
  const holdout = [
    ...r8bHoldoutV3(300, 0x8c0b).map(({ id, answers }) => ({ id: `r8b/${id}`, answers })),
    ...r8c.answerBags.map(({ id, answers }) => ({ id: `r8c/${id}`, answers })),
    ...r8c.routes.slice(0, 146).map(({ id, answers }) => ({ id: `interactive/${id}`, answers })),
    ...familyRoutes,
  ];
  assert.equal(holdout.length, 750);
  assert.equal(holdout.filter((item) => item.id.startsWith("interactive/") || item.id.startsWith("family/")).length, 150);
  const summary = summarize(holdout);
  assert.deepEqual(summary.report.H1_CONTEXT_OBSERVABLE, summary.report.H3_R5_OPPORTUNITY);
  assert.ok(summary.report.H1_CONTEXT_OBSERVABLE.indexed > 0);
  const families = new Map<string, number>();
  for (const { answers } of holdout) {
    const result = buildCandidateCommercialBoundaryV3({ answers });
    for (const tag of familyTagsV3(result)) families.set(tag, (families.get(tag) ?? 0) + 1);
  }
  const forcedFamilies = familyRoutes.map(({ id, answers, expectedFamily }) => ({ id, expectedFamily, tags: familyTagsV3(buildCandidateCommercialBoundaryV3({ answers })) }));
  assert.deepEqual(summary.corpusStats, { casesWithLowerDenominator: 743, unreadApplicableDimensionsWithNoContextDirectOpportunity: 1950, h0LowWithoutRespondentGap: 374, h1LowWithoutRespondentGap: 335 });
  assert.equal(summary.report.H1_CONTEXT_OBSERVABLE.confidence.high ?? 0, 0, "context observability alone does not create high confidence");
  assert.deepEqual(forcedFamilies.map(({ expectedFamily, tags }) => [expectedFamily, tags.includes(({ professional: "appointments", creator: "ecommerce", nonprofit: "organization", hybrid: "hybrid" } as const)[expectedFamily])]), [["professional", true], ["creator", true], ["nonprofit", true], ["hybrid", true]]);
  console.log("R8-O6 deterministic holdout", JSON.stringify({ report: summary.report, changes: summary.changes, corpusStats: summary.corpusStats, families: Object.fromEntries(families) }));
});

test("R8-O6: small denominators, unknown, N/A, prelaunch and hard caps cannot inflate evidence confidence", () => {
  const witness = r8cContextLimitWitnessV3();
  const base = buildCandidateCommercialBoundaryV3({ answers: witness.answers });
  const index = base.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  const small = { ...index, scoredDimensions: index.scoredDimensions.slice(0, 1), coverage: 1, sufficient: false, rawScore: null, displayScore: null };
  assert.equal(small.rawScore, null, "the three-reading minimum remains binding for denominator 1");
  assert.equal(computeOverallConfidence(base.scoring, small).level, "low");
  const two = { ...index, scoredDimensions: index.scoredDimensions.slice(0, 2), coverage: 1, sufficient: false, rawScore: null, displayScore: null };
  assert.equal(two.rawScore, null, "the three-reading minimum remains binding for denominator 2");
  assert.equal(computeOverallConfidence(base.scoring, two).level, "low");
  assert.equal(index.sufficient, index.scoredDimensions.length >= model.minScoredDimensions && index.scoredDimensions.length / index.observableApplicableDimensions.length >= model.minCoverage);
  assert.equal(computeOverallConfidence(base.scoring, index).level, "medium", "three single clean DIRECT observations are medium, not high");

  const singleDirectIds = new Set(base.scoring.dimensions.filter((d) => d.confidence.direct === 1).flatMap((d) => d.evidence.filter((e) => e.directness === "direct").map((e) => e.questionId)));
  const unknownQuestion = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => singleDirectIds.has(q.id) && q.evidenceV3?.dimensions.some((d) => d.directness === "direct") && q.options.some((o) => o.value === "unknown"));
  assert.ok(unknownQuestion);
  const unknown = buildCandidateCommercialBoundaryV3({ answers: { ...witness.answers, [unknownQuestion.id]: answerValue(unknownQuestion, "unknown") } });
  const beforeUnknown = unknown.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  const unknownRows = beforeUnknown.dimensionObservability.filter((item) => item.reason === "respondent_unknown");
  assert.ok(unknownRows.length > 0, "a direct unknown is retained as a respondent gap");
  for (const row of unknownRows) assert.ok(beforeUnknown.observableApplicableDimensions.includes(row.dimension));
  assert.equal(unknown.overall.confidence.level === "high" && base.overall.confidence.level !== "high", false);
  const confidenceRank = { low: 0, medium: 1, high: 2 } as const;
  assert.ok(confidenceRank[unknown.overall.confidence.level] <= confidenceRank[base.overall.confidence.level], "withdrawing a known direct response cannot raise overall confidence");

  const naCase = r7CorpusV3().find((item) => item.id === "A06")!;
  const na = buildCandidateCommercialBoundaryV3({ answers: naCase.answers });
  const naIndex = na.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  const naRows = naIndex.dimensionObservability.filter((item) => item.reason === "respondent_not_applicable");
  assert.ok(naRows.some((row) => row.dimension === "relationship_recurrence"), "A06 has direct N/A answers while R4 keeps Relationship applicable from context");
  for (const row of naRows) assert.ok(naIndex.observableApplicableDimensions.includes(row.dimension));

  const prelaunch = buildCandidateCommercialBoundaryV3({ answers: { ...witness.answers, q2_has_customers: "no" } });
  assert.equal(prelaunch.narrative.lifecycle, "prelaunch");
  assert.equal(prelaunch.overall.index.rawScore, null);

  const source = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => base.activeAnswers[q.id] !== undefined && q.evidenceV3?.dimensions.some((d) => d.directness === "direct") && !q.options.some((o) => o.produces));
  assert.ok(source);
  const cappedAnswers = { ...base.activeAnswers };
  delete cappedAnswers[source.id];
  const capped = buildCandidateCommercialBoundaryV3({ answers: cappedAnswers });
  const cap = buildCandidateQuestionPlanV3({ answers: capped.activeAnswers, budget: { ...buildCandidateQuestionPlanV3({ answers: capped.activeAnswers }).budget, hardMax: Object.keys(capped.activeAnswers).length } });
  assert.ok(cap.completion.hardCapReached);
  const cappedIndex = computeCandidateDigitalPresenceIndexV3(capped.scoring, {}, model, capped.activeAnswers, cap.budget);
  assert.ok(cappedIndex.dimensionObservability.some((d) => d.reason === "hard_cap_blocked"));
});

test("R8-O6: metamorphic determinism, calibration independence, clarification isolation and DIRECT-only observation", () => {
  const witness = r8cContextLimitWitnessV3();
  const normal = buildCandidateCommercialBoundaryV3({ answers: witness.answers, calibration: CANDIDATE_CALIBRATION_R8B_V2 });
  const reversed = Object.fromEntries(Object.entries(witness.answers).reverse()) as AnswersV2;
  const reversedResult = buildCandidateCommercialBoundaryV3({ answers: reversed, calibration: CANDIDATE_CALIBRATION_R8B_V2 });
  const v1 = buildCandidateCommercialBoundaryV3({ answers: witness.answers, calibration: CANDIDATE_CALIBRATION_BASELINE_V1 });
  const n = normal.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
  assert.deepEqual(n.dimensionObservability, (reversedResult.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability);
  assert.deepEqual(n.dimensionObservability, (v1.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability);
  const savedPrefix = Object.fromEntries(Object.entries(witness.answers).slice(0, Math.floor(Object.keys(witness.answers).length / 2)));
  const resumedAnswers = { ...savedPrefix, ...Object.fromEntries(Object.entries(witness.answers).slice(Object.keys(savedPrefix).length)) } as AnswersV2;
  assert.deepEqual(n.dimensionObservability, (buildCandidateCommercialBoundaryV3({ answers: resumedAnswers }).overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability, "saving/resuming equivalent answers reproduces observability");
  const directAttempts = n.dimensionObservability.filter((row) => row.answeredDirectQuestionIds.length > 0 && !row.observedDirect);
  assert.ok(directAttempts.every((row) => n.observableApplicableDimensions.includes(row.dimension)), "respondent unknown/N/A remains denominator-visible");
  const supportingOnly = normal.scoring.dimensions.filter((d) => d.confidence.direct === 0 && d.confidence.supporting > 0);
  assert.ok(supportingOnly.every((d) => !n.dimensionObservability.find((row) => row.dimension === d.id)!.observedDirect));
  const clarification = buildCandidateCommercialBoundaryV3({ answers: witness.answers, currentLicense: "cuadra", clarificationAnswer: "multiple_coordinated_processes" });
  assert.deepEqual(n.dimensionObservability, (clarification.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability);
});

test("R8-O6: adding a DIRECT opportunity without changing resolved context cannot lower coverage", () => {
  let checked = 0;
  for (const { answers } of r7CorpusV3()) {
    const full = buildCandidateCommercialBoundaryV3({ answers });
    const question = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => full.activeAnswers[q.id] !== undefined
      && q.evidenceV3?.dimensions.some((d) => d.directness === "direct") && !q.options.some((o) => o.produces));
    if (!question) continue;
    const cutAnswers = { ...full.activeAnswers };
    const original = cutAnswers[question.id]!;
    delete cutAnswers[question.id];
    const before = buildCandidateCommercialBoundaryV3({ answers: cutAnswers });
    const after = buildCandidateCommercialBoundaryV3({ answers: { ...before.activeAnswers, [question.id]: original } });
    if (JSON.stringify(before.context) !== JSON.stringify(after.context)) continue;
    const beforeIndex = before.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
    const afterIndex = after.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>;
    assert.ok(afterIndex.coverage >= beforeIndex.coverage, `${question.id}: ${beforeIndex.coverage} → ${afterIndex.coverage}`);
    const touched = new Set(question.evidenceV3!.dimensions.filter((d) => d.directness === "direct").map((d) => d.dimension));
    for (const row of beforeIndex.dimensionObservability.filter((item) => !touched.has(item.dimension))) {
      assert.deepEqual(afterIndex.dimensionObservability.find((item) => item.dimension === row.dimension)?.reachableDirectQuestionIds, row.reachableDirectQuestionIds, `${question.id} cannot change unrelated ${row.dimension} gates`);
    }
    checked += 1;
  }
  assert.ok(checked > 0, "the R7 corpus contains at least one context-preserving DIRECT opportunity mutation");
});

test("R8-O6: legacy index, calibration values, R5 identity and public isolation remain frozen", () => {
  const witness = r8cContextLimitWitnessV3();
  const result = buildCandidateCommercialBoundaryV3({ answers: witness.answers });
  const historic = computeDigitalPresenceIndex(result.scoring, { model: CANDIDATE_CALIBRATION_R8B_V2.overall });
  assert.deepEqual([historic.scoredDimensions.length, historic.applicableDimensions.length, historic.coverage], [3, 8, 0.38]);
  assert.deepEqual(CANDIDATE_CALIBRATION_BASELINE_V1.overall, CANDIDATE_CALIBRATION_R8B_V2.overall);
  assert.equal(buildCandidateQuestionPlanV3({ answers: witness.answers }).plannerIdentity, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.deepEqual(DIGITAL_DIMENSION_IDS.filter((id) => (result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability.find((row) => row.dimension === id)?.observedDirect), (result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).scoredDimensions);
  assert.ok(!(result.overall.index as ReturnType<typeof computeCandidateDigitalPresenceIndexV3>).dimensionObservability.some((row) => row.reason === "respondent_unknown" && row.observedDirect));
});
