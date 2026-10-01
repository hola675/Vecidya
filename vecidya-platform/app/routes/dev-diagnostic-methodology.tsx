import { isRouteErrorResponse, useRouteError, type MetaFunction } from "react-router";

import { MethodologyArticle } from "../components/diagnostic-methodology";
import { PublicLayout } from "../components/public-layout";

/**
 * DIAG-V3-11 — metodología y fuentes del diagnóstico V3, en privado como el resto de V3. Solo existe en desarrollo:
 * `routes.ts` la registra con `NODE_ENV=development` y el loader responde 404 fuera de `import.meta.env.DEV`.
 */

export const meta: MetaFunction = () => [{ title: "Metodología del diagnóstico (desarrollo)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

export default function DevDiagnosticMethodology() {
  return (
    <PublicLayout>
      <main className="dm-page">
        <MethodologyArticle />
      </main>
    </PublicLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="dm-page">
      <h1>{notFound ? "Página no encontrada" : "No pudimos cargar la metodología"}</h1>
    </main>
  );
}
