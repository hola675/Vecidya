import { QUESTION_BANK_V2 } from "../features/diagnostic/qbv2-bank";
import { ROUTE_HARD_CAP } from "../features/diagnostic/qbv2-planner";
import {
  completeSessionV3,
  createSessionV3,
  currentQuestionIdV3,
  submitAnswerV3,
  type AnswerValueV3,
} from "../features/diagnostic/qbv2-session";
import { toAnonymousDiagnosticSummaryV1 } from "../features/diagnostic/anonymous-summary.server";
import type { AnswersV2 } from "../features/diagnostic/qbv2-rules";

import type { Route } from "./+types/api-diagnostic-anonymous-summary";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

export function loader() {
  return failure(405, "Método no permitido.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return failure(415, "Formato no permitido.");
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return failure(400, "No pudimos leer las respuestas.");
  }
  if (new TextEncoder().encode(raw).byteLength > 32 * 1024) return failure(413, "La solicitud es demasiado grande.");

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return failure(400, "Las respuestas no tienen un formato válido.");
  }
  if (!isRecord(input) || !hasExactKeys(input, ["answers"]) || !Array.isArray(input.answers)) {
    return failure(400, "Las respuestas no tienen un formato válido.");
  }
  if (input.answers.length === 0 || input.answers.length > ROUTE_HARD_CAP) {
    return failure(400, "La cantidad de respuestas no es válida.");
  }

  const answerEntries: { readonly questionId: string; readonly value: unknown }[] = [];
  const seen = new Set<string>();
  for (const entry of input.answers) {
    if (!isRecord(entry) || !hasExactKeys(entry, ["questionId", "value"]) || typeof entry.questionId !== "string") {
      return failure(400, "Las respuestas no tienen un formato válido.");
    }
    if (seen.has(entry.questionId)) return failure(400, "Hay respuestas repetidas.");
    if (!QUESTION_BANK_V2.some((question) => question.id === entry.questionId)) {
      return failure(400, "Una pregunta ya no está disponible.");
    }
    seen.add(entry.questionId);
    answerEntries.push({ questionId: entry.questionId, value: entry.value });
  }

  const now = Date.now();
  let session = createSessionV3({ sessionId: "anonymous-summary", now });
  for (const entry of answerEntries) {
    const currentQuestionId = currentQuestionIdV3(session);
    if (currentQuestionId !== entry.questionId) return failure(400, "La ruta de respuestas no corresponde al diagnóstico.");
    const submitted = submitAnswerV3(session, currentQuestionId, entry.value as AnswerValueV3, now);
    if (!submitted.ok) return failure(400, "Una respuesta no cumple el contrato vigente.");
    session = submitted.session;
  }
  if (session.status !== "completing" || session.reviewIndex !== null || session.queue.length !== 0) {
    return failure(422, "Aún no hay información suficiente para cerrar este diagnóstico.");
  }

  const completion = completeSessionV3(session, now);
  if (!completion.ok) return failure(422, "No pudimos preparar una lectura fiable con estas respuestas.");

  return Response.json(
    { summary: toAnonymousDiagnosticSummaryV1(completion.result) },
    { headers },
  );
}
