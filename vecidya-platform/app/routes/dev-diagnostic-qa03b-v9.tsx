import { useState } from "react";
import { isRouteErrorResponse, useRouteError, type ActionFunctionArgs, type MetaFunction } from "react-router";

import {
  Qa03bV9ClassificationStep,
  type ClassificationDraftV9,
} from "../components/diagnostic-flow/qa03b-v9-classification-step";
import { PublicLayout } from "../components/public-layout";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { replayQa03bSessionV9Core } from "../features/diagnostic/qa03b/worker-replay-v9.server";
import type { ClassificationSelectionV9 } from "../features/diagnostic/qa03b/v9-classification-bundle";

export const meta: MetaFunction = () => [
  { title: "QA-03B V9 — clasificación y replay (prueba local)" },
  { name: "robots", content: "noindex, nofollow" },
];

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });

export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return failure(415, "Formato no permitido.");
  }

  let raw: string;
  try {
    raw = await readRequestBodyLimited(request, 64 * 1024);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer la sesión V9.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return failure(400, "La sesión V9 no tiene un formato válido.");
  }

  const replay = replayQa03bSessionV9Core(payload);
  if (!replay.ok) {
    const status = replay.reason === "expired" ? 410
      : replay.reason === "identity" || replay.reason === "schema" || replay.reason === "bank" ? 409
        : replay.reason === "incomplete" ? 422 : 400;
    return failure(status, `Replay V9 rechazado: ${replay.reason}.`);
  }
  return Response.json({ core: replay.core, completedAt: replay.completedAt }, { headers });
}

export default function DevQa03bV9() {
  const [draft, setDraft] = useState<ClassificationDraftV9>({});
  const [submitted, setSubmitted] = useState<ClassificationSelectionV9 | null>(null);

  return (
    <PublicLayout>
      <main className="df-page">
        <section className="df-screen" aria-labelledby="qa03b-v9-preview-title">
          <div className="df-screen__header">
            <p className="df-screen__eyebrow">Solo desarrollo · V9 candidato</p>
            <h1 className="df-screen__title" id="qa03b-v9-preview-title">
              Clasificación sector + especialidad
            </h1>
            <p className="df-screen__lead">
              Vista aislada para revisar una interacción compuesta. No utiliza la sesión pública V8 ni publica resultados.
            </p>
          </div>

          <Qa03bV9ClassificationStep
            canGoBack={false}
            entityType="business"
            error={null}
            onBack={() => {}}
            onChange={(next) => {
              setDraft(next);
              setSubmitted(null);
            }}
            onSubmit={(selection) => setSubmitted(selection)}
            progress={{ stage: "context", stageIndex: 0, answered: 3 }}
            reviewing={false}
            value={draft}
          />

          {submitted ? (
            <aside className="df-screen__note" aria-live="polite">
              <strong>Interacción preparada.</strong>{" "}
              Sector: <code>{submitted.sector}</code>
              {submitted.niche ? <> · Especialidad: <code>{submitted.niche}</code></> : null}
              . En V9 este envío cuenta como una sola interacción visible.
            </aside>
          ) : null}
        </section>
      </main>
    </PublicLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="df-page">
      <section className="df-screen" role="alert">
        <h1 className="df-screen__title">{notFound ? "Página no encontrada" : "No pudimos cargar la prueba V9"}</h1>
        <p className="df-screen__lead">
          {notFound ? "Esta experiencia solo existe en desarrollo local." : "Recarga el entorno de prueba para continuar."}
        </p>
      </section>
    </main>
  );
}
