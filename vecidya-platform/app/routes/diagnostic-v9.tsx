import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { PublicLayout } from "../components/public-layout";
import { cloudflareContext } from "../../server/cloudflare-context";
import { createCandidateSessionV9Prototype } from "../features/diagnostic/qa03b/v9-session-prototype";
import { createBrowserDiagnosticV9LocalDraftStore } from "../features/diagnostic/v9/local-draft.client";
import { DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS } from "../features/diagnostic/v9/local-draft";
import {
  isV9PublicRuntimeAvailable,
  type V9PublicRuntimeConfig,
} from "../features/diagnostic/qa03b/v9-public-availability.server";

import type { Route } from "./+types/diagnostic-v9";

export function meta() {
  return [
    { title: "Diagnóstico V9 | Vecidya" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const enabled = isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig);
  return { enabled };
}

export default function DiagnosticV9Start({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    const stored = createBrowserDiagnosticV9LocalDraftStore().readResult(Date.now());
    if (stored.status === "found") setDraftId(stored.envelope.session.sessionId);
    if (stored.status === "expired") setError("El borrador local anterior expiró. Puedes iniciar uno nuevo.");
    if (stored.status === "unavailable") setError("El almacenamiento local no está disponible; el recorrido podrá mantenerse solo mientras esta página permanezca abierta.");
  }, []);

  async function start() {
    if (starting || !consented || !loaderData.enabled) return;
    setStarting(true);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      const session = createCandidateSessionV9Prototype({
        sessionId,
        writerId: crypto.randomUUID(),
        now: Date.now(),
      });
      const saved = await createBrowserDiagnosticV9LocalDraftStore().write(session);
      if (saved.status !== "written" && saved.status !== "idempotent") {
        throw new Error(saved.status === "conflict"
          ? "Ya existe un borrador más reciente en este navegador. Recupéralo antes de iniciar otro."
          : "No pudimos iniciar el borrador local.");
      }
      navigate(`/diagnostico/v9/${encodeURIComponent(sessionId)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos iniciar el diagnóstico.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <PublicLayout>
      <main className="df-page">
        <section className="df-screen" aria-labelledby="v9-start-heading">
          <div className="df-screen__header">
            <p className="df-screen__eyebrow">Vecidya · Diagnóstico V9</p>
            <h1 className="df-screen__title" id="v9-start-heading">Conoce el estado digital de tu negocio</h1>
            <p className="df-screen__lead">Un recorrido adaptado a tu actividad. El borrador anónimo se guarda en este navegador durante un máximo de 7 días desde la última respuesta válida.</p>
          </div>
          {!loaderData.enabled ? (
            <div className="df-screen__note" role="status">
              La nueva versión está en validación y todavía no admite diagnósticos públicos.
              Puedes utilizar el <Link to="/diagnostico">diagnóstico disponible</Link>.
            </div>
          ) : (
            <>
              <p role="status">Borrador anónimo local. Vecidya no recibe ni guarda tus respuestas durante la entrevista.</p>
              <label className="v9-consent">
                <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.currentTarget.checked)} />
                <span>He leído la <Link to="/privacidad">Política de privacidad</Link> y entiendo que este borrador se conserva solo en este navegador durante un máximo de 7 días.</span>
              </label>
              {error ? <p role="alert" className="df-screen__note">{error}</p> : null}
              <button type="button" className="button button--primary" disabled={starting || !consented} onClick={() => void start()}>
                {starting ? "Preparando diagnóstico…" : "Comenzar diagnóstico"}
              </button>
              {draftId ? <p><Link className="button" to={`/diagnostico/v9/${encodeURIComponent(draftId)}`}>Continuar borrador anterior</Link> · máximo {Math.ceil(DIAGNOSTIC_V9_LOCAL_DRAFT_TTL_MS / 86_400_000)} días desde la última respuesta</p> : null}
              <p>La finalización y el resultado estarán disponibles cuando se complete la siguiente fase de validación.</p>
            </>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
