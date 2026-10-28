import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { PublicLayout } from "../components/public-layout";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
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

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const enabled = isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig);
  let authenticated = false;
  let sessionError = false;
  if (enabled) {
    try {
      authenticated = Boolean(await getSession(env, request));
    } catch {
      sessionError = true;
    }
  }
  return { enabled, authenticated, sessionError };
}

export default function DiagnosticV9Start({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (starting || !loaderData.enabled || loaderData.sessionError) return;
    setStarting(true);
    setError(null);
    try {
      if (!loaderData.authenticated) {
        const identityResponse = await fetch("/api/diagnostic/anonymous-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          credentials: "same-origin",
        });
        if (!identityResponse.ok) {
          const problem = await identityResponse.json() as { error?: string };
          throw new Error(problem.error || "No pudimos crear una identidad de visitante.");
        }
      }
      const response = await fetch("/api/diagnostic/v9/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "same-origin",
      });
      const data = await response.json() as { ok?: boolean; runId?: string; error?: string };
      if (!response.ok || !data.ok || !data.runId) {
        throw new Error(data.error || "No pudimos iniciar el diagnóstico.");
      }
      navigate(`/diagnostico/v9/${encodeURIComponent(data.runId)}`);
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
            <p className="df-screen__lead">
              Un recorrido adaptado a tu actividad, con respuestas guardadas de forma segura para retomar tu diagnóstico.
            </p>
          </div>
          {!loaderData.enabled ? (
            <div className="df-screen__note" role="status">
              La nueva versión está en validación y todavía no admite diagnósticos públicos.
              Puedes utilizar el <Link to="/diagnostico">diagnóstico disponible</Link>.
            </div>
          ) : loaderData.sessionError ? (
            <div role="alert" className="df-screen__note">No pudimos verificar la sesión. Vuelve a iniciar sesión antes de continuar.</div>
          ) : (
            <>
              <p role="status">
                {loaderData.authenticated
                  ? "Sesión iniciada: el diagnóstico se asociará a tu cuenta Vecidya."
                  : "Visita anónima: conservaremos una identidad de recuperación segura en este navegador."}
              </p>
              {error ? <p role="alert" className="df-screen__note">{error}</p> : null}
              <button type="button" className="button button--primary" disabled={starting} onClick={() => void start()}>
                {starting ? "Preparando diagnóstico…" : "Comenzar diagnóstico"}
              </button>
              <p>Podrás asociar después los resultados a tus organizaciones desde <Link to="/app/diagnosticos">Mis diagnósticos</Link>.</p>
            </>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
