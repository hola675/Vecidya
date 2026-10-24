import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { PublicLayout } from "./components/public-layout";
import "./app.css";
import "./styles/vecidya-polish.css";

export function meta() {
  return [{ title: "Vecidya" }, { name: "description", content: "Comunidad digital para ordenar presencia, aprendizaje y próximos pasos." }];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta content="#f7f9fc" name="theme-color" />
        <link href="/brand/vecidya-icon-3d.png" rel="icon" type="image/png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Vecidya", url: "https://vecidya.com/", inLanguage: "es", description: "Comunidad digital para ordenar presencia, aprendizaje y próximos pasos.", publisher: { "@type": "Organization", name: "Vecidya", url: "https://vecidya.com/" } }).replace(/</g, "\\u003c") }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = notFound ? "Página no encontrada" : "Error inesperado";

  if (notFound) {
    return <PublicLayout><section className="public-page public-error-page"><p className="eyebrow">ERROR 404</p><h1>{message}</h1><p>La dirección que buscas no existe o ya no está disponible.</p><div className="public-actions"><Link className="button button--primary" to="/">Volver al inicio</Link><Link className="button button--secondary" to="/vecindario">Explorar el Vecindario</Link></div></section></PublicLayout>;
  }

  return (
    <main className="foundation-shell">
      <section className="foundation-card">
        <p className="eyebrow">VECIDYA</p>
        <h1>{message}</h1>
        <p>No fue posible completar esta solicitud.</p>
      </section>
    </main>
  );
}
