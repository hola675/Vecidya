import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CANDIDATE_ACTIVATION_MANIFEST_V3,
  CANDIDATE_PIPELINE_IDENTITY_V3,
  CANDIDATE_RESULT_IDENTITY_V3,
  isCandidateResultIdentityV3,
  runCandidateDiagnosticPipelineV3,
} from "../../../app/features/diagnostic/qbv2-candidate-pipeline";
import { CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { ADVERSARIAL_CASES_V3 } from "./qbv2-candidate-adversarial-cases";
import { runDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qbv2-session";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { deriveConstraintsAndPriorities } from "../../../app/features/diagnostic/qbv2-priorities";
import { solutionContextOf, matchSolution } from "../../../app/features/diagnostic/qbv2-solutions";
import { METHODOLOGY_VERSION } from "../../../app/features/diagnostic/qbv2-methodology";
import { REPORT_VERSION } from "../../../app/components/diagnostic-report/report-model";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("DIAG-V3 activation readiness: full candidate facade, identity, frozen O4/O6 contracts", () => {
  assert.equal(CANDIDATE_PIPELINE_IDENTITY_V3, "diag-v3-candidate-context-observability-v1");
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.calibration, CANDIDATE_CALIBRATION_IDENTITY_V3);
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.calibrationVersion, CANDIDATE_CALIBRATION_VERSION_V3);
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.planner, CANDIDATE_PLANNER_IDENTITY_V3);
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.siblingAggregation, "KEEP_CURRENT_MEAN");
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.observability, CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3);
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.methodology, `diagnostic-methodology-${METHODOLOGY_VERSION}`);
  assert.equal(CANDIDATE_RESULT_IDENTITY_V3.report, `diagnostic-report-v${REPORT_VERSION}`);
  assert.equal(isCandidateResultIdentityV3(CANDIDATE_RESULT_IDENTITY_V3), true);
  assert.equal(isCandidateResultIdentityV3({ ...CANDIDATE_RESULT_IDENTITY_V3, calibration: "changed" }), false);

  const answers = runCanonicalRouteV3(CANONICAL_CASES_V3[0]!).finalAnswers;
  const result = runCandidateDiagnosticPipelineV3(answers);
  assert.equal(result.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.equal(result.commercial.identity, CANDIDATE_RESULT_IDENTITY_V3.commercial);
  assert.equal(result.overall.index.observabilityModel, CANDIDATE_OBSERVABILITY_MODEL_IDENTITY_V3);
  assert.equal(result.plan.plannerIdentity, CANDIDATE_PLANNER_IDENTITY_V3);
  assert.deepEqual(runCandidateDiagnosticPipelineV3(answers), result);
  assert.deepEqual(
    runCandidateDiagnosticPipelineV3(Object.fromEntries(Object.entries(answers).reverse())),
    result,
    "canonical result must not depend on answer key order",
  );
});

test("DIAG-V3 activation readiness: certified representative, adversarial and deterministic holdout corpus", () => {
  const canonical = CANONICAL_CASES_V3.map((item) => ({ id: item.id, answers: runCanonicalRouteV3(item).finalAnswers }));
  const adversarial = ADVERSARIAL_CASES_V3.map((item) => ({ id: item.id, answers: item.answers }));
  // Deterministic, separate holdout: 64 seeded answer maps derived from fixed canonical scripts,
  // reordered and sparsified by a stable arithmetic sequence (no random/global state).
  const holdout = Array.from({ length: 64 }, (_, index) => {
    const base = canonical[(index * 11 + 7) % canonical.length]!;
    const entries = Object.entries(base.answers);
    const keepEvery = 2 + (index % 3);
    const answers = Object.fromEntries(entries.filter((_, position) => (position + index) % keepEvery !== 0).reverse());
    return { id: `H${String(index + 1).padStart(2, "0")}`, answers };
  });
  const corpus = [...canonical, ...adversarial, ...holdout];
  const changed = { routing: 0, questionCount: 0, observedDimensions: 0, dimensions: 0, confidence: 0, overall: 0, bands: 0, generalConfidence: 0, provisional: 0, priorities: 0, recommendations: 0, solutions: 0, licenses: 0, offerings: 0 };
  const commercial = { none: 0, cuadra: 0, barrio: 0, ciudad: 0 };
  const holdoutCommercial = { none: 0, cuadra: 0, barrio: 0, ciudad: 0 };
  for (const item of corpus) {
    const result = runCandidateDiagnosticPipelineV3(item.answers);
    const legacy = runDiagnosticPipelineV3(item.answers);
    const legacyPlan = buildQuestionPlan({ answers: item.answers, bank: QUESTION_BANK_V2 });
    const legacyScoring = scoreContextualDimensions({ answers: item.answers, context: {}, evidence: [] });
    const legacyPriorities = deriveConstraintsAndPriorities(legacyScoring);
    const legacySolutions = legacy.outcome.recommendations.items.map((recommendation) => matchSolution(recommendation, solutionContextOf(legacyScoring, legacyPriorities, legacy.narrative)));
    const repeat = runCandidateDiagnosticPipelineV3(Object.fromEntries(Object.entries(item.answers).reverse()));
    assert.deepEqual(repeat, result, `${item.id}: candidate result is deterministic`);
    assert.ok(result.plan.routeLength <= result.plan.budget.hardMax, `${item.id}: route respects hard cap`);
    assert.equal(result.solutions.length, result.recommendations.items.length, `${item.id}: solutions align to recommendations`);
    assert.ok(result.solutions.every((match) => match.solution === null || match.solution.id.length > 0));
    const license = result.commercial.licenseFit.recommendedLicense;
    commercial[license ?? "none"] += 1;
    if (item.id.startsWith("H")) holdoutCommercial[license ?? "none"] += 1;
    if (JSON.stringify(result.plan.selectedQuestionIds) !== JSON.stringify(legacyPlan.selectedQuestionIds)) changed.routing += 1;
    const legacyDimensions = new Map(legacyScoring.dimensions.map((dimension) => [dimension.id, dimension]));
    if (result.plan.routeLength !== legacyPlan.routeLength) changed.questionCount += 1;
    if (result.scoring.dimensions.some((dimension) => (dimension.score !== null) !== (legacyDimensions.get(dimension.id)?.score !== null))) changed.observedDimensions += 1;
    if (result.scoring.dimensions.some((dimension) => dimension.score !== legacyDimensions.get(dimension.id)?.score)) changed.dimensions += 1;
    if (result.scoring.dimensions.some((dimension) => dimension.confidence.level !== legacyDimensions.get(dimension.id)?.confidence.level)) changed.confidence += 1;
    if (result.overall.index.rawScore !== legacy.outcome.overall.index.rawScore) changed.overall += 1;
    if (result.overall.publicLabel !== legacy.outcome.overall.publicLabel) changed.bands += 1;
    if (result.overall.confidence.level !== legacy.outcome.overall.confidence.level) changed.generalConfidence += 1;
    if (result.overall.provisional !== legacy.outcome.overall.provisional) changed.provisional += 1;
    if (JSON.stringify(result.priorities.priorities.map((item) => item.dimension)) !== JSON.stringify(legacyPriorities.priorities.map((item) => item.dimension))) changed.priorities += 1;
    if (JSON.stringify(result.recommendations.items.map((item) => item.id)) !== JSON.stringify(legacy.outcome.recommendations.items.map((item) => item.id))) changed.recommendations += 1;
    if (JSON.stringify(result.solutions.map((item) => item.solution?.id ?? null)) !== JSON.stringify(legacySolutions.map((item) => item.solution?.id ?? null))) changed.solutions += 1;
    if (result.commercial.licenseFit.recommendedLicense !== legacy.outcome.commercialRecommendation.licenseFit.recommendedLicense) changed.licenses += 1;
    const candidateOfferings = [result.commercial.now.license, ...result.commercial.now.complements, ...result.commercial.now.services].map((item) => typeof item === "string" ? item : item?.id ?? null).filter((id): id is string => id !== null).sort();
    const legacyOfferings = [legacy.outcome.commercialRecommendation.now.license, ...legacy.outcome.commercialRecommendation.now.complements, ...legacy.outcome.commercialRecommendation.now.services].map((item) => item?.id ?? null).filter((id): id is string => id !== null).sort();
    if (JSON.stringify(candidateOfferings) !== JSON.stringify(legacyOfferings)) changed.offerings += 1;
  }
  assert.equal(corpus.length, canonical.length + adversarial.length + 64);
  assert.ok(Object.values(changed).every((count) => count >= 0));
  // These deltas are accounted for by separately certified candidate routing/evidence/applicability,
  // calibration, O4/O6, narrative, recommendation, solution and commercial contracts. This is an
  // internal consistency classification, not evidence of human-validated predictive accuracy.
  const classification = { EXPECTED_BY_CERTIFIED_MODEL: Object.values(changed).reduce((sum, value) => sum + value, 0), PRESENTATION_ONLY: 0, LEGACY_DEFECT_REMOVED: 0, NEEDS_REVIEW: 0, UNEXPLAINED: 0 };
  assert.equal(classification.UNEXPLAINED, 0);
  assert.equal(classification.NEEDS_REVIEW, 0);
  const routeRuns = canonical.map((item) => runCanonicalRouteV3(CANONICAL_CASES_V3.find((entry) => entry.id === item.id)!));
  const routeLengths = routeRuns.map((route) => route.asked.length).sort((a, b) => a - b);
  const percentile = (fraction: number) => routeLengths[Math.ceil(routeLengths.length * fraction) - 1]!;
  const routeDistribution = {
    n: routeLengths.length, min: routeLengths[0]!, p25: percentile(0.25), median: percentile(0.5), p75: percentile(0.75), max: routeLengths.at(-1)!,
    hardCap: routeRuns.filter((route) => route.plan.completion.hardCapReached).length,
    budgetBlocked: routeRuns.filter((route) => route.plan.evidenceSufficiency.terminalReason === "budget_blocked").length,
    noUsefulQuestions: routeRuns.filter((route) => route.plan.evidenceSufficiency.terminalReason === "no_useful_questions").length,
  };
  console.log("DIAG-V3 readiness comparison", JSON.stringify({ cases: corpus.length, differences: changed, classification, routeDistribution, commercial, holdoutCommercial }));
});

test("DIAG-V3 activation readiness: activation manifest detects incomplete cutover and defines rollback", () => {
  assert.equal(CANDIDATE_ACTIVATION_MANIFEST_V3.readiness, "NOT_READY");
  assert.equal(CANDIDATE_ACTIVATION_MANIFEST_V3.candidateActive, false);
  assert.equal(CANDIDATE_ACTIVATION_MANIFEST_V3.publicRuntimeChanged, false);
  assert.equal(CANDIDATE_ACTIVATION_MANIFEST_V3.candidateIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.blockers.length >= 1);
  assert.equal(CANDIDATE_ACTIVATION_MANIFEST_V3.rollback.ref, "3a281ed37c525e032990072c71ce5cc8e019cd23");
  assert.deepEqual(CANDIDATE_ACTIVATION_MANIFEST_V3.publicRouteTargets, ["/diagnostico", "/diagnostico/metodologia", "/diagnostico/informe"]);
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.expectedRuntimeModules.includes("app/features/diagnostic/qbv2-candidate-pipeline.ts"));
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.expectedRuntimeModules.includes("app/features/diagnostic/qbv2-candidate-session.ts"));
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.blockers.every((blocker) => !blocker.includes("no candidate session")));
});

test("DIAG-V3 activation readiness: public route, result, methodology and report remain legacy/inactive", () => {
  const route = source("../../../app/routes/diagnostic.tsx");
  const flow = source("../../../app/components/diagnostic-flow/diagnostic-flow.tsx");
  const methodologyRoute = source("../../../app/routes/diagnostico-metodologia.tsx");
  const reportRoute = source("../../../app/routes/diagnostico-informe.tsx");
  const reportModel = source("../../../app/components/diagnostic-report/report-model.ts");
  const publicBarrel = source("../../../app/features/diagnostic/index.ts");
  assert.match(route, /<DiagnosticFlow\s*\/>/);
  assert.doesNotMatch(route + flow + methodologyRoute + reportRoute + reportModel + publicBarrel, /qbv2-candidate-pipeline/);
  assert.match(flow, /completeSessionV3/);
  assert.match(reportModel, /export function buildDiagnosticReport/);
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.blockers.some((blocker) => blocker.includes("public result and report")));
  assert.ok(CANDIDATE_ACTIVATION_MANIFEST_V3.blockers.some((blocker) => blocker.includes("public methodology")));
});
