import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { CALIBRATION_OWNERSHIP_V3, sharedReferenceCalibrationV3 } from "./qbv2-r8-calibration-qa";
import { buildR8HandoffV3 } from "./qbv2-r8-handoff";
import {
  CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_R8B_V2, CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_VERSION_V3,
  type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { CANDIDATE_COMMERCIAL_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, LEGACY_DIMENSION_CALIBRATION, SCORING_MODEL } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { OVERALL_INDEX_MODEL } from "../../../app/features/diagnostic/qbv2-overall";
import { SEVERITY_BANDS } from "../../../app/features/diagnostic/qbv2-priorities";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { ADAPTIVE_PLANNER_VERSION } from "../../../app/features/diagnostic/qbv2-planner";
import {
  CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";

/**
 * DIAG-V3-R8-B certification gate: the selected calibration is versioned and current, the v1 baseline stays
 * reproducible, only R8-B-owned parameters moved, R8-C parameters and the legacy runtime are untouched, and
 * the candidate stays private. The evidence for the choice itself lives in `qbv2-r8b-dimension-calibration.test.ts`.
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const values = ({ identity: _i, version: _v, ...rest }: CandidateCalibrationV3) => JSON.parse(JSON.stringify(rest));

test("R8-B-CERT: the calibration is versioned — v1 kept as history, v2 current, and the R8 handoff labelled with it", () => {
  assert.deepEqual([CANDIDATE_CALIBRATION_BASELINE_V1.identity, CANDIDATE_CALIBRATION_BASELINE_V1.version], ["diag-v3-candidate-calibration-v1", 1]);
  assert.deepEqual([CANDIDATE_CALIBRATION_R8B_V2.identity, CANDIDATE_CALIBRATION_R8B_V2.version], ["diag-v3-candidate-calibration-v2", 2]);
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual([CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_VERSION_V3], ["diag-v3-candidate-calibration-v2", 2]);
  assert.deepEqual(values(CANDIDATE_CALIBRATION_BASELINE_V1), values(sharedReferenceCalibrationV3()), "v1 still reproduces the shared reference");
  assert.deepEqual(buildR8HandoffV3().calibration, { identity: "diag-v3-candidate-calibration-v2", version: 2 });
});

test("R8-B-CERT: every parameter that moved is owned by R8-B; every R8-C parameter equals v1 and the shared model", () => {
  const moved = CALIBRATION_OWNERSHIP_V3.filter((row) => row.candidateEffect !== "NO" && row.candidateValue(CANDIDATE_CALIBRATION_V3) !== row.candidateValue(CANDIDATE_CALIBRATION_BASELINE_V1));
  assert.deepEqual(moved.map((row) => row.parameter), ["CONFIDENCE_MODEL.mediumAt", "CONFIDENCE_MODEL.highAt"]);
  assert.ok(moved.every((row) => row.owner === "R8-B"));
  for (const row of CALIBRATION_OWNERSHIP_V3.filter((r) => r.owner === "R8-C")) assert.equal(row.candidateValue(CANDIDATE_CALIBRATION_V3), row.legacyValue, `${row.parameter}: R8-C-owned, untouched in R8-B`);
  assert.deepEqual([CANDIDATE_CALIBRATION_V3.severity, CANDIDATE_CALIBRATION_V3.overall], [SEVERITY_BANDS, OVERALL_INDEX_MODEL].map((x) => JSON.parse(JSON.stringify(x))));
});

test("R8-B-CERT: the legacy runtime is untouched — shared constants, legacy defaults, SOUND, runtime versions and identities", () => {
  assert.deepEqual(CAPABILITY_CONTRIBUTION, { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null });
  assert.deepEqual([SCORING_MODEL, CONFIDENCE_MODEL, SEVERITY_BANDS], [{ directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 }, { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 }, { materialBelow: 50, moderateBelow: 75 }]);
  assert.ok(LEGACY_DIMENSION_CALIBRATION.scoring === SCORING_MODEL && LEGACY_DIMENSION_CALIBRATION.confidence === CONFIDENCE_MODEL);
  assert.match(read("../../../app/features/diagnostic/qbv2-solutions.ts"), /^const SOUND = 75;$/m);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION], ["2.0", 1, 1, 1, 1, 2]);
  assert.deepEqual([CANDIDATE_PLANNER_IDENTITY_V3, CANDIDATE_COMMERCIAL_IDENTITY_V3], ["reviewed-evidence-v3+r3+r4+candidate-planner-v2", "commercial-product-system-v1+diag-v3-candidate-v1"]);
});

test("R8-B-CERT: candidate calibration stays private — no barrel export, imported only by candidate modules", async () => {
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of ["CANDIDATE_CALIBRATION_V3", "CANDIDATE_CALIBRATION_BASELINE_V1", "CANDIDATE_CALIBRATION_R8B_V2", "CANDIDATE_CALIBRATION_IDENTITY_V3"]) assert.equal(barrel[symbol], undefined, symbol);
  const appRoot = new URL("../../../app/", import.meta.url);
  const files = (readdirSync(appRoot, { recursive: true }) as string[]).map((f) => f.replaceAll("\\", "/")).filter((f) => /\.tsx?$/.test(f));
  const importers = files.filter((file) => readFileSync(new URL(file, appRoot), "utf8").includes("qbv2-candidate-calibration"));
  assert.ok(importers.length > 0 && importers.every((file) => /(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file)), importers.join(", "));
});

test("R8-B-CERT: the calibration-contingent gates keep their historical v1 assertion next to the current contract", () => {
  const r4 = read("./qbv2-r4-final-certification.test.ts");
  assert.match(r4, /calibration: CANDIDATE_CALIBRATION_BASELINE_V1/, "R4-FINAL keeps the exact v1 = legacy core equality");
  const r8a = read("./qbv2-r8a-calibration-isolation.test.ts");
  assert.match(r8a, /run\(answers, CANDIDATE_CALIBRATION_BASELINE_V1\)\) !== JSON\.stringify\(run\(answers, shared\)\)/, "R8-A keeps the v1 parity over 261 inputs");
  const r7a = read("./qbv2-candidate-canonical-cases.test.ts");
  assert.match(r7a, /producedContextFields\(question\)\]\.some\(\(field\) => block\.sourceContext\.includes\(field\)\)/, "R7-A applies only the certified R7-B declaration-provenance exception");
});
