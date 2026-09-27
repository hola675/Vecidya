import { count, eq, lt } from "drizzle-orm";

import { ANALYTICS_EVENT_RETENTION_DAYS, ANALYTICS_SCHEMA_VERSION, type AnalyticsEventType, type AnswerKind } from "../../app/features/diagnostic/analytics";
import { ONE_DAY_MS } from "../../app/features/diagnostic/contracts";
import type { Database } from "../client.server";
import { diagnosticEvent } from "../schema";

/**
 * Capa de escritura de telemetría (DIAG-V3-08 §8/§9/§49). Sin escritura del `writeToken` en ningún
 * punto (spec §31): esta función solo acepta el shape ya reducido de `AnalyticsEventRecord`, que no
 * tiene ese campo — no hay forma de colarlo por accidente. Idempotente por `event_uuid`
 * (`onConflictDoNothing`): un batch reintentado no duplica filas ni lanza (spec §9/§59/§60).
 */
export type AnalyticsEventRecord = {
  eventUuid: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  questionId: string | null;
  sectionId: string | null;
  answerKind: AnswerKind | null;
  routeSignature: string | null;
  questionsSeen: number | null;
  questionsAnswered: number | null;
  applicableQuestions: number | null;
};

export async function insertAnalyticsEventBatch(database: Database, events: AnalyticsEventRecord[], now: Date = new Date()): Promise<{ inserted: number }> {
  if (events.length === 0) return { inserted: 0 };
  const retentionUntil = new Date(now.getTime() + ANALYTICS_EVENT_RETENTION_DAYS * ONE_DAY_MS);

  const statements = events.map((event) =>
    database
      .insert(diagnosticEvent)
      .values({
        eventUuid: event.eventUuid,
        sessionId: event.sessionId,
        analyticsSchemaVersion: ANALYTICS_SCHEMA_VERSION,
        eventType: event.eventType,
        questionId: event.questionId,
        sectionId: event.sectionId,
        answerKind: event.answerKind,
        routeSignature: event.routeSignature,
        questionsSeen: event.questionsSeen,
        questionsAnswered: event.questionsAnswered,
        applicableQuestions: event.applicableQuestions,
        receivedAt: now,
        retentionUntil,
      })
      .onConflictDoNothing({ target: diagnosticEvent.eventUuid }),
  );

  const results = await database.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);
  return { inserted: results.reduce((total, result) => total + result.meta.changes, 0) };
}

export async function countAnalyticsEventsForSession(database: Database, sessionId: string): Promise<number> {
  const [row] = await database.select({ value: count() }).from(diagnosticEvent).where(eq(diagnosticEvent.sessionId, sessionId));
  return row?.value ?? 0;
}

/** Spec §50: función segura y testeada, sin scheduler todavía. Nunca se ejecuta contra D1 remoto aquí. */
export async function purgeExpiredAnalyticsEvents(database: Database, now: Date = new Date()): Promise<{ deleted: number }> {
  const result = await database.delete(diagnosticEvent).where(lt(diagnosticEvent.retentionUntil, now));
  return { deleted: result.meta.changes };
}
