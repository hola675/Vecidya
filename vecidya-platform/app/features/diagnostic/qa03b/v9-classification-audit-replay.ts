import {
  applyClassificationInteractionV9,
  replayClassificationInteractionsV9,
  QA03B_V9_CLASSIFICATION_INTERACTION_ID,
  type DiagnosticClassificationStateV9,
  type ClassificationInteractionEventV9,
} from "./v9-classification-bundle";
import { recoverDiagnosticStateV9 } from "./v9-audit-recovery";
import type { V9AuditDb } from "./v9-audit-repository";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDiagnosticClassificationStateV9(value: unknown): value is DiagnosticClassificationStateV9 {
  if (!isObject(value) || value.version !== 9 || !isObject(value.answers) ||
      !Array.isArray(value.events) || !Number.isSafeInteger(value.historicalInteractionCount) ||
      (value.historicalInteractionCount as number) < 0) return false;
  if (!Object.values(value.answers).every((answer) =>
    typeof answer === "string" || (Array.isArray(answer) && answer.every((v) => typeof v === "string")))) return false;
  if (value.historicalInteractionCount < value.events.length) return false;
  const events = value.events as unknown[];
  if (!events.every((event) => isObject(event) &&
    event.kind === QA03B_V9_CLASSIFICATION_INTERACTION_ID &&
    typeof event.sector === "string" &&
    event.sectorQuestionId === "q2_sector")) return false;
  const replayed = replayClassificationInteractionsV9({}, events as ClassificationInteractionEventV9[]);
  if (replayed === null) return false;
  const expected = Object.entries(replayed).sort(([a], [b]) => a.localeCompare(b));
  const actual = Object.entries(value.answers).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(expected) === JSON.stringify(actual);
}

/** Rebuilds the V9 classification state from the audit log, without V8 sessions. */
export async function recoverDiagnosticClassificationV9(
  db: V9AuditDb,
  workspaceId: string,
  runId: string,
): Promise<{ state: DiagnosticClassificationStateV9; lastSeq: number }> {
  return recoverDiagnosticStateV9(db, {
    workspaceId,
    runId,
    initialState: { version: 9, answers: {}, events: [], historicalInteractionCount: 0 },
    validateSnapshot: isDiagnosticClassificationStateV9,
    applyEvent(state, event) {
      if (event.kind !== QA03B_V9_CLASSIFICATION_INTERACTION_ID ||
          !isObject(event.payload) || typeof event.payload.sector !== "string" ||
          (event.payload.niche !== undefined && typeof event.payload.niche !== "string")) {
        throw new Error("v9_recovery_unsupported_event");
      }
      const selection = {
        sector: event.payload.sector,
        ...(typeof event.payload.niche === "string" ? { niche: event.payload.niche } : {}),
      };
      const result = applyClassificationInteractionV9(state.answers, selection);
      if (!result.ok) throw new Error("v9_recovery_invalid_classification");
      return {
        version: 9,
        answers: result.answers,
        events: [...state.events, result.event] as ClassificationInteractionEventV9[],
        historicalInteractionCount: state.historicalInteractionCount + 1,
      };
    },
  });
}
