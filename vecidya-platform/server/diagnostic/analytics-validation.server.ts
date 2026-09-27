import {
  ANALYTICS_SCHEMA_VERSION,
  ANSWER_KINDS,
  isAnalyticsEventType,
  isAnalyticsSectionId,
  isAnswerKind,
  MAX_ANALYTICS_EVENTS_PER_BATCH,
  MAX_ANALYTICS_STRING_LENGTH,
  type AnalyticsEventType,
  type AnswerKind,
} from "../../app/features/diagnostic/analytics";
import { isQuestionId } from "../../app/features/diagnostic/contracts";

/**
 * Validación deny-by-default del batch de telemetría (DIAG-V3-08 §27/§28): mismo espíritu que
 * `validateAnswersPayload` — un campo desconocido, un tipo equivocado o un valor fuera de rango
 * rechaza el evento COMPLETO, nunca lo acepta con un valor por defecto inventado. Rechaza cualquier
 * clave que no pertenezca al shape esperado (spec §27: "reject unknown fields"), lo que además cierra
 * la puerta a que `writeToken`/`answerValue`/cualquier payload arbitrario viaje dentro de un evento.
 */
const EVENT_FIELDS = ["eventUuid", "eventType", "questionId", "sectionId", "answerKind", "routeSignature", "questionsSeen", "questionsAnswered", "applicableQuestions"] as const;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX64_PATTERN = /^[0-9a-f]{64}$/;

export type ValidatedAnalyticsEvent = {
  eventUuid: string;
  eventType: AnalyticsEventType;
  questionId: string | null;
  sectionId: string | null;
  answerKind: AnswerKind | null;
  routeSignature: string | null;
  questionsSeen: number | null;
  questionsAnswered: number | null;
  applicableQuestions: number | null;
};

export type AnalyticsBatchValidationResult = { ok: true; events: ValidatedAnalyticsEvent[] } | { ok: false; error: string };

function isNonNegativeIntegerOrNull(value: unknown): value is number | null {
  return value === null || value === undefined || (typeof value === "number" && Number.isInteger(value) && value >= 0);
}

function validateOneEvent(candidate: unknown): ValidatedAnalyticsEvent | { error: string } {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) return { error: "event must be a plain object" };
  const record = candidate as Record<string, unknown>;

  const unknownKeys = Object.keys(record).filter((key) => !(EVENT_FIELDS as readonly string[]).includes(key));
  if (unknownKeys.length > 0) return { error: `event has unknown field(s): ${unknownKeys.join(", ")}` };

  if (typeof record.eventUuid !== "string" || !UUID_PATTERN.test(record.eventUuid)) return { error: "eventUuid must be a valid UUID" };
  if (!isAnalyticsEventType(record.eventType)) return { error: `unknown eventType: ${String(record.eventType)}` };

  const questionId = record.questionId ?? null;
  if (questionId !== null && !isQuestionId(questionId)) return { error: `unknown questionId: ${String(questionId)}` };

  const sectionId = record.sectionId ?? null;
  if (sectionId !== null && !isAnalyticsSectionId(sectionId)) return { error: `unknown sectionId: ${String(sectionId)}` };

  const answerKind = record.answerKind ?? null;
  if (answerKind !== null && !isAnswerKind(answerKind)) return { error: `answerKind must be one of ${ANSWER_KINDS.join(", ")}` };

  const routeSignature = record.routeSignature ?? null;
  if (routeSignature !== null) {
    if (typeof routeSignature !== "string" || routeSignature.length > MAX_ANALYTICS_STRING_LENGTH || !HEX64_PATTERN.test(routeSignature)) return { error: "routeSignature must be a 64-character hex digest" };
  }

  if (!isNonNegativeIntegerOrNull(record.questionsSeen)) return { error: "questionsSeen must be a non-negative integer or null" };
  if (!isNonNegativeIntegerOrNull(record.questionsAnswered)) return { error: "questionsAnswered must be a non-negative integer or null" };
  if (!isNonNegativeIntegerOrNull(record.applicableQuestions)) return { error: "applicableQuestions must be a non-negative integer or null" };

  return {
    eventUuid: record.eventUuid,
    eventType: record.eventType,
    questionId: questionId as string | null,
    sectionId: sectionId as string | null,
    answerKind: answerKind as AnswerKind | null,
    routeSignature: routeSignature as string | null,
    questionsSeen: (record.questionsSeen as number | null) ?? null,
    questionsAnswered: (record.questionsAnswered as number | null) ?? null,
    applicableQuestions: (record.applicableQuestions as number | null) ?? null,
  };
}

export function validateAnalyticsBatch(candidate: unknown): AnalyticsBatchValidationResult {
  if (typeof candidate !== "object" || candidate === null) return { ok: false, error: "body must be a plain object" };
  const body = candidate as Record<string, unknown>;

  if (body.analyticsSchemaVersion !== ANALYTICS_SCHEMA_VERSION) return { ok: false, error: `unsupported analyticsSchemaVersion: ${String(body.analyticsSchemaVersion)}` };
  if (!Array.isArray(body.events)) return { ok: false, error: "events must be an array" };
  if (body.events.length === 0) return { ok: false, error: "events must not be empty" };
  if (body.events.length > MAX_ANALYTICS_EVENTS_PER_BATCH) return { ok: false, error: `events exceeds the maximum batch size of ${MAX_ANALYTICS_EVENTS_PER_BATCH}` };

  const events: ValidatedAnalyticsEvent[] = [];
  for (const item of body.events) {
    const validated = validateOneEvent(item);
    if ("error" in validated) return { ok: false, error: validated.error };
    events.push(validated);
  }
  return { ok: true, events };
}
