import { isRouteErrorResponse, useRouteError, type MetaFunction } from "react-router";

import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/candidate-diagnostic-flow";
import { PublicLayout } from "../components/public-layout";

export const meta: MetaFunction = () => [{ title: "Diagnóstico candidato (prueba local)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

export default function DevDiagnosticCandidate() {
  return <PublicLayout><main className="df-page"><CandidateDiagnosticFlow /></main></PublicLayout>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="df-page"><section className="df-screen" role="alert"><h1 className="df-screen__title">{notFound ? "Página no encontrada" : "No pudimos cargar la prueba candidata"}</h1><p className="df-screen__lead">{notFound ? "Esta experiencia solo está disponible en desarrollo local." : "Recarga el entorno de prueba para continuar."}</p></section></main>;
}
