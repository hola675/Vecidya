import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { CANONICAL_CASE_IDENTITY_V3, runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { buildCandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_CALIBRATION_V3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import type { DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";

/**
 * DIAG-V3-R7-FINAL → R8 handoff. Test-only and OBSERVATIONAL — FOR R8, NOT FROZEN: a deterministic record of
 * the current numeric reading of the 25 canonical routes so R8 calibration starts from a reproducible
 * baseline. It is data, never a correctness snapshot — no test compares these values, and R8 may legitimately
 * change every number here without breaking any R7 gate.
 */
export const R8_HANDOFF_LABEL_V3 = "OBSERVATIONAL — FOR R8, NOT FROZEN" as const;

/**
 * The five calibration observations recorded by R7-B (reproducible mutation pairs: `R7B_R8_MANIFEST`), with the
 * question R8-B/C must answer for each (R8-A records questions, never answers).
 */
export const R8_OBSERVATIONS_V3 = [
  { id: 1, code: "R8-O1", title: "Candidate evidence ceiling", observation: "No V3 option maps to `strong`, so every dimension and the overall index currently top out at 75.", examples: ["A03", "A07", "A08"], question: "Should `established` represent full demonstrated capability in candidate V3 when no `strong` state is reachable?" },
  { id: 2, code: "R8-O2", title: "Dimension/overall confidence", observation: "Overall confidence can stay `low` despite several established direct sources.", examples: ["A06", "A07", "A10"], question: "How much direct evidence is enough for medium/high confidence, given the adaptive route intentionally asks few high-value questions?" },
  { id: 3, code: "R8-O3", title: "Supporting drag", observation: "A supporting `partial` lowers Readiness 75 → 67 and changes its reading to `partial`.", examples: ["C24"], question: "Should supporting evidence lower a strong direct base, and by how much?" },
  { id: 4, code: "R8-O4", title: "Sibling cancellation", observation: "Opposing sibling direct sources average near 50 (`partial`).", examples: ["A14", "N01", "N02"], question: "How should heterogeneous direct facets combine: arithmetic mean, worst-facet bias or a weighted facet model?" },
  { id: 5, code: "R8-O5", title: "Band sensitivity", observation: "A single source can move the band REGULAR ↔ BIEN.", examples: ["A07", "A08"], question: "Where should the public band boundaries sit given the empirical canonical distribution?" },
] as const;

export type R8HandoffDimensionV3 = {
  readonly dimension: DigitalDimensionId;
  readonly applicability: string;
  readonly score: number | null;
  readonly confidence: string;
  readonly directSources: number;
  readonly supportingSources: number;
  readonly priorityPosition: number | null;
};
export type R8HandoffCaseV3 = {
  readonly caseId: string;
  readonly overallRawScore: number | null;
  readonly coverage: number;
  readonly overallConfidence: string;
  readonly band: "MAL" | "REGULAR" | "BIEN" | null;
  readonly license: string | null;
  readonly dimensions: readonly R8HandoffDimensionV3[];
};

export function buildR8HandoffV3(): {
  readonly label: typeof R8_HANDOFF_LABEL_V3; readonly identity: typeof CANONICAL_CASE_IDENTITY_V3;
  readonly calibration: { readonly identity: string; readonly version: number };
  readonly observations: typeof R8_OBSERVATIONS_V3; readonly cases: readonly R8HandoffCaseV3[];
} {
  const cases = CANONICAL_CASES_V3.map((caseDef): R8HandoffCaseV3 => {
    const result = buildCandidateCommercialBoundaryV3({ answers: runCanonicalRouteV3(caseDef).finalAnswers });
    return {
      caseId: caseDef.id,
      overallRawScore: result.overall.index.rawScore,
      coverage: result.overall.index.coverage,
      overallConfidence: result.overall.confidence.level,
      band: result.overall.publicLabel,
      license: result.commercial.licenseFit.recommendedLicense,
      dimensions: result.scoring.dimensions.map((d) => ({
        dimension: d.id,
        applicability: d.applicability,
        score: d.score,
        confidence: d.confidence.level,
        directSources: d.evidence.filter((e) => e.directness === "direct").length,
        supportingSources: d.evidence.filter((e) => e.directness === "supporting").length,
        priorityPosition: result.narrative.priorities.find((p) => p.dimension === d.id)?.rank ?? null,
      })),
    };
  });
  // R8-A: the rows are produced under (and labelled with) the candidate calibration identity.
  const calibration = { identity: CANDIDATE_CALIBRATION_V3.identity, version: CANDIDATE_CALIBRATION_V3.version };
  return { label: R8_HANDOFF_LABEL_V3, identity: CANONICAL_CASE_IDENTITY_V3, calibration, observations: R8_OBSERVATIONS_V3, cases };
}
