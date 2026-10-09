import { QUESTION_BY_ID, answerValue, mulberry32, optionState, pick, runPolicyRoute, structuralViolations, EVIDENCE_LADDER } from "./qbv2-candidate-qa-harness";
import { candidateCalibrationInvariantViolationsV3, r7CorpusV3, type CalibrationReviewStatusV3 } from "./qbv2-r8-calibration-qa";
import { holdoutCorpusV3, supportingMatrixV3 } from "./qbv2-r8b-calibration-experiments";
import { CANDIDATE_CALIBRATION_R8B_V2, candidateDimensionCalibrationV3, type CandidateCalibrationV3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3, type CommercialClarificationAnswer } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import { CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3, type CandidateDigitalPresenceIndexV3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { STATE_KIND, type CapabilityState } from "../../../app/features/diagnostic/qbv2-capability";
import { scoreDimensionWithApplicability, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { EvidenceDirectness } from "../../../app/features/diagnostic/qbv2-coverage";
import type { DiagnosticScoringView } from "../../../app/features/diagnostic/qbv2-diagnostic-view";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import {
  OVERALL_STATUS_CODES, bandForBands, buildDigitalPresenceStatus, computeDigitalPresenceIndex, computeOverallConfidence, displayScoreForBands, type DigitalPresenceIndex, type OverallBands,
} from "../../../app/features/diagnostic/qbv2-overall";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8-C overall calibration experiments (test-only). Hypotheses over the parameters R8-C owns (index
 * sufficiency, public bands, overall confidence, priority severity), each evaluated through the real candidate
 * chain — `buildCandidateCommercialBoundaryV3({ answers, calibration })`, never a parallel index, band or
 * priority engine — plus exhaustive synthetic domains for the pure rules (coverage fractions, confidence
 * compositions, evidence combinations). R8-B values (contributions, scoring, dimension confidence) are frozen
 * and never varied here. Selection corpus: the R7 corpus and the synthetic domains. The holdout (answer bags
 * and clean interactive routes, fresh seeds) is evaluated only for the selected calibration, after selection.
 */

const R8C_PARAMETERS = ["minScoredDimensions", "minCoverage", "developingFrom", "solidFrom", "mediumCoverage", "highCoverage", "share", "materialBelow", "moderateBelow"] as const;
export type R8cParameterV3 = (typeof R8C_PARAMETERS)[number];
export type R8cFamilyV3 = "BASELINE_V2" | "SUFFICIENCY_ONLY" | "BANDS_ONLY" | "OVERALL_CONFIDENCE_ONLY" | "SEVERITY_ONLY" | "COMBINED_CONSERVATIVE";
export type R8cHypothesisV3 = {
  readonly id: string;
  readonly family: R8cFamilyV3;
  readonly patch: Partial<Record<R8cParameterV3, number>>;
  readonly rationale: string;
  /** The certified statement that justifies moving each parameter; `none — …` records why it is unanchored (§34). */
  readonly anchors: Partial<Record<R8cParameterV3, string>>;
  readonly expectedEffect: string;
};

/** Applicable dimensions the candidate bank can ever read: eight minus the bank-unobservable ones (Measurement). */
export const CANDIDATE_MAX_OBSERVABLE_V3 = DIGITAL_DIMENSION_IDS.length - CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.size;

const NONE = (why: string) => `none — ${why}`;
const NO_CEILING_RESCALE = "lowering the bands toward the 75 ceiling re-scales `established` toward excellence, the move R3/R8-B rejected (R8-O1); no certified statement places the boundary there";
const PUBLIC_BANDS = "the 41/71 boundaries are the certified public band contract (DIAG-V3-10/FIX-03D, published by the methodology as an internal rule); no certified statement replaces them";
const R3_SEVERITY = "the R3 ladder places the material/moderate boundaries at `partial` (50) and `established` (75); no certified statement moves them";

export const R8C_HYPOTHESES_V3: readonly R8cHypothesisV3[] = [
  { id: "BASELINE_V2", family: "BASELINE_V2", patch: {}, anchors: {}, rationale: "R8-B v2 values: the certified DIAG-V3-10 overall contract (≥3 readings, ≥1/3 coverage, bands 41/71, confidence 0.5/0.75/0.5) and the R3-ladder severity (below `partial` material, below `established` moderate).", expectedEffect: "none" },
  { id: "INDEX-H1", family: "SUFFICIENCY_ONLY", patch: { minCoverage: 0.4 }, anchors: { minCoverage: NONE("no certified statement places the coverage floor at 40%") }, rationale: "Raise the coverage floor to 40%.", expectedEffect: "none on the candidate: with at most 7 observable areas, 3 readings already cover 3/7 ≈ 0.43" },
  { id: "INDEX-H2", family: "SUFFICIENCY_ONLY", patch: { minCoverage: 0.5 }, anchors: { minCoverage: NONE("one half is the medium-confidence coverage, not a certified rule for the index to exist (DIAG-V3-10 certifies 1/3)") }, rationale: "Require half of the observable areas before summarizing.", expectedEffect: "removes the index of every 3-of-7 reading" },
  { id: "INDEX-H3", family: "SUFFICIENCY_ONLY", patch: { minScoredDimensions: 4, minCoverage: 0.5 }, anchors: { minScoredDimensions: NONE("DIAG-V3-10 certifies three readings as the anti-repetition minimum"), minCoverage: NONE("see INDEX-H2") }, rationale: "Require four readings and half coverage.", expectedEffect: "removes the index of every 3-reading route, including complete routes with 6 observable areas" },
  { id: "BAND-H1", family: "BANDS_ONLY", patch: { developingFrom: 40, solidFrom: 68 }, anchors: { developingFrom: NONE(PUBLIC_BANDS), solidFrom: NONE(NO_CEILING_RESCALE) }, rationale: "Compensate the 75 ceiling slightly.", expectedEffect: "means in [68, 71) become BIEN; a mean of exactly 40 becomes REGULAR" },
  { id: "BAND-H2", family: "BANDS_ONLY", patch: { developingFrom: 40, solidFrom: 65 }, anchors: { developingFrom: NONE(PUBLIC_BANDS), solidFrom: NONE(NO_CEILING_RESCALE) }, rationale: "Compensate the 75 ceiling fully for one partial area.", expectedEffect: "means in [65, 71) become BIEN, including one weak area among five or more" },
  { id: "BAND-H3", family: "BANDS_ONLY", patch: { developingFrom: 45, solidFrom: 70 }, anchors: { developingFrom: NONE(PUBLIC_BANDS), solidFrom: NONE(NO_CEILING_RESCALE) }, rationale: "Widen MAL slightly and move BIEN to 70.", expectedEffect: "means in [41, 45) become MAL; means in [70, 71) become BIEN" },
  { id: "BAND-H4", family: "BANDS_ONLY", patch: { developingFrom: 50, solidFrom: 75 }, anchors: { developingFrom: NONE(PUBLIC_BANDS), solidFrom: NONE("the severity thresholds read one area; the certified overall contract deliberately keeps its own public bands for the summary") }, rationale: "Strict counterpart: read the mean with the per-area reading thresholds.", expectedEffect: "BIEN only when every read area is established; means in [41, 50) become MAL" },
  { id: "OVERALL-CONF-H1", family: "OVERALL_CONFIDENCE_ONLY", patch: { highCoverage: 0.8 }, anchors: { highCoverage: NONE("no certified statement places broad coverage at 80%") }, rationale: "Demand more coverage for high.", expectedEffect: "none observed: no corpus reading reaches high (R5 asks one direct question per area)" },
  { id: "OVERALL-CONF-H2", family: "OVERALL_CONFIDENCE_ONLY", patch: { mediumCoverage: 0.6, highCoverage: 0.8 }, anchors: { mediumCoverage: NONE("no certified statement places reasonable support at 60%"), highCoverage: NONE("see OVERALL-CONF-H1") }, rationale: "Demand more coverage for medium and high.", expectedEffect: "complete 4-of-7 and 3-of-6 routes become low and provisional" },
  { id: "OVERALL-CONF-H3", family: "OVERALL_CONFIDENCE_ONLY", patch: { share: 0.6 }, anchors: { share: NONE("the certified rule is a majority of the read areas (one half)") }, rationale: "Demand a 60% share of supported areas.", expectedEffect: "none observed: under v2 almost every read area is medium" },
  { id: "OVERALL-CONF-H4", family: "OVERALL_CONFIDENCE_ONLY", patch: { mediumCoverage: 0.4 }, anchors: { mediumCoverage: NONE("R6-B certifies a bank-level denominator; treating context-level instrument gaps differently is a model decision (R8-O6), not a threshold") }, rationale: "Opposite direction (R8-O6 probe): stop 3-of-7 readings from lowering confidence.", expectedEffect: "3-of-7 readings become medium; coverage no longer affects medium for any reachable route" },
  { id: "SEVERITY-H1", family: "SEVERITY_ONLY", patch: { materialBelow: 45, moderateBelow: 70 }, anchors: { materialBelow: NONE(R3_SEVERITY), moderateBelow: NONE(R3_SEVERITY) }, rationale: "Soften both severity boundaries.", expectedEffect: "no corpus score lies in [45, 50) or [70, 75): no corpus effect" },
  { id: "SEVERITY-H2", family: "SEVERITY_ONLY", patch: { materialBelow: 50, moderateBelow: 70 }, anchors: { moderateBelow: NONE(R3_SEVERITY) }, rationale: "Soften the moderate boundary.", expectedEffect: "no corpus score lies in [70, 75): no corpus effect; C24 (67) stays moderate" },
  { id: "SEVERITY-H3", family: "SEVERITY_ONLY", patch: { materialBelow: 50, moderateBelow: 72 }, anchors: { moderateBelow: NONE(R3_SEVERITY) }, rationale: "Soften the moderate boundary marginally.", expectedEffect: "no score is reachable in [72, 75): no effect at all" },
  { id: "COMBINED_CONSERVATIVE", family: "COMBINED_CONSERVATIVE", patch: { minCoverage: 0.4, developingFrom: 45, solidFrom: 70, highCoverage: 0.8, moderateBelow: 72 }, anchors: { minCoverage: NONE("see INDEX-H1"), developingFrom: NONE(PUBLIC_BANDS), solidFrom: NONE(NO_CEILING_RESCALE), highCoverage: NONE("see OVERALL-CONF-H1"), moderateBelow: NONE(R3_SEVERITY) }, rationale: "The mildest move of each family together.", expectedEffect: "union of INDEX-H1, BAND-H3, OVERALL-CONF-H1 and SEVERITY-H3" },
];

const PARAMETER_VALUE: Readonly<Record<R8cParameterV3, (c: CandidateCalibrationV3) => number>> = {
  minScoredDimensions: (c) => c.overall.minScoredDimensions, minCoverage: (c) => c.overall.minCoverage,
  developingFrom: (c) => c.overall.bands.developingFrom, solidFrom: (c) => c.overall.bands.solidFrom,
  mediumCoverage: (c) => c.overall.confidence.mediumCoverage, highCoverage: (c) => c.overall.confidence.highCoverage, share: (c) => c.overall.confidence.share,
  materialBelow: (c) => c.severity.materialBelow, moderateBelow: (c) => c.severity.moderateBelow,
};
export function r8cParameterValuesV3(c: CandidateCalibrationV3): Record<R8cParameterV3, number> {
  return Object.fromEntries(R8C_PARAMETERS.map((p) => [p, PARAMETER_VALUE[p](c)])) as Record<R8cParameterV3, number>;
}

export function r8cHypothesisCalibrationV3(hypothesis: R8cHypothesisV3, base: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2): CandidateCalibrationV3 {
  const p = hypothesis.patch, o = base.overall;
  return {
    ...base,
    severity: { materialBelow: p.materialBelow ?? base.severity.materialBelow, moderateBelow: p.moderateBelow ?? base.severity.moderateBelow },
    overall: {
      minScoredDimensions: p.minScoredDimensions ?? o.minScoredDimensions, minCoverage: p.minCoverage ?? o.minCoverage,
      bands: { developingFrom: p.developingFrom ?? o.bands.developingFrom, solidFrom: p.solidFrom ?? o.bands.solidFrom },
      confidence: { mediumCoverage: p.mediumCoverage ?? o.confidence.mediumCoverage, highCoverage: p.highCoverage ?? o.confidence.highCoverage, share: p.share ?? o.confidence.share },
    },
  };
}

// ── Shared helpers ───────────────────────────────────────────────────────────────────────────────────

const round2 = (value: number) => Math.round(value * 100) / 100;
/** R8-C is a historical calibration certification against H0; O6's successor model is certified separately. */
export const runR8cHistoricalBankModelV3 = (answers: AnswersV2, calibration: CandidateCalibrationV3, clarificationAnswer?: CommercialClarificationAnswer) => {
  const result = buildCandidateCommercialBoundaryV3({ answers, calibration, clarificationAnswer });
  const prelaunch = result.narrative.lifecycle === "prelaunch";
  const base = computeDigitalPresenceIndex(result.scoring, { prelaunch, model: calibration.overall });
  const unobservableApplicableDimensions = base.applicableDimensions.filter((id) => CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id));
  const observableApplicableDimensions = base.applicableDimensions.filter((id) => !CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(id));
  const coverageDenominator = observableApplicableDimensions.length;
  const coverage = coverageDenominator === 0 ? 0 : round2(base.scoredDimensions.length / coverageDenominator);
  const sufficient = !prelaunch && base.scoredDimensions.length >= calibration.overall.minScoredDimensions && coverageDenominator > 0 && base.scoredDimensions.length / coverageDenominator >= calibration.overall.minCoverage;
  const rawScore = sufficient ? base.scoredDimensions.reduce((sum, id) => sum + result.scoring.dimensions.find((d) => d.id === id)!.score!, 0) / base.scoredDimensions.length : null;
  const index = {
    ...base, coverage, sufficient, rawScore,
    displayScore: rawScore === null ? null : displayScoreForBands(rawScore, calibration.overall.bands),
    unobservableApplicableDimensions, observableApplicableDimensions, coverageDenominator,
    observabilityModel: result.overall.index.observabilityModel,
    dimensionObservability: result.overall.index.dimensionObservability,
  } as CandidateDigitalPresenceIndexV3;
  const overall = buildDigitalPresenceStatus({
    scoring: result.scoring, priorities: result.priorities, semanticFacts: result.semanticFacts, narrative: result.narrative,
    computeIndex: () => index, computeConfidence: (scoring, value) => computeOverallConfidence(scoring, value, calibration.overall), bands: calibration.overall.bands,
  });
  return { ...result, overall };
};
const run = runR8cHistoricalBankModelV3;
export const candidateIndexOf = (r: CandidateCommercialBoundaryV3) => r.overall.index as CandidateDigitalPresenceIndexV3;
export const observableApplicableOf = (r: CandidateCommercialBoundaryV3) => candidateIndexOf(r).applicableDimensions.length - candidateIndexOf(r).unobservableApplicableDimensions.length;
const LEVEL = { low: 0, medium: 1, high: 2 } as const;
type Level = keyof typeof LEVEL;
const CAPABILITY_TYPES = new Set(["strength", "partial", "weakness"]);

/**
 * Why an observable applicable area has no reading. `instrument`: no direct question of that area is in the
 * route (the context leaves it unreachable). `respondent`: a direct question was answered but gave no reading
 * (unknown or not-applicable answer). Calibration-independent (the R5 planner never reads the calibration).
 */
export type RouteProfileV3 = { readonly complete: boolean; readonly prelaunch: boolean; readonly instrumentGaps: readonly DigitalDimensionId[]; readonly respondentGaps: readonly DigitalDimensionId[] };
export function routeProfileV3(answers: AnswersV2, result: CandidateCommercialBoundaryV3): RouteProfileV3 {
  const index = candidateIndexOf(result);
  const gaps = index.excluded.filter((e) => e.reason === "no_reading" && !index.unobservableApplicableDimensions.includes(e.dimension)).map((e) => e.dimension);
  const answered = (dimension: DigitalDimensionId) => CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(dimension).some((id) => result.activeAnswers[id] !== undefined);
  return {
    complete: buildCandidateQuestionPlanV3({ answers }).nextQuestionId === undefined, prelaunch: result.narrative.lifecycle === "prelaunch",
    instrumentGaps: gaps.filter((d) => !answered(d)), respondentGaps: gaps.filter(answered),
  };
}
/** A complete, launched route in which the respondent left no direct question without a reading. */
export const isCleanCompleteV3 = (p: RouteProfileV3) => p.complete && !p.prelaunch && p.respondentGaps.length === 0;

let selectionCorpus: readonly { readonly id: string; readonly answers: AnswersV2; readonly profile: RouteProfileV3 }[] | undefined;
/** The R7 corpus with each case's calibration-independent route profile (§35 selection corpus). */
export function r8cSelectionCorpusV3() {
  selectionCorpus ??= r7CorpusV3().map(({ id, answers }) => ({ id, answers, profile: routeProfileV3(answers, run(answers, CANDIDATE_CALIBRATION_R8B_V2)) }));
  return selectionCorpus;
}

// ── Per-result contracts (§8-§9, §12, §20, §24-§26, §29) ─────────────────────────────────────────────

/** Index, denominator, band, rounding, confidence-gate, provisional and caveat contract of one candidate result. */
export function overallContractViolationsV3(r: CandidateCommercialBoundaryV3, c: CandidateCalibrationV3): string[] {
  const v: string[] = [];
  const o = r.overall, index = candidateIndexOf(r), raw = index.rawScore;
  if (index.sufficient !== (raw !== null)) v.push("sufficient ⇔ rawScore !== null");
  if ((raw === null) !== (index.displayScore === null) || (raw === null) !== (o.publicLabel === null)) v.push("rawScore, displayScore and publicLabel are null together");
  if (r.narrative.lifecycle === "prelaunch" && raw !== null) v.push("prelaunch has no percentage");
  if (raw !== null) {
    const band = bandForBands(raw, c.overall.bands);
    if (o.bandState !== band || o.state !== band || o.publicLabel !== OVERALL_STATUS_CODES[band]) v.push("state and publicLabel follow the rawScore band (caveats never move it)");
    const display = index.displayScore!;
    if (!Number.isInteger(display) || Math.abs(display - raw) >= 1 || bandForBands(display, c.overall.bands) !== band) v.push("displayScore is an integer within 1 of rawScore and in its band");
    const scores = index.scoredDimensions.map((id) => r.scoring.dimensions.find((d) => d.id === id)!.score!);
    if (Math.abs(scores.reduce((a, b) => a + b, 0) / scores.length - raw) > 1e-9) v.push("rawScore is the equal-weight mean of the read areas");
  } else if (o.state !== "insufficient" || o.caveat !== null) v.push("no index → insufficient state without caveat");
  const n = observableApplicableOf(r);
  if (index.unobservableApplicableDimensions.some((d) => !CANDIDATE_UNOBSERVABLE_DIMENSIONS_V3.has(d))) v.push("only bank-unobservable areas leave the denominator");
  if (index.unobservableApplicableDimensions.some((d) => index.scoredDimensions.includes(d) || r.scoring.dimensions.find((x) => x.id === d)!.score !== null)) v.push("an unobservable area is never read");
  if (n > 0 && index.coverage !== round2(index.scoredDimensions.length / n)) v.push("coverage = read / observable applicable areas");
  if (!index.sufficient && o.confidence.level !== "low") v.push("no index → low overall confidence");
  if (o.provisional !== (raw !== null && o.confidence.level === "low")) v.push("provisional ⇔ index with low overall confidence");
  if (o.caveat !== null && o.bandState !== "solid") v.push("caveats only qualify a solid band");
  if (o.caveat?.reason === "material_constraint" && !r.priorities.constraints.some((k) => k.severity === "material" && k.dimension === (o.caveat as { dimension: DigitalDimensionId }).dimension)) v.push("a material caveat cites an evidenced material constraint");
  if (o.caveat?.reason === "limited_confidence" && o.confidence.level !== "low") v.push("limited-confidence caveat ⇔ low confidence");
  return v;
}

/** §29: priorities, semantic fact readings and recommendation prerequisites read one severity model. */
export function severityCoherenceViolationsV3(r: CandidateCommercialBoundaryV3, c: CandidateCalibrationV3): string[] {
  const v: string[] = [];
  const { materialBelow, moderateBelow } = c.severity;
  for (const d of r.scoring.dimensions) {
    if (d.applicability !== "applicable" || d.score === null) continue;
    const expected = d.score < materialBelow ? "material" : d.score < moderateBelow ? "moderate" : null;
    const constraint = r.priorities.constraints.find((k) => k.dimension === d.id && (k.severity === "material" || k.severity === "moderate"));
    if ((constraint?.severity ?? null) !== expected) v.push(`${d.id}=${d.score}: priority severity ${constraint?.severity ?? "none"} ≠ ${expected ?? "none"}`);
    const fact = r.semanticFacts.facts.find((f) => f.dimension === d.id && CAPABILITY_TYPES.has(f.type));
    const type = expected === "material" ? "weakness" : expected === "moderate" ? "partial" : "strength";
    if (!fact || fact.type !== type || (fact.severity ?? null) !== expected) v.push(`${d.id}=${d.score}: fact reading ${fact?.type ?? "none"} ≠ ${type}`);
    for (const rec of r.recommendations.items) for (const pre of rec.prerequisites) if (pre.dimension === d.id && pre.satisfied !== d.score >= moderateBelow) v.push(`${d.id}=${d.score}: prerequisite of ${rec.id} disagrees`);
  }
  return v;
}

/** §30/§32: supporting refines, never selects (R6-C.1 F2); unknown/absent direct never scores or selects. */
export function supportingSafetyViolationsV3(c: CandidateCalibrationV3): string[] {
  const v: string[] = [];
  for (const row of supportingMatrixV3(c)) {
    const label = `direct ${row.direct} + supporting ${row.supporting}`;
    if ((row.direct === "unknown" || row.direct === "absent") && (row.score !== null || row.solution !== null || row.license !== null)) v.push(`${label}: supporting alone scored or selected`);
    if (row.direct === "established" && (row.solution !== null || row.license !== null)) v.push(`${label}: supporting selected an intervention over a healthy direct reading`);
  }
  return v;
}

// ── Exhaustive synthetic domains (pure rules through the real helpers) ─────────────────────────────────

/** §13: the published (2-decimal) coverage never contradicts a threshold decision taken on the exact fraction. */
export function coverageRoundingViolationsV3(c: CandidateCalibrationV3, maxObservable = CANDIDATE_MAX_OBSERVABLE_V3): string[] {
  const v: string[] = [];
  const o = c.overall;
  for (let n = 1; n <= maxObservable; n += 1) for (let k = o.minScoredDimensions; k <= n; k += 1) {
    const exact = k / n, published = round2(exact);
    const thresholds: [string, number][] = [["minCoverage", o.minCoverage]];
    if (exact >= o.minCoverage) thresholds.push(["mediumCoverage", o.confidence.mediumCoverage], ["highCoverage", o.confidence.highCoverage]);
    for (const [name, t] of thresholds) if ((published >= t) !== (exact >= t)) v.push(`${k}/${n}: published ${published} vs ${name} ${t}`);
  }
  return v;
}

/** §20: on a 0.01 grid of [0, 100] and around each boundary, the visible integer never leaves the rawScore band. */
export function displayRoundingViolationsV3(bands: OverallBands): string[] {
  const v: string[] = [];
  const points = new Set<number>();
  for (let i = 0; i <= 10_000; i += 1) points.add(i / 100);
  for (const t of [bands.developingFrom, bands.solidFrom]) for (const d of [-1, -0.51, -0.5, -0.49, -0.001, 0, 0.001, 0.49, 0.5, 0.51]) points.add(t + d);
  let previous = -Infinity;
  for (const x of [...points].filter((p) => p >= 0 && p <= 100).sort((a, b) => a - b)) {
    const display = displayScoreForBands(x, bands);
    if (!Number.isInteger(display) || Math.abs(display - x) >= 1 || bandForBands(display, bands) !== bandForBands(x, bands)) v.push(`${x} → ${display}`);
    if (display < previous) v.push(`${x}: display not monotonic`);
    previous = display;
  }
  return v;
}

function syntheticOverallLevel(c: CandidateCalibrationV3, counts: readonly [number, number, number], n: number): Level {
  const levels: Level[] = [...Array<Level>(counts[0]).fill("low"), ...Array<Level>(counts[1]).fill("medium"), ...Array<Level>(counts[2]).fill("high")];
  const ids = DIGITAL_DIMENSION_IDS.slice(0, levels.length);
  const k = levels.length;
  const sufficient = k >= c.overall.minScoredDimensions && n > 0 && k / n >= c.overall.minCoverage;
  const scoring = { dimensions: ids.map((id, i) => ({ id, confidence: { level: levels[i] } })) } as unknown as DiagnosticScoringView;
  const index = { scoredDimensions: ids, sufficient, coverage: n === 0 ? 0 : round2(k / n) } as unknown as DigitalPresenceIndex;
  return computeOverallConfidence(scoring, index, c.overall).level;
}
function* compositions(maxObservable: number) {
  for (let n = 1; n <= maxObservable; n += 1) for (let k = 0; k <= n; k += 1) for (let high = 0; high <= k; high += 1) for (let medium = 0; medium <= k - high; medium += 1) {
    yield { n, counts: [k - high - medium, medium, high] as [number, number, number] };
  }
}

/**
 * §21-§24 overall confidence contract over every reachable composition (n ≤ 7 observable areas, any mix of area
 * levels), through the real `computeOverallConfidence`: no index → low; no supported area → low; never high
 * without a corroborated area; upgrading an area or adding one at the top level never lowers it; coverage
 * stays part of the medium level (§22); medium and high stay reachable.
 */
export function overallConfidenceContractV3(c: CandidateCalibrationV3, maxObservable = CANDIDATE_MAX_OBSERVABLE_V3) {
  const v = new Set<string>();
  const level = (counts: readonly [number, number, number], n: number) => syntheticOverallLevel(c, counts, n);
  const sufficient = (k: number, n: number) => k >= c.overall.minScoredDimensions && k / n >= c.overall.minCoverage;
  let coverageMatters = false, mediumReachable = false, highReachable = false;
  for (const { n, counts } of compositions(maxObservable)) {
    const k = counts[0] + counts[1] + counts[2];
    const at = LEVEL[level(counts, n)];
    if (!sufficient(k, n) && at !== 0) v.add("no index → low");
    if (counts[1] + counts[2] === 0 && at !== 0) v.add("no supported area → low");
    if (counts[2] === 0 && at === 2) v.add("never high without a corroborated area");
    if (counts[0] > 0 && LEVEL[level([counts[0] - 1, counts[1] + 1, counts[2]], n)] < at) v.add("upgrading an area low → medium never lowers confidence");
    if (counts[1] > 0 && LEVEL[level([counts[0], counts[1] - 1, counts[2] + 1], n)] < at) v.add("upgrading an area medium → high never lowers confidence");
    if (k < n) {
      const top: [number, number, number] = counts[2] > 0 ? [counts[0], counts[1], counts[2] + 1] : counts[1] > 0 ? [counts[0], counts[1] + 1, counts[2]] : [counts[0] + 1, counts[1], counts[2]];
      if (LEVEL[level(top, n)] < at) v.add("more coverage at the top level never lowers confidence");
    }
    if (sufficient(k, n) && counts[0] === 0 && counts[2] === 0 && at === 0) coverageMatters = true;
    if (sufficient(k, n) && k === n && counts[0] === 0 && counts[2] === 0 && at === 1) mediumReachable = true;
    if (sufficient(k, n) && counts[0] + counts[1] === 0 && at === 2) highReachable = true;
  }
  if (!coverageMatters) v.add("coverage must stay part of the medium level (§22): some reachable index of clean areas is low by coverage alone");
  if (!mediumReachable) v.add("medium must be reachable by a fully read reading of clean areas");
  if (!highReachable) v.add("high must be reachable by a broad, fully corroborated reading");
  const matrix: Record<string, Level> = {};
  for (const n of [6, 7]) for (let k = 3; k <= n; k += 1) {
    matrix[`${k}/${n} all medium`] = level([0, k, 0], n);
    matrix[`${k}/${n} all high`] = level([0, 0, k], n);
    matrix[`${k}/${n} half high`] = level([0, k - Math.ceil(k / 2), Math.ceil(k / 2)], n);
    matrix[`${k}/${n} one low`] = level([1, k - 1, 0], n);
  }
  return { violations: [...v], matrix };
}

type LadderState = "established" | "partial" | "weak" | "missing";
const BAND_PATTERN_STATES: Readonly<Record<string, readonly LadderState[]>> = {
  "all established": [], "one partial": ["partial"], "one weak": ["weak"], "one missing": ["missing"], "two partial": ["partial", "partial"],
};
/**
 * §16-§18 band semantics on R3-ladder patterns over 3–7 read areas (exact means through `bandForBands`). Fixed
 * expectations: all established → BIEN (established is the top demonstrable reading and BIEN ≠ excellence),
 * all partial → REGULAR (works in part), all weak or all missing → MAL. The single-step patterns are recorded
 * with whether their band is the same for every area count.
 */
export function bandPatternMatrixV3(bands: OverallBands, c: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2, maxObservable = CANDIDATE_MAX_OBSERVABLE_V3) {
  const value = (s: LadderState) => 100 * c.capabilityContribution[s];
  const violations: string[] = [];
  const patterns: Record<string, Record<number, { mean: number; band: string }>> = {};
  const sizeConsistent: Record<string, boolean> = {};
  for (let n = 3; n <= maxObservable; n += 1) {
    for (const [state, expected] of [["established", "solid"], ["partial", "developing"], ["weak", "low"], ["missing", "low"]] as const) {
      if (bandForBands(value(state), bands) !== expected) violations.push(`${n} × ${state} must read ${expected}`);
    }
    for (const [name, lower] of Object.entries(BAND_PATTERN_STATES)) {
      const mean = (value("established") * (n - lower.length) + lower.reduce((a, s) => a + value(s), 0)) / n;
      (patterns[name] ??= {})[n] = { mean: round2(mean), band: bandForBands(mean, bands) };
    }
  }
  for (const [name, rows] of Object.entries(patterns)) sizeConsistent[name] = new Set(Object.values(rows).map((x) => x.band)).size === 1;
  // "One partial" BIEN for every n needs solidFrom ≤ its smallest mean; "one weak" REGULAR for every n needs solidFrom > its largest mean.
  const minOnePartial = Math.min(...Object.values(patterns["one partial"]!).map((x) => x.mean));
  const maxOneWeak = Math.max(...Object.values(patterns["one weak"]!).map((x) => x.mean));
  return { violations, patterns, sizeConsistent, singleStepConsistencyFeasible: minOnePartial > maxOneWeak, minOnePartial, maxOneWeak };
}

function evidence(id: string, directness: EvidenceDirectness, state: CapabilityState, c: CandidateCalibrationV3): ContextualEvidence {
  return { questionId: id, dimension: "digital_readiness", observationId: id, directness, state, kind: STATE_KIND[state], contribution: c.capabilityContribution[state], answer: [] };
}
function* multisets<T>(items: readonly T[], size: number, start = 0): Generator<T[]> {
  if (size === 0) { yield []; return; }
  for (let i = start; i < items.length; i += 1) for (const rest of multisets(items, size - 1, i)) yield [items[i]!, ...rest];
}
/** Every dimension score the shared core can produce from 1–3 direct and 0–2 supporting R3 readings (a superset of the bank). */
export function syntheticDimensionScoresV3(c: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2): number[] {
  const states: readonly CapabilityState[] = ["established", "partial", "weak", "missing"];
  const scores = new Set<number>();
  for (let nd = 1; nd <= 3; nd += 1) for (const direct of multisets(states, nd)) for (let ns = 0; ns <= 2; ns += 1) for (const supporting of multisets(states, ns)) {
    const items = [...direct.map((s, i) => evidence(`d${i}`, "direct", s, c)), ...supporting.map((s, i) => evidence(`s${i}`, "supporting", s, c))];
    scores.add(scoreDimensionWithApplicability("digital_readiness", items, "applicable", candidateDimensionCalibrationV3(c)).score!);
  }
  return [...scores].sort((a, b) => a - b);
}
const severityOf = (score: number, c: CandidateCalibrationV3) => score < c.severity.materialBelow ? "material" : score < c.severity.moderateBelow ? "moderate" : "none";

/** The synthetic domain on which a hypothesis decides differently from the baseline (its footprint, even with no corpus effect). */
export function syntheticFootprintV3(c: CandidateCalibrationV3, base: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2) {
  const sufficiency: string[] = [], confidence: string[] = [];
  const suff = (x: CandidateCalibrationV3, k: number, n: number) => k >= x.overall.minScoredDimensions && k / n >= x.overall.minCoverage;
  for (let n = 1; n <= CANDIDATE_MAX_OBSERVABLE_V3; n += 1) for (let k = 0; k <= n; k += 1) if (suff(c, k, n) !== suff(base, k, n)) sufficiency.push(`${k}/${n}`);
  for (const { n, counts } of compositions(CANDIDATE_MAX_OBSERVABLE_V3)) if (syntheticOverallLevel(c, counts, n) !== syntheticOverallLevel(base, counts, n)) confidence.push(`${counts.join("/")} of ${n}`);
  const severity = syntheticDimensionScoresV3(base).filter((s) => severityOf(s, c) !== severityOf(s, base)).map((s) => `${s}: ${severityOf(s, base)} → ${severityOf(s, c)}`);
  const bands: string[] = [];
  for (let i = 0; i <= 10_000; i += 1) {
    const x = i / 100;
    if (bandForBands(x, c.overall.bands) !== bandForBands(x, base.overall.bands)) bands.push(String(x));
  }
  return { sufficiency, confidence: confidence.length, severity, bandRange: bands.length === 0 ? null : `${bands[0]}–${bands.at(-1)} (${bands.length} grid points)` };
}

// ── Corpus evaluation, effects and expectations ──────────────────────────────────────────────────────

const itemsOf = (r: CandidateCommercialBoundaryV3) => [...r.commercial.now.services, ...r.commercial.now.complements, ...r.commercial.later.services, ...r.commercial.later.complements].map((i) => i.id).join(",");
/** The downstream reading R8-C may move (§31), compared field by field against the baseline. */
export function downstreamSummaryV3(r: CandidateCommercialBoundaryV3) {
  const index = candidateIndexOf(r);
  return {
    sufficient: String(index.sufficient), displayScore: String(index.displayScore), band: String(r.overall.publicLabel), confidence: r.overall.confidence.level,
    provisional: String(r.overall.provisional), caveat: String(r.overall.caveat?.reason ?? null), overallText: r.overall.explanation.text,
    severities: r.priorities.constraints.map((k) => `${k.dimension}:${k.severity}`).sort().join(","),
    priorities: r.priorities.priorities.map((p) => `${p.rank}:${p.dimension}:${p.severity}:${p.certainty}`).join(","),
    facts: r.semanticFacts.facts.map((f) => `${f.id}:${f.type}:${f.severity ?? ""}`).join(","),
    recommendations: r.recommendations.items.map((x, i) => `${x.dimension}:${x.mode}:${x.urgency}:${r.solutions[i]!.solution?.id ?? "null"}`).join(","),
    license: String(r.commercial.licenseFit.recommendedLicense), items: itemsOf(r),
  };
}
type Summary = ReturnType<typeof downstreamSummaryV3>;

export type R8cExpectationV3 = { readonly id: string; readonly rule: string; readonly source: string; readonly review: CalibrationReviewStatusV3 };
/**
 * R8-C overall expectations: semantic and relative, never a target percentage, band share or license count.
 * Evaluated on the R7 corpus (selection) — the holdout only reports them for the selected calibration.
 */
export const R8C_EXPECTATIONS_V3: readonly R8cExpectationV3[] = [
  { id: "IX1", rule: "A prelaunch reading has no percentage, band or label.", source: "DIAG-V3-10 overall contract (no percentage before launch) + R8-C §12", review: "CONTRACT_DERIVED_NOT_HUMAN_VALIDATED" },
  { id: "IX2", rule: "Fewer than three read areas never produce an index.", source: "DIAG-V3-10 (one or two readings would only repeat those areas)", review: "CONTRACT_DERIVED_NOT_HUMAN_VALIDATED" },
  { id: "IX3", rule: "A clean complete route (launched, terminal, no respondent gap) with at least three read areas presents an index.", source: "R8-C §11 (no configuration may make the index systematically impossible in normal complete routes) + R5 route completion", review: "CONTRACT_DERIVED_NOT_HUMAN_VALIDATED" },
  { id: "OC6", rule: "A clean complete route of the R7 corpus whose read areas all carry a clean direct reading is not low (not provisional).", source: "R8-C §23 (a level must distinguish evidence, not the context) + R5 route completion + R8-B v2 (one clean direct reading = medium)", review: "CONTRACT_DERIVED_NOT_HUMAN_VALIDATED" },
  { id: "OB1", rule: "Share of clean complete holdout routes that are low because their context leaves fewer than half of the observable areas reachable (R8-O6).", source: "holdout measurement", review: "OBSERVATIONAL" },
];

export function r8cExpectationViolationsV3(results: readonly { id: string; profile: RouteProfileV3; result: CandidateCommercialBoundaryV3 }[]): string[] {
  const v: string[] = [];
  for (const { id, profile, result } of results) {
    const index = candidateIndexOf(result);
    if (profile.prelaunch && (index.rawScore !== null || result.overall.publicLabel !== null)) v.push(`IX1:${id}`);
    if (index.scoredDimensions.length < 3 && index.rawScore !== null) v.push(`IX2:${id}`);
    if (isCleanCompleteV3(profile) && index.scoredDimensions.length >= 3 && index.rawScore === null) v.push(`IX3:${id}`);
    const clean = index.scoredDimensions.every((d) => result.scoring.dimensions.find((x) => x.id === d)!.confidence.level !== "low");
    if (isCleanCompleteV3(profile) && index.rawScore !== null && clean && result.overall.confidence.level === "low") v.push(`OC6:${id}`);
  }
  return v;
}

export function runR8cExperimentV3(hypothesis: R8cHypothesisV3, baseline: ReadonlyMap<string, Summary> = r8cBaselineSummariesV3()) {
  const calibration = r8cHypothesisCalibrationV3(hypothesis);
  const moved = Object.keys(hypothesis.patch) as R8cParameterV3[];
  const corpus = r8cSelectionCorpusV3().map(({ id, answers, profile }) => ({ id, profile, result: run(answers, calibration) }));
  const contract = { overall: [] as string[], severity: [] as string[], structural: 0 };
  const effect: Record<string, string[]> = {};
  const distribution = { bands: {} as Record<string, number>, confidence: {} as Record<string, number>, provisional: 0, caveats: {} as Record<string, number>, licenses: {} as Record<string, number> };
  const tally = (into: Record<string, number>, key: string) => { into[key] = (into[key] ?? 0) + 1; };
  for (const { id, result } of corpus) {
    contract.overall.push(...overallContractViolationsV3(result, calibration).map((x) => `${id}: ${x}`));
    contract.severity.push(...severityCoherenceViolationsV3(result, calibration).map((x) => `${id}: ${x}`));
    contract.structural += structuralViolations(result).length;
    const now = downstreamSummaryV3(result), before = baseline.get(id)!;
    for (const field of Object.keys(now) as (keyof Summary)[]) if (now[field] !== before[field]) (effect[field] ??= []).push(id);
    tally(distribution.bands, String(result.overall.publicLabel)); tally(distribution.confidence, result.overall.confidence.level);
    if (result.overall.provisional) distribution.provisional += 1;
    tally(distribution.caveats, String(result.overall.caveat?.reason ?? null)); tally(distribution.licenses, String(result.commercial.licenseFit.recommendedLicense));
  }
  const bandPatterns = bandPatternMatrixV3(calibration.overall.bands);
  return {
    id: hypothesis.id, family: hypothesis.family, patch: hypothesis.patch, moved, rationale: hypothesis.rationale, expectedEffect: hypothesis.expectedEffect,
    anchors: hypothesis.anchors,
    unanchored: moved.filter((p) => !hypothesis.anchors[p] || hypothesis.anchors[p]!.startsWith("none")),
    invariantViolations: candidateCalibrationInvariantViolationsV3(calibration),
    r8bFrozen: JSON.stringify([calibration.capabilityContribution, calibration.scoring, calibration.dimensionConfidence]) === JSON.stringify([CANDIDATE_CALIBRATION_R8B_V2.capabilityContribution, CANDIDATE_CALIBRATION_R8B_V2.scoring, CANDIDATE_CALIBRATION_R8B_V2.dimensionConfidence]),
    contract: {
      ...contract,
      coverageRounding: coverageRoundingViolationsV3(calibration), displayRounding: displayRoundingViolationsV3(calibration.overall.bands),
      confidence: overallConfidenceContractV3(calibration).violations, bandSemantics: bandPatterns.violations, supporting: supportingSafetyViolationsV3(calibration),
    },
    expectationViolations: r8cExpectationViolationsV3(corpus),
    corpusEffect: effect, inertOnCorpus: Object.keys(effect).length === 0, footprint: syntheticFootprintV3(calibration),
    bandPatterns: { sizeConsistent: bandPatterns.sizeConsistent }, distribution,
  };
}
export type R8cExperimentResultV3 = ReturnType<typeof runR8cExperimentV3>;

let baselineSummaries: ReadonlyMap<string, Summary> | undefined;
export function r8cBaselineSummariesV3(): ReadonlyMap<string, Summary> {
  baselineSummaries ??= new Map(r8cSelectionCorpusV3().map(({ id, answers }) => [id, downstreamSummaryV3(run(answers, CANDIDATE_CALIBRATION_R8B_V2))]));
  return baselineSummaries;
}

/**
 * Decision order (§34, §39, §51): drop a hypothesis that breaks an invariant, moves an R8-B parameter, breaks a
 * per-result contract (index, denominator, band, rounding, provisional, caveat), the coverage or display
 * rounding, the overall confidence contract, the band semantics, severity coherence, supporting safety,
 * structural safety or an expectation; drop any that moves a parameter without a certified anchor; among the
 * survivors prefer the fewest moved parameters. Indistinguishable survivors are an error, never a silent pick.
 */
export function selectR8cCalibrationV3(results: readonly R8cExperimentResultV3[]): { readonly selected: string; readonly eliminated: Readonly<Record<string, readonly string[]>> } {
  const eliminated: Record<string, string[]> = {};
  const survivors = results.filter((r) => {
    const c = r.contract;
    const reasons = [
      ...(r.invariantViolations.length > 0 ? ["INVARIANT"] : []),
      ...(!r.r8bFrozen ? ["R8B_PARAMETER_MOVED"] : []),
      ...(c.overall.length > 0 ? ["OVERALL_CONTRACT"] : []),
      ...(c.coverageRounding.length > 0 || c.displayRounding.length > 0 ? ["ROUNDING"] : []),
      ...(c.confidence.length > 0 ? ["CONFIDENCE_CONTRACT"] : []),
      ...(c.bandSemantics.length > 0 ? ["BAND_SEMANTICS"] : []),
      ...(c.severity.length > 0 ? ["SEVERITY_COHERENCE"] : []),
      ...(c.supporting.length > 0 ? ["SUPPORTING_SAFETY"] : []),
      ...(c.structural > 0 ? ["STRUCTURAL"] : []),
      ...(r.expectationViolations.length > 0 ? [`EXPECTATIONS:${[...new Set(r.expectationViolations.map((x) => x.split(":")[0]))].join("/")}`] : []),
      ...(r.unanchored.length > 0 ? [`UNANCHORED:${r.unanchored.join("/")}`] : []),
    ];
    if (reasons.length > 0) eliminated[r.id] = reasons;
    return reasons.length === 0;
  });
  const fewest = Math.min(...survivors.map((r) => r.moved.length));
  const best = survivors.filter((r) => r.moved.length === fewest);
  if (best.length !== 1) throw new Error(`R8-C: ${best.length} indistinguishable surviving calibrations (${best.map((r) => r.id).join(", ")})`);
  return { selected: best[0]!.id, eliminated };
}

// ── Band sensitivity (§19) and metamorphic mutations (§45) ───────────────────────────────────────────

type Snapshot = {
  readonly raw: number | null; readonly coverage: number; readonly confidence: Level; readonly scored: readonly string[];
  readonly scores: Readonly<Record<string, number | null>>; readonly levels: Readonly<Record<string, Level>>; readonly direct: Readonly<Record<string, number>>; readonly keys: string;
};
const snapshot = (r: CandidateCommercialBoundaryV3): Snapshot => {
  const index = candidateIndexOf(r);
  return {
    raw: index.rawScore, coverage: index.coverage, confidence: r.overall.confidence.level, scored: index.scoredDimensions,
    scores: Object.fromEntries(r.scoring.dimensions.map((d) => [d.id, d.score])), levels: Object.fromEntries(r.scoring.dimensions.map((d) => [d.id, d.confidence.level])),
    direct: Object.fromEntries(r.scoring.dimensions.map((d) => [d.id, d.evidence.filter((e) => e.directness === "direct" && e.contribution !== null).length])),
    keys: Object.keys(r.activeAnswers).sort().join(","),
  };
};
export type R8cMutationV3 = {
  readonly caseId: string; readonly questionId: string; readonly dimension: DigitalDimensionId; readonly directness: "direct" | "supporting"; readonly single: boolean;
  readonly from: string; readonly to: string; readonly before: Snapshot; readonly after: Snapshot; readonly mutatedEvidenceContribution: number | null | undefined;
};

/**
 * Single-answer mutations over the R7 corpus: every capability answer of an applicable area moved to one option of
 * each other R3 state (including unknown and not-applicable), through the real chain under one calibration.
 */
export function r8cMutationsV3(calibration: CandidateCalibrationV3 = CANDIDATE_CALIBRATION_R8B_V2): R8cMutationV3[] {
  const out: R8cMutationV3[] = [];
  for (const { id, answers } of r7CorpusV3()) {
    const base = run(answers, calibration);
    if (base.narrative.lifecycle === "prelaunch") continue;
    const before = snapshot(base);
    for (const [questionId, value] of Object.entries(base.activeAnswers)) {
      const q = QUESTION_BY_ID.get(questionId);
      const mapping = q?.evidenceMigration === "migrated" ? q.evidenceV3?.dimensions[0] : undefined;
      if (!q || !mapping || (mapping.directness !== "direct" && mapping.directness !== "supporting")) continue;
      if (base.scoring.dimensions.find((d) => d.id === mapping.dimension)?.applicability !== "applicable") continue;
      const current = optionState(q, Array.isArray(value) ? String(value[0]) : String(value));
      const targets = new Map<string, string>();
      for (const option of q.options) { const state = optionState(q, option.value); if (state && state !== current && !targets.has(state)) targets.set(state, option.value); }
      for (const [state, option] of targets) {
        const result = run({ ...answers, [questionId]: answerValue(q, option) } as AnswersV2, calibration);
        const item = result.scoring.dimensions.find((d) => d.id === mapping.dimension)!.evidence.find((e) => e.questionId === questionId);
        out.push({ caseId: id, questionId, dimension: mapping.dimension, directness: mapping.directness, single: q.type === "single", from: String(current), to: state, before, after: snapshot(result), mutatedEvidenceContribution: item?.contribution });
      }
    }
  }
  return out;
}

export type BandTransitionKindV3 = "STATE_CHANGE" | "READING_WITHDRAWN" | "SUPPORTING_REFINEMENT" | "COVERAGE_CHANGE" | "INDEX_AVAILABILITY" | "UNEXPLAINED";
/**
 * §19: a band change is explained by a changed direct reading, a withdrawn sibling reading (unknown/N/A on one
 * facet of an area that stays read — the area loses a source and never gains confidence), a supporting
 * refinement, a changed coverage or a changed index availability. Anything else is UNEXPLAINED.
 */
export function bandTransitionsV3(mutations: readonly R8cMutationV3[], bands: OverallBands) {
  const transitions: {
    caseId: string; questionId: string; dimension: string; directness: string; change: string; kind: BandTransitionKindV3; transparent: boolean; thinEvidence: boolean;
    rawBefore: number | null; rawAfter: number | null; bandBefore: string | null; bandAfter: string | null; coverage: string; confidence: string; distanceToThreshold: number | null;
  }[] = [];
  for (const m of mutations) {
    const bandBefore = m.before.raw === null ? null : OVERALL_STATUS_CODES[bandForBands(m.before.raw, bands)];
    const bandAfter = m.after.raw === null ? null : OVERALL_STATUS_CODES[bandForBands(m.after.raw, bands)];
    if (bandBefore === bandAfter) continue;
    const coverageChanged = m.before.coverage !== m.after.coverage || m.before.scored.join() !== m.after.scored.join();
    const scoreChanged = Object.keys(m.before.scores).some((d) => m.before.scores[d] !== m.after.scores[d]);
    const withdrawn = m.to === "uncertainty" || m.to === "not_applicable";
    const kind: BandTransitionKindV3 = bandBefore === null || bandAfter === null ? "INDEX_AVAILABILITY" : coverageChanged ? "COVERAGE_CHANGE" : !scoreChanged ? "UNEXPLAINED"
      : m.directness === "supporting" ? "SUPPORTING_REFINEMENT" : withdrawn ? "READING_WITHDRAWN" : "STATE_CHANGE";
    const transparent = kind !== "READING_WITHDRAWN" || (m.after.direct[m.dimension]! < m.before.direct[m.dimension]! && LEVEL[m.after.levels[m.dimension]!] <= LEVEL[m.before.levels[m.dimension]!]);
    const raw = m.before.raw;
    transitions.push({
      caseId: m.caseId, questionId: m.questionId, dimension: m.dimension, directness: m.directness, change: `${m.from}→${m.to}`, kind, transparent,
      thinEvidence: m.before.confidence === "low" || m.after.confidence === "low",
      rawBefore: raw === null ? null : round2(raw), rawAfter: m.after.raw === null ? null : round2(m.after.raw), bandBefore, bandAfter,
      coverage: `${m.before.coverage}→${m.after.coverage}`, confidence: `${m.before.confidence}→${m.after.confidence}`,
      distanceToThreshold: raw === null ? null : round2(Math.min(Math.abs(raw - bands.developingFrom), Math.abs(raw - bands.solidFrom))),
    });
  }
  const byKind: Record<string, number> = {};
  for (const t of transitions) byKind[t.kind] = (byKind[t.kind] ?? 0) + 1;
  return { mutations: mutations.length, crossings: transitions.length, byKind, thinEvidence: transitions.filter((t) => t.thinEvidence).length, transitions };
}

/** §45 metamorphic relations over the mutation set (ordering and clarification relations are checked directly in the test). */
export function r8cMetamorphicViolationsV3(mutations: readonly R8cMutationV3[]): string[] {
  const v: string[] = [];
  const ladder = (s: string) => EVIDENCE_LADDER[s];
  for (const m of mutations) {
    const label = `${m.caseId}/${m.questionId} ${m.from}→${m.to}`;
    const fixed = m.before.keys === m.after.keys && m.before.scored.join() === m.after.scored.join();
    // Higher readings with fixed coverage never lower the index; lower readings never raise it.
    if (fixed && m.single && ladder(m.from) !== undefined && ladder(m.to) !== undefined && m.before.raw !== null && m.after.raw !== null) {
      const up = ladder(m.to)! > ladder(m.from)!;
      if (up ? m.after.raw < m.before.raw - 1e-9 : m.after.raw > m.before.raw + 1e-9) v.push(`${label}: index moved against the reading`);
    }
    // Unknown / not-applicable never fill zero: the answer contributes nothing and an area left without direct evidence leaves the index.
    if (m.to === "uncertainty" || m.to === "not_applicable") {
      if (m.mutatedEvidenceContribution !== undefined && m.mutatedEvidenceContribution !== null) v.push(`${label}: neutral answer contributes`);
      if (m.after.scores[m.dimension] === null && m.after.scored.includes(m.dimension)) v.push(`${label}: unread area kept in the index`);
      if (m.after.scores[m.dimension] === 0 && m.before.scores[m.dimension] !== 0) v.push(`${label}: neutral answer zero-filled`);
      // Less coverage with a comparable composition never raises overall confidence.
      const dropped = m.before.scored.filter((d) => !m.after.scored.includes(d));
      const remaining = m.after.scored;
      if (dropped.length === 1 && m.before.raw !== null && remaining.every((d) => m.before.scored.includes(d) && m.after.levels[d] === m.before.levels[d])
        && remaining.every((d) => LEVEL[m.before.levels[dropped[0]!]!] >= LEVEL[m.after.levels[d]!]) && LEVEL[m.after.confidence] > LEVEL[m.before.confidence]) v.push(`${label}: losing a comparable area raised confidence`);
    }
  }
  return v;
}

// ── R8-O6 witness and open decisions (§43) ───────────────────────────────────────────────────────────

/**
 * R8-O6 witness: route #24 of the exploratory clean-route campaign (seed 0x8c01) that surfaced the observation —
 * a complete route with no unknown or not-applicable direct answer whose context leaves 4 of 7 observable areas
 * without any direct question, so 3 clean readings cover 0.43 < 0.5 and the reading is low and provisional.
 * Regenerating the first 25 routes reproduces it exactly (the campaign draws sequentially from one seed).
 */
export function r8cContextLimitWitnessV3(): { readonly id: string; readonly answers: AnswersV2 } {
  return cleanRouteCampaignV3(25, 0x8c01)[24]!;
}

export type R8cOpenDecisionV3 = {
  readonly code: "R8-O3" | "R8-O4" | "R8-O6";
  readonly title: string;
  readonly status: "RETAINED_NO_ANCHOR" | "CALIBRATION_MODEL_DECISION_REQUIRED";
  readonly blocksR8Final: boolean;
  readonly requiresOwnCheckpointBeforeActivation: boolean;
  readonly disposition: string;
  readonly evidence: readonly string[];
};
export const R8C_OPEN_DECISIONS_V3: readonly R8cOpenDecisionV3[] = [
  {
    code: "R8-O3", title: "Supporting magnitude", status: "RETAINED_NO_ANCHOR", blocksR8Final: false, requiresOwnCheckpointBeforeActivation: false,
    disposition: "Weight and cap stay 0.5 (R8-B certified, no anchor for another magnitude). Supporting moves severity and, near a boundary, the band, but never selects an intervention or license. A new magnitude needs external evidence, not an architecture decision.",
    evidence: ["C24: 75 → 67, moderate improve, solution null, license null", "supporting-only band crossings in the single-answer mutations (C24, N06)", "2 direct established + 1 supporting partial = 70 (synthetic only)"],
  },
  {
    code: "R8-O4", title: "Sibling facet aggregation", status: "CALIBRATION_MODEL_DECISION_REQUIRED", blocksR8Final: false, requiresOwnCheckpointBeforeActivation: true,
    disposition: "The arithmetic mean stays (certified R3/R6 aggregation); worst-facet or weighted-facet models change what heterogeneous evidence means and need their own architecture checkpoint before public activation. R8-FINAL certifies the calibration under the mean.",
    evidence: ["A14 Foundation 50 (weak + established) → moderate, overall 70 REGULAR", "N01/N02 Trust 50 → moderate, overall 68.75 REGULAR", "an unknown on the weak facet withdraws it and the sibling decides (A14 70 → 75)"],
  },
  {
    code: "R8-O6", title: "Context-level observability in coverage", status: "CALIBRATION_MODEL_DECISION_REQUIRED", blocksR8Final: false, requiresOwnCheckpointBeforeActivation: true,
    disposition: "R6-B certifies a bank-level denominator (only areas with zero direct sources leave it). Areas whose direct questions are unreachable in a context still count, so complete routes read 0.5–0.86 of their observable areas, a clean 3-of-7 route is low and a fully corroborated 5-of-7 reading stays medium. No threshold fixes it without breaking §22 (OVERALL-CONF-H4) or §11 (INDEX-H2/H3); a per-context denominator must keep respondent gaps visible and needs its own checkpoint before activation.",
    evidence: ["R7 corpus: 138 of 150 unread observable areas have no direct question in the route", "witness route #24 (seed 0x8c01): 3/7 clean readings → low, provisional", "synthetic: 5/7 all high → medium"],
  },
];

// ── Holdout (never used for selection) and family breakdown (§36) ────────────────────────────────────

/** Clean interactive routes: one question per turn, any option except unknown (fresh seed, holdout only). */
export function cleanRouteCampaignV3(size = 150, seed = 0x8c0d): { id: string; answers: AnswersV2 }[] {
  const rng = mulberry32(seed);
  return Array.from({ length: size }, (_, i) => {
    const route = runPolicyRoute((q) => {
      const options = q.options.filter((o) => o.kind !== "unknown" && !(o.exclusive && q.type === "multi"));
      return answerValue(q, pick(rng, options.length > 0 ? options : q.options).value);
    });
    return { id: `route#${i}`, answers: route.finalAnswers };
  });
}
/** R8-C holdout: answer bags (seed 0x8c0c) and clean routes (seed 0x8c0d), both distinct from every earlier campaign. */
export function r8cHoldoutV3() {
  return { answerBags: holdoutCorpusV3(300, 0x8c0c), routes: cleanRouteCampaignV3() };
}

type ResolvedField = { readonly status?: string; readonly value?: unknown } | undefined;
const resolvedValue = (field: ResolvedField) => (field?.status === "resolved" ? String(field.value) : null);
/** Multi-label business family of one reading (§36): lifecycle, archetype components, buyer, entity, focus and answer quality. */
export function familyTagsV3(r: CandidateCommercialBoundaryV3): string[] {
  const tags: string[] = [];
  const ctx = r.context as unknown as { entity?: ResolvedField; archetype?: ResolvedField; archetypeComponents?: readonly string[]; customerModel?: { buyer?: ResolvedField }; primaryGoal?: ResolvedField; primaryFriction?: ResolvedField };
  if (r.narrative.lifecycle === "prelaunch") tags.push("prelaunch");
  for (const component of ctx.archetypeComponents ?? []) tags.push(component === "local_service" ? "service" : component);
  if (resolvedValue(ctx.archetype) === "hybrid") tags.push("hybrid");
  if (resolvedValue(ctx.customerModel?.buyer) === "b2b" && !tags.includes("b2b")) tags.push("b2b");
  if (resolvedValue(ctx.entity) === "organization") tags.push("organization");
  if (tags.length === 0) tags.push("unresolved-archetype");
  if (["organize", "automate"].includes(resolvedValue(ctx.primaryGoal) ?? "") || ["operations", "scale"].includes(resolvedValue(ctx.primaryFriction) ?? "")) tags.push("operations-heavy");
  const kinds = Object.entries(r.activeAnswers).flatMap(([id, value]) => (Array.isArray(value) ? value : [value]).map((x) => QUESTION_BY_ID.get(id)?.options.find((o) => o.value === x)?.kind));
  if (kinds.filter((k) => k === "unknown").length >= 3) tags.push("unknown-heavy");
  if (kinds.filter((k) => k === "not_applicable").length >= 2) tags.push("na-heavy");
  return tags;
}
export function familyBreakdownV3(results: readonly CandidateCommercialBoundaryV3[]) {
  const out: Record<string, { n: number; indexed: number; bands: Record<string, number>; confidence: Record<string, number>; topSeverity: Record<string, number>; licenses: Record<string, number> }> = {};
  const tally = (into: Record<string, number>, key: string) => { into[key] = (into[key] ?? 0) + 1; };
  for (const r of results) for (const tag of familyTagsV3(r)) {
    const row = out[tag] ??= { n: 0, indexed: 0, bands: {}, confidence: {}, topSeverity: {}, licenses: {} };
    row.n += 1; if (r.overall.index.rawScore !== null) row.indexed += 1;
    tally(row.bands, String(r.overall.publicLabel)); tally(row.confidence, r.overall.confidence.level);
    tally(row.topSeverity, String(r.priorities.priorities[0]?.severity ?? null)); tally(row.licenses, String(r.commercial.licenseFit.recommendedLicense));
  }
  return out;
}
