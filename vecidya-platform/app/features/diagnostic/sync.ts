import type { PersistedVersions } from "./contracts";
import type { DiagnosticSessionSnapshot } from "./persistence";
import type { Answers, DiagnosticResult } from "./types";

/**
 * Cliente HTTP delgado hacia la API de persistencia (DIAG-V3-06 §30). Nunca lanza: una caída de red
 * devuelve `null` y quien llama decide seguir en modo solo-navegador (spec §37) — ninguna pregunta
 * queda bloqueada por un fallo de autosave server-side.
 */

type FetchLike = typeof fetch;

export type CreateSessionResult = { sessionId: string; writeToken: string; versions: PersistedVersions; status: "STARTED" };

export async function createServerSession(fetchImpl: FetchLike = fetch): Promise<CreateSessionResult | null> {
  try {
    const response = await fetchImpl("/api/diagnostic/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    if (!response.ok) return null;
    return (await response.json()) as CreateSessionResult;
  } catch {
    return null;
  }
}

export type SnapshotPayload = {
  writeToken: string;
  answers: Answers;
  currentQuestionId: string | null;
  questionsSeen: number;
  questionsAnswered: number;
};

export async function sendSnapshot(sessionId: string, payload: SnapshotPayload, fetchImpl: FetchLike = fetch): Promise<{ revision: number; status: string } | null> {
  try {
    const response = await fetchImpl(`/api/diagnostic/sessions/${encodeURIComponent(sessionId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return (await response.json()) as { revision: number; status: string };
  } catch {
    return null;
  }
}

// ── Save & Resume (DIAG-V3-07) ──────────────────────────────────────────────
// A diferencia de `sendSnapshot`/`sendCompletion` (autosave silencioso: `null` en cualquier fallo,
// spec §37), SAVE y RECOVER son acciones explícitas que la persona inicia a propósito — la UI
// necesita el motivo del fallo para mostrarlo (código inválido/expirado, sin conexión), no solo
// "seguir en modo solo-navegador".

export type SavePayload = SnapshotPayload & { regenerateCode?: boolean };

export type SaveSessionResult =
  | { ok: true; status: "saved"; recoveryCode: string; expiresAt: string }
  | { ok: true; status: "already_saved"; expiresAt: string }
  | { ok: false; error: string };

/**
 * Los mensajes de error del servidor (`api-diagnostic-*.ts`) están en inglés — mismo idioma que el
 * resto de la API de persistencia (spec §37 no los expone: `sendSnapshot`/`sendCompletion` nunca
 * llegan a la UI con `null`). SAVE y RECOVER sí necesitan mostrar el motivo, así que se traduce por
 * código HTTP, nunca reenviando `body.error` a una interfaz en español (AGENTS.md).
 */
function saveErrorMessage(status: number): string {
  if (status === 409) return "Esta sesión ya fue completada; no se puede guardar de nuevo.";
  if (status === 403) return "No se pudo verificar esta sesión. Recarga la página e intenta de nuevo.";
  if (status === 413) return "El progreso es demasiado grande para guardarlo.";
  return "No se pudo guardar el progreso. Intenta de nuevo en un momento.";
}

export async function saveSessionForLater(sessionId: string, payload: SavePayload, fetchImpl: FetchLike = fetch): Promise<SaveSessionResult> {
  try {
    const response = await fetchImpl(`/api/diagnostic/sessions/${encodeURIComponent(sessionId)}/save`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, error: saveErrorMessage(response.status) };
    const body = (await response.json().catch(() => null)) as { status: "saved"; recoveryCode: string; expiresAt: string } | { status: "already_saved"; expiresAt: string } | null;
    if (!body) return { ok: false, error: saveErrorMessage(response.status) };
    return { ok: true, ...body };
  } catch {
    return { ok: false, error: "Sin conexión. Intenta de nuevo." };
  }
}

export type RecoverSessionResult =
  | { ok: true; sessionId: string; writeToken: string; versions: PersistedVersions; snapshot: DiagnosticSessionSnapshot }
  | { ok: false; error: string };

function recoverErrorMessage(status: number): string {
  if (status === 410) return "Este código ya expiró.";
  if (status === 409) return "Esta sesión guardada ya no es compatible con el diagnóstico actual.";
  if (status === 429) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
  return "Código inválido o expirado. Revisa que esté bien escrito.";
}

/** El código nunca viaja en la URL (spec §17): siempre `POST` con el código en el body. */
export async function recoverSession(code: string, fetchImpl: FetchLike = fetch): Promise<RecoverSessionResult> {
  try {
    const response = await fetchImpl("/api/diagnostic/recover", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) return { ok: false, error: recoverErrorMessage(response.status) };
    const body = (await response.json().catch(() => null)) as { sessionId: string; writeToken: string; versions: PersistedVersions; snapshot: DiagnosticSessionSnapshot } | null;
    if (!body) return { ok: false, error: recoverErrorMessage(response.status) };
    return { ok: true, ...body };
  } catch {
    return { ok: false, error: "Sin conexión. Intenta de nuevo." };
  }
}

export async function sendCompletion(
  sessionId: string,
  writeToken: string,
  answers: Answers,
  fetchImpl: FetchLike = fetch,
): Promise<{ status: "completed" | "already_completed"; result: DiagnosticResult } | null> {
  try {
    const response = await fetchImpl(`/api/diagnostic/sessions/${encodeURIComponent(sessionId)}/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ writeToken, answers }),
    });
    if (!response.ok) return null;
    return (await response.json()) as { status: "completed" | "already_completed"; result: DiagnosticResult };
  } catch {
    return null;
  }
}
