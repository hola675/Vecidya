import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPublishedBusinessProfileFilterOptions, listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { BusinessCardV2, CTASection, EmptyState, SearchFilters } from "../components/public-v2";

import type { Route } from "./+types/directory";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Vecindario", "Perfiles publicados reales en el vecindario digital de Vecidya.", "/vecindario");
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const params = new URL(request.url).searchParams;
  const filters = { q: params.get("q")?.trim().slice(0, 100) || undefined, category: params.get("category")?.trim().slice(0, 100) || undefined, city: params.get("city")?.trim().slice(0, 100) || undefined };
  const database = createDatabase(env.DB);
  const [profiles, options] = await Promise.all([listPublishedBusinessProfiles(database, filters), getPublishedBusinessProfileFilterOptions(database)]);
  return { profiles, filters, ...options };
}

function categoryUrl(category: string) {
  const params = new URLSearchParams({ category });
  return `/vecindario?${params.toString()}`;
}

export default function DirectoryPage() {
  const { profiles, filters, categories, cities } = useLoaderData<typeof loader>();
  const hasFilters = Boolean(filters.q || filters.category || filters.city);

  return (
    <PublicLayout>
      <section className="public-page directory-page directory-page-v2">
        <div className="directory-hero">
          <div>
            <p className="eyebrow">VECINDARIO</p>
            <h1>Explora presencias reales publicadas en Vecidya.</h1>
            <p>Busca negocios con información pública existente. Sin inventario artificial, sin reseñas fabricadas y sin promesas añadidas por la plataforma.</p>
          </div>
        </div>

        <SearchFilters categories={categories} cities={cities} filters={filters} />

        {categories.length ? (
          <nav aria-label="Categorías disponibles" className="directory-category-list">
            {categories.slice(0, 8).map((category) => <Link key={category} to={categoryUrl(category)}>{category}</Link>)}
          </nav>
        ) : null}

        <div className="directory-results-heading">
          <div>
            <p className="eyebrow">RESULTADOS</p>
            <h2>{profiles.length ? `${profiles.length} ${profiles.length === 1 ? "perfil publicado" : "perfiles publicados"}` : "Sin resultados"}</h2>
          </div>
          {hasFilters ? <Link className="text-link" to="/vecindario">Ver todos los negocios <span aria-hidden="true">→</span></Link> : null}
        </div>

        {profiles.length === 0 ? (
          <EmptyState
            actions={[
              { label: "Limpiar filtros", to: "/vecindario", variant: "secondary" },
              { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
            ]}
            title="No encontramos negocios con esos filtros"
          >
            <p>El Vecindario solo muestra perfiles publicados reales. Prueba con otra búsqueda, vuelve a todos los resultados o usa el diagnóstico para preparar una presencia pública clara antes de aparecer aquí.</p>
          </EmptyState>
        ) : (
          <ul className="directory-grid directory-grid-v2" aria-label="Perfiles publicados">
            {profiles.map((profile) => <li key={profile.slug}><BusinessCardV2 profile={profile} /></li>)}
          </ul>
        )}
      </section>

      <CTASection
        eyebrow="PARA NEGOCIOS"
        title="¿Tu negocio también debería aparecer aquí?"
        actions={[
          { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
          { label: "Hablar con Vecidya", to: "/contacto", variant: "secondary" },
        ]}
      >
        <p>Vecidya ayuda a ordenar lo esencial para que tu negocio pueda ser encontrado, entendido y contactado con claridad.</p>
      </CTASection>
    </PublicLayout>
  );
}
