import { Link, isRouteErrorResponse, useRouteError, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { CandidateMethodologyArticle } from "../components/diagnostic-flow/qa03b-methodology";

export const meta: MetaFunction = () => [
  { title: "Metodología candidata (prueba local)" },
  { name: "robots", content: "noindex, nofollow" },
];

export function loader(_args: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

export default function DevDiagnosticCandidateMethodology() {
  return <main className="dm-page"><div className="rp-toolbar"><Link to="/__dev/diagnostico/qa03b">Regresar a la prueba candidata</Link></div><CandidateMethodologyArticle devBaseHref="/__dev/diagnostico/qa03b" devReportHref="/__dev/diagnostico/qa03b/informe" /></main>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="dm-page"><p role="alert">{notFound ? "Esta prueba solo está disponible en desarrollo local." : "No pudimos cargar la metodología candidata."}</p></main>;
}
