import { REPORT_VERSION, buildDiagnosticReport } from "../../components/diagnostic-report/report-model";
import {
  CURRENT_QUESTION_BANK_VERSION,
  CURRENT_ROUTING_VERSION,
  CURRENT_SCORING_VERSION,
  CURRENT_RESULT_SCHEMA_VERSION,
} from "./contracts";
import { METHODOLOGY_VERSION } from "./diagnostic-contract-versions";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import { ROUTE_HARD_CAP } from "./qbv2-planner";
import type { PublicDiagnosticEngineIdentityV1 } from "./public-diagnostic-engine-identity";
import { hasPublicDiagnosticEngineIdentityV1 } from "./public-diagnostic-engine-identity";
import {
  completeSessionV3,
  createSessionV3,
  currentQuestionIdV3,
  submitAnswerV3,
  type AnswerValueV3,
  type DiagnosticResultV3,
} from "./qbv2-session";

export const PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 = {
  version: 1,
  engine: "diag-v3-public",
  engineRevision: 1,
  questionBank: "QUESTION_BANK_V2",
  questionBankVersion: CURRENT_QUESTION_BANK_VERSION,
  routingVersion: CURRENT_ROUTING_VERSION,
  scoringVersion: CURRENT_SCORING_VERSION,
  resultSchemaVersion: CURRENT_RESULT_SCHEMA_VERSION,
  sessionSchemaVersion: 2,
  methodologyVersion: METHODOLOGY_VERSION,
  reportVersion: REPORT_VERSION,
} as const;

export function isCurrentPublicDiagnosticEngineIdentityV1(value: unknown): value is PublicDiagnosticEngineIdentityV1 {
  if (!hasPublicDiagnosticEngineIdentityV1(value)) return false;
  const expected = PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1;
  return Object.keys(expected).every((key) => value[key as keyof typeof expected] === expected[key as keyof typeof expected]);
}

export type PublicDiagnosticAnswer = { readonly questionId: string; readonly value: unknown };

export type PublicDiagnosticReplay =
  | { readonly ok: true; readonly result: DiagnosticResultV3; readonly answers: Readonly<Record<string, AnswerValueV3>> }
  | { readonly ok: false; readonly reason: "shape" | "duplicate" | "question" | "order" | "answer" | "incomplete" | "completion" };

export function replayPublicDiagnosticV3(value: unknown, now = Date.now()): PublicDiagnosticReplay {
  if (!Array.isArray(value) || value.length === 0 || value.length > ROUTE_HARD_CAP) return { ok: false, reason: "shape" };
  const entries: PublicDiagnosticAnswer[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return { ok: false, reason: "shape" };
    const entry = item as Record<string, unknown>;
    if (Object.keys(entry).length !== 2 || !Object.hasOwn(entry, "questionId") || !Object.hasOwn(entry, "value") || typeof entry.questionId !== "string") return { ok: false, reason: "shape" };
    if (seen.has(entry.questionId)) return { ok: false, reason: "duplicate" };
    if (!QUESTION_BANK_V2.some((question) => question.id === entry.questionId)) return { ok: false, reason: "question" };
    seen.add(entry.questionId);
    entries.push({ questionId: entry.questionId, value: entry.value });
  }

  let session = createSessionV3({ sessionId: "server-replay", now });
  for (const entry of entries) {
    const currentQuestionId = currentQuestionIdV3(session);
    if (currentQuestionId !== entry.questionId) return { ok: false, reason: "order" };
    const submitted = submitAnswerV3(session, currentQuestionId, entry.value as AnswerValueV3, now);
    if (!submitted.ok) return { ok: false, reason: "answer" };
    session = submitted.session;
  }
  if (session.status !== "completing" || session.reviewIndex !== null || session.queue.length !== 0) return { ok: false, reason: "incomplete" };
  const completed = completeSessionV3(session, now);
  if (!completed.ok) return { ok: false, reason: "completion" };
  return { ok: true, result: completed.result, answers: completed.session.answers };
}

export function buildPublicDiagnosticReport(result: DiagnosticResultV3, businessName: string | null, generatedAt: Date) {
  return buildDiagnosticReport({ narrative: result.narrative, outcome: result.outcome, businessName, generatedAt });
}
