import test from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIAL_CASES_V3 } from "./qbv2-candidate-adversarial-cases";
import { structuralViolations } from "./qbv2-candidate-qa-harness";
import { r7CorpusV3 } from "./qbv2-r8-calibration-qa";
import { supportingMatrixV3 } from "./qbv2-r8b-calibration-experiments";
import {
  CANDIDATE_MAX_OBSERVABLE_V3, R8C_EXPECTATIONS_V3, R8C_HYPOTHESES_V3, bandPatternMatrixV3, bandTransitionsV3, candidateIndexOf, coverageRoundingViolationsV3,
  displayRoundingViolationsV3, familyBreakdownV3, isCleanCompleteV3, observableApplicableOf, overallConfidenceContractV3, overallContractViolationsV3,
  r8cContextLimitWitnessV3, r8cExpectationViolationsV3, r8cHoldoutV3, r8cHypothesisCalibrationV3, r8cMetamorphicViolationsV3, r8cMutationsV3, r8cSelectionCorpusV3, routeProfileV3,
  runR8cExperimentV3, runR8cHistoricalBankModelV3, selectR8cCalibrationV3, severityCoherenceViolationsV3, supportingSafetyViolationsV3, syntheticDimensionScoresV3,
  type R8cExperimentResultV3,
} from "./qbv2-r8c-overall-calibration-experiments";
import { CANDIDATE_CALIBRATION_R8B_V2, CANDIDATE_CALIBRATION_V3, type CandidateCalibrationV3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import { CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import {
  bandFor, bandForBands, classifyOverallState, computeDigitalPresenceIndex, displayScoreFor, displayScoreForBands, resolveGlobalDigitalStatus, resolveGlobalDigitalStatusForBands,
} from "../../../app/features/diagnostic/qbv2-overall";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8-C — overall index, confidence, bands & priority severity calibration. Certifies the reproducible
 * experiment and its selection (BASELINE_V2: every R8-C value is retained, so the current calibration stays
 * v2), the sufficiency, denominator, rounding, band, confidence, provisional/caveat and severity contracts, the
 * band sensitivity, the R8-C metamorphic relations, a never-used holdout and semantic invariance. Asserts rules,
 * never a target band share, percentage or license count (R7 cases are not empirical ground truth).
 */

const v2 = CANDIDATE_CALIBRATION_R8B_V2;
const run = (answers: AnswersV2, calibration: CandidateCalibrationV3 = v2) => runR8cHistoricalBankModelV3(answers, calibration);
const report: Record<string, unknown> = {};
let experiments: R8cExperimentResultV3[] | undefined;
const allExperiments = () => (experiments ??= R8C_HYPOTHESES_V3.map((h) => runR8cExperimentV3(h)));
const corpusById = () => new Map(r7CorpusV3().map((c) => [c.id, c.answers]));

test("R8-C: every hypothesis is evaluated through the real chain; the decision order selects BASELINE_V2 and the current calibration stays v2", () => {
  const results = allExperiments();
  const { selected, eliminated } = selectR8cCalibrationV3(results);
  assert.equal(selected, "BASELINE_V2");
  assert.deepEqual(Object.keys(eliminated).sort(), R8C_HYPOTHESES_V3.map((h) => h.id).filter((id) => id !== selected).sort(), "every other hypothesis is eliminated with a recorded reason");
  const baseline = results.find((r) => r.id === "BASELINE_V2")!;
  assert.deepEqual([baseline.moved, baseline.invariantViolations, baseline.expectationViolations, baseline.contract.structural, baseline.r8bFrozen], [[], [], [], 0, true]);
  for (const list of Object.values(baseline.contract)) if (Array.isArray(list)) assert.deepEqual(list, []);
  assert.deepEqual(baseline.corpusEffect, {}, "the baseline is the reference");
  // No non-baseline hypothesis has a certified anchor for its move (§34); some also break a contract or expectation.
  for (const r of results.filter((x) => x.id !== selected)) assert.ok(eliminated[r.id]!.some((reason) => reason.startsWith("UNANCHORED:")), r.id);
  assert.deepEqual(eliminated["INDEX-H3"]!.filter((x) => !x.startsWith("UNANCHORED")), ["CONFIDENCE_CONTRACT", "EXPECTATIONS:IX3"]);
  assert.deepEqual(eliminated["INDEX-H2"]!.filter((x) => !x.startsWith("UNANCHORED")), ["CONFIDENCE_CONTRACT"], "a floor of one half makes coverage irrelevant to the medium level");
  assert.deepEqual(eliminated["OVERALL-CONF-H2"]!.filter((x) => !x.startsWith("UNANCHORED")), ["EXPECTATIONS:OC6"]);
  assert.deepEqual(eliminated["OVERALL-CONF-H4"]!.filter((x) => !x.startsWith("UNANCHORED")), ["CONFIDENCE_CONTRACT"]);
  assert.deepEqual(results.filter((r) => r.inertOnCorpus && r.id !== selected).map((r) => r.id), ["INDEX-H1", "OVERALL-CONF-H1", "OVERALL-CONF-H3", "SEVERITY-H1", "SEVERITY-H2", "SEVERITY-H3"], "moves with no corpus effect would only create an artificial version (§40)");
  assert.ok(results.every((r) => r.r8bFrozen && r.invariantViolations.length === 0), "no hypothesis touches an R8-B parameter or an invariant");
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2, "current calibration remains v2");
  report.experiments = results.map((r) => ({
    id: r.id, family: r.family, patch: r.patch, rationale: r.rationale, expectedEffect: r.expectedEffect, unanchored: r.unanchored,
    contract: Object.fromEntries(Object.entries(r.contract).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])), expectations: r.expectationViolations,
    corpusEffect: Object.fromEntries(Object.entries(r.corpusEffect).map(([k, v]) => [k, v])), inertOnCorpus: r.inertOnCorpus, footprint: r.footprint,
    sizeConsistent: r.bandPatterns.sizeConsistent, distribution: r.distribution,
  }));
  report.selection = { selected, eliminated };
});

test("R8-C index sufficiency: sufficient ⇔ rawScore, prelaunch null, fewer than three readings null, every clean complete route ≥ 3 readings indexed; 1/3 is never binding (≤ 7 observable areas)", () => {
  const corpus = r8cSelectionCorpusV3().map(({ id, answers, profile }) => ({ id, profile, result: run(answers) }));
  for (const { id, result } of corpus) assert.deepEqual(overallContractViolationsV3(result, v2), [], id);
  assert.deepEqual(r8cExpectationViolationsV3(corpus), []);
  assert.equal(CANDIDATE_MAX_OBSERVABLE_V3, 7);
  for (let n = 3; n <= CANDIDATE_MAX_OBSERVABLE_V3; n += 1) assert.ok(v2.overall.minScoredDimensions / n >= v2.overall.minCoverage, `3/${n} clears the floor`);
  for (const id of ["C01", "A11"]) assert.equal(candidateIndexOf(corpus.find((c) => c.id === id)!.result).rawScore, null, `${id}: prelaunch`);
  const matrix: Record<string, { cases: number; sufficient: number; observable: Record<string, number>; notApplicable: number; unobservable: number; cleanComplete: number }> = {};
  for (const { profile, result } of corpus) {
    const index = candidateIndexOf(result), k = index.scoredDimensions.length;
    const row = matrix[k >= 5 ? "5+" : String(k)] ??= { cases: 0, sufficient: 0, observable: {}, notApplicable: 0, unobservable: 0, cleanComplete: 0 };
    row.cases += 1; if (index.sufficient) row.sufficient += 1;
    row.observable[String(observableApplicableOf(result))] = (row.observable[String(observableApplicableOf(result))] ?? 0) + 1;
    row.notApplicable += index.excluded.filter((e) => e.reason === "not_applicable").length;
    row.unobservable += index.unobservableApplicableDimensions.length;
    if (isCleanCompleteV3(profile)) row.cleanComplete += 1;
  }
  assert.deepEqual([matrix["0"]!.sufficient, matrix["1"]!.sufficient, matrix["2"]!.sufficient], [0, 0, 0]);
  assert.equal(matrix["3"]!.sufficient, matrix["3"]!.cases);
  const gaps = corpus.reduce((acc, { profile }) => ({ instrument: acc.instrument + profile.instrumentGaps.length, respondent: acc.respondent + profile.respondentGaps.length }), { instrument: 0, respondent: 0 });
  report.sufficiency = { matrix, unreadObservableAreas: gaps };
});

test("R8-C Measurement: bank-unobservable, never read, outside the denominator — the legacy denominator is not restored", () => {
  assert.deepEqual([...CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3], ["measurement_optimization"]);
  assert.equal(CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds("measurement_optimization").length, 0);
  let differs = 0;
  for (const { id, answers } of r7CorpusV3()) {
    const result = run(answers), index = candidateIndexOf(result);
    const measurement = result.scoring.dimensions.find((d) => d.id === "measurement_optimization")!;
    if (measurement.applicability !== "applicable") continue;
    assert.equal(measurement.score, null, `${id}: never read`);
    assert.ok(index.unobservableApplicableDimensions.includes("measurement_optimization") && !index.scoredDimensions.includes("measurement_optimization"), id);
    const legacy = computeDigitalPresenceIndex(result.scoring, { prelaunch: result.narrative.lifecycle === "prelaunch", model: v2.overall });
    if (index.scoredDimensions.length > 0) { assert.ok(index.coverage > legacy.coverage, `${id}: the instrument limit never counts as a missing answer`); differs += 1; }
    assert.equal(index.coverage, index.scoredDimensions.length === 0 ? 0 : Math.round((index.scoredDimensions.length / observableApplicableOf(result)) * 100) / 100, id);
  }
  assert.ok(differs > 0);
  report.measurement = { casesWithApplicableMeasurement: differs };
});

test("R8-C rounding integrity: rawScore decides the band, displayScore presents it; boundaries, decimals and coverage fractions coherent; legacy single-argument helpers intact", () => {
  const bands = v2.overall.bands;
  assert.deepEqual(displayRoundingViolationsV3(bands), []);
  assert.deepEqual(coverageRoundingViolationsV3(v2), []);
  const table = [40, 40.49, 40.5, 40.99, 41, 41.49, 41.5, 70.49, 70.5, 70.99, 71, 71.5, 74.99, 75].map((x) => [x, displayScoreForBands(x, bands), resolveGlobalDigitalStatusForBands(x, bands).publicLabel]);
  assert.deepEqual(table, [[40, 40, "MAL"], [40.49, 40, "MAL"], [40.5, 40, "MAL"], [40.99, 40, "MAL"], [41, 41, "REGULAR"], [41.49, 41, "REGULAR"], [41.5, 42, "REGULAR"], [70.49, 70, "REGULAR"], [70.5, 70, "REGULAR"], [70.99, 70, "REGULAR"], [71, 71, "BIEN"], [71.5, 72, "BIEN"], [74.99, 75, "BIEN"], [75, 75, "BIEN"]]);
  assert.deepEqual([bandFor.length, displayScoreFor.length, resolveGlobalDigitalStatus.length], [1, 1, 1]);
  assert.deepEqual([40.5, 70.5, 71].map(displayScoreFor), [40, 70, 71], "callback contract");
  assert.deepEqual([40.5, 70.5, 71].map(bandFor), ["low", "developing", "solid"]);
  for (const x of [0, 33.33, 41, 58.25, 70.83, 73, 75]) assert.equal(bandForBands(x, bands), bandFor(x), "candidate bands equal the shared bands");
  report.rounding = { table };
});

test("R8-C bands: R3-ladder patterns hold, one-step size consistency is infeasible for any mean threshold, 41/71 retained", () => {
  const m = bandPatternMatrixV3(v2.overall.bands);
  assert.deepEqual(m.violations, []);
  assert.equal(m.singleStepConsistencyFeasible, false, "'one partial' BIEN for every n and 'one weak' REGULAR for every n cannot both hold");
  assert.ok(m.minOnePartial < m.maxOneWeak);
  assert.deepEqual(m.sizeConsistent, { "all established": true, "one partial": false, "one weak": true, "one missing": true, "two partial": true });
  for (const id of R8C_HYPOTHESES_V3.filter((h) => h.family === "BANDS_ONLY").map((h) => h.id)) {
    assert.deepEqual(bandPatternMatrixV3(r8cHypothesisCalibrationV3(R8C_HYPOTHESES_V3.find((h) => h.id === id)!).overall.bands).violations, [], `${id}: the semantic patterns do not discriminate`);
  }
  const corpus = r7CorpusV3().map(({ id, answers }) => ({ id, result: run(answers) }));
  assert.equal(corpus.filter(({ result }) => result.overall.caveat?.reason === "material_constraint").length, 0, "observed: no BIEN reading carries a material constraint");
  report.bands = { patterns: m.patterns, sizeConsistent: m.sizeConsistent, minOnePartial: m.minOnePartial, maxOneWeak: m.maxOneWeak };
});

test("R8-C band sensitivity: every single-answer crossing is explained (reading, supporting, coverage or index availability); thin-evidence crossings flagged", () => {
  const mutations = r8cMutationsV3();
  const selected = bandTransitionsV3(mutations, v2.overall.bands);
  assert.equal(selected.byKind.UNEXPLAINED ?? 0, 0);
  for (const t of selected.transitions) {
    assert.ok(t.transparent, `${t.caseId}/${t.questionId}: a withdrawn sibling reading loses a source and never gains confidence`);
    if (t.kind === "INDEX_AVAILABILITY") assert.ok(t.rawBefore === null || t.rawAfter === null);
    if (t.kind === "SUPPORTING_REFINEMENT") assert.equal(t.directness, "supporting");
    if (t.kind === "STATE_CHANGE" || t.kind === "READING_WITHDRAWN") assert.equal(t.directness, "direct");
    if (t.kind === "READING_WITHDRAWN") assert.match(t.change, /→(uncertainty|not_applicable)$/);
  }
  const alternatives = Object.fromEntries(R8C_HYPOTHESES_V3.filter((h) => h.family === "BANDS_ONLY").map((h) => {
    const x = bandTransitionsV3(mutations, r8cHypothesisCalibrationV3(h).overall.bands);
    assert.equal(x.byKind.UNEXPLAINED ?? 0, 0, h.id);
    return [h.id, { crossings: x.crossings, byKind: x.byKind, thinEvidence: x.thinEvidence }];
  }));
  report.bandSensitivity = {
    mutations: selected.mutations, crossings: selected.crossings, byKind: selected.byKind, thinEvidence: selected.thinEvidence, alternatives,
    nearThreshold: selected.transitions.filter((t) => t.distanceToThreshold !== null && t.distanceToThreshold <= 1 && t.kind !== "INDEX_AVAILABILITY").slice(0, 12),
    supporting: selected.transitions.filter((t) => t.kind === "SUPPORTING_REFINEMENT"),
  };
});

test("R8-C overall confidence: coverage and corroboration contract over every reachable composition; 0.5/0.75/0.5 retained", () => {
  const { violations, matrix } = overallConfidenceContractV3(v2);
  assert.deepEqual(violations, []);
  assert.deepEqual([matrix["3/7 all medium"], matrix["4/7 all medium"], matrix["3/6 all medium"], matrix["6/7 all high"], matrix["5/6 all high"]], ["low", "medium", "medium", "high", "high"]);
  assert.equal(matrix["5/7 all high"], "medium", "R8-O6: a fully corroborated 5-of-7 reading stays medium (bank-level denominator)");
  const corpus = r8cSelectionCorpusV3().map(({ id, answers, profile }) => ({ id, profile, result: run(answers) }));
  const levels: Record<string, number> = {};
  for (const { result } of corpus) levels[result.overall.confidence.level] = (levels[result.overall.confidence.level] ?? 0) + 1;
  assert.equal(levels.high ?? 0, 0, "observed: R5 asks one direct question per area, so corroboration is rare");
  // R8-O6 witness: a clean complete route whose context leaves 4 of 7 observable areas without a direct question.
  const witness = r8cContextLimitWitnessV3();
  const result = run(witness.answers), profile = routeProfileV3(witness.answers, result), index = candidateIndexOf(result);
  assert.ok(isCleanCompleteV3(profile), "complete, launched, no unknown or not-applicable direct answer");
  assert.deepEqual([index.scoredDimensions.length, observableApplicableOf(result), profile.instrumentGaps.length], [3, 7, 4]);
  assert.ok(index.scoredDimensions.every((d) => result.scoring.dimensions.find((x) => x.id === d)!.confidence.level === "medium"), "every read area is a clean direct reading");
  assert.deepEqual([result.overall.confidence.level, result.overall.provisional], ["low", true], "coverage 0.43 < 0.5 makes it preliminary (R8-O6)");
  report.overallConfidence = { matrix, corpusLevels: levels, witness: { id: `${witness.id} (seed 0x8c01)`, read: index.scoredDimensions, instrumentGaps: profile.instrumentGaps, coverage: index.coverage, band: result.overall.publicLabel } };
});

test("R8-C provisional and caveats: provisional ⇔ index with low confidence; caveats qualify only BIEN and never move band, number or label", () => {
  const bands = v2.overall.bands;
  const material = { dimension: "digital_readiness" as const, constraintId: "capacity_constraint:digital_readiness" };
  assert.deepEqual(classifyOverallState({ rawScore: 73, confidence: "medium", material, bands }), { state: "solid", bandState: "solid", caveat: { reason: "material_constraint", ...material } });
  assert.deepEqual(classifyOverallState({ rawScore: 73, confidence: "low", material: null, bands }), { state: "solid", bandState: "solid", caveat: { reason: "limited_confidence" } });
  assert.deepEqual(classifyOverallState({ rawScore: 60, confidence: "low", material, bands }), { state: "developing", bandState: "developing", caveat: null });
  assert.deepEqual(classifyOverallState({ rawScore: null, confidence: "low", material, bands }), { state: "insufficient", bandState: null, caveat: null });
  const a17b = run(corpusById().get("A17b")!);
  assert.deepEqual([a17b.overall.publicLabel, a17b.overall.confidence.level, a17b.overall.provisional, a17b.overall.caveat?.reason], ["BIEN", "low", true, "limited_confidence"], "3 of 7 read areas: preliminary BIEN, band unchanged");
  const tally: Record<string, number> = {};
  for (const { answers } of r7CorpusV3()) {
    const o = run(answers).overall;
    const key = `${o.publicLabel}:${o.confidence.level}:provisional=${o.provisional}:${o.caveat?.reason ?? "none"}`;
    tally[key] = (tally[key] ?? 0) + 1;
  }
  report.provisional = tally;
});

test("R8-C priority severity: R3-ladder 50/75 retained; one severity model for priorities, fact readings and prerequisites; C24 stays moderate without solution or license", () => {
  for (const { id, answers } of r7CorpusV3()) assert.deepEqual(severityCoherenceViolationsV3(run(answers), v2), [], id);
  const base = ADVERSARIAL_CASES_V3.find((c) => c.id === "A16")!.answers;
  const ladder = Object.fromEntries((["defined", "partial", "informal"] as const).map((option) => {
    const answers = { ...base, q2_process_systemization: option } as Record<string, unknown>;
    delete answers.q2_operations_handoffs; delete answers.q2_operations_information_base;
    const result = run(answers as AnswersV2);
    const constraint = result.priorities.constraints.find((k) => k.dimension === "digital_readiness" && (k.severity === "material" || k.severity === "moderate"));
    return [option, `${result.scoring.dimensions.find((d) => d.id === "digital_readiness")!.score}:${constraint?.severity ?? "none"}`];
  }));
  assert.deepEqual(ladder, { defined: "75:none", partial: "50:moderate", informal: "25:material" }, "established → no constraint, partial → moderate, weak → material");
  const c24 = run(r7CorpusV3().find((c) => c.id === "C24")!.answers);
  const readiness = c24.priorities.constraints.find((k) => k.dimension === "digital_readiness")!;
  const index = c24.recommendations.items.findIndex((r) => r.dimension === "digital_readiness");
  assert.deepEqual([readiness.score, readiness.severity, c24.recommendations.items[index]!.mode, c24.solutions[index]!.solution, c24.commercial.licenseFit.recommendedLicense], [67, "moderate", "improve", null, null]);
  const scores = syntheticDimensionScoresV3();
  report.severity = { ladder, c24: { score: 67, severity: "moderate", mode: "improve", solution: null, license: null }, syntheticScores: scores.length, inBand70to75: scores.filter((s) => s >= 70 && s < 75), inBand45to50: scores.filter((s) => s >= 45 && s < 50) };
});

test("R8-C supporting safety: supporting refines but never selects — matrix, C24 and N06 under v2 and under every hypothesis", () => {
  assert.deepEqual(supportingSafetyViolationsV3(v2), []);
  for (const r of allExperiments()) assert.deepEqual(r.contract.supporting, [], r.id);
  const answersById = corpusById();
  for (const id of ["C24", "N06"]) {
    const result = run(answersById.get(id)!);
    const index = result.recommendations.items.findIndex((r) => r.dimension === "digital_readiness");
    assert.ok(index >= 0 && result.solutions[index]!.solution === null && result.commercial.licenseFit.recommendedLicense === null, id);
  }
  report.supportingMatrix = supportingMatrixV3(v2);
});

test("R8-C metamorphic relations: monotone readings, no zero fill, comparable coverage never raises confidence, clarification and key order change nothing", () => {
  const mutations = r8cMutationsV3();
  assert.deepEqual(r8cMetamorphicViolationsV3(mutations), []);
  const pre = (r: CandidateCommercialBoundaryV3) => JSON.stringify([r.overall, r.priorities, r.semanticFacts, r.scoring.dimensions.map((d) => [d.id, d.score, d.confidence.level])]);
  for (const { id, answers } of r7CorpusV3()) {
    const base = run(answers);
    for (const clarificationAnswer of ["single_process", "multiple_coordinated_processes", "not_applicable", "not_sure"] as const) {
      assert.equal(pre(runR8cHistoricalBankModelV3(answers, v2, clarificationAnswer)), pre(base), `${id}: clarification ${clarificationAnswer}`);
    }
    const reversed = Object.fromEntries(Object.entries(answers).reverse()) as AnswersV2;
    const full = (r: CandidateCommercialBoundaryV3) => JSON.stringify([pre(r), r.recommendations, r.solutions, r.commercial]);
    assert.equal(full(run(reversed)), full(base), `${id}: answer-key order`);
  }
  report.metamorphic = { mutations: mutations.length, violations: 0 };
});

test("R8-C holdout (seeds 0x8c0c/0x8c0d, never used for selection): every contract holds under the selected calibration; R8-O6 measured", () => {
  const { answerBags, routes } = r8cHoldoutV3();
  assert.deepEqual([answerBags.length, routes.length], [300, 150]);
  const results: CandidateCommercialBoundaryV3[] = [];
  for (const { id, answers } of answerBags) {
    const result = run(answers);
    results.push(result);
    assert.deepEqual([...structuralViolations(result), ...overallContractViolationsV3(result, v2), ...severityCoherenceViolationsV3(result, v2)], [], id);
  }
  const routeRows = routes.map(({ id, answers }) => { const result = run(answers); return { id, result, profile: routeProfileV3(answers, result) }; });
  for (const { id, result } of routeRows) assert.deepEqual([...structuralViolations(result), ...overallContractViolationsV3(result, v2), ...severityCoherenceViolationsV3(result, v2)], [], id);
  assert.deepEqual(r8cExpectationViolationsV3(routeRows).filter((x) => !x.startsWith("OC6")), [], "IX1–IX3 hold on clean routes");
  const clean = routeRows.filter(({ profile, result }) => isCleanCompleteV3(profile) && result.overall.index.rawScore !== null);
  const lowByContext = clean.filter(({ result }) => result.overall.confidence.level === "low");
  for (const { id, result, profile } of lowByContext) {
    const index = candidateIndexOf(result);
    assert.ok(index.coverage < v2.overall.confidence.mediumCoverage && profile.instrumentGaps.length > 0, `${id}: the only low clean complete routes are context-limited coverage (R8-O6)`);
  }
  const shapes: Record<string, number> = {};
  for (const { result } of lowByContext) { const key = `${candidateIndexOf(result).scoredDimensions.length}/${observableApplicableOf(result)}`; shapes[key] = (shapes[key] ?? 0) + 1; }
  report.holdout = {
    answerBags: answerBags.length, routes: routes.length, cleanIndexedRoutes: clean.length, lowByContext: lowByContext.length, lowByContextShapes: shapes,
    expectation: R8C_EXPECTATIONS_V3.find((e) => e.id === "OB1"), families: familyBreakdownV3([...r7CorpusV3().map(({ answers }) => run(answers)), ...routeRows.map((x) => x.result)]),
  };
});

test("R8-C semantic invariance: no R8-C hypothesis moves evidence meaning, directness, applicability, active answers, scores or dimension confidence", () => {
  const projection = (answers: AnswersV2, calibration: CandidateCalibrationV3) => {
    const scoring = scoreCandidateContextualDimensionsV3({ answers, calibration });
    return JSON.stringify([scoring.dimensions.map((d) => [d.id, d.applicability, d.score, d.confidence, d.evidence.map((e) => [e.questionId, e.directness, e.state, e.contribution]), d.explainability])]);
  };
  const calibrations = R8C_HYPOTHESES_V3.filter((h) => h.id !== "BASELINE_V2").map((h) => r8cHypothesisCalibrationV3(h));
  for (const { id, answers } of r7CorpusV3()) {
    const reference = projection(answers, v2), active = JSON.stringify(run(answers).activeAnswers);
    for (const calibration of calibrations) {
      assert.equal(projection(answers, calibration), reference, id);
      assert.equal(JSON.stringify(run(answers, calibration).activeAnswers), active, id);
    }
  }
});

test("R8-C report (OBSERVATIONAL — FOR R8, NOT FROZEN)", () => {
  console.log(`R8C_CALIBRATION_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
