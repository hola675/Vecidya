import test from "node:test";
import assert from "node:assert/strict";
import { structuralViolations } from "./qbv2-candidate-qa-harness";
import { calibrationExpectationViolationsV3, candidateCalibrationInvariantViolationsV3, r7CorpusV3 } from "./qbv2-r8-calibration-qa";
import {
  R8B_HYPOTHESES_V3, confidenceContractV3, downstreamDiffV3, holdoutCorpusV3, hypothesisCalibrationV3, r3SemanticViolationsV3, runR8bExperimentV3,
  selectR8bCalibrationV3, supportingMatrixV3,
} from "./qbv2-r8b-calibration-experiments";
import {
  CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_R8B_V2, CANDIDATE_CALIBRATION_V3, type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8-B — capability contribution & dimension confidence calibration. Certifies the reproducible
 * experiment and its selection (v2 = v1 with dimension-confidence thresholds 1/2), the confidence contract,
 * the supporting matrix, the explained downstream effects, a never-used holdout and semantic invariance.
 * Asserts rules and v1→v2 comparisons, never a target number for a business (R7 cases are not ground truth).
 */

const run = (answers: AnswersV2, calibration: CandidateCalibrationV3) => buildCandidateCommercialBoundaryV3({ answers, calibration });
const strip = ({ identity: _i, version: _v, ...rest }: CandidateCalibrationV3) => JSON.parse(JSON.stringify(rest));
const report: Record<string, unknown> = {};

test("R8-B: every hypothesis is evaluated reproducibly; the §32 procedure selects CONFIDENCE_H1 and v2 is exactly that hypothesis", () => {
  const results = R8B_HYPOTHESES_V3.map((h) => runR8bExperimentV3(h));
  const { selected, eliminated } = selectR8bCalibrationV3(results);
  assert.equal(selected, "CONFIDENCE_H1");
  assert.deepEqual(Object.keys(eliminated).sort(), R8B_HYPOTHESES_V3.map((h) => h.name).filter((n) => n !== selected).sort(), "every other hypothesis is eliminated with a recorded reason");
  assert.deepEqual(strip(CANDIDATE_CALIBRATION_R8B_V2), strip(hypothesisCalibrationV3(R8B_HYPOTHESES_V3.find((h) => h.name === selected)!)));
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2, "the selected calibration is the current one");
  report.experiments = results.map((r) => ({ name: r.name, family: r.family, patch: r.patch, unanchored: r.unanchored, r3: r.r3SemanticViolations.length, contract: r.confidenceContract.violations, expectations: r.expectationViolations, downstream: { constraints: r.downstream.constraints.length, recommendations: r.downstream.recommendations.length, licenses: r.downstream.licenses.length, items: r.downstream.items.length, structural: r.downstream.structuralViolations }, bands: r.evaluation.bands, overallConfidence: r.evaluation.overallConfidence, supportingDelta: r.evaluation.supportingDelta, siblingDisagreement: r.evaluation.siblingDisagreement }));
  report.selection = { selected, eliminated };
});

test("R8-B: only the two dimension-confidence thresholds move v1 → v2; contributions, supporting weights, severity and overall stay; ladder and null partition intact", () => {
  const v1 = strip(CANDIDATE_CALIBRATION_BASELINE_V1), v2 = strip(CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual({ ...v2, dimensionConfidence: v1.dimensionConfidence }, v1, "nothing but dimensionConfidence differs");
  assert.deepEqual([v1.dimensionConfidence, v2.dimensionConfidence], [{ supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 }, { supportingWeight: 0.5, mediumAt: 1, highAt: 2 }]);
  for (const calibration of [CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_R8B_V2]) {
    assert.deepEqual(candidateCalibrationInvariantViolationsV3(calibration), [], calibration.identity);
    assert.deepEqual(r3SemanticViolationsV3(calibration), [], `${calibration.identity}: established stays below strong`);
    const k = calibration.capabilityContribution;
    assert.deepEqual([k.constraint, k.uncertainty, k.not_applicable], [null, null, null]);
  }
});

test("R8-B: the confidence contract holds under v2 on synthetic evidence through the real core; v1 broke §31", () => {
  const v2 = confidenceContractV3(CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual(v2.violations, []);
  assert.deepEqual(confidenceContractV3(CANDIDATE_CALIBRATION_BASELINE_V1).violations, ["two direct sources must not equal one direct source plus supporting (§31)"]);
  report.confidenceMatrix = { v1: confidenceContractV3(CANDIDATE_CALIBRATION_BASELINE_V1).matrix, v2: v2.matrix };
});

test("R8-B: contract-derived expectations — all hold under v2; v1 failed exactly K1 and K9", () => {
  assert.deepEqual(calibrationExpectationViolationsV3(CANDIDATE_CALIBRATION_R8B_V2), []);
  assert.deepEqual(calibrationExpectationViolationsV3(CANDIDATE_CALIBRATION_BASELINE_V1), ["K1", "K9"]);
});

test("R8-B: supporting matrix (§15) — unchanged v1 → v2; supporting never scores, establishes or selects; the direct reading dominates", () => {
  const v1 = supportingMatrixV3(CANDIDATE_CALIBRATION_BASELINE_V1), v2 = supportingMatrixV3(CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual(v2.map(({ confidence: _c, ...row }) => row), v1.map(({ confidence: _c, ...row }) => row), "scores, solutions and licenses identical");
  const value = { established: 75, partial: 50, weak: 25 } as Record<string, number>;
  for (const row of v2) {
    if (row.direct === "unknown" || row.direct === "absent") {
      assert.deepEqual([row.score, row.confidence, row.solution, row.license], [null, "low", null, null], `${row.direct}/${row.supporting}: supporting alone never scores or selects`);
      continue;
    }
    const d = value[row.direct]!, s = value[row.supporting]!;
    assert.ok(row.score! >= Math.min(d, s) && row.score! <= Math.max(d, s), `${row.direct}/${row.supporting}: refinement stays between the readings`);
    assert.ok(Math.abs(row.score! - d) <= Math.abs(row.score! - s), `${row.direct}/${row.supporting}: the direct reading dominates`);
  }
  report.supportingMatrix = v2.map((row, i) => ({ ...row, confidenceV1: v1[i]!.confidence }));
});

test("R8-B: downstream v1 → v2 over the R7 corpus is exactly the four declared-friction verify items, replaced by R6's contradiction fact; no solution, license or item moves", () => {
  const diff = downstreamDiffV3(CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_R8B_V2);
  const declared = ["A07", "A07c", "A07e", "C20"];
  assert.deepEqual([[...diff.constraints].sort(), [...diff.recommendations].sort(), diff.licenses, diff.items, diff.structuralViolations], [declared, declared, [], [], 0]);
  const answersById = new Map(r7CorpusV3().map((c) => [c.id, c.answers]));
  for (const id of declared) {
    const before = run(answersById.get(id)!, CANDIDATE_CALIBRATION_BASELINE_V1), after = run(answersById.get(id)!, CANDIDATE_CALIBRATION_R8B_V2);
    const gap = before.priorities.constraints.filter((c) => c.kind === "evidence_gap");
    assert.ok(gap.length === 1 && gap[0]!.reasonCodes.includes("declared_friction_unconfirmed"), `${id}: v1 verify came from the low-confidence declared-friction rule`);
    assert.equal(after.priorities.constraints.some((c) => c.kind === "evidence_gap"), false, `${id}: v2 reading is no longer low`);
    assert.ok(after.semanticFacts.facts.some((f) => f.id.startsWith("contradiction:declared_friction:")), `${id}: R6 states the unconfirmed declared friction instead`);
    assert.equal(after.recommendations.items.some((r) => r.mode === "improve" && r.dimension === gap[0]!.dimension), false, `${id}: declared friction never becomes improve`);
  }
  report.downstream = { r7: diff };
});

test("R8-B: deterministic holdout (seed 0x8b0b, never used for selection) — structure, neutrality, provenance, confidence rules and commercial safety under v2", () => {
  const holdout = holdoutCorpusV3();
  assert.equal(holdout.length, 300);
  const reordered: string[] = [];
  for (const { id, answers } of holdout) {
    const a = run(answers, CANDIDATE_CALIBRATION_BASELINE_V1), b = run(answers, CANDIDATE_CALIBRATION_R8B_V2);
    assert.deepEqual(structuralViolations(b), [], id);
    assert.equal(b.commercial.licenseFit.recommendedLicense, a.commercial.licenseFit.recommendedLicense, `${id}: license`);
    const items = (r: CandidateCommercialBoundaryV3) => [...r.commercial.now.services, ...r.commercial.now.complements, ...r.commercial.later.services, ...r.commercial.later.complements].map((x) => x.id);
    assert.deepEqual(items(b), items(a), `${id}: commercial items`);
    const recs = (r: CandidateCommercialBoundaryV3) => r.recommendations.items.map((x, i) => `${x.dimension}:${x.mode}:${r.solutions[i]!.solution?.id ?? "null"}`);
    if (JSON.stringify(recs(a)) !== JSON.stringify(recs(b))) { reordered.push(id); assert.deepEqual([...recs(b)].sort(), [...recs(a)].sort(), `${id}: only the order may move (R6-A certainty tie-break)`); }
    for (const d of b.scoring.dimensions) {
      const direct = d.evidence.filter((e) => e.directness === "direct" && e.contribution !== null).length;
      if (direct === 0) assert.equal(d.confidence.level, "low", `${id}/${d.id}: no direct → low`);
      if (direct === 1) assert.notEqual(d.confidence.level, "high", `${id}/${d.id}: one direct source never high`);
    }
  }
  report.holdout = { inputs: holdout.length, reorderedRecommendations: reordered };
});

test("R8-B: v2 moves no score and no semantics — states, applicability, provenance and the planner's inputs are identical to v1 over the R7 corpus and the holdout", () => {
  const projection = (answers: AnswersV2, calibration: CandidateCalibrationV3) => scoreCandidateContextualDimensionsV3({ answers, calibration }).dimensions.map((d) => ({
    id: d.id, applicability: d.applicability, score: d.score, direct: d.confidence.direct, supporting: d.confidence.supporting, contradictory: d.confidence.contradictory,
    evidence: d.evidence.map((e) => [e.questionId, e.directness, e.state, e.contribution]), explainability: d.explainability,
  }));
  let levelChanges = 0;
  for (const { id, answers } of [...r7CorpusV3(), ...holdoutCorpusV3()]) {
    assert.deepEqual(projection(answers, CANDIDATE_CALIBRATION_R8B_V2), projection(answers, CANDIDATE_CALIBRATION_BASELINE_V1), id);
    const v1 = scoreCandidateContextualDimensionsV3({ answers, calibration: CANDIDATE_CALIBRATION_BASELINE_V1 }).dimensions;
    const v2 = scoreCandidateContextualDimensionsV3({ answers, calibration: CANDIDATE_CALIBRATION_R8B_V2 }).dimensions;
    levelChanges += v2.filter((d, i) => d.confidence.level !== v1[i]!.confidence.level).length;
  }
  report.semanticInvariance = { scoreChanges: 0, semanticChanges: 0, confidenceLevelChanges: levelChanges };
  assert.ok(levelChanges > 0);
});

test("R8-B report (OBSERVATIONAL — FOR R8, NOT FROZEN)", () => {
  console.log(`R8B_CALIBRATION_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
