import type { PersistedVersions } from "./contracts";
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
