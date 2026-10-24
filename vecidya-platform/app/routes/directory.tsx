import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPublishedBusinessProfileFilterOptions, listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { serviceModeLabels } from "../../db/business-profile-rules";
import { cloudflareContext } from "../../server/cloudflare-context";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { BusinessCardV2, CTASection, EmptyState, SearchFilters } from "../components/public-v2";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { MINIWEB_MODULE_REGISTRY, SUPPORTED_MINIWEB_MODULE_TYPES, type MiniWebModuleType } from "../features/miniweb/registry";
import type { NeighborhoodFilters } from "../features/miniweb/neighborhood";

import type { Route } from "./+types/directory";

export function meta({ location }: Route.MetaArgs) {
  const hasQuery = Boolean(location.search);
  return publicMeta(
    "Vecindario",
    "Explora negocios con perfiles públicos reales en el Vecindario de Vecidya.",
    "/vecindario",
    hasQuery ? "noindex, follow" : "index, follow",
  );
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const params = new URL(request.url).searchParams;
  const moduleParam = params.get("module");
  const offeringParam = params.get("offering");
  const serviceModeParam = params.get("serviceMode");
  const filters: NeighborhoodFilters = {
    q: params.get("q")?.trim().slice(0, 100) || undefined,
    category: params.get("category")?.trim().slice(0, 100) || undefined,
    city: params.get("city")?.trim().slice(0, 100) || undefined,
    serviceArea: params.get("serviceArea")?.trim().slice(0, 120) || undefined,
    serviceMode: serviceModeParam && Object.hasOwn(serviceModeLabels, serviceModeParam) ? serviceModeParam : undefined,
    offering: offeringParam === "service" || offeringParam === "product" ? offeringParam : undefined,
    module: moduleParam && SUPPORTED_MINIWEB_MODULE_TYPES.includes(moduleParam as MiniWebModuleType) ? moduleParam as MiniWebModuleType : undefined,
  };
  const database = createDatabase(env.DB);
  const [profiles, options] = await Promise.all([listPublishedBusinessProfiles(database, filters), getPublishedBusinessProfileFilterOptions(database)]);
  return { profiles, filters, ...options };
}

function categoryUrl(category: string) {
  const params = new URLSearchParams({ category });
  return `/vecindario?${params.toString()}`;
}

export default function DirectoryPage() {
  const { profiles, filters, categories, cities, serviceAreas, serviceModes, offeringKinds, modules } = useLoaderData<typeof loader>();
  const hasFilters = Boolean(filters.q || filters.category || filters.city || filters.serviceArea || filters.serviceMode || filters.offering || filters.module);
  const filterSummary = [
    filters.q ? `Nombre, categoría u oferta: ${filters.q}` : null,
    filters.category ? `Categoría: ${filters.category}` : null,
    filters.city ? `Ciudad: ${filters.city}` : null,
    filters.serviceArea ? `Área de servicio: ${filters.serviceArea}` : null,
    filters.serviceMode ? `Modalidad: ${serviceModeLabels[filters.serviceMode]}` : null,
    filters.offering ? `Ofrece: ${filters.offering === "service" ? "servicios" : "productos"}` : null,
    filters.module ? `Sección: ${MINIWEB_MODULE_REGISTRY[filters.module].label}` : null,
  ].filter((value): value is string => value !== null);
  const resultLabel = profiles.length === 1 ? "1 perfil encontrado" : `${profiles.length} perfiles encontrados`;

  return (
    <PublicLayout>
      <main>
        <section className={`public-page directory-page directory-page-v2${profiles.length > 0 && profiles.length <= 2 ? " directory-page-v2--compact" : ""}`} aria-labelledby="directory-title">
          <div className="directory-hero">
            <div>
              <p className="eyebrow">VECINDARIO</p>
              <h1 id="directory-title">Descubre negocios con una presencia clara.</h1>
              <p>Explora perfiles publicados por categoría, ciudad, modalidad y lo que cada negocio ofrece.</p>
            </div>
          </div>

          <SearchFilters categories={categories} cities={cities} filters={filters} serviceAreas={serviceAreas} serviceModes={serviceModes} offeringKinds={offeringKinds} modules={modules} />

          {categories.length ? (
            <nav aria-label="Categorías disponibles" className="directory-category-list">
              {categories.slice(0, 8).map((category) => <Link key={category} to={categoryUrl(category)}>{category}</Link>)}
            </nav>
          ) : null}

          <div aria-live="polite" className="directory-results-heading">
            <div>
              <p className="eyebrow">RESULTADOS</p>
              <h2>{profiles.length ? resultLabel : hasFilters ? "Sin coincidencias" : "El Vecindario está empezando"}</h2>
            </div>
            {hasFilters ? <Link className="text-link" to="/vecindario">Limpiar filtros <span aria-hidden="true">→</span></Link> : null}
          </div>

          {hasFilters && filterSummary.length ? (
            <div aria-label="Filtros activos" className="directory-active-filters" role="group">
              <strong>Filtros activos</strong>
              {filterSummary.map((filter) => <span key={filter}>{filter}</span>)}
            </div>
          ) : null}

          {profiles.length === 0 ? (
            hasFilters ? (
              <EmptyState
                actions={[
                  { label: "Limpiar filtros", to: "/vecindario", variant: "secondary" },
                  { label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" },
                ]}
                title="No encontramos coincidencias"
              >
                <p>Prueba con otro término o combina distintas opciones. Solo usamos el perfil y contenido que cada negocio publicó.</p>
              </EmptyState>
            ) : (
              <EmptyState
                actions={[{ label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" }]}
                eyebrow="VECINDARIO EN CRECIMIENTO"
                title="El Vecindario está empezando a crecer"
              >
                <p>Cuando existan perfiles publicados, aparecerán aquí para que puedas explorarlos.</p>
              </EmptyState>
            )
          ) : (
            <ul aria-label="Perfiles publicados" className="directory-grid directory-grid-v2">
              {profiles.map((profile) => <li key={profile.slug}><BusinessCardV2 profile={profile} /></li>)}
            </ul>
          )}
        </section>

        <CTASection
          className="public-v2-cta--soft"
          eyebrow="PARA NEGOCIOS"
          title="¿Tu negocio también debería aparecer aquí?"
          actions={[
            { label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" },
            { label: "Hablar con Vecidya", to: "/contacto", variant: "secondary" },
          ]}
        >
          <p>Ordena lo esencial para que tu negocio pueda ser encontrado, entendido y contactado con claridad.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
