import type {
  V9ContextualEvidence,
  V9DigitalDimensionId,
} from "./scoring-contract";

export type V9ConfirmedObservationCorrelation = {
  readonly observationId: string;
  readonly questionId: string;
  readonly dimension: V9DigitalDimensionId;
  readonly eventKey: string;
  readonly constructKey: string;
  readonly periodKey: string;
  readonly provenance: "explicit_confirmation" | "verified_record";
};

export type V9CorrelatedObservationConflict = {
  readonly correlationKey: string;
  readonly questionIds: readonly string[];
  readonly states: readonly string[];
};

export type V9CorrelatedObservationResult = {
  readonly accepted: readonly V9ContextualEvidence[];
  readonly deduplicated: readonly V9ContextualEvidence[];
  readonly unmapped: readonly V9ContextualEvidence[];
  readonly conflicts: readonly V9CorrelatedObservationConflict[];
  readonly scoreSafe: boolean;
};

const annotationKey = (observationId: string, dimension: V9DigitalDimensionId) =>
  JSON.stringify([observationId, dimension]);

const correlationKey = (row: V9ConfirmedObservationCorrelation) =>
  JSON.stringify([row.dimension, row.eventKey, row.constructKey, row.periodKey]);

const rank = (evidence: V9ContextualEvidence) =>
  evidence.directness === "direct" ? 0 : evidence.directness === "supporting" ? 1 : 2;

export function correlateV9Observations(
  evidence: readonly V9ContextualEvidence[],
  correlations: readonly V9ConfirmedObservationCorrelation[],
): V9CorrelatedObservationResult {
  const byId = new Map<string, V9ConfirmedObservationCorrelation>();
  const duplicateAnnotations = new Set<string>();
  for (const item of correlations) {
    const key = annotationKey(item.observationId, item.dimension);
    if (byId.has(key)) duplicateAnnotations.add(key);
    byId.set(key, item);
  }

  const groups = new Map<string, V9ContextualEvidence[]>();
  const unmapped: V9ContextualEvidence[] = [];
  for (const reading of evidence) {
    const sourceId = annotationKey(reading.observationId, reading.dimension);
    const row = byId.get(sourceId);
    if (
      !row ||
      duplicateAnnotations.has(sourceId) ||
      row.questionId !== reading.questionId ||
      row.dimension !== reading.dimension ||
      !row.eventKey.trim() ||
      !row.constructKey.trim() ||
      !row.periodKey.trim()
    ) {
      unmapped.push(reading);
      continue;
    }
    const key = correlationKey(row);
    groups.set(key, [...(groups.get(key) ?? []), reading]);
  }

  const accepted: V9ContextualEvidence[] = [];
  const deduplicated: V9ContextualEvidence[] = [];
  const conflicts: V9CorrelatedObservationConflict[] = [];
  for (const [key, matches] of groups) {
    const states = [...new Set(matches.map((reading) =>
      JSON.stringify([reading.state, reading.contribution])))];
    if (states.length > 1) {
      conflicts.push({
        correlationKey: key,
        questionIds: [...new Set(matches.map((reading) => reading.questionId))].sort(),
        states: [...new Set(matches.map((reading) => reading.state))].sort(),
      });
      continue;
    }
    const ranked = [...matches].sort((a, b) =>
      rank(a) - rank(b) ||
      a.questionId.localeCompare(b.questionId) ||
      a.questionVersion - b.questionVersion);
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
