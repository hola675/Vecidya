import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/qa03b-diagnostic-flow";
import { ANONYMOUS_START_COPY } from "../components/diagnostic-flow/flow-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_PATH } from "../features/diagnostic/deep-link";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import { Link } from "react-router";
import { useEffect } from "react";
import { isIdentifiedReportJourneyAvailable } from "../features/diagnostic/identified-report-availability.server";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";

import type { Route } from "./+types/diagnostic";

/**
 * ACT-04 — cuestionario adaptativo QA-03B. Mantiene sesiones históricas en sus claves anteriores;
 * las nuevas sesiones usan el contrato de banco v8, schema/key 8 y replay v6.
 */

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    ANONYMOUS_START_COPY.metaDescription,
    DIAGNOSTIC_PATH,
  );
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  let authenticatedUser: { name: string } | null = null;
  let authStatus: "authenticated" | "anonymous" | "unavailable" = "anonymous";
  try {
    const session = await getSession(env, request);
    authenticatedUser = session ? { name: session.user.name } : null;
    authStatus = session ? "authenticated" : "anonymous";
  } catch {
    authStatus = "unavailable";
  }
  const v9IdentityBootstrapEnabled = isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig);
  return {
    identifiedReportAvailable: isIdentifiedReportJourneyAvailable(env),
    v9IdentityBootstrapEnabled,
    authenticatedUser,
    authStatus,
  };
}

export default function Diagnostic({ loaderData }: Route.ComponentProps) {
  useEffect(() => {
    if (loaderData.authStatus !== "anonymous" || !loaderData.v9IdentityBootstrapEnabled) return;
    void fetch("/api/diagnostic/anonymous-identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      credentials: "same-origin",
    }).catch(() => undefined);
  }, [loaderData.authStatus, loaderData.v9IdentityBootstrapEnabled]);

  return (
    <PublicLayout>
      <main className="df-page">
        <p className="alert" role="status">
          {loaderData.authStatus === "unavailable" ? (
            <>No pudimos comprobar el estado de tu sesión. El diagnóstico sigue disponible, pero no se asociará a una cuenta en esta visita. <Link to="/login?redirectTo=%2Fdiagnostico">Iniciar sesión</Link></>
          ) : loaderData.authenticatedUser ? (
            <>Sesión iniciada{loaderData.authenticatedUser.name ? ` como ${loaderData.authenticatedUser.name}` : ""}. La asociación automática al historial se está activando. Si antes diagnosticabas como visitante en este navegador, puedes intentar recuperar ese historial desde <Link to="/app/diagnosticos">Mis diagnósticos</Link>.</>
          ) : (
            <>Estás como visitante. <Link to="/login?redirectTo=%2Fdiagnostico">Inicia sesión</Link> para acceder a tu cuenta. La recuperación de diagnósticos anónimos estará disponible cuando termine la activación del historial V9.</>
          )}
        </p>
        <CandidateDiagnosticFlow publicMode reportRequestEnabled={loaderData.identifiedReportAvailable} />
      </main>
    </PublicLayout>
  );
}
