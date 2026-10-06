import type { EvidenceKind } from "./qbv2-coverage";

/** Estados y contribuciones existentes de 08C, compartidos sin recalibración. */
export const CAPABILITY_STATES = ["strong", "established", "partial", "weak", "missing", "dependency", "constraint", "uncertainty", "not_applicable"] as const;
export type CapabilityState = (typeof CAPABILITY_STATES)[number];

/** null nunca entra al numerador ni al denominador. No son pesos de directness. */
export const CAPABILITY_CONTRIBUTION: Readonly<Record<CapabilityState, number | null>> = {
  strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0,
  constraint: null, uncertainty: null, not_applicable: null,
};

export const STATE_KIND: Readonly<Record<CapabilityState, EvidenceKind>> = {
  strong: "established", established: "established", partial: "partial", weak: "partial", missing: "missing",
  dependency: "dependency", constraint: "constraint", uncertainty: "uncertainty", not_applicable: "not_applicable",
};
