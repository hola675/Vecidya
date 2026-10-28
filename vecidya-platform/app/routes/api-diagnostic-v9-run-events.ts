import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import { QA03B_V9_CLASSIFICATION_INTERACTION_ID } from "../features/diagnostic/qa03b/v9-classification-bundle";
import { ingestOwnedDiagnosticEventV9 } from "../features/diagnostic/qa03b/v9-event-ingestion.server";
import { readV9AnonymousIdentityCookie } from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";

import type { Route } from "./+types/api-diagnostic-v9-run-events";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

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

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

function normalizeEvent(kind: unknown, payload: unknown): { kind: string; payload: unknown } | null {
  if (!isRecord(payload)) return null;
  if (kind === "answer") {
    if (!hasExactKeys(payload, ["questionId", "value", "mode"]) ||
        typeof payload.questionId !== "string" || payload.questionId.length < 1 || payload.questionId.length > 128 ||
        (payload.mode !== "answer" && payload.mode !== "edit")) return null;
    const value = payload.value;
    if (typeof value === "string") {
      if (value.length > 500) return null;
    } else if (Array.isArray(value)) {
      if (value.length > 32 || !value.every((item) => typeof item === "string" && item.length <= 300)) return null;
    } else return null;
    return { kind: "answer", payload: { questionId: payload.questionId, value, mode: payload.mode } };
  }
  if (kind === "classification") {
    if (!hasExactKeys(payload, ["classification", "mode"]) ||
        (payload.mode !== "answer" && payload.mode !== "edit") || !isRecord(payload.classification)) return null;
    const classification = payload.classification;
    const allowed = ["kind", "sector", "niche", "sectorQuestionId", "nicheQuestionId"];
    if (Object.keys(classification).some((key) => !allowed.includes(key)) ||
        classification.kind !== QA03B_V9_CLASSIFICATION_INTERACTION_ID ||
        typeof classification.sector !== "string" || classification.sector.length > 128 ||
        classification.sectorQuestionId !== "q2_sector" ||
        (classification.niche !== undefined && (typeof classification.niche !== "string" || classification.niche.length > 128)) ||
        (classification.nicheQuestionId !== undefined && (typeof classification.nicheQuestionId !== "string" || classification.nicheQuestionId.length > 128))) return null;
    return {
      kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
      payload: { ...classification, mode: payload.mode },
    };
  }
  return null;
}

export async function action({ context, request, params }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig)) {
    return failure(503, "El diagnóstico V9 aún no está habilitado con versiones certificadas.");
  }
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-v9-append-event")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }
  const runId = params.runId;
  if (!validUuid(runId)) return failure(400, "El identificador del diagnóstico no es válido.");

  let raw: string;
  try {
    raw = await readRequestBodyLimited(request, 20 * 1024);
  } catch (error) {
    return failure(error instanceof RequestBodyTooLargeError ? 413 : 400, "La solicitud no tiene un formato válido.");
  }
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return failure(400, "La solicitud no tiene un formato válido."); }
  if (!isRecord(input) || !hasExactKeys(input, ["eventId", "expectedSeq", "kind", "payload", "occurredAt"]) ||
      !validUuid(input.eventId) || !Number.isSafeInteger(input.expectedSeq) ||
      (input.expectedSeq as number) < 0 || (input.expectedSeq as number) > 100000 ||
      typeof input.occurredAt !== "string") return failure(400, "El evento no cumple el contrato V9.");
  const occurredMs = Date.parse(input.occurredAt);
  if (!Number.isFinite(occurredMs) || occurredMs > Date.now() + 5 * 60 * 1000 || occurredMs < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return failure(400, "La fecha del evento está fuera del intervalo permitido.");
  }
  const normalized = normalizeEvent(input.kind, input.payload);
  if (!normalized) return failure(400, "La respuesta no cumple el contrato de eventos V9.");

  let session;
  try { session = await getSession(env, request); } catch { return failure(503, "No pudimos comprobar tu sesión de Vecidya."); }
  const anonymous = session ? null : readV9AnonymousIdentityCookie(request);
  if (!session && !anonymous) return failure(401, "No encontramos una identidad anónima válida.");

  try {
    const result = await ingestOwnedDiagnosticEventV9(env.DB as unknown as V9IdentityDb, {
      workspaceId: DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
      runId,
      ...(session ? { userId: session.user.id } : {
        identityId: anonymous!.identityId,
        recoveryCredential: anonymous!.recoveryCredential,
      }),
      eventId: input.eventId,
      expectedSeq: input.expectedSeq as number,
      kind: normalized.kind,
      payload: normalized.payload,
      occurredAt: input.occurredAt,
      expectedVersions: {
        bank: (env as unknown as V9PublicRuntimeConfig).DIAGNOSTIC_V9_BANK_VERSION!,
        engine: (env as unknown as V9PublicRuntimeConfig).DIAGNOSTIC_V9_ENGINE_VERSION!,
        scoring: (env as unknown as V9PublicRuntimeConfig).DIAGNOSTIC_V9_SCORING_VERSION!,
        recommendations: (env as unknown as V9PublicRuntimeConfig).DIAGNOSTIC_V9_RECOMMENDATION_VERSION!,
        consent: (env as unknown as V9PublicRuntimeConfig).DIAGNOSTIC_V9_CONSENT_VERSION!,
      },
    });
    if (result.status === "conflict") return failure(409, "El historial cambió. Recarga el diagnóstico antes de continuar.");
    return Response.json({ ok: true, status: result.status, seq: result.seq }, {
      status: result.status === "created" ? 201 : 200,
      headers,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "v9_run_not_owned") return failure(404, "El diagnóstico no existe o no pertenece a esta identidad.");
    if (code === "v9_identity_proof_invalid") return failure(403, "No pudimos verificar la identidad anónima.");
    if (code === "v9_identity_already_claimed") return failure(409, "Esta identidad ya está asociada a una cuenta. Inicia sesión.");
    if (code === "v9_invalid_event" || code === "v9_invalid_payload") return failure(400, "El evento no cumple el contrato V9.");
    if (code === "v9_event_not_eligible") return failure(422, "La respuesta no corresponde a la ruta activa del diagnóstico.");
    if (code === "v9_run_version_mismatch") return failure(409, "La versión del diagnóstico es diferente. Inicia uno nuevo.");
    if (code === "v9_run_not_active") return failure(409, "Este diagnóstico ya no acepta respuestas.");
    if (code === "v9_history_incomplete" || code === "v9_history_sequence_gap") return failure(409, "El historial está incompleto.");
    return failure(503, "No pudimos guardar la respuesta. Inténtalo de nuevo.");
  }
}
