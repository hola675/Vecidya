import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { CANONICAL_CASE_IDENTITY_V3, runCanonicalRouteV3, type CanonicalRouteResultV3 } from "./qbv2-candidate-case-runner";
import { CONTEXT_ONLY_MANIFEST_V3, LATER_REVIEW_MANIFEST_V3, UNUSED_ANSWER_DISPOSITIONS_V3 } from "./qbv2-candidate-context-manifest";
import { BANK, CONTEXT_ONLY_IDS, DIRECT_SOURCES, LATER_REVIEW_IDS, MIGRATED, PENDING_IDS, SUPPORTING_SOURCES, capabilityProvenance, runChain, solutionIds } from "./qbv2-candidate-qa-harness";
import { R8_HANDOFF_LABEL_V3, buildR8HandoffV3 } from "./qbv2-r8-handoff";
import { CANDIDATE_COMMERCIAL_IDENTITY_V3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PLANNER_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { CANDIDATE_PROCESS_AUTHORITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import type { DimensionApplicabilityReasonV3, DimensionApplicabilityV3 } from "../../../app/features/diagnostic/qbv2-applicability";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, SCORING_MODEL } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { OVERALL_INDEX_MODEL } from "../../../app/features/diagnostic/qbv2-overall";
import { ADAPTIVE_PLANNER_VERSION, ROUTE_BANDS, ROUTE_HARD_CAP } from "../../../app/features/diagnostic/qbv2-planner";
import { SEVERITY_BANDS } from "../../../app/features/diagnostic/qbv2-priorities";
import {
  CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-FINAL — certification and freeze of Diagnostic V3 QA (R7-A, R7-A.1, R7-B, R7-B.1). A compact gate:
 * every component suite stays the owner of its own assertions; this file certifies that the components are
 * present and unweakened, the canonical commercial spine holds, no Priority A/B R7 contract debt remains open,
 * every upstream freeze holds, the candidate stays isolated, and the R8 handoff exists. It never asserts a
 * score, band or confidence value (R8 owns calibration).
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const titleCount = (source: string, prefix: string) => source.split("\n").filter((line) => line.startsWith(`test("${prefix}`)).length;
const median = (values: readonly number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

let routes: Map<string, CanonicalRouteResultV3> | undefined;
const route = (id: string) => (routes ??= new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c)]))).get(id)!;
const fin = (id: string) => route(id).finalAnswers;
function solutionFor(result: CandidateCommercialBoundaryV3, dimension: string): string | null | undefined {
  const index = result.recommendations.items.findIndex((r) => r.dimension === dimension);
  return index < 0 ? undefined : result.solutions[index]!.solution?.id ?? null;
}
const report: Record<string, unknown> = {};

test("R7-FINAL: every R7 component and corrective checkpoint is present and unweakened", () => {
  const suites: Record<string, readonly [string, number]> = {
    "R7-A": ["./qbv2-candidate-canonical-cases.test.ts", 15], "R7-A.1": ["./qbv2-candidate-context-manifest.test.ts", 6],
    "R7-B-FINAL": ["./qbv2-r7b-final-certification.test.ts", 8], "R6-D.3": ["./qbv2-r6d3-ciudad-scope.test.ts", 7], "R6-FINAL": ["./qbv2-r6-final-certification.test.ts", 10],
  };
  for (const [prefix, [file, count]] of Object.entries(suites)) assert.equal(titleCount(read(file), `${prefix}:`) + titleCount(read(file), `${prefix} `), count, `${file}: ${prefix} inventory`);
  const corrective = read("./qbv2-r6-cd-corrective.test.ts");
  assert.deepEqual(["F1:", "F2:", "F3:", "R6-D.2"].map((prefix) => titleCount(corrective, prefix)), [6, 3, 1, 3], "R6-C.1/R6-D.2 F1/F2/F3 regressions");
  const ids = [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].map((c) => c.id);
  assert.deepEqual([ADVERSARIAL_CASES_V3.length, NEAR_MISS_PAIRS_V3.length, new Set(ids).size], [28, 8, 36]);
  for (const id of ["A08b", "A20", "N06", "N08"]) assert.ok(ids.includes(id), `${id}: historical R7-B reproduction`);
  assert.equal(titleCount(read("./qbv2-candidate-adversarial.test.ts"), ""), 35);
  const metamorphic = read("./qbv2-candidate-metamorphic.test.ts");
  for (let n = 1; n <= 20; n += 1) assert.equal(titleCount(metamorphic, `M${n}:`), 1, `M${n}`);
  assert.equal(titleCount(metamorphic, ""), 22);
  const fuzz = read("./qbv2-candidate-fuzz.test.ts");
  for (const pattern of [/^export const FUZZ_SEED = 20261007;$/m, /^const ROUTED_RUNS = 540;$/m, /^const INTERPRETED_RUNS = 450;$/m]) assert.match(fuzz, pattern);
  assert.equal(titleCount(fuzz, ""), 5);
});

test("R7-FINAL: canonical inventory, coverage, context bookkeeping and route integrity are frozen", () => {
  assert.equal(CANONICAL_CASE_IDENTITY_V3, "diag-v3-canonical-cases-v1");
  assert.equal(CANONICAL_CASES_V3.length, 25);
  // Runner contract: one question per turn, no fallback — a missing authored answer is a hard failure.
  assert.throws(() => runCanonicalRouteV3({ id: "R7-FINAL-probe", description: "missing answer", answerScript: {} }), /has no authored answer/);
  const results = CANONICAL_CASES_V3.map((c) => ({ id: c.id, route: route(c.id), result: runChain(fin(c.id)) }));
  const exercised = new Set(results.flatMap(({ result }) => result.scoring.dimensions.flatMap((d) => d.evidence.map((e) => e.questionId))));
  assert.deepEqual([MIGRATED, DIRECT_SOURCES, SUPPORTING_SOURCES].map((set) => set.filter((q) => exercised.has(q.id)).length), [21, 19, 2]);
  assert.deepEqual([CONTEXT_ONLY_MANIFEST_V3.length, LATER_REVIEW_MANIFEST_V3.length, UNUSED_ANSWER_DISPOSITIONS_V3.length], [15, 2, 63]);
  assert.deepEqual(CONTEXT_ONLY_MANIFEST_V3.map((row) => row.questionId).sort(), [...CONTEXT_ONLY_IDS].sort(), "every CONTEXT_ONLY id classified");
  assert.deepEqual(LATER_REVIEW_MANIFEST_V3.map((row) => row.questionId).sort(), [...LATER_REVIEW_IDS].sort(), "every LATER_REVIEW id classified");
  assert.ok(UNUSED_ANSWER_DISPOSITIONS_V3.every((entry) => entry.disposition !== "FIXTURE_ERROR"));
  const pendingLeaks = results.flatMap(({ id, result }) => [...capabilityProvenance(result).keys()].filter((q) => PENDING_IDS.has(q)).map((q) => `${id}:${q}`));
  assert.deepEqual(pendingLeaks, [], "pending questions never become capability provenance");
  const asked = results.map(({ route: r }) => r.asked.length);
  const active = results.map(({ route: r }) => Object.keys(r.finalAnswers).length);
  const terminal: Record<string, number> = {};
  for (const { route: r } of results) terminal[r.plan.completion.terminalReason] = (terminal[r.plan.completion.terminalReason] ?? 0) + 1;
  const hardCap = results.filter(({ route: r }) => r.plan.completion.hardCapReached).length;
  report.canonicalRoutes = { asked: [Math.min(...asked), median(asked), Math.max(...asked)], activeAnswers: [Math.min(...active), median(active), Math.max(...active)], terminal, hardCap, budgetBlocked: terminal.budget_blocked ?? 0 };
  assert.equal(hardCap, 0);
  assert.equal(terminal.budget_blocked ?? 0, 0);
});

test("R7-FINAL: canonical commercial spine — F1/F2/F3 and the Ciudad-scope closure hold on the frozen cases", () => {
  assert.equal(CANDIDATE_PROCESS_AUTHORITY_V3, "q2_process_systemization");
  const license = (answers: AnswersV2, clarification?: Parameters<typeof runChain>[1]) => runChain(answers, clarification).commercial.licenseFit;
  // Prelaunch / Measurement / Discovery / website-only: no license; website-only keeps Web & Conversión.
  assert.equal(runChain(fin("C01")).overall.index.rawScore, null, "prelaunch has no overall percentage");
  for (const id of ["C01", "C15", "C18", "C19"]) assert.equal(license(fin(id)).recommendedLicense, null, id);
  assert.equal(solutionFor(runChain(fin("C15")), "measurement_optimization") ?? null, null);
  assert.equal(solutionFor(runChain(fin("C18")), "discovery"), null);
  assert.deepEqual(solutionIds(runChain(fin("C19"))), ["website"]);
  // Cuadra only from a DIRECT Readiness weakness (C12); F2: supporting-only C24 keeps improve, no solution, no license.
  assert.deepEqual([solutionFor(runChain(fin("C12")), "digital_readiness"), license(fin("C12")).recommendedLicense], ["work_organization", "cuadra"]);
  const c24 = runChain(fin("C24"));
  assert.deepEqual([c24.recommendations.items.find((r) => r.dimension === "digital_readiness")?.mode, solutionFor(c24, "digital_readiness"), c24.commercial.licenseFit.recommendedLicense], ["improve", null, null]);
  // F3 inside a recurring need (C09); R7-B.1: the clarification never creates the need (C16, C19, C12).
  assert.deepEqual(["undefined", "single_process", "multiple_coordinated_processes", "not_sure", "not_applicable"].map((c) => {
    const fit = license(fin("C09"), c === "undefined" ? undefined : c as Parameters<typeof runChain>[1]);
    return `${fit.recommendedLicense}/${fit.confidence}`;
  }), ["barrio/medium", "barrio/high", "ciudad/high", "barrio/to_confirm", "barrio/to_confirm"]);
  for (const [id, expected] of [["C16", null], ["C19", null], ["C12", "cuadra"]] as const) {
    assert.deepEqual(runChain(fin(id), "multiple_coordinated_processes").commercial, runChain(fin(id)).commercial, `${id}: clarification out of scope`);
    assert.equal(license(fin(id), "multiple_coordinated_processes").recommendedLicense, expected, id);
  }
});

test("R7-FINAL: open-debt gate — no Priority A/B DIAG-V3-R7 semantic contract debt remains open", () => {
  const rows = read("../../../docs/STATUS.md").split("\n").filter((line) => /^\| `DIAG-V3-R7/.test(line));
  const debts = rows.map((line) => {
    const cells = line.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0);
    return { id: cells[0]!.replaceAll("`", ""), priority: cells.at(-2)!, status: cells.at(-1)! };
  });
  assert.ok(debts.length >= 4, "the R7-B debt rows (F1, F2, F3, Ciudad scope) must stay recorded, never erased");
  const open = debts.filter((debt) => ["A", "B"].includes(debt.priority) && !/RESUELTA/.test(debt.status));
  report.r7Debts = { recorded: debts.map((d) => `${d.id}:${d.priority}`), openBlocking: open.length };
  assert.deepEqual(open.map((debt) => debt.id), []);
});

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const R4_STATES = ["applicable", "not_applicable", "insufficient_context"] as const;
const R4_REASONS = [
  "universal_dimension", "active_operation", "prelaunch_no_operation", "audience_or_demand_context",
  "concrete_action_context", "ongoing_interaction_context", "observed_dimension_evidence", "context_unresolved",
] as const;
const r4StatesClosed: Equal<DimensionApplicabilityV3, (typeof R4_STATES)[number]> = true;
const r4ReasonsClosed: Equal<DimensionApplicabilityReasonV3, (typeof R4_REASONS)[number]> = true;

test("R7-FINAL: R3/R4/R5 freezes, candidate identities, runtime versions and the R8-owned calibration identifiers", () => {
  const unclassified = BANK.filter((q) => q.evidenceMigration !== "migrated" && q.evidenceMigration !== "pending").length;
  assert.deepEqual([BANK.length, MIGRATED.length, CONTEXT_ONLY_IDS.length, LATER_REVIEW_IDS.filter((id) => PENDING_IDS.has(id)).length, unclassified], [38, 21, 15, 2, 0]);
  assert.deepEqual([DIGITAL_DIMENSION_IDS.length, R4_STATES.length, R4_REASONS.length], [8, 3, 8]);
  assert.ok(r4StatesClosed && r4ReasonsClosed);
  assert.equal(CANDIDATE_PLANNER_IDENTITY_V3, "reviewed-evidence-v3+r3+r4+candidate-planner-v2");
  assert.deepEqual([ROUTE_BANDS.base, ROUTE_BANDS.materialExtension, ROUTE_HARD_CAP], [18, 20, 24]);
  assert.equal(CANDIDATE_COMMERCIAL_IDENTITY_V3, "commercial-product-system-v1+diag-v3-candidate-v1");
  assert.equal(CANONICAL_CASE_IDENTITY_V3, "diag-v3-canonical-cases-v1");
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(
    [CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION],
    ["2.0", 1, 1, 1, 1, 2],
  );
  // Calibration is R8's: only the identifiers R8 will own are certified to exist, never their values.
  for (const [name, value] of Object.entries({ CAPABILITY_CONTRIBUTION, SCORING_MODEL, CONFIDENCE_MODEL, SEVERITY_BANDS, OVERALL_INDEX_MODEL })) assert.equal(typeof value, "object", name);
  assert.deepEqual(Object.keys(OVERALL_INDEX_MODEL.bands).sort(), ["developingFrom", "solidFrom"]);
  assert.match(read("../../../app/features/diagnostic/qbv2-solutions.ts"), /^const SOUND = /m);
});

test("R7-FINAL: the ACT-root candidate stays isolated — no barrel export, no root-candidate importer, no app → tests import", async () => {
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of [
    "buildCandidateCommercialBoundaryV3", "buildCandidateRecommendationsAndSolutionsV3", "buildCandidateQuestionPlanV3", "candidateSolutionContextOfV3",
    "CANDIDATE_PROCESS_AUTHORITY_V3", "candidateCommercialEvidenceRoleV3", "resolveCandidateLicenseFitV3", "REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3",
  ]) assert.equal(barrel[symbol], undefined, `${symbol} must not be barrel-exported`);
  // Bundle-level absence (build/client, build/server) is verified on the real build output during validation.
  const appRoot = new URL("../../../app/", import.meta.url);
  const files = (readdirSync(appRoot, { recursive: true }) as string[]).map((f) => f.replaceAll("\\", "/")).filter((f) => /\.tsx?$/.test(f));
  const localCandidateEntries = new Set([
    // QA-03B ahora es el motor público; sus contratos internos conservan el submódulo aislado.
    "components/diagnostic-flow/qa03b-diagnostic-flow.tsx",
    "components/diagnostic-flow/qa03b-result.tsx",
    "components/diagnostic-flow/qa03b-presentation.ts",
    "routes/dev-diagnostic-qa03b.tsx",
    "routes/dev-diagnostic-qa03b-methodology.tsx",
    "routes/dev-diagnostic-qa03b-report.tsx",
    "routes/dev-diagnostic-qa03b-funnel.tsx",
    "routes/dev-diagnostic-identified-report.tsx",
    "components/diagnostic-flow/candidate-diagnostic-flow.tsx",
    "components/diagnostic-flow/candidate-result.tsx",
    "components/diagnostic-flow/candidate-presentation.ts",
    "routes/dev-diagnostic-candidate-report.tsx",
  ]);
  const offenders = files.flatMap((file) => {
    const source = readFileSync(new URL(file, appRoot), "utf8");
    return [
      ...(!file.startsWith("features/diagnostic/qa03b/") && !/(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file) && !localCandidateEntries.has(file) && source.includes("qbv2-candidate-") ? [`${file}: references the ACT-root candidate module`] : []),
      ...(/(from|import)\s*\(?\s*["'][^"']*\/tests\//.test(source) ? [`${file}: imports test code`] : []),
    ];
  });
  report.sourceGraph = { files: files.length, offenders: offenders.length };
  assert.deepEqual(offenders, []);
});

test("R7-FINAL: R8 handoff (OBSERVATIONAL — FOR R8, NOT FROZEN) is deterministic and complete; its values are never asserted", () => {
  const handoff = buildR8HandoffV3();
  assert.deepStrictEqual(buildR8HandoffV3(), handoff, "deterministic");
  assert.equal(handoff.label, R8_HANDOFF_LABEL_V3);
  assert.equal(handoff.observations.length, 5);
  assert.equal(handoff.cases.length, 25);
  for (const c of handoff.cases) {
    assert.equal(c.dimensions.length, 8, c.caseId);
    assert.ok([null, "MAL", "REGULAR", "BIEN"].includes(c.band) && [null, "cuadra", "barrio"].includes(c.license), c.caseId);
    for (const d of c.dimensions) assert.ok(d.score === null || (d.score >= 0 && d.score <= 100), `${c.caseId}/${d.dimension}`);
  }
  assert.equal(titleCount(read("./qbv2-candidate-adversarial.test.ts"), "R8 observation manifest (OBSERVATIONAL — NOT FROZEN)"), 1, "R7-B mutation-pair manifest stays available");
  console.log(`R7_R8_HANDOFF ${JSON.stringify(handoff)}`);
});

test("R7-FINAL report (OBSERVATIONAL — reproducible record for the certification)", () => {
  assert.ok(existsSync(new URL("./qbv2-r8-handoff.ts", import.meta.url)));
  console.log(`R7_FINAL_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
