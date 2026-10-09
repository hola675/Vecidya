import { ADVERSARIAL_CASES_V3 } from "./qbv2-candidate-adversarial-cases";
import { BANK, QUESTION_BY_ID, mulberry32, optionsByState, pick, structuralViolations, unknownOption } from "./qbv2-candidate-qa-harness";
import {
  calibrationExpectationViolationsV3, candidateCalibrationInvariantViolationsV3, evaluateCandidateCalibrationV3, r7CorpusV3,
} from "./qbv2-r8-calibration-qa";
import {
  CANDIDATE_CALIBRATION_BASELINE_V1, candidateDimensionCalibrationV3, type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { STATE_KIND, type CapabilityState } from "../../../app/features/diagnostic/qbv2-capability";
import { scoreDimensionWithApplicability, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { EvidenceDirectness } from "../../../app/features/diagnostic/qbv2-coverage";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8-B calibration experiments (test-only). A small set of interpretable hypotheses over the parameters
 * R8-B owns (contributions, supporting weight/cap, dimension-confidence thresholds), each evaluated on the same
 * R7 corpus through the real candidate chain — never a parallel scoring engine — and a reproducible selection
 * procedure (§32). Severity and the overall model belong to R8-C and are never varied here.
 */

type TunableParameter = "established" | "supportingWeight" | "supportingCapRatio" | "mediumAt" | "highAt";
export type R8bHypothesisV3 = {
  readonly name: string;
  readonly family: "BASELINE" | "CONTRIBUTION_ONLY" | "CONFIDENCE_ONLY" | "SUPPORTING_ONLY" | "COMBINED";
  readonly patch: Partial<Record<TunableParameter, number>>;
  /** The certified statement that justifies moving each parameter; a moved parameter without one is unanchored (§33). */
  readonly anchors: Partial<Record<TunableParameter, string>>;
};

const R5_SUFFICIENCY = "R5 certified planner: a dimension is resolved by its first direct observation (sufficient ⇔ no applicable dimension without a direct reading)";
export const R8B_HYPOTHESES_V3: readonly R8bHypothesisV3[] = [
  { name: "BASELINE", family: "BASELINE", patch: {}, anchors: {} },
  { name: "CONTRIBUTION_H1", family: "CONTRIBUTION_ONLY", patch: { established: 0.85 }, anchors: {} },
  { name: "CONTRIBUTION_H2", family: "CONTRIBUTION_ONLY", patch: { established: 0.9 }, anchors: {} },
  { name: "CONTRIBUTION_H3", family: "CONTRIBUTION_ONLY", patch: { established: 1 }, anchors: {} },
  { name: "CONFIDENCE_H1", family: "CONFIDENCE_ONLY", patch: { mediumAt: 1, highAt: 2 }, anchors: { mediumAt: R5_SUFFICIENCY, highAt: "R8-B §11/§31: high = corroboration by a second consistent direct source" } },
  { name: "CONFIDENCE_H2", family: "CONFIDENCE_ONLY", patch: { mediumAt: 1, highAt: 2.5 }, anchors: { mediumAt: R5_SUFFICIENCY, highAt: "none (2.5 requires supporting on top of two direct sources)" } },
  { name: "SUPPORTING_H1", family: "SUPPORTING_ONLY", patch: { supportingWeight: 0.35, supportingCapRatio: 0.35 }, anchors: {} },
  { name: "SUPPORTING_H2", family: "SUPPORTING_ONLY", patch: { supportingWeight: 0.25, supportingCapRatio: 0.25 }, anchors: {} },
  { name: "COMBINED_CONSERVATIVE", family: "COMBINED", patch: { established: 0.85, mediumAt: 1, highAt: 2 }, anchors: { mediumAt: R5_SUFFICIENCY, highAt: "R8-B §11/§31" } },
  { name: "COMBINED_FULL_SCALE", family: "COMBINED", patch: { established: 1, mediumAt: 1, highAt: 2 }, anchors: { mediumAt: R5_SUFFICIENCY, highAt: "R8-B §11/§31" } },
  { name: "COMBINED_ALL", family: "COMBINED", patch: { established: 1, mediumAt: 1, highAt: 2, supportingWeight: 0.35, supportingCapRatio: 0.35 }, anchors: { mediumAt: R5_SUFFICIENCY, highAt: "R8-B §11/§31" } },
];

export function hypothesisCalibrationV3(hypothesis: R8bHypothesisV3, base: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_BASELINE_V1): CandidateCalibrationV3 {
  const p = hypothesis.patch;
  return {
    ...base,
    capabilityContribution: { ...base.capabilityContribution, ...(p.established !== undefined ? { established: p.established } : {}) },
    scoring: { ...base.scoring, ...(p.supportingWeight !== undefined ? { supportingWeight: p.supportingWeight } : {}), ...(p.supportingCapRatio !== undefined ? { supportingCapRatio: p.supportingCapRatio } : {}) },
    dimensionConfidence: { ...base.dimensionConfidence, ...(p.mediumAt !== undefined ? { mediumAt: p.mediumAt } : {}), ...(p.highAt !== undefined ? { highAt: p.highAt } : {}) },
  };
}

/** R3 certifies `established` as declared habitual functioning, not excellence: it must stay strictly below `strong`. */
export function r3SemanticViolationsV3(c: CandidateCalibrationV3): readonly string[] {
  return c.capabilityContribution.established < c.capabilityContribution.strong ? [] : ["established must stay below strong (habitual functioning ≠ excellence)"];
}

// ── Confidence contract on synthetic evidence through the real shared core ─────────────────────────────

const LEVEL = { low: 0, medium: 1, high: 2 } as const;
function evidence(id: string, directness: EvidenceDirectness, state: CapabilityState, c: CandidateCalibrationV3): ContextualEvidence {
  return { questionId: id, dimension: "digital_readiness", observationId: id, directness, state, kind: STATE_KIND[state], contribution: c.capabilityContribution[state], answer: [] };
}
export function confidenceContractV3(c: CandidateCalibrationV3) {
  const d = (n: number, state: CapabilityState = "established") => evidence(`d${n}`, "direct", state, c);
  const s = (n: number, state: CapabilityState = "established") => evidence(`s${n}`, "supporting", state, c);
  const u = evidence("u1", "direct", "uncertainty", c);
  const patterns: Record<string, readonly ContextualEvidence[]> = {
    "0 direct + 1 supporting": [s(1)],
    "1 direct": [d(1)],
    "1 direct + 1 supporting": [d(1), s(1)],
    "1 direct + 2 supporting": [d(1), s(1), s(2)],
    "2 direct": [d(1), d(2)],
    "2 direct + 1 supporting": [d(1), d(2), s(1)],
    "3 direct": [d(1), d(2), d(3)],
    "2 direct contradiction": [d(1), d(2, "weak")],
    "1 direct + unknown": [d(1), u],
    "2 direct + unknown": [d(1), d(2), u],
  };
  const matrix = Object.fromEntries(Object.entries(patterns).map(([name, items]) => {
    const r = scoreDimensionWithApplicability("digital_readiness", items, "applicable", candidateDimensionCalibrationV3(c));
    return [name, { score: r.score, level: r.confidence.level }];
  })) as Record<string, { score: number | null; level: keyof typeof LEVEL }>;
  const L = (name: string) => LEVEL[matrix[name]!.level];
  const v: string[] = [];
  if (matrix["0 direct + 1 supporting"]!.level !== "low" || matrix["0 direct + 1 supporting"]!.score !== null) v.push("supporting-only must be low and unscored");
  if (L("1 direct + 1 supporting") === 2 || L("1 direct + 2 supporting") === 2) v.push("one direct source must never reach high through supporting");
  if (!(L("2 direct") > L("1 direct + 1 supporting"))) v.push("two direct sources must not equal one direct source plus supporting (§31)");
  if (!(L("2 direct") >= L("1 direct") && L("3 direct") >= L("2 direct") && L("2 direct + 1 supporting") >= L("2 direct"))) v.push("more consistent evidence must never reduce confidence");
  if (!(L("2 direct contradiction") <= L("1 direct") && L("2 direct contradiction") < L("2 direct"))) v.push("a direct contradiction must never increase confidence and must be penalized");
  if (!(L("1 direct + unknown") <= L("1 direct") && L("2 direct + unknown") <= L("2 direct"))) v.push("an unknown answer must never increase confidence");
  if (matrix["1 direct + unknown"]!.score !== matrix["1 direct"]!.score) v.push("an unknown answer must never move the score");
  return { matrix, violations: v };
}

// ── §15 supporting matrix through the real candidate chain ────────────────────────────────────────────

const DIRECT_Q = "q2_process_systemization";
const SUPPORTING_Q = "q2_operations_handoffs";
export function supportingMatrixV3(c: CandidateCalibrationV3) {
  const base = ADVERSARIAL_CASES_V3.find((x) => x.id === "A16")!.answers;
  const value = (questionId: string, state: string) => state === "unknown" ? unknownOption(QUESTION_BY_ID.get(questionId)!)! : optionsByState(QUESTION_BY_ID.get(questionId)!, state)[0]!;
  const rows: { direct: string; supporting: string; score: number | null; confidence: string; solution: string | null; license: string | null }[] = [];
  for (const direct of ["established", "partial", "weak", "unknown", "absent"]) for (const supporting of ["established", "partial", "weak"]) {
    const answers: Record<string, unknown> = { ...base, [SUPPORTING_Q]: value(SUPPORTING_Q, supporting) };
    if (direct === "absent") delete answers[DIRECT_Q]; else answers[DIRECT_Q] = value(DIRECT_Q, direct);
    delete answers.q2_operations_information_base;
    const r = buildCandidateCommercialBoundaryV3({ answers: answers as AnswersV2, calibration: c });
    const dim = r.scoring.dimensions.find((x) => x.id === "digital_readiness")!;
    const index = r.recommendations.items.findIndex((x) => x.dimension === "digital_readiness");
    rows.push({ direct, supporting, score: dim.score, confidence: dim.confidence.level, solution: index < 0 ? null : r.solutions[index]!.solution?.id ?? null, license: r.commercial.licenseFit.recommendedLicense });
  }
  return rows;
}

// ── Holdout and downstream comparison ─────────────────────────────────────────────────────────────────

/** Deterministic holdout never used to choose parameters (seed distinct from every other campaign). */
export function holdoutCorpusV3(size = 300, seed = 0x8b0b): { id: string; answers: AnswersV2 }[] {
  const rng = mulberry32(seed);
  return Array.from({ length: size }, (_, i) => {
    const raw: Record<string, string | readonly string[]> = { q2_has_customers: rng() < 0.85 ? "yes" : "no" };
    for (const q of BANK) {
      if (q.id === "q2_has_customers" || rng() > 0.65) continue;
      const options = q.options.filter((o) => !o.exclusive || q.type === "single");
      const v = pick(rng, options.length > 0 ? options : q.options).value;
      raw[q.id] = q.type === "multi" ? [v] : v;
    }
    return { id: `holdout#${i}`, answers: raw as AnswersV2 };
  });
}

const constraintsOf = (r: CandidateCommercialBoundaryV3) => r.priorities.constraints.map((k) => `${k.dimension}:${k.kind}:${k.severity}`).sort().join(",");
const recommendationsOf = (r: CandidateCommercialBoundaryV3) => r.recommendations.items.map((x, i) => `${x.dimension}:${x.mode}:${r.solutions[i]!.solution?.id ?? "null"}`).join(",");
const itemsOf = (r: CandidateCommercialBoundaryV3) => [...r.commercial.now.services, ...r.commercial.now.complements, ...r.commercial.later.services, ...r.commercial.later.complements].map((i) => i.id).join(",");

export function downstreamDiffV3(from: CandidateCalibrationV3, to: CandidateCalibrationV3, corpus: readonly { id: string; answers: AnswersV2 }[] = r7CorpusV3()) {
  const changed = { constraints: [] as string[], recommendations: [] as string[], licenses: [] as string[], items: [] as string[], structuralViolations: 0 };
  for (const { id, answers } of corpus) {
    const a = buildCandidateCommercialBoundaryV3({ answers, calibration: from });
    const b = buildCandidateCommercialBoundaryV3({ answers, calibration: to });
    if (constraintsOf(a) !== constraintsOf(b)) changed.constraints.push(id);
    if (recommendationsOf(a) !== recommendationsOf(b)) changed.recommendations.push(id);
    if (a.commercial.licenseFit.recommendedLicense !== b.commercial.licenseFit.recommendedLicense) changed.licenses.push(`${id}:${a.commercial.licenseFit.recommendedLicense}→${b.commercial.licenseFit.recommendedLicense}`);
    if (itemsOf(a) !== itemsOf(b)) changed.items.push(id);
    changed.structuralViolations += structuralViolations(b).length;
  }
  return changed;
}

// ── Experiment and selection (§20-21, §32-33) ─────────────────────────────────────────────────────────

export function runR8bExperimentV3(hypothesis: R8bHypothesisV3) {
  const calibration = hypothesisCalibrationV3(hypothesis);
  const evaluation = evaluateCandidateCalibrationV3(calibration);
  const moved = Object.keys(hypothesis.patch) as TunableParameter[];
  return {
    name: hypothesis.name, family: hypothesis.family, patch: hypothesis.patch, moved,
    unanchored: moved.filter((p) => !hypothesis.anchors[p] || hypothesis.anchors[p]!.startsWith("none")),
    invariantViolations: candidateCalibrationInvariantViolationsV3(calibration),
    r3SemanticViolations: r3SemanticViolationsV3(calibration),
    confidenceContract: confidenceContractV3(calibration),
    expectationViolations: calibrationExpectationViolationsV3(calibration),
    downstream: downstreamDiffV3(CANDIDATE_CALIBRATION_BASELINE_V1, calibration),
    evaluation: {
      scoreByDimension: evaluation.scoreByDimension, confidenceByDirectCount: evaluation.confidenceByDirectCount, confidencePatterns: evaluation.confidencePatterns,
      supportingDelta: evaluation.supportingDelta, siblingDisagreement: evaluation.siblingDisagreement, bands: evaluation.bands, overallConfidence: evaluation.overallConfidence, licenses: evaluation.commercialLicenses,
    },
  };
}
export type R8bExperimentResultV3 = ReturnType<typeof runR8bExperimentV3>;

/**
 * §32 decision order: drop hypotheses that break invariants, R3 semantics, the confidence contract, the
 * contract-derived expectations or structural safety; drop any that moves a parameter without a certified
 * anchor (§33); among survivors prefer the fewest moved parameters. Indistinguishable survivors are an error,
 * never a silent pick.
 */
export function selectR8bCalibrationV3(results: readonly R8bExperimentResultV3[]): { readonly selected: string; readonly eliminated: Readonly<Record<string, readonly string[]>> } {
  const eliminated: Record<string, string[]> = {};
  const survivors = results.filter((r) => {
    const reasons = [
      ...(r.invariantViolations.length > 0 ? ["INVARIANT"] : []),
      ...(r.r3SemanticViolations.length > 0 ? ["R3_SEMANTICS"] : []),
      ...(r.confidenceContract.violations.length > 0 ? ["CONFIDENCE_CONTRACT"] : []),
      ...(r.expectationViolations.length > 0 ? [`EXPECTATIONS:${r.expectationViolations.join("/")}`] : []),
      ...(r.downstream.structuralViolations > 0 ? ["STRUCTURAL"] : []),
      ...(r.unanchored.length > 0 ? [`UNANCHORED:${r.unanchored.join("/")}`] : []),
    ];
    if (reasons.length > 0) eliminated[r.name] = reasons;
    return reasons.length === 0;
  });
  const fewest = Math.min(...survivors.map((r) => r.moved.length));
  const best = survivors.filter((r) => r.moved.length === fewest);
  if (best.length !== 1) throw new Error(`R8-B: ${best.length} indistinguishable surviving calibrations (${best.map((r) => r.name).join(", ")})`);
  return { selected: best[0]!.name, eliminated };
}
