import { AUTOSAVE_SNAPSHOT_RETENTION_DAYS, ONE_DAY_MS } from "../../app/features/diagnostic/contracts";
import type { DiagnosticSessionSnapshot } from "../../app/features/diagnostic/persistence";

/**
 * KV es exclusivamente snapshot temporal de trabajo (spec §15): nunca base histórica, nunca fuente
 * fuerte de concurrencia, nunca source of truth de un resultado completado. No se promete
 * lectura-tras-escritura global (spec §17): un PUT no garantiza verse de inmediato desde cualquier
 * región; same-browser sigue usando `DiagnosticBrowserStore` como primera fuente. Nada en esta fase
 * lee esta key todavía (queda preparada para Save & Resume, DIAG-V3-07).
 */

const SNAPSHOT_TTL_SECONDS = AUTOSAVE_SNAPSHOT_RETENTION_DAYS * (ONE_DAY_MS / 1000);

function kvKey(sessionId: string): string {
  return `diagnostic:session:${sessionId}`;
}

export async function putDiagnosticSnapshot(kv: KVNamespace, sessionId: string, snapshot: DiagnosticSessionSnapshot): Promise<void> {
  await kv.put(kvKey(sessionId), JSON.stringify(snapshot), { expirationTtl: SNAPSHOT_TTL_SECONDS });
}

export async function getDiagnosticSnapshot(kv: KVNamespace, sessionId: string): Promise<DiagnosticSessionSnapshot | null> {
  const raw = await kv.get(kvKey(sessionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DiagnosticSessionSnapshot;
  } catch {
    return null;
  }
}

/**
 * Borrado best-effort, y SIEMPRE después de confirmar D1 (spec §29): nunca `delete` antes de `batch`.
 * Un fallo aquí no revierte ni invalida una finalización ya persistida; el snapshot simplemente queda
 * para que su propio TTL lo elimine.
 */
export async function deleteDiagnosticSnapshotBestEffort(kv: KVNamespace, sessionId: string): Promise<boolean> {
  try {
    await kv.delete(kvKey(sessionId));
    return true;
  } catch {
    return false;
  }
}
