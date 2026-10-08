import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { CANONICAL_CASE_IDENTITY_V3, runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { CONTEXT_ONLY_MANIFEST_V3, LATER_REVIEW_MANIFEST_V3, UNUSED_ANSWER_DISPOSITIONS_V3 } from "./qbv2-candidate-context-manifest";
import {
  BANK, CONTEXT_ONLY_IDS, DIRECT_SOURCES, LATER_REVIEW_IDS, MIGRATED, PENDING_IDS, PRE_COMMERCIAL_KEYS, SUPPORTING_SOURCES, dimensionOf, runChain, solutionIds, without,
} from "./qbv2-candidate-qa-harness";
import { CANDIDATE_COMMERCIAL_IDENTITY_V3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CANDIDATE_PROCESS_AUTHORITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import type { DimensionApplicabilityReasonV3, DimensionApplicabilityV3 } from "../../../app/features/diagnostic/qbv2-applicability";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { ADAPTIVE_PLANNER_VERSION, ROUTE_BANDS, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import {
  CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-B formal re-certification gate. The first R7-B run BLOCKED on F1/F2/F3; R6-C.1/R6-D.2
 * corrected production. This suite does not duplicate the exhaustive campaign (adversarial, metamorphic,
 * fuzz, corrective suites stay the assertion owners): it certifies that the campaign is still present and
 * unweakened, that the exact R7-B reproductions stay corrected, and that every freeze R7-B relies on holds.
 * Never asserts a score/band value (R8 owns calibration).
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const titleCount = (source: string, prefix: string) => source.split("\n").filter((line) => line.startsWith(`test("${prefix}`)).length;

const ADVERSARIAL = [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3];
const adv = (id: string) => ADVERSARIAL.find((c) => c.id === id)!.answers;
let canonicalFinal: Map<string, AnswersV2> | undefined;
const fin = (id: string) => (canonicalFinal ??= new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c).finalAnswers]))).get(id)!;
const AUTOMATION = new Set(["operational_automation", "follow_up_automation"]);

function solutionFor(result: CandidateCommercialBoundaryV3, dimension: string): string | null | undefined {
  const index = result.recommendations.items.findIndex((r) => r.dimension === dimension);
  return index < 0 ? undefined : result.solutions[index]!.solution?.id ?? null;
}

test("R7-B-FINAL: the explicit adversarial matrix is intact — 36 candidate-native cases incl. every F1/F2/F3 reproduction", () => {
  assert.equal(ADVERSARIAL_CASES_V3.length, 28);
  assert.equal(NEAR_MISS_PAIRS_V3.length, 8);
  const ids = ADVERSARIAL.map((c) => c.id);
  assert.equal(new Set(ids).size, 36);
  for (let n = 1; n <= 20; n += 1) assert.ok(ids.includes(`A${String(n).padStart(2, "0")}`), `A${n}`);
  for (let n = 1; n <= 8; n += 1) assert.ok(ids.includes(`N0${n}`), `N0${n}`);
  for (const id of ["A08b", "A20", "N06", "N08"]) assert.ok(ids.includes(id), `${id}: R7-B reproduction`);
});

test("R7-B-FINAL: M1–M20 each run exactly once, the fuzz campaign stays seeded, and the F1/F2/F3, invention and R8 records are present", () => {
  const metamorphic = read("./qbv2-candidate-metamorphic.test.ts");
  for (let n = 1; n <= 20; n += 1) assert.equal(titleCount(metamorphic, `M${n}:`), 1, `M${n}`);
  assert.equal(titleCount(metamorphic, "§43-44: context mutation matrix"), 1);
  const fuzz = read("./qbv2-candidate-fuzz.test.ts");
  assert.match(fuzz, /^export const FUZZ_SEED = 20261007;$/m);
  assert.match(fuzz, /^const ROUTED_RUNS = 540;$/m);
  assert.match(fuzz, /^const INTERPRETED_RUNS = 450;$/m);
  const adversarial = read("./qbv2-candidate-adversarial.test.ts");
  for (const title of [
    "A08b [R6-C contract]", "A20: Barrio-capable diagnostic", "[R6-C/R6-D contract] supporting evidence alone never selects",
    "[R6-D contract] work_organization/Cuadra requires", "[R6-C contract] automation is never selected", "§50: downstream invention audit",
    "§39: valid-looking raw answers for the 10 legacy-only", "§30: legacy contradiction rules", "R8 observation manifest (OBSERVATIONAL — NOT FROZEN)",
  ]) assert.equal(titleCount(adversarial, title), 1, title);
  const corrective = read("./qbv2-r6-cd-corrective.test.ts");
  assert.deepEqual(["F1:", "F2:", "F3:", "R6-D.2"].map((prefix) => titleCount(corrective, prefix)), [6, 3, 1, 3]);
});

test("R7-B-FINAL: F1 stays corrected — q2_process_systemization is the only process authority; healthy sub-processes never sell automation", () => {
  assert.equal(CANDIDATE_PROCESS_AUTHORITY_V3, "q2_process_systemization");
  const reproductions: Record<string, AnswersV2> = { A08b: adv("A08b"), N08: adv("N08"), C12: fin("C12"), "C12+intake=clear": { ...fin("C12"), q2_professional_intake_flow: "clear" } };
  for (const [label, answers] of Object.entries(reproductions)) {
    const result = runChain(answers);
    assert.ok(!solutionIds(result).some((id) => AUTOMATION.has(id)), `${label}: automation on an informal process`);
    assert.equal(solutionFor(result, "digital_readiness"), "work_organization", label);
    assert.equal(result.commercial.licenseFit.recommendedLicense, "cuadra", label);
  }
  assert.equal(solutionFor(runChain(fin("C05")), "relationship_recurrence"), null, "C05: weak reminders + informal process");
});

test("R7-B-FINAL: F2 stays corrected — supporting still refines the score but never selects the intervention or license (C24, N06)", () => {
  for (const [label, answers] of [["C24", fin("C24")], ["N06", adv("N06")]] as const) {
    const result = runChain(answers);
    assert.equal(result.recommendations.items.find((r) => r.dimension === "digital_readiness")?.mode, "improve", `${label}: frozen R6-A keeps the recommendation`);
    assert.equal(solutionFor(result, "digital_readiness"), null, `${label}: solution`);
    assert.equal(result.commercial.licenseFit.recommendedLicense, null, `${label}: license`);
    const unrefined = runChain(without(answers, "q2_b2b_status_visibility"));
    assert.notEqual(dimensionOf(result, "digital_readiness").score, dimensionOf(unrefined, "digital_readiness").score, `${label}: supporting refinement must survive`);
  }
});

test("R7-B-FINAL: F3 stays corrected — the clarification truth table on the Barrio-capable reproductions (A20, C09)", () => {
  const table = [
    [undefined, "barrio", "medium", true], ["single_process", "barrio", "high", false], ["multiple_coordinated_processes", "ciudad", "high", false],
    ["not_sure", "barrio", "to_confirm", true], ["not_applicable", "barrio", "to_confirm", true],
  ] as const;
  for (const answers of [adv("A20"), fin("C09")]) for (const [clarification, license, confidence, unresolved] of table) {
    const fit = runChain(answers, clarification).commercial.licenseFit;
    assert.deepEqual([fit.recommendedLicense, fit.confidence, fit.unresolvedSignals.length > 0], [license, confidence, unresolved], String(clarification));
    const singleProcessClaim = fit.evidence.some((ref) => ref.derivedFact === "one principal operational process") || /confirma un único proceso/i.test(fit.whyNotHigher);
    assert.equal(singleProcessClaim, clarification === "single_process", `${clarification}: single-process claim`);
  }
});

test("R7-B-FINAL: open DIAG-V3-R7B-CIUDAD-SCOPE-001 is deterministic and commercial-only (preserved, not decided here)", () => {
  for (const id of ["C16", "C19"]) {
    const unclarified = runChain(fin(id));
    const ciudad = runChain(fin(id), "multiple_coordinated_processes");
    assert.deepEqual(runChain(fin(id), "multiple_coordinated_processes"), ciudad, `${id}: deterministic`);
    assert.equal(ciudad.commercial.licenseFit.recommendedLicense, "ciudad", `${id}: current behavior`);
    for (const key of PRE_COMMERCIAL_KEYS) assert.deepEqual(ciudad[key], unclarified[key], `${id}: ${key} must not move with the clarification`);
  }
});

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const R4_STATES = ["applicable", "not_applicable", "insufficient_context"] as const;
const R4_REASONS = [
  "universal_dimension", "active_operation", "prelaunch_no_operation", "audience_or_demand_context",
  "concrete_action_context", "ongoing_interaction_context", "observed_dimension_evidence", "context_unresolved",
] as const;
const r4StatesClosed: Equal<DimensionApplicabilityV3, (typeof R4_STATES)[number]> = true;
const r4ReasonsClosed: Equal<DimensionApplicabilityReasonV3, (typeof R4_REASONS)[number]> = true;

test("R7-B-FINAL: R7-A coverage, R3/R4/R5 freezes, candidate identities and runtime versions are unchanged", () => {
  assert.equal(CANONICAL_CASE_IDENTITY_V3, "diag-v3-canonical-cases-v1");
  assert.equal(CANONICAL_CASES_V3.length, 25);
  const exercised = new Set(CANONICAL_CASES_V3.flatMap((c) => runChain(fin(c.id)).scoring.dimensions.flatMap((d) => d.evidence.map((e) => e.questionId))));
  assert.deepEqual([MIGRATED, DIRECT_SOURCES, SUPPORTING_SOURCES].map((set) => set.filter((q) => exercised.has(q.id)).length), [21, 19, 2]);
  assert.deepEqual([CONTEXT_ONLY_MANIFEST_V3.length, LATER_REVIEW_MANIFEST_V3.length, UNUSED_ANSWER_DISPOSITIONS_V3.length], [15, 2, 63]);
  assert.ok(UNUSED_ANSWER_DISPOSITIONS_V3.every((entry) => entry.disposition !== "FIXTURE_ERROR"));
  const unclassified = BANK.filter((q) => q.evidenceMigration !== "migrated" && q.evidenceMigration !== "pending").length;
  assert.deepEqual([BANK.length, MIGRATED.length, CONTEXT_ONLY_IDS.length, LATER_REVIEW_IDS.filter((id) => PENDING_IDS.has(id)).length, unclassified], [38, 21, 15, 2, 0]);
  assert.deepEqual([DIGITAL_DIMENSION_IDS.length, R4_STATES.length, R4_REASONS.length], [8, 3, 8]);
  assert.ok(r4StatesClosed && r4ReasonsClosed);
  assert.equal(CANDIDATE_PLANNER_IDENTITY_V3, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.deepEqual([ROUTE_BANDS.base, ROUTE_BANDS.materialExtension, ROUTE_HARD_CAP], [18, 20, 24]);
  assert.equal(CANDIDATE_COMMERCIAL_IDENTITY_V3, "commercial-product-system-v1+diag-v3-candidate-v1");
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(
    [CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION],
    ["2.0", 1, 1, 1, 1, 2],
  );
});

test("R7-B-FINAL: the candidate stays inactive and isolated — no barrel export, no non-candidate importer, no app → tests import", async () => {
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of [
    "buildCandidateCommercialBoundaryV3", "buildCandidateRecommendationsAndSolutionsV3", "buildCandidateQuestionPlanV3", "candidateSolutionContextOfV3",
    "CANDIDATE_PROCESS_AUTHORITY_V3", "candidateCommercialEvidenceRoleV3", "resolveCandidateLicenseFitV3", "REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3",
  ]) assert.equal(barrel[symbol], undefined, `${symbol} must not be barrel-exported`);
  // Bundle-level absence (build/client, build/server) is verified on the real build output during validation.
  const appRoot = new URL("../../../app/", import.meta.url);
  const offenders: string[] = [];
  for (const file of (readdirSync(appRoot, { recursive: true }) as string[]).map((f) => f.replaceAll("\\", "/")).filter((f) => /\.tsx?$/.test(f))) {
    const source = readFileSync(new URL(file, appRoot), "utf8");
    if (!/(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file) && source.includes("qbv2-candidate-")) offenders.push(`${file}: references a candidate module`);
    if (/(from|import)\s*\(?\s*["'][^"']*\/tests\//.test(source)) offenders.push(`${file}: imports test code`);
  }
  assert.deepEqual(offenders, []);
});
