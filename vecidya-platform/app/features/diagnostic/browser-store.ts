import { CURRENT_PERSISTED_VERSIONS, isCurrentPersistedVersions } from "./contracts";
import { hasSnapshotShape, validateAnswersPayload, type DiagnosticSessionSnapshot } from "./persistence";
import type { Answers } from "./types";

/**
 * `DiagnosticBrowserStore` (DIAG-V3-06 §10): capa de almacenamiento versionada. Ningún componente
 * llama a `localStorage` directamente; todos pasan por aquí. Guarda el snapshot de sesión más el
 * `writeToken` (que nunca sale del navegador salvo en las llamadas de snapshot/completion) y un
 * indicador de si la sesión de servidor ya se completó, para que el mismo navegador nunca reintente
 * una escritura ordinaria sobre una sesión cerrada.
 */

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

/**
 * La propia clave incluye una versión de formato: un cambio incompatible en la forma del registro
 * (no en las versiones del motor, que ya validan por contenido) usa una clave nueva en vez de migrar
 * un registro viejo en silencio.
 */
const STORAGE_KEY = "vecidya.diagnostic.session.v1";

export type DiagnosticBrowserRecord = DiagnosticSessionSnapshot & {
  /** `null` antes de que exista sesión de servidor, o si D1 no pudo crearla (modo solo-navegador, spec §38). */
  writeToken: string | null;
  /** Refleja si la finalización en servidor ya se confirmó, sin llegar a borrar el snapshot local. */
  serverCompleted: boolean;
};

function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export class DiagnosticBrowserStore {
  #storage: StorageLike | null;

  constructor(storage?: StorageLike | null) {
    this.#storage = storage ?? (typeof window === "undefined" ? null : window.localStorage);
  }

  /**
   * Lee y valida el snapshot local. Devuelve `null` si no hay nada, si el JSON está corrupto, si la
   * forma no coincide, o si las versiones no son EXACTAMENTE las vigentes (spec §12: sin casts, sin
   * carga silenciosa de un snapshot de otra versión). Las respuestas se re-validan contra el registro
   * de preguntas vigente por la misma razón: un registro corrupto no debe llegar al motor.
   */
  read(): DiagnosticBrowserRecord | null {
    if (!this.#storage) return null;
    const raw = safeCall(() => this.#storage!.getItem(STORAGE_KEY), null);
    if (!raw) return null;

    const parsed = safeCall<unknown>(() => JSON.parse(raw), null);
    if (!hasSnapshotShape(parsed)) return null;
    if (!isCurrentPersistedVersions(parsed.versions)) return null;
    const extra = parsed as unknown as { writeToken: unknown; serverCompleted: unknown };
    if (typeof extra.writeToken !== "string" && extra.writeToken !== null) return null;
    if (typeof extra.serverCompleted !== "boolean") return null;

    const answers = validateAnswersPayload(parsed.answers);
    if (!answers.ok) return null;

    return { ...(parsed as DiagnosticBrowserRecord), answers: answers.answers };
  }

  /** `true` cuando existe un snapshot restaurable en el mismo navegador (spec §11): versión compatible, sin completar. */
  canAutoResume(): boolean {
    const record = this.read();
    return record !== null && !record.serverCompleted && record.status !== undefined;
  }

  write(record: DiagnosticBrowserRecord): void {
    if (!this.#storage) return;
    safeCall(() => {
      this.#storage!.setItem(STORAGE_KEY, JSON.stringify(record));
      return undefined;
    }, undefined);
  }

  clear(): void {
    if (!this.#storage) return;
    safeCall(() => {
      this.#storage!.removeItem(STORAGE_KEY);
      return undefined;
    }, undefined);
  }

  /**
   * Registro inicial antes de que exista (o mientras no exista) una sesión de servidor. El
   * `sessionId` lo emite siempre el servidor (spec §8); el cliente nunca inventa uno, así que este
   * registro empieza con `sessionId: null` hasta que `POST /api/diagnostic/sessions` confirme uno.
   */
  static createLocalOnly(now: number = Date.now()): DiagnosticBrowserRecord {
    return {
      sessionId: null,
      writeToken: null,
      versions: CURRENT_PERSISTED_VERSIONS,
      status: "STARTED",
      startedAt: now,
      lastActivityAt: now,
      revision: 0,
      currentQuestionId: null,
      answers: {} as Answers,
      questionsSeen: 0,
      questionsAnswered: 0,
      serverCompleted: false,
    };
  }
}
