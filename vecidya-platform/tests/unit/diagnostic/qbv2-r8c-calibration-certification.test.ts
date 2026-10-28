import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { CALIBRATION_OWNERSHIP_V3, sharedReferenceCalibrationV3 } from "./qbv2-r8-calibration-qa";
import { buildR8HandoffV3 } from "./qbv2-r8-handoff";
import { R8C_HYPOTHESES_V3, R8C_OPEN_DECISIONS_V3, r8cParameterValuesV3 } from "./qbv2-r8c-overall-calibration-experiments";
import {
  CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_R8B_V2, CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_VERSION_V3,
  type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { CANDIDATE_COMMERCIAL_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, SCORING_MODEL } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { METHODOLOGY_ENGINE_CONTRACT } from "../../../app/features/diagnostic/qbv2-methodology";
import { OVERALL_INDEX_MODEL, bandFor, displayScoreFor, resolveGlobalDigitalStatus } from "../../../app/features/diagnostic/qbv2-overall";
import { SEVERITY_BANDS } from "../../../app/features/diagnostic/qbv2-priorities";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { ADAPTIVE_PLANNER_VERSION } from "../../../app/features/diagnostic/qbv2-planner";
import {
  CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";

/**
 * DIAG-V3-R8-C certification gate. R8-C retained every value it owns, so v2 stays active and reproducible.
 * DIAG-MOTOR-02 adds a separate, inactive representativeness proposal v3; it does not alter R8-owned scoring,
 * confidence, bands, legacy runtime or public helpers. R8-O4/O6 remain gated from activation pending review.
 * The evidence for the R8-C decision lives in
 * `qbv2-r8c-overall-calibration.test.ts`.
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const values = ({ identity: _i, version: _v, ...rest }: CandidateCalibrationV3) => JSON.parse(JSON.stringify(rest));
const deepFrozen = (value: unknown): boolean => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(deepFrozen));

test("R8-C-CERT: v2 remains active; v1 and v2 stay immutable, while the DIAG-MOTOR-02 proposal remains separate", () => {
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual([CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3], ["diag-v3-candidate-calibration-v2", 2]);
  assert.match(read("../../../app/features/diagnostic/qbv2-candidate-calibration.ts"), /diag-v3-candidate-calibration-v3/, "the separately reviewed proposal has an explicit version");
  assert.ok(deepFrozen(CANDIDATE_CALIBRATION_BASELINE_V1) && deepFrozen(CANDIDATE_CALIBRATION_R8B_V2));
  assert.deepEqual(values(CANDIDATE_CALIBRATION_BASELINE_V1), values(sharedReferenceCalibrationV3()), "v1 still reproduces the shared reference");
  assert.deepEqual(buildR8HandoffV3().calibration, { identity: "diag-v3-candidate-calibration-v2", version: 2 });
});

test("R8-C-CERT: every R8-C parameter keeps its baseline value (§6); R8-B parameters are frozen; no R8-owned parameter differs from v2", () => {
  assert.deepEqual(r8cParameterValuesV3(CANDIDATE_CALIBRATION_V3), {
    minScoredDimensions: 3, minCoverage: 1 / 3, developingFrom: 41, solidFrom: 71, mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5, materialBelow: 50, moderateBelow: 75,
  });
  assert.deepEqual([CANDIDATE_CALIBRATION_V3.capabilityContribution, CANDIDATE_CALIBRATION_V3.scoring, CANDIDATE_CALIBRATION_V3.dimensionConfidence].map((x) => JSON.parse(JSON.stringify(x))), [
    { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null },
    { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 },
    { supportingWeight: 0.5, mediumAt: 1, highAt: 2 },
  ]);
  const movedFromV2 = CALIBRATION_OWNERSHIP_V3.filter((row) => row.candidateEffect !== "NO" && row.candidateValue(CANDIDATE_CALIBRATION_V3) !== row.candidateValue(CANDIDATE_CALIBRATION_R8B_V2));
  assert.deepEqual(movedFromV2, []);
  assert.ok(R8C_HYPOTHESES_V3.every((h) => Object.keys(h.patch).every((p) => ["minScoredDimensions", "minCoverage", "developingFrom", "solidFrom", "mediumCoverage", "highCoverage", "share", "materialBelow", "moderateBelow"].includes(p))), "R8-C hypotheses vary only R8-C-owned parameters");
  assert.ok(CALIBRATION_OWNERSHIP_V3.filter((row) => row.owner === "R8-C").every((row) => row.candidateValue(CANDIDATE_CALIBRATION_V3) === row.legacyValue));
});

test("R8-C-CERT: the legacy runtime is untouched — shared constants, single-argument public helpers, the methodology contract, SOUND, runtime versions and identities", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(OVERALL_INDEX_MODEL)), { minScoredDimensions: 3, minCoverage: 1 / 3, bands: { developingFrom: 41, solidFrom: 71 }, confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 } });
  assert.deepEqual([SEVERITY_BANDS, SCORING_MODEL, CONFIDENCE_MODEL], [{ materialBelow: 50, moderateBelow: 75 }, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 }, { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 }]);
  assert.equal(CAPABILITY_CONTRIBUTION.established, 0.75);
  assert.deepEqual([bandFor.length, displayScoreFor.length, resolveGlobalDigitalStatus.length], [1, 1, 1]);
  assert.deepEqual([METHODOLOGY_ENGINE_CONTRACT.bands, METHODOLOGY_ENGINE_CONTRACT.minScoredDimensions, METHODOLOGY_ENGINE_CONTRACT.minCoverage], [OVERALL_INDEX_MODEL.bands, 3, 1 / 3], "the published methodology still states the shared contract");
  assert.match(read("../../../app/features/diagnostic/qbv2-solutions.ts"), /^const SOUND = 75;$/m);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION], ["2.0", 1, 1, 1, 1, 2]);
  assert.deepEqual([CANDIDATE_PLANNER_IDENTITY_V3, CANDIDATE_COMMERCIAL_IDENTITY_V3], ["reviewed-evidence-v3+r3+r4+candidate-planner-v2", "commercial-product-system-v1+diag-v3-candidate-v1"]);
});

test("R8-C-CERT: the candidate stays private and inactive — no overall, calibration or chain symbol in the barrel; imported only by candidate modules", async () => {
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of ["CANDIDATE_CALIBRATION_V3", "CANDIDATE_CALIBRATION_R8B_V2", "computeCandidateDigitalPresenceIndexV3", "CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3", "buildCandidateNarrativeAndOverallV3", "buildCandidateCommercialBoundaryV3"]) assert.equal(barrel[symbol], undefined, symbol);
  const appRoot = new URL("../../../app/", import.meta.url);
  const files = (readdirSync(appRoot, { recursive: true }) as string[]).map((f) => f.replaceAll("\\", "/")).filter((f) => /\.tsx?$/.test(f));
  for (const module of ["qbv2-candidate-calibration", "qbv2-candidate-overall"]) {
    const importers = files.filter((file) => readFileSync(new URL(file, appRoot), "utf8").includes(module));
    assert.ok(importers.length > 0 && importers.every((file) => (/(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file) || file === "features/diagnostic/qa03b/v9-candidate-scoring.ts")), `${module}: ${importers.join(", ")}`);
  }
});

/**
 * §41 register: assertions tied to a calibrated number, with their class. R8-C moved no number, so none needed
 * adjusting; a later change would keep every FROZEN_SEMANTIC assertion, re-derive each CALIBRATION_CONTINGENT
 * one and keep each HISTORICAL_BASELINE one pinned to its explicit v1/v2 calibration.
 */
const CONTINGENT_REGISTER: readonly { readonly file: string; readonly pattern: RegExp; readonly kind: "FROZEN_SEMANTIC_ASSERTION" | "CALIBRATION_CONTINGENT_ASSERTION" | "HISTORICAL_BASELINE_ASSERTION"; readonly note: string }[] = [
  { file: "qbv2-r7-final-certification.test.ts", pattern: /\["improve", null, null\]/, kind: "CALIBRATION_CONTINGENT_ASSERTION", note: "C24 Readiness `improve` exists because 67 < moderateBelow 75; the null solution and license are the frozen F2 semantics." },
  { file: "qbv2-r7b-final-certification.test.ts", pattern: /frozen R6-A keeps the recommendation/, kind: "CALIBRATION_CONTINGENT_ASSERTION", note: "C24/N06 `improve` depends on moderateBelow; solution/license null is frozen." },
  { file: "qbv2-r6-cd-corrective.test.ts", pattern: /frozen priority\/recommendation mechanics keep the improve item/, kind: "CALIBRATION_CONTINGENT_ASSERTION", note: "Same F2 pair; the `improve` mode depends on moderateBelow." },
  { file: "qbv2-r8b-calibration-certification.test.ts", pattern: /every R8-C parameter equals v1 and the shared model/, kind: "CALIBRATION_CONTINGENT_ASSERTION", note: "Holds while R8-C retains its values; a change would pin it to CANDIDATE_CALIBRATION_R8B_V2." },
  { file: "qbv2-r6-cd-corrective.test.ts", pattern: /expectSolution: null, expectLicense: null/, kind: "FROZEN_SEMANTIC_ASSERTION", note: "F2: supporting never selects an intervention or license." },
  { file: "qbv2-r6d3-ciudad-scope.test.ts", pattern: /a multiprocess clarification never preserves Ciudad without a recurring need/, kind: "FROZEN_SEMANTIC_ASSERTION", note: "Ciudad requires a recurring need plus the multiprocess clarification." },
  { file: "qbv2-candidate-metamorphic.test.ts", pattern: /M14: commercial score spoof/, kind: "FROZEN_SEMANTIC_ASSERTION", note: "Display score, band and overall confidence never move license fit or offerings." },
  { file: "qbv2-r8a-calibration-isolation.test.ts", pattern: /run\(answers, CANDIDATE_CALIBRATION_BASELINE_V1\)/, kind: "HISTORICAL_BASELINE_ASSERTION", note: "v1 = shared reference over 261 inputs." },
  { file: "qbv2-r4-final-certification.test.ts", pattern: /calibration: CANDIDATE_CALIBRATION_BASELINE_V1/, kind: "HISTORICAL_BASELINE_ASSERTION", note: "Exact v1 = legacy core equality." },
  { file: "qbv2-r8b-dimension-calibration.test.ts", pattern: /assert\.equal\(selected, "CONFIDENCE_H1"\)/, kind: "HISTORICAL_BASELINE_ASSERTION", note: "R8-B selection reproduces v2 from v1." },
];

test("R8-C-CERT: calibration-contingent assertions are registered and classified (§41); none needed adjusting", () => {
  for (const entry of CONTINGENT_REGISTER) assert.match(read(`./${entry.file}`), entry.pattern, `${entry.file}: ${entry.note}`);
  const kinds = new Set(CONTINGENT_REGISTER.map((e) => e.kind));
  assert.deepEqual([...kinds].sort(), ["CALIBRATION_CONTINGENT_ASSERTION", "FROZEN_SEMANTIC_ASSERTION", "HISTORICAL_BASELINE_ASSERTION"]);
});

test("R8-C-CERT: R8-O3, R8-O4 and R8-O6 are triaged explicitly — none blocks R8-FINAL; the two model decisions need their own checkpoint before activation", () => {
  assert.deepEqual(R8C_OPEN_DECISIONS_V3.map((d) => [d.code, d.status, d.blocksR8Final, d.requiresOwnCheckpointBeforeActivation]), [
    ["R8-O3", "RETAINED_NO_ANCHOR", false, false],
    ["R8-O4", "CALIBRATION_MODEL_DECISION_REQUIRED", false, true],
    ["R8-O6", "CALIBRATION_MODEL_DECISION_REQUIRED", false, true],
  ]);
  assert.ok(R8C_OPEN_DECISIONS_V3.every((d) => d.disposition.length > 0 && d.evidence.length > 0));
});
