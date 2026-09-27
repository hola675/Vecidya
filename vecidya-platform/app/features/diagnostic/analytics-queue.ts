import { MAX_ANALYTICS_EVENTS_PER_BATCH, type AnalyticsEventType, type AnswerKind } from "./analytics";
import type { QuestionId } from "./questions";
import type { SectionId } from "./types";

/**
 * Cola de eventos analíticos, cliente-side (DIAG-V3-08 §25/§30/§32/§62). Pura y sin `window`/`fetch`,
 * igual que `snapshot-policy.ts`: la decisión de CUÁNDO enviar (`shouldFlush`) está separada de CÓMO
 * enviar (eso vive en `sync.ts`/`diagnostic.tsx`). Nunca guarda respuestas crudas (spec §32): el shape
 * de entrada ya es el reducido de `AnalyticsEventInput`, sin ningún campo de valor de respuesta.
 */
export const ANALYTICS_QUEUE_FLUSH_SIZE = 20;
export const ANALYTICS_QUEUE_FLUSH_INTERVAL_MS = 10_000;
/** Tope de eventos pendientes en memoria (spec §65): degrada analítica antes que el producto — bajo
 * fallo sostenido del endpoint, se descartan los más antiguos en vez de crecer sin límite. */
export const ANALYTICS_QUEUE_MAX_PENDING = 200;

export type AnalyticsQueueEventInput = {
  eventType: AnalyticsEventType;
  questionId: QuestionId | null;
  sectionId: SectionId | null;
  answerKind: AnswerKind | null;
  routeSignature: string | null;
  questionsSeen: number | null;
  questionsAnswered: number | null;
  applicableQuestions: number | null;
};

export type AnalyticsQueueEvent = AnalyticsQueueEventInput & { eventUuid: string };

export class AnalyticsEventQueue {
  private pending: AnalyticsQueueEvent[] = [];
  private readonly generateId: () => string;

  constructor(options: { generateId?: () => string } = {}) {
    this.generateId = options.generateId ?? (() => crypto.randomUUID());
  }

  enqueue(input: AnalyticsQueueEventInput): void {
    this.pending.push({ ...input, eventUuid: this.generateId() });
    if (this.pending.length > ANALYTICS_QUEUE_MAX_PENDING) {
      this.pending.splice(0, this.pending.length - ANALYTICS_QUEUE_MAX_PENDING);
    }
  }

  shouldFlush(msSinceLastFlush: number): boolean {
    if (this.pending.length === 0) return false;
    if (this.pending.length >= ANALYTICS_QUEUE_FLUSH_SIZE) return true;
    return msSinceLastFlush >= ANALYTICS_QUEUE_FLUSH_INTERVAL_MS;
  }

  /** Extrae hasta `limit` eventos (por defecto el tamaño máximo de batch del endpoint) para enviarlos;
   * cualquier remanente queda en la cola para el siguiente flush. */
  drain(limit: number = MAX_ANALYTICS_EVENTS_PER_BATCH): AnalyticsQueueEvent[] {
    return this.pending.splice(0, limit);
  }

  /** Un flush fallido (red, 503) devuelve sus eventos al frente de la cola para reintentar, respetando
   * el mismo tope de `ANALYTICS_QUEUE_MAX_PENDING` (spec §30). */
  requeue(events: AnalyticsQueueEvent[]): void {
    this.pending.unshift(...events);
    if (this.pending.length > ANALYTICS_QUEUE_MAX_PENDING) {
      this.pending.length = ANALYTICS_QUEUE_MAX_PENDING;
    }
  }

  size(): number {
    return this.pending.length;
  }
}
