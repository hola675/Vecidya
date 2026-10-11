import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { CANONICAL_CASE_IDENTITY_V3, runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { r7CorpusV3 } from "./qbv2-r8-calibration-qa";
import { R8_HANDOFF_LABEL_V3, buildR8HandoffV3 } from "./qbv2-r8-handoff";
import { R8C_OPEN_DECISIONS_V3, r8cContextLimitWitnessV3 } from "./qbv2-r8c-overall-calibration-experiments";
import { confidenceContractV3 } from "./qbv2-r8b-calibration-experiments";
import {
  CANDIDATE_CALIBRATION_BASELINE_V1,
  CANDIDATE_CALIBRATION_IDENTITY_V3,
  CANDIDATE_CALIBRATION_R8B_V2,
  CANDIDATE_CALIBRATION_V3,
  CANDIDATE_CALIBRATION_VERSION_V3,
  type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, CANDIDATE_COMMERCIAL_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { buildCandidateQuestionPlanV3, CANDIDATE_PLANNER_IDENTITY_V3, type CandidateQuestionPlannerInputV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CANDIDATE_PROCESS_AUTHORITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, SCORING_MODEL } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { OVERALL_INDEX_MODEL, bandFor, buildDigitalPresenceStatus, computeDigitalPresenceIndex, computeOverallConfidence, displayScoreFor, resolveGlobalDigitalStatus } from "../../../app/features/diagnostic/qbv2-overall";
import { CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { SEVERITY_BANDS } from "../../../app/features/diagnostic/qbv2-priorities";
import {
  CURRENT_DIAGNOSTIC_VERSION,
  CURRENT_QUESTION_BANK_VERSION,
  CURRENT_RESULT_SCHEMA_VERSION,
  CURRENT_ROUTING_VERSION,
  CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/** DIAG-V3-R8-FINAL — one integrated certification gate over R3→R8. */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const deepFrozen = (value: unknown): boolean => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deepFrozen));
const testCount = (source: string) => source.split("\n").filter((line) => line.trimStart().startsWith("test(")).length;
const normalizedValues = ({ identity: _identity, version: _version, ...values }: CandidateCalibrationV3) => JSON.parse(JSON.stringify(values));

function commercialProjection(result: ReturnType<typeof buildCandidateCommercialBoundaryV3>) {
  return {
    // R8-B may add/remove a verify priority as confidence changes, but a null SolutionMatch is not a solution.
    solutions: result.recommendations.items.map((item, index) => ({
      dimension: item.dimension,
      solution: result.solutions[index]?.solution?.id ?? null,
    })).filter((item) => item.solution !== null).sort((a, b) => a.dimension.localeCompare(b.dimension)),
    licenseFit: result.commercial.licenseFit,
    now: result.commercial.now,
    later: result.commercial.later,
    cost: result.commercial.cost,
  };
}

function plannerInput(answers: AnswersV2, calibration: CandidateCalibrationV3): CandidateQuestionPlannerInputV3 {
  // The candidate planner deliberately has no calibration input. Keep a runtime probe so a future seam cannot
  // silently make question selection depend on the calibration version.
  return Object.assign({ answers }, { calibration }) as CandidateQuestionPlannerInputV3;
}

test("R8-FINAL: v1/v2 identity, version, every frozen value and immutability are exact", () => {
  assert.deepEqual([CANDIDATE_CALIBRATION_BASELINE_V1.identity, CANDIDATE_CALIBRATION_BASELINE_V1.version], ["diag-v3-candidate-calibration-v1", 1]);
  assert.deepEqual([CANDIDATE_CALIBRATION_R8B_V2.identity, CANDIDATE_CALIBRATION_R8B_V2.version], ["diag-v3-candidate-calibration-v2", 2]);
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual([CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3], ["diag-v3-candidate-calibration-v2", 2]);
  assert.deepEqual(normalizedValues(CANDIDATE_CALIBRATION_BASELINE_V1), {
    capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
    scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
    dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 },
    severity: { materialBelow: 50, moderateBelow: 75 },
    overall: { minScoredDimensions: 3, minCoverage: 1 / 3, bands: { developingFrom: 41, solidFrom: 71 }, confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 } },
  });
  assert.deepEqual(normalizedValues(CANDIDATE_CALIBRATION_R8B_V2), {
    capabilityContribution: { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
    scoring: { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
    dimensionConfidence: { supportingWeight: 0.5, mediumAt: 1, highAt: 2 },
    severity: { materialBelow: 50, moderateBelow: 75 },
    overall: { minScoredDimensions: 3, minCoverage: 1 / 3, bands: { developingFrom: 41, solidFrom: 71 }, confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 } },
  });
  assert.ok(deepFrozen(CANDIDATE_CALIBRATION_BASELINE_V1) && deepFrozen(CANDIDATE_CALIBRATION_R8B_V2));
  assert.doesNotMatch(read("../../../app/features/diagnostic/qbv2-candidate-calibration.ts"), /diag-v3-candidate-calibration-v3/);
});

test("R8-FINAL: R3→R8 integrated outputs stay reproducible and v1→v2 changes no score or commercial outcome", () => {
  const corpus = r7CorpusV3();
  assert.equal(corpus.length, 61, "25 canonical plus 36 adversarial/near-miss cases");

  for (const { id, answers } of corpus) {
    const v1 = buildCandidateCommercialBoundaryV3({ answers, calibration: CANDIDATE_CALIBRATION_BASELINE_V1 });
    const v2 = buildCandidateCommercialBoundaryV3({ answers, calibration: CANDIDATE_CALIBRATION_R8B_V2 });
    assert.deepEqual(v2, buildCandidateCommercialBoundaryV3({ answers, calibration: CANDIDATE_CALIBRATION_V3 }), `${id}: current alias is v2`);
    assert.deepEqual(
      v1.scoring.dimensions.map((d) => [d.id, d.applicability, d.score, d.confidence.direct, d.confidence.supporting, d.confidence.uncertain, d.confidence.contradictory]),
      v2.scoring.dimensions.map((d) => [d.id, d.applicability, d.score, d.confidence.direct, d.confidence.supporting, d.confidence.uncertain, d.confidence.contradictory]),
      `${id}: v1/v2 retain the same evidence, applicability and dimension scores`,
    );
    assert.deepEqual(
      [v1.overall.index.rawScore, v1.overall.index.displayScore, v1.overall.publicLabel],
      [v2.overall.index.rawScore, v2.overall.index.displayScore, v2.overall.publicLabel],
      `${id}: confidence calibration does not alter the overall score or band`,
    );
    assert.deepEqual(commercialProjection(v1), commercialProjection(v2), `${id}: solutions, license, offerings and cost stay unchanged`);
  }

  const confidenceV1 = confidenceContractV3(CANDIDATE_CALIBRATION_BASELINE_V1).matrix;
  const confidenceV2 = confidenceContractV3(CANDIDATE_CALIBRATION_R8B_V2).matrix;
  assert.deepEqual([confidenceV2["1 direct"].level, confidenceV2["1 direct + 1 supporting"].level, confidenceV2["2 direct"].level], ["medium", "medium", "high"]);
  assert.deepEqual([confidenceV1["2 direct"].level, confidenceV1["1 direct + 1 supporting"].level], ["medium", "medium"], "v1 remains a reproducible historical baseline with its former §31 limitation");
  assert.deepEqual([confidenceV2["0 direct + 1 supporting"].score, confidenceV2["0 direct + 1 supporting"].level], [null, "low"]);

  const sibling = corpus.find(({ id }) => id === "A14")!;
  const siblingResult = buildCandidateCommercialBoundaryV3({ answers: sibling.answers, calibration: CANDIDATE_CALIBRATION_V3 });
  const foundation = siblingResult.scoring.dimensions.find((d) => d.id === "digital_foundation")!;
  const siblingContributions = foundation.evidence.filter((e) => e.directness === "direct").map((e) => e.contribution).sort((a, b) => Number(a) - Number(b));
  assert.deepEqual(siblingContributions, [0.25, 0.75], "O4 checkpoint retains the certified arithmetic mean");
  assert.equal(foundation.score, 50);
});

test("R8-FINAL: planner selections are calibration-independent along representative R5 routes", () => {
  const selectedIds = new Set(["C04", "C09", "C13", "C15", "C18"]);
  for (const caseDef of CANONICAL_CASES_V3.filter((item) => selectedIds.has(item.id))) {
    let answers: AnswersV2 = {};
    const route = runCanonicalRouteV3(caseDef);
    for (const step of route.asked) {
      const v1 = buildCandidateQuestionPlanV3(plannerInput(answers, CANDIDATE_CALIBRATION_BASELINE_V1));
      const v2 = buildCandidateQuestionPlanV3(plannerInput(answers, CANDIDATE_CALIBRATION_R8B_V2));
      assert.deepEqual(v1, v2, `${caseDef.id}/${step.id}: calibration cannot change the R5 plan`);
      assert.equal(v2.nextQuestionId, step.id, `${caseDef.id}: fixture still follows its certified planner route`);
      answers = { ...v2.activeAnswers, [step.id]: step.answer };
    }
  }
});

test("R8-FINAL: historic bank-observable witness remains reproducible after O6 adopts its successor model", () => {
  const witness = r8cContextLimitWitnessV3();
  const result = buildCandidateCommercialBoundaryV3({ answers: witness.answers, calibration: CANDIDATE_CALIBRATION_V3 });
  const frozenBankIndex = computeDigitalPresenceIndex(result.scoring, { model: CANDIDATE_CALIBRATION_V3.overall });
  const bankObservable = frozenBankIndex.applicableDimensions.filter((id) => !CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id)).length;
  const historicIndex = { ...frozenBankIndex, coverage: Math.round((frozenBankIndex.scoredDimensions.length / bankObservable) * 100) / 100 };
  const historicConfidence = computeOverallConfidence(result.scoring, historicIndex, CANDIDATE_CALIBRATION_V3.overall);
  const historicStatus = buildDigitalPresenceStatus({
    scoring: result.scoring, priorities: result.priorities, semanticFacts: result.semanticFacts, narrative: result.narrative,
    computeIndex: () => historicIndex, computeConfidence: () => historicConfidence, bands: CANDIDATE_CALIBRATION_V3.overall.bands,
  });
  assert.deepEqual([witness.id, frozenBankIndex.scoredDimensions.length, bankObservable, historicIndex.coverage], ["route#24", 3, 7, 0.43]);
  assert.deepEqual([historicConfidence.level, historicStatus.provisional], ["low", true]);

  const decisions = new Map(R8C_OPEN_DECISIONS_V3.map((decision) => [decision.code, decision]));
  assert.deepEqual([decisions.get("R8-O3")?.status, decisions.get("R8-O3")?.requiresOwnCheckpointBeforeActivation], ["RETAINED_NO_ANCHOR", false]);
  for (const code of ["R8-O4", "R8-O6"]) {
    const decision = decisions.get(code);
    // This array is the immutable R8-C checkpoint snapshot, not current Open Debt.
    assert.deepEqual([decision?.status, decision?.blocksR8Final, decision?.requiresOwnCheckpointBeforeActivation], ["CALIBRATION_MODEL_DECISION_REQUIRED", false, true], code);
  }
  assert.match(read("../../../docs/STATUS.md"), /DIAG-V3-R8-O4-SIBLING-AGGREGATION-001[^\n]*RESUELTA[^\n]*KEEP_CURRENT_MEAN/i);
  assert.match(read("../../../docs/STATUS.md"), /DIAG-V3-R8-O6-CONTEXT-OBSERVABILITY-001[^\n]*RESUELTA[^\n]*ADOPT_CONTEXT_OBSERVABLE/i);
});

test("R8-FINAL: candidate pipeline identity and upstream certification suites remain present", () => {
  assert.deepEqual([
    CANDIDATE_PLANNER_IDENTITY_V3,
    CANDIDATE_COMMERCIAL_IDENTITY_V3,
    CANDIDATE_PROCESS_AUTHORITY_V3,
    CANONICAL_CASE_IDENTITY_V3,
  ], [
    "reviewed-evidence-v3+r3+r4+candidate-planner-v2",
    "commercial-product-system-v1+diag-v3-candidate-v1",
    "q2_process_systemization",
    "diag-v3-canonical-cases-v1",
  ]);
  assert.equal(R8_HANDOFF_LABEL_V3, "OBSERVATIONAL — FOR R8, NOT FROZEN");
  const handoff = buildR8HandoffV3();
  assert.deepEqual(handoff.calibration, { identity: "diag-v3-candidate-calibration-v2", version: 2 });
  assert.equal(handoff.cases.length, 25);

  const suites: Readonly<Record<string, readonly [string, number]>> = {
    "R3-FINAL": ["./qbv2-r3-final-certification.test.ts", 7],
    "R4-FINAL": ["./qbv2-r4-final-certification.test.ts", 10],
    "R5-FINAL": ["./qbv2-r5-final-certification.test.ts", 10],
    "R6-FINAL": ["./qbv2-r6-final-certification.test.ts", 10],
    "R7-FINAL": ["./qbv2-r7-final-certification.test.ts", 8],
    "R8-A": ["./qbv2-r8a-calibration-isolation.test.ts", 12],
    "R8-B": ["./qbv2-r8b-dimension-calibration.test.ts", 9],
    "R8-B-CERT": ["./qbv2-r8b-calibration-certification.test.ts", 5],
    "R8-C": ["./qbv2-r8c-overall-calibration.test.ts", 14],
    "R8-C-CERT": ["./qbv2-r8c-calibration-certification.test.ts", 6],
  };
  for (const [name, [file, expected]] of Object.entries(suites)) assert.equal(testCount(read(file)), expected, `${name} suite inventory`);
});

test("R8-FINAL: legacy runtime stays on its frozen contract and candidate modules remain unreachable from app entry points", async () => {
  assert.deepEqual(CAPABILITY_CONTRIBUTION, { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null });
  assert.deepEqual([SCORING_MODEL, CONFIDENCE_MODEL, SEVERITY_BANDS], [
    { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
    { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 },
    { materialBelow: 50, moderateBelow: 75 },
  ]);
  assert.deepEqual(OVERALL_INDEX_MODEL, { minScoredDimensions: 3, minCoverage: 1 / 3, bands: { developingFrom: 41, solidFrom: 71 }, confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 } });
  assert.deepEqual([bandFor.length, displayScoreFor.length, resolveGlobalDigitalStatus.length], [1, 1, 1]);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([
    CURRENT_DIAGNOSTIC_VERSION,
    CURRENT_QUESTION_BANK_VERSION,
    CURRENT_ROUTING_VERSION,
    CURRENT_SCORING_VERSION,
    CURRENT_RESULT_SCHEMA_VERSION,
  ], ["2.0", 1, 1, 1, 1]);
  assert.match(read("../../../app/features/diagnostic/qbv2-solutions.ts"), /^const SOUND = 75;$/m);

  const barrel = await import("../../../app/features/diagnostic/index") as Record<string, unknown>;
  for (const symbol of [
    "CANDIDATE_CALIBRATION_BASELINE_V1", "CANDIDATE_CALIBRATION_R8B_V2", "CANDIDATE_CALIBRATION_V3",
    "scoreCandidateContextualDimensionsV3", "buildCandidateQuestionPlanV3", "computeCandidateDigitalPresenceIndexV3",
    "buildCandidateCommercialBoundaryV3",
  ]) assert.equal(barrel[symbol], undefined, `${symbol} must remain private`);

  const appRoot = new URL("../../../app/", import.meta.url);
  const files = (readdirSync(appRoot, { recursive: true }) as string[]).map((file) => file.replaceAll("\\", "/")).filter((file) => /\.tsx?$/.test(file));
  const localCandidateEntries = new Set([
    // QA-03B: entradas locales explícitas; las rutas siguen excluidas del build.
    "components/diagnostic-flow/qa03b-diagnostic-flow.tsx",
    "components/diagnostic-flow/qa03b-result.tsx",
    "components/diagnostic-flow/qa03b-presentation.ts",
    "routes/dev-diagnostic-qa03b.tsx",
    "routes/dev-diagnostic-qa03b-methodology.tsx",
    "routes/dev-diagnostic-qa03b-report.tsx",
    "components/diagnostic-flow/candidate-diagnostic-flow.tsx",
    "components/diagnostic-flow/candidate-result.tsx",
    "components/diagnostic-flow/candidate-presentation.ts",
    "routes/dev-diagnostic-candidate.tsx",
    "routes/dev-diagnostic-candidate-methodology.tsx",
    "routes/dev-diagnostic-candidate-report.tsx",
  ]);
  const leaks = files.filter((file) => !/(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file) && !localCandidateEntries.has(file) && readFileSync(new URL(file, appRoot), "utf8").includes("qbv2-candidate-"));
  assert.deepEqual(leaks, [], "candidate computational modules remain private; only the explicit development harness may import them");
  assert.match(read("../../../app/routes.ts"), /route\("__dev\/diagnostico\/candidate", "routes\/dev-diagnostic-candidate\.tsx"\)/);
  assert.match(read("../../../app/routes.ts"), /route\("__dev\/diagnostico\/candidate\/metodologia", "routes\/dev-diagnostic-candidate-methodology\.tsx"\)/);
  assert.match(read("../../../app/routes.ts"), /route\("__dev\/diagnostico\/candidate\/informe", "routes\/dev-diagnostic-candidate-report\.tsx"\)/);
  assert.match(read("../../../app/routes.ts"), /\.\.\.\(isDevelopmentServer \? \[/);
  assert.match(read("../../../app/routes/dev-diagnostic-candidate.tsx"), /if \(!import\.meta\.env\.DEV\) throw new Response\("Not Found", \{ status: 404 \}\)/);
  for (const route of ["../../../app/routes/dev-diagnostic-candidate-methodology.tsx", "../../../app/routes/dev-diagnostic-candidate-report.tsx"]) {
    assert.match(read(route), /if \(!import\.meta\.env\.DEV\) throw new Response\("Not Found", \{ status: 404 \}\)/);
  }
  // The activation manifest names the candidate entrypoint as metadata; count executable imports only.
  const candidateFlowConsumers = files.filter((file) => /\bfrom\s*["'][^"']*candidate-diagnostic-flow(?:\.tsx?)?["']/.test(readFileSync(new URL(file, appRoot), "utf8")));
  assert.deepEqual(candidateFlowConsumers, ["routes/dev-diagnostic-candidate.tsx"]);
});
