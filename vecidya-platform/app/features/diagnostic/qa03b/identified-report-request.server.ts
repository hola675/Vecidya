import { isAnonymousDiagnosticSummaryV2, type AnonymousDiagnosticSummaryV2 } from "./qbv2-candidate-funnel";
import { CANDIDATE_RESULT_IDENTITY_V3, isCandidateResultIdentityV3 } from "./qbv2-candidate-pipeline";
import { ANSWER_SCHEMA_ID, QUESTION_BANK_ID, SESSION_KEY, SESSION_SCHEMA, WORKER_REPLAY_VERSION } from "./contract";
import { validateReportDetails, type ValidatedReportDetails } from "../identified-report-contracts";

export type Qa03bDiagnosticReportRequest = {
  readonly replayVersion: typeof WORKER_REPLAY_VERSION;
  readonly engineIdentity: typeof CANDIDATE_RESULT_IDENTITY_V3;
  readonly answerSchema: typeof ANSWER_SCHEMA_ID;
  readonly questionBank: typeof QUESTION_BANK_ID;
  readonly sessionSchema: typeof SESSION_SCHEMA;
  readonly sessionKey: typeof SESSION_KEY;
  readonly session: unknown;
  readonly anonymousSummary: AnonymousDiagnosticSummaryV2;
} & ValidatedReportDetails;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const hasExactKeys = (value: Record<string, unknown>, expected: readonly string[]) => Object.keys(value).length === expected.length && expected.every((key) => Object.hasOwn(value, key));

export function validateQa03bDiagnosticReportRequest(value: unknown): Qa03bDiagnosticReportRequest | null {
  if (!isRecord(value) || !hasExactKeys(value, [
    "replayVersion", "engineIdentity", "answerSchema", "questionBank", "sessionSchema", "sessionKey", "session", "anonymousSummary",
    "fullName", "businessName", "email", "phone", "serviceNoticeVersion", "serviceNoticeAcknowledged", "commercialContactOptIn",
    "commercialNoticeVersion", "researchParticipationOptIn", "researchNoticeVersion",
  ])) return null;
  if (value.replayVersion !== WORKER_REPLAY_VERSION || !isCandidateResultIdentityV3(value.engineIdentity)) return null;
  if (value.answerSchema !== ANSWER_SCHEMA_ID || value.questionBank !== QUESTION_BANK_ID || value.sessionSchema !== SESSION_SCHEMA || value.sessionKey !== SESSION_KEY) return null;
  if (!isRecord(value.session) || !isAnonymousDiagnosticSummaryV2(value.anonymousSummary)) return null;
  if (!isCandidateResultIdentityV3(value.anonymousSummary.diagnosticIdentity)) return null;
  const details = validateReportDetails(value);
  if (!details || details.phone !== null) return null;
  return {
    replayVersion: WORKER_REPLAY_VERSION,
    engineIdentity: CANDIDATE_RESULT_IDENTITY_V3,
    answerSchema: ANSWER_SCHEMA_ID,
    questionBank: QUESTION_BANK_ID,
    sessionSchema: SESSION_SCHEMA,
    sessionKey: SESSION_KEY,
    session: value.session,
    anonymousSummary: value.anonymousSummary,
    ...details,
  };
}
