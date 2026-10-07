import type { ResolvedDomainContext } from "./context-resolver";
import type { DigitalDimensionId } from "./qbv2-dimensions";
import type { ContextualEvidence, DimensionApplicability, DimensionConfidence, DimensionExplainability } from "./qbv2-contextual-scoring";

/**
 * DIAG-V3-R6-A: the minimal structural contract both the legacy (`scoreContextualDimensions`) and
 * candidate (`scoreCandidateContextualDimensionsV3`) scorers already satisfy without a cast. Downstream
 * consumers (`deriveConstraintsAndPriorities`, `deriveSemanticFacts`) depend only on these fields, never
 * on which applicability-reason vocabulary or extra diagnostic context produced them.
 */
export type DiagnosticDimensionView = {
  readonly id: DigitalDimensionId;
  readonly applicability: DimensionApplicability;
  readonly score: number | null;
  readonly confidence: DimensionConfidence;
  readonly evidence: readonly ContextualEvidence[];
  readonly explainability: DimensionExplainability;
};

export type DiagnosticScoringView = {
  readonly context: Partial<ResolvedDomainContext>;
  readonly dimensions: readonly DiagnosticDimensionView[];
};
