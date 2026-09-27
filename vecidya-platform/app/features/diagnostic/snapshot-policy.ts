/**
 * Presupuesto de escritura a KV (DIAG-V3-06 §16): el navegador guarda cada respuesta localmente sin
 * red; la red solo se usa para snapshots espaciados. Esta decisión es pura y determinista para poder
 * probarla sin temporizadores reales: la orquestación con `setTimeout` vive en la UI que la llama.
 *
 * Para una sesión típica de 10–16 preguntas, el presupuesto esperado es de aproximadamente 2–4
 * escrituras de red antes de completar (cada ~5 respuestas o al cruzar de sección), más 1 al
 * finalizar: nunca una escritura por clic.
 */

export const SNAPSHOT_ANSWER_INTERVAL = 5;
/** Nunca se escribe más de una vez por segundo a la misma key (spec §16). */
export const SNAPSHOT_MIN_INTERVAL_MS = 1000;

export type SnapshotDecisionInput = {
  /** Respuestas nuevas o cambiadas desde el último snapshot enviado. */
  answeredSinceLastSnapshot: number;
  /** Tiempo transcurrido desde el último snapshot enviado con éxito. */
  msSinceLastSnapshot: number;
  /** `true` si la respuesta que disparó la evaluación cruza a una sección nueva. */
  crossedSectionBoundary: boolean;
  /** `true` cuando se llama justo antes de completar: siempre fuerza el flush (spec §16). */
  isBeforeCompletion: boolean;
};

/**
 * Decide si corresponde enviar un snapshot ahora. El límite de 1/segundo es la única condición que
 * puede bloquear incluso un flush de finalización que llegara de inmediato después de otro snapshot;
 * en la práctica esto no ocurre porque completar espera a la última pregunta respondida.
 */
export function shouldFlushSnapshot(input: SnapshotDecisionInput): boolean {
  if (input.msSinceLastSnapshot < SNAPSHOT_MIN_INTERVAL_MS) return false;
  if (input.isBeforeCompletion) return true;
  if (input.crossedSectionBoundary) return true;
  return input.answeredSinceLastSnapshot >= SNAPSHOT_ANSWER_INTERVAL;
}

/** Escrituras de red esperadas (redondeadas) para una sesión de `answeredQuestions` respuestas, sin contar la de finalización. */
export function estimatedSnapshotWrites(answeredQuestions: number): number {
  return Math.floor(answeredQuestions / SNAPSHOT_ANSWER_INTERVAL);
}
