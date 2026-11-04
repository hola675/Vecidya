import {
  parseCandidateSessionV9Prototype,
  type CandidateSessionV9Prototype,
} from "../../diagnostic/qa03b/v9-session-prototype";

export const DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION = 1 as const;
export const DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_KEY = "vecidya.diagnostic.v9.local-draft.1";

export type DiagnosticV9LocalDraftEnvelope = {
  readonly storageVersion: typeof DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION;
  readonly session: CandidateSessionV9Prototype;
};

export type DiagnosticV9LocalDraftReadResult =
  | { readonly status: "found"; readonly envelope: DiagnosticV9LocalDraftEnvelope }
  | { readonly status: "empty" }
  | { readonly status: "expired" }
  | { readonly status: "invalid" }
  | { readonly status: "unavailable" };

export function buildDiagnosticV9LocalDraftEnvelope(
  session: CandidateSessionV9Prototype,
): DiagnosticV9LocalDraftEnvelope | null {
  if (session.status !== "in_progress" && session.status !== "completing") return null;
  return { storageVersion: DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION, session };
}

export function parseDiagnosticV9LocalDraft(
  raw: string,
  now: number,
): DiagnosticV9LocalDraftReadResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { status: "invalid" };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { status: "invalid" };
  const record = value as Record<string, unknown>;
  if (record.storageVersion !== DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION ||
    !record.session || typeof record.session !== "object" || Array.isArray(record.session)) {
    return { status: "invalid" };
  }
  const rawSession = record.session as Record<string, unknown>;
  if (!Number.isSafeInteger(rawSession.updatedAt) || !Number.isSafeInteger(rawSession.revision) ||
    (rawSession.revision as number) < 0 || !Number.isSafeInteger(now)) {
    return { status: "invalid" };
  }
  const session = parseCandidateSessionV9Prototype(JSON.stringify(record.session));
  if (!session || (session.status !== "in_progress" && session.status !== "completing")) {
    return { status: "invalid" };
  }
  if (now - session.updatedAt > DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS) return { status: "expired" };
  return { status: "found", envelope: { storageVersion: DIAGNOSTIC_V9_LOCAL_DRAFT_STORAGE_VERSION, session } };
}
