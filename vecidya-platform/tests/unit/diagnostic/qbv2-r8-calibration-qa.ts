import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import {
  CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_VERSION_V3, candidateDimensionCalibrationV3,
  type CandidateCalibrationV3, type CandidateCapabilityContributionV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, SCORING_MODEL, scoreDimensionWithApplicability } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import { OVERALL_INDEX_MODEL } from "../../../app/features/diagnostic/qbv2-overall";
import { SEVERITY_BANDS } from "../../../app/features/diagnostic/qbv2-priorities";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8 calibration QA kit (test-only). R8-A builds it without tuning anything: the shared-reference path
 * for baseline parity, the executable parameter-ownership manifest, structural calibration invariants, a
 * deterministic evaluator over the R7 corpus, and the (empty) target-annotation structure R8-B will populate.
 * Every number this kit reports is OBSERVATIONAL — FOR R8, NOT FROZEN.
 */

/**
 * The pre-isolation reference: the candidate chain driven by the shared (legacy) constants, exactly as it was
 * before R8-A. While the candidate baseline equals it, parity must be total; once R8-B moves candidate values,
 * comparing against it becomes a migration/history record, not an equality requirement.
 */
export function sharedReferenceCalibrationV3(): CandidateCalibrationV3 {
  return {
    identity: CANDIDATE_CALIBRATION_IDENTITY_V3, version: CANDIDATE_CALIBRATION_VERSION_V3,
    capabilityContribution: CAPABILITY_CONTRIBUTION as CandidateCapabilityContributionV3,
    scoring: SCORING_MODEL, dimensionConfidence: CONFIDENCE_MODEL, severity: SEVERITY_BANDS, overall: OVERALL_INDEX_MODEL,
  };
}

type Perturbation = (calibration: CandidateCalibrationV3) => CandidateCalibrationV3;
const withContribution = (state: keyof CandidateCapabilityContributionV3, value: number): Perturbation => (c) => ({ ...c, capabilityContribution: { ...c.capabilityContribution, [state]: value } as CandidateCapabilityContributionV3 });
const withScoring = (patch: Partial<CandidateCalibrationV3["scoring"]>): Perturbation => (c) => ({ ...c, scoring: { ...c.scoring, ...patch } });
const withConfidence = (patch: Partial<CandidateCalibrationV3["dimensionConfidence"]>): Perturbation => (c) => ({ ...c, dimensionConfidence: { ...c.dimensionConfidence, ...patch } });
const withSeverity = (patch: Partial<CandidateCalibrationV3["severity"]>): Perturbation => (c) => ({ ...c, severity: { ...c.severity, ...patch } });
const withOverall = (patch: Partial<Omit<CandidateCalibrationV3["overall"], "bands" | "confidence">>): Perturbation => (c) => ({ ...c, overall: { ...c.overall, ...patch } });
const withBands = (patch: Partial<CandidateCalibrationV3["overall"]["bands"]>): Perturbation => (c) => ({ ...c, overall: { ...c.overall, bands: { ...c.overall.bands, ...patch } } });
const withOverallConfidence = (patch: Partial<CandidateCalibrationV3["overall"]["confidence"]>): Perturbation => (c) => ({ ...c, overall: { ...c.overall, confidence: { ...c.overall.confidence, ...patch } } });

export type CandidateEffect = "YES" | "WIRED_UNREACHABLE" | "NO";
export type OwnershipRowV3 = {
  readonly parameter: string;
  readonly legacyValue: number | null;
  readonly candidateValue: (calibration: CandidateCalibrationV3) => number | null;
  readonly candidateEffect: CandidateEffect;
  readonly legacyEffect: "YES";
  readonly owner: "R8-B" | "R8-C" | "none";
  /** Executable dependency path: `base` (optional) vs `perturb(base)` must change candidate output iff YES. */
  readonly perturb?: Perturbation;
  readonly base?: Perturbation;
  readonly note: string;
};

/** Every numeric calibration parameter that exists today — no hidden parameter (§23). */
export const CALIBRATION_OWNERSHIP_V3: readonly OwnershipRowV3[] = [
  { parameter: "CAPABILITY_CONTRIBUTION.strong", legacyValue: CAPABILITY_CONTRIBUTION.strong, candidateValue: (c) => c.capabilityContribution.strong, candidateEffect: "WIRED_UNREACHABLE", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("strong", 0.9), note: "No candidate-38 V3 answer maps to `strong` (root of R8-O1)." },
  { parameter: "CAPABILITY_CONTRIBUTION.established", legacyValue: CAPABILITY_CONTRIBUTION.established, candidateValue: (c) => c.capabilityContribution.established, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("established", 0.8), note: "Highest reachable candidate state." },
  { parameter: "CAPABILITY_CONTRIBUTION.partial", legacyValue: CAPABILITY_CONTRIBUTION.partial, candidateValue: (c) => c.capabilityContribution.partial, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("partial", 0.45), note: "" },
  { parameter: "CAPABILITY_CONTRIBUTION.weak", legacyValue: CAPABILITY_CONTRIBUTION.weak, candidateValue: (c) => c.capabilityContribution.weak, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("weak", 0.2), note: "" },
  { parameter: "CAPABILITY_CONTRIBUTION.dependency", legacyValue: CAPABILITY_CONTRIBUTION.dependency, candidateValue: (c) => c.capabilityContribution.dependency, candidateEffect: "WIRED_UNREACHABLE", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("dependency", 0.3), note: "No candidate-38 V3 answer maps to `dependency`." },
  { parameter: "CAPABILITY_CONTRIBUTION.missing", legacyValue: CAPABILITY_CONTRIBUTION.missing, candidateValue: (c) => c.capabilityContribution.missing, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withContribution("missing", 0.1), note: "Reachable from two direct sources only." },
  { parameter: "SCORING_MODEL.directWeight", legacyValue: SCORING_MODEL.directWeight, candidateValue: (c) => c.scoring.directWeight, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withScoring({ directWeight: 2 }), note: "Cancels out unless supporting evidence is present." },
  { parameter: "SCORING_MODEL.supportingWeight", legacyValue: SCORING_MODEL.supportingWeight, candidateValue: (c) => c.scoring.supportingWeight, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withScoring({ supportingWeight: 0.25 }), note: "Only Readiness has candidate supporting sources." },
  { parameter: "SCORING_MODEL.supportingCapRatio", legacyValue: SCORING_MODEL.supportingCapRatio, candidateValue: (c) => c.scoring.supportingCapRatio, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withScoring({ supportingCapRatio: 0.25 }), note: "Binds only when supporting weight exceeds the cap." },
  { parameter: "CONFIDENCE_MODEL.supportingWeight", legacyValue: CONFIDENCE_MODEL.supportingWeight, candidateValue: (c) => c.dimensionConfidence.supportingWeight, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withConfidence({ supportingWeight: 0.25 }), note: "" },
  { parameter: "CONFIDENCE_MODEL.mediumAt", legacyValue: CONFIDENCE_MODEL.mediumAt, candidateValue: (c) => c.dimensionConfidence.mediumAt, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", perturb: withConfidence({ mediumAt: 1 }), note: "Root of R8-O2 with one direct source per dimension." },
  { parameter: "CONFIDENCE_MODEL.highAt", legacyValue: CONFIDENCE_MODEL.highAt, candidateValue: (c) => c.dimensionConfidence.highAt, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-B", base: withConfidence({ mediumAt: 1 }), perturb: withConfidence({ highAt: 1.5 }), note: "Inert at baseline: no candidate dimension reaches strength 3." },
  { parameter: "SEVERITY_BANDS.materialBelow", legacyValue: SEVERITY_BANDS.materialBelow, candidateValue: (c) => c.severity.materialBelow, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withSeverity({ materialBelow: 70 }), note: "Priorities, fact readings and prerequisites share it." },
  { parameter: "SEVERITY_BANDS.moderateBelow", legacyValue: SEVERITY_BANDS.moderateBelow, candidateValue: (c) => c.severity.moderateBelow, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withSeverity({ moderateBelow: 60 }), note: "" },
  { parameter: "OVERALL_INDEX_MODEL.minScoredDimensions", legacyValue: OVERALL_INDEX_MODEL.minScoredDimensions, candidateValue: (c) => c.overall.minScoredDimensions, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withOverall({ minScoredDimensions: 9 }), note: "" },
  { parameter: "OVERALL_INDEX_MODEL.minCoverage", legacyValue: OVERALL_INDEX_MODEL.minCoverage, candidateValue: (c) => c.overall.minCoverage, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withOverall({ minCoverage: 0.95 }), note: "Over observable applicable dimensions (R6-B)." },
  { parameter: "OVERALL_INDEX_MODEL.bands.developingFrom", legacyValue: OVERALL_INDEX_MODEL.bands.developingFrom, candidateValue: (c) => c.overall.bands.developingFrom, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withBands({ developingFrom: 63 }), note: "" },
  { parameter: "OVERALL_INDEX_MODEL.bands.solidFrom", legacyValue: OVERALL_INDEX_MODEL.bands.solidFrom, candidateValue: (c) => c.overall.bands.solidFrom, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withBands({ solidFrom: 74 }), note: "" },
  { parameter: "OVERALL_INDEX_MODEL.confidence.mediumCoverage", legacyValue: OVERALL_INDEX_MODEL.confidence.mediumCoverage, candidateValue: (c) => c.overall.confidence.mediumCoverage, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", base: withOverallConfidence({ share: 0, highCoverage: 1 }), perturb: withOverallConfidence({ mediumCoverage: 0.9 }), note: "Inert at baseline: no canonical case reaches the share condition (R8-O2)." },
  { parameter: "OVERALL_INDEX_MODEL.confidence.highCoverage", legacyValue: OVERALL_INDEX_MODEL.confidence.highCoverage, candidateValue: (c) => c.overall.confidence.highCoverage, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", base: withOverallConfidence({ share: 0 }), perturb: withOverallConfidence({ highCoverage: 1.01 }), note: "Inert at baseline for the same reason." },
  { parameter: "OVERALL_INDEX_MODEL.confidence.share", legacyValue: OVERALL_INDEX_MODEL.confidence.share, candidateValue: (c) => c.overall.confidence.share, candidateEffect: "YES", legacyEffect: "YES", owner: "R8-C", perturb: withOverallConfidence({ share: 0 }), note: "" },
  { parameter: "SOUND (qbv2-solutions.ts)", legacyValue: 75, candidateValue: () => null, candidateEffect: "NO", legacyEffect: "YES", owner: "none", note: "LEGACY_ONLY: read only inside legacy `matchSolution` (Discovery advertising gate); the candidate never calls it." },
];

/** Structural invariants any future candidate calibration must keep (objectives O1/O6/O9); never a target. */
export function candidateCalibrationInvariantViolationsV3(c: CandidateCalibrationV3): readonly string[] {
  const v: string[] = [];
  const k = c.capabilityContribution;
  if (!(k.strong >= k.established && k.established > k.partial && k.partial > k.weak && k.weak >= k.missing && k.missing >= 0 && k.strong <= 1)) v.push("contribution ladder must be monotonic within [0, 1]");
  if (!(k.dependency >= k.missing && k.dependency < k.partial)) v.push("dependency must stay a negative reading");
  if (k.constraint !== null || k.uncertainty !== null || k.not_applicable !== null) v.push("neutral states must never contribute");
  if (!(c.scoring.directWeight > 0 && c.scoring.supportingWeight >= 0 && c.scoring.supportingCapRatio > 0 && c.scoring.supportingCapRatio <= 1)) v.push("scoring weights out of range");
  if (!(c.dimensionConfidence.supportingWeight >= 0 && c.dimensionConfidence.mediumAt > 0 && c.dimensionConfidence.mediumAt < c.dimensionConfidence.highAt)) v.push("dimension confidence thresholds out of order");
  if (!(0 <= c.severity.materialBelow && c.severity.materialBelow < c.severity.moderateBelow && c.severity.moderateBelow <= 100)) v.push("severity bands out of order");
  const o = c.overall;
  if (!(o.minScoredDimensions >= 1 && o.minCoverage > 0 && o.minCoverage <= 1)) v.push("overall minimums out of range");
  if (!(0 < o.bands.developingFrom && o.bands.developingFrom < o.bands.solidFrom && o.bands.solidFrom <= 100)) v.push("overall bands out of order");
  if (!(o.confidence.mediumCoverage <= o.confidence.highCoverage && o.confidence.share >= 0 && o.confidence.share <= 1)) v.push("overall confidence model out of order");
  return v;
}

// ── R7 corpus and deterministic evaluator ──────────────────────────────────────────────────────────────

let canonicalAnswers: readonly { readonly id: string; readonly answers: AnswersV2 }[] | undefined;
/** R7 corpus: the 25 canonical routes (`route.finalAnswers`) plus the 36 adversarial/near-miss cases. */
export function r7CorpusV3(): readonly { readonly id: string; readonly answers: AnswersV2 }[] {
  canonicalAnswers ??= CANONICAL_CASES_V3.map((c) => ({ id: c.id, answers: runCanonicalRouteV3(c).finalAnswers }));
  return [...canonicalAnswers, ...[...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].map((c) => ({ id: c.id, answers: c.answers }))];
}

const LADDER = ["strong", "established", "partial", "weak", "dependency", "missing"] as const;
const tally = (into: Record<string, number>, key: string) => { into[key] = (into[key] ?? 0) + 1; };
const describe = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length === 0 ? null : { n: sorted.length, min: sorted[0]!, median: sorted[Math.floor(sorted.length / 2)]!, max: sorted.at(-1)! };
};

/**
 * Deterministic calibration evaluator over the R7 corpus (§33-35). Reports distributions only; commercial
 * outcomes are included for regression visibility and are never an optimization target.
 */
export function evaluateCandidateCalibrationV3(calibration: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_V3) {
  const dimensionCalibration = candidateDimensionCalibrationV3(calibration);
  const scores: Record<string, number[]> = {};
  const patterns: Record<string, { n: number; scores: Record<string, number>; confidence: Record<string, number> }> = {};
  const confidencePatterns: Record<string, Record<string, number>> = {};
  const byDirect: Record<string, Record<string, number>> = {};
  const bySupporting: Record<string, Record<string, number>> = {};
  const supportingDelta: Record<string, number> = {};
  const siblingDisagreement: Record<string, number> = {};
  const coverage: Record<string, number> = {};
  const overallRaw: Record<string, number> = {};
  const bands: Record<string, number> = {};
  const overallConfidence: Record<string, number> = {};
  const priorityRanks: Record<string, Record<string, number>> = {};
  const archetypes: Record<string, Record<string, number>> = {};
  const licenses: Record<string, number> = {};
  const corpus = r7CorpusV3();
  for (const { answers } of corpus) {
    const result: CandidateCommercialBoundaryV3 = buildCandidateCommercialBoundaryV3({ answers, calibration });
    for (const d of result.scoring.dimensions) {
      if (d.applicability !== "applicable") continue;
      const capability = d.evidence.filter((e) => e.directness !== "contextual" && e.contribution !== null);
      const direct = capability.filter((e) => e.directness === "direct");
      const supporting = capability.filter((e) => e.directness === "supporting");
      const uncertain = d.evidence.filter((e) => e.state === "uncertainty" && e.directness !== "contextual").length;
      const level = d.confidence.level;
      tally(byDirect[`${Math.min(direct.length, 3)}${direct.length >= 3 ? "+" : ""} direct`] ??= {}, level);
      tally(bySupporting[`${supporting.length} supporting`] ??= {}, level);
      const shape = direct.length === 0 ? null : direct.length >= 3 ? "3+ direct" : `${direct.length} direct${supporting.length > 0 ? ` + ${supporting.length} supporting` : ""}`;
      if (shape) tally(confidencePatterns[shape] ??= {}, level);
      if (d.confidence.contradictory) tally(confidencePatterns["direct contradiction"] ??= {}, level);
      if (uncertain > 0) tally(confidencePatterns["unknown penalty"] ??= {}, level);
      if (d.score === null) continue;
      (scores[d.id] ??= []).push(d.score);
      const order = (s: string) => LADDER.indexOf(s as (typeof LADDER)[number]);
      const states = (items: typeof capability) => items.map((e) => e.state).sort((a, b) => order(a) - order(b)).join("/");
      const key = `${direct.length} direct ${states(direct)}${supporting.length > 0 ? ` + supporting ${states(supporting)}` : ""}`;
      const entry = patterns[key] ??= { n: 0, scores: {}, confidence: {} };
      entry.n += 1; tally(entry.scores, String(d.score)); tally(entry.confidence, level);
      if (supporting.length > 0) {
        const withoutSupporting = scoreDimensionWithApplicability(d.id, direct, "applicable", dimensionCalibration).score!;
        tally(supportingDelta, `${states(direct)} + ${states(supporting)}: ${d.score - withoutSupporting}`);
      }
      if (new Set(direct.map((e) => e.state)).size > 1) {
        const best = Math.round(100 * Math.max(...direct.map((e) => e.contribution!)));
        tally(siblingDisagreement, `${states(direct)}: ${d.score - best}`);
      }
    }
    const o = result.overall;
    tally(coverage, String(o.index.coverage));
    tally(overallRaw, o.index.rawScore === null ? "null" : String(Math.round(o.index.rawScore)));
    tally(bands, String(o.publicLabel));
    tally(overallConfidence, o.confidence.level);
    for (const p of result.narrative.priorities) tally(priorityRanks[p.dimension] ??= {}, `rank ${p.rank}`);
    const archetype = result.context.archetype?.status === "resolved" ? String(result.context.archetype.value) : "unresolved";
    tally(archetypes[archetype] ??= {}, String(o.publicLabel));
    tally(licenses, String(result.commercial.licenseFit.recommendedLicense));
  }
  return {
    calibration: { identity: calibration.identity, version: calibration.version },
    corpus: corpus.length,
    scoreByDimension: Object.fromEntries(Object.entries(scores).map(([id, values]) => [id, describe(values)])),
    evidencePatterns: patterns, confidencePatterns, confidenceByDirectCount: byDirect, confidenceBySupportingCount: bySupporting,
    supportingDelta, siblingDisagreement, coverage, overallRawScore: overallRaw, bands, overallConfidence,
    priorityRanks, archetypeBands: archetypes,
    /** Regression visibility only — never an optimization target (§32). */
    commercialLicenses: licenses,
  };
}

// ── Target annotations (structure only; R8-B populates, relative constraints first) ─────────────────────

export type CalibrationRefV3 = { readonly caseId: string; readonly dimension: DigitalDimensionId };
export type CalibrationExpectationV3 =
  | { readonly kind: "relative"; readonly higher: CalibrationRefV3; readonly relation: ">" | ">="; readonly lower: CalibrationRefV3; readonly rationale: string }
  | { readonly kind: "range"; readonly ref: CalibrationRefV3; readonly min: number; readonly max: number; readonly rationale: string }
  | { readonly kind: "confidence_at_least"; readonly ref: CalibrationRefV3; readonly level: "medium" | "high"; readonly rationale: string };

/** Intentionally empty in R8-A: no numeric target is claimed without curated human labels (§36-37). */
export const CALIBRATION_EXPECTATIONS_V3: readonly CalibrationExpectationV3[] = [];
