export const V9_DIGITAL_DIMENSIONS = Object.freeze([
  { id: "clarity_positioning", label: "Clarity & Positioning" },
  { id: "digital_foundation", label: "Digital Foundation" },
  { id: "discovery", label: "Discovery" },
  { id: "trust_reputation", label: "Trust & Reputation" },
  { id: "conversion_access", label: "Conversion & Access" },
  { id: "relationship_recurrence", label: "Relationship & Recurrence" },
  { id: "measurement_optimization", label: "Measurement & Optimization" },
  { id: "digital_readiness", label: "Digital Readiness" },
] as const);

export type V9DigitalDimensionId = (typeof V9_DIGITAL_DIMENSIONS)[number]["id"];
export type V9EvidenceDirectness = "direct" | "supporting" | "contextual";
export type V9CapabilityState =
  | "strong"
  | "established"
  | "partial"
  | "weak"
  | "missing"
  | "dependency"
  | "constraint"
  | "uncertainty"
  | "not_applicable";
export type V9MigratedAnswerState = V9CapabilityState | "context_only";
export type V9EvidenceKind =
  | "established"
  | "missing"
  | "partial"
  | "dependency"
  | "constraint"
  | "uncertainty"
  | "not_applicable";

export type V9ContextualEvidence = {
  readonly questionId: string;
  readonly questionVersion: number;
  readonly migrationIdentity: string;
  readonly dimension: V9DigitalDimensionId;
  readonly observationId: string;
  readonly directness: V9EvidenceDirectness;
  readonly state: V9CapabilityState;
  readonly kind: V9EvidenceKind;
  readonly contribution: number | null;
  readonly answer: readonly string[];
};

export type V9DimensionApplicability =
  | "applicable"
  | "not_applicable"
  | "insufficient_context";

export type V9DimensionApplicabilityReason =
  | "observed_dimension_evidence"
  | "defined_activity"
  | "public_capability_context"
  | "audience_context"
  | "action_context"
  | "current_interaction_context"
  | "paused_offer_suspended"
  | "preparing_no_interaction"
  | "no_historical_recurrence"
  | "declared_no_digital_demand"
  | "context_unresolved";

export type V9ContextualConfidenceLevel = "high" | "medium" | "low";
export type V9ScoreBasis = "direct" | "direct_and_supporting" | "supporting_only" | "none";
export type V9ConfidencePenalty = "direct_contradiction" | "uncertain_answers";
export type V9EvidenceGap = "no_evidence" | "no_direct_evidence" | "single_direct_observation";

export type V9DimensionConfidence = {
  readonly level: V9ContextualConfidenceLevel;
  readonly direct: number;
  readonly supporting: number;
  readonly contextual: number;
  readonly uncertain: number;
  readonly independent: number;
  readonly strength: number;
  readonly contradictory: boolean;
  readonly penalties: readonly V9ConfidencePenalty[];
};

export type V9DimensionExplainability = {
  readonly basis: V9ScoreBasis;
  readonly direct: readonly string[];
  readonly supporting: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly missing: readonly string[];
  readonly dependencies: readonly string[];
  readonly constraints: readonly string[];
  readonly uncertainty: readonly string[];
  readonly contradictions: readonly { readonly positive: string; readonly negative: string }[];
  readonly gaps: readonly V9EvidenceGap[];
};

export type V9ContextualDimensionResult = {
  readonly id: V9DigitalDimensionId;
  readonly label: string;
  readonly applicability: V9DimensionApplicability;
  readonly applicabilityReason: V9DimensionApplicabilityReason;
  readonly applicabilityContext: readonly string[];
  readonly score: number | null;
  readonly confidence: V9DimensionConfidence;
  readonly evidence: readonly V9ContextualEvidence[];
  readonly explainability: V9DimensionExplainability;
};

export type V9DimensionScoringModel = {
  readonly directWeight: number;
  readonly supportingWeight: number;
  readonly supportingCapRatio: number;
};

export type V9DimensionConfidenceModel = {
  readonly supportingWeight: number;
  readonly mediumAt: number;
  readonly highAt: number;
};

export type V9OverallIndexModel = {
  readonly minScoredDimensions: number;
  readonly minCoverage: number;
  readonly coverageBasis?: "observable_dimensions" | "applicable_dimensions";
  readonly bands: {
    readonly developingFrom: number;
    readonly solidFrom: number;
    readonly verySolidFrom?: number;
  };
  readonly confidence: {
    readonly mediumCoverage: number;
    readonly highCoverage: number;
    readonly share: number;
  };
};

export type V9Calibration = {
  readonly identity:
    | "diag-v3-candidate-calibration-v1"
    | "diag-v3-candidate-calibration-v2"
    | "diag-v3-candidate-calibration-v3"
    | "diag-v3-candidate-calibration-v4";
  readonly version: 1 | 2 | 3 | 4;
  readonly capabilityContribution: Readonly<Record<V9CapabilityState, number | null>>;
  readonly scoring: V9DimensionScoringModel;
  readonly dimensionConfidence: V9DimensionConfidenceModel;
  readonly severity: { readonly materialBelow: number; readonly moderateBelow: number };
  readonly overall: V9OverallIndexModel;
  readonly scoreRanges?: readonly {
    readonly id: "initial" | "developing" | "functional" | "strong";
    readonly label: string;
    readonly minimum: number;
    readonly maximum: number;
  }[];
};

export type V9ResolvedValue = {
  readonly status: "resolved";
  readonly value: string;
} | {
  readonly status: "unresolved";
};

export type V9ScoringContext = {
  readonly contractIdentity: string;
  readonly operationalStatus: V9ResolvedValue;
  readonly businessModel: V9ResolvedValue;
  readonly nicheGroup: V9ResolvedValue;
  readonly customerModel: {
    readonly buyer: V9ResolvedValue;
    readonly reach: V9ResolvedValue;
  };
  readonly buyerDisposition: string | null;
  readonly hasEverHadRealPeople: boolean | null;
  readonly delivery: {
    readonly serviceSetting: readonly unknown[];
    readonly appointmentMode?: unknown;
    readonly purchaseChannel: readonly unknown[];
    readonly onsiteConsumption?: unknown;
  };
  readonly discoveryReachReliability: V9ResolvedValue;
};
