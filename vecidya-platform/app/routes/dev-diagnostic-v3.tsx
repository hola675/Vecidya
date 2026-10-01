import { isRouteErrorResponse, useLoaderData, useRouteError, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { DiagnosticFlow } from "../components/diagnostic-flow";
import { FlowDebugPanel } from "../components/diagnostic-flow/flow-debug-panel";
import { PublicLayout } from "../components/public-layout";

/**
 * DIAG-V3-10B — integración privada del diagnóstico adaptativo V3 (inicio → preguntas → planner → resultado V3).
 * Solo existe en desarrollo: `routes.ts` la registra con `NODE_ENV=development` y el loader responde 404 fuera de
 * `import.meta.env.DEV`, así que no entra en el build ni en la navegación. `/diagnostico` (QBV1) no cambia.
 */

export const meta: MetaFunction = () => [{ title: "Diagnóstico V3 (desarrollo)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader({ request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return { debug: new URL(request.url).searchParams.get("debug") === "1" };
}

export default function DevDiagnosticV3() {
  const { debug } = useLoaderData<typeof loader>();
  return (
    <PublicLayout>
      <main className="df-page">
        <DiagnosticFlow renderDebug={debug ? (session) => <FlowDebugPanel session={session} /> : undefined} />
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
        <h1 className="df-screen__title">{notFound ? "Página no encontrada" : "No pudimos cargar el diagnóstico"}</h1>
        <p className="df-screen__lead">{notFound ? "Esta página no está disponible." : "Tus respuestas siguen guardadas en este navegador. Recarga la página para continuar."}</p>
      </section>
    </main>
  );
}
