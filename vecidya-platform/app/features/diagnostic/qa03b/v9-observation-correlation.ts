import type { ContextualEvidence } from "../qbv2-contextual-scoring";

/**
 * V9 candidate-only: never infer an event, construct or period from a question ID,
 * sector or answer. No caller in the public scoring pipeline uses this prototype.
 */
export type ConfirmedObservationCorrelationV1 = {
  readonly observationId: string;
  readonly questionId: string;
  readonly dimension: ContextualEvidence["dimension"];
  readonly eventKey: string;
  readonly constructKey: string;
  readonly periodKey: string;
  readonly provenance: "explicit_confirmation" | "verified_record";
};

export type CorrelatedObservationConflictV1 = {
  readonly correlationKey: string;
  readonly questionIds: readonly string[];
  readonly states: readonly string[];
};

export type CorrelatedObservationResultV1 = {
  /** Scorable only if all source evidence is mapped and conflicts is empty. */
  readonly accepted: readonly ContextualEvidence[];
  readonly deduplicated: readonly ContextualEvidence[];
  readonly unmapped: readonly ContextualEvidence[];
  readonly conflicts: readonly CorrelatedObservationConflictV1[];
  readonly scoreSafe: boolean;
};

function correlationKey(row: ConfirmedObservationCorrelationV1): string {
  // JSON tuple prevents concatenation ambiguity, including arbitrary user labels.
  return JSON.stringify([row.dimension, row.eventKey, row.constructKey, row.periodKey]);
}

function rank(e: ContextualEvidence): number {
  return e.directness === "direct" ? 0 : e.directness === "supporting" ? 1 : 2;
}

/**
 * Strict, fail-closed *audit* of explicitly correlated evidence.
 * If ANY evidence lacks a confirmed correlation or groups disagree, scoreSafe=false.
 * No automatic imputation; never collapse independent events just for sharing a dimension.
 */
export function correlateCandidateObservationsV1(
  evidence: readonly ContextualEvidence[],
  correlations: readonly ConfirmedObservationCorrelationV1[],
): CorrelatedObservationResultV1 {
  const byId = new Map<string, ConfirmedObservationCorrelationV1>();
  const duplicateAnnotations = new Set<string>();
  for (const item of correlations) {
    if (byId.has(item.observationId)) duplicateAnnotations.add(item.observationId);
    byId.set(item.observationId, item);
  }

  const groups = new Map<string, ContextualEvidence[]>();
  const unmapped: ContextualEvidence[] = [];
  for (const reading of evidence) {
    const row = byId.get(reading.observationId);
    if (!row || duplicateAnnotations.has(reading.observationId) ||
        row.questionId !== reading.questionId || row.dimension !== reading.dimension ||
        !row.eventKey.trim() || !row.constructKey.trim() || !row.periodKey.trim()) {
      unmapped.push(reading);
      continue;
    }
    const key = correlationKey(row);
    const existing = groups.get(key) ?? [];
    existing.push(reading);
    groups.set(key, existing);
  }

  const accepted: ContextualEvidence[] = [];
  const deduplicated: ContextualEvidence[] = [];
  const conflicts: CorrelatedObservationConflictV1[] = [];
  for (const [key, matches] of groups) {
    const states = [...new Set(matches.map((reading) => JSON.stringify([reading.state, reading.contribution])))];
    if (states.length > 1) {
      conflicts.push({
        correlationKey: key,
        questionIds: [...new Set(matches.map((reading) => reading.questionId))].sort(),
        states: [...new Set(matches.map((reading) => reading.state))].sort(),
      });
      continue;
    }
    const ranked = [...matches].sort((a, b) =>
      rank(a) - rank(b) || a.questionId.localeCompare(b.questionId) ||
      (a.questionVersion ?? 0) - (b.questionVersion ?? 0));
    accepted.push(ranked[0]!);
    deduplicated.push(...ranked.slice(1));
  }

  return {
    accepted,
    deduplicated,
    unmapped,
    conflicts,
    scoreSafe: unmapped.length === 0 && conflicts.length === 0,
  };
}
