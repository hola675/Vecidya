import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { COMMERCIAL_BOUNDARY_COPY, COMMERCIAL_EXTERNAL_COSTS, PUBLIC_ACTION_LABELS, type CommercialBoundaryKind } from "../content/public-copy";
import { buildDiagnosticPath, type ProfileId } from "../features/diagnostic";
import { serviceModeLabels } from "../../db/business-profile-rules";
import type { NeighborhoodFilters, NeighborhoodOfferingKind } from "../features/miniweb/neighborhood";
import type { MiniWebModuleType } from "../features/miniweb/registry";
import type { ReactNode } from "react";

export {
  PublicBusinessContact,
  PublicBusinessDetails,
  PublicBusinessHeader,
  PublicBusinessHours,
} from "./public-business-profile-view";

type CTAAction = {
  label: string;
  to?: string;
  href?: string;
  variant?: "primary" | "secondary" | "light";
};

type BusinessCardProfile = {
  slug: string;
  displayName: string;
  shortDescription: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  serviceArea: string | null;
  serviceMode: string | null;
  offerings: { kind: NeighborhoodOfferingKind; title: string }[];
  moduleLabels: string[];
};

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}
      type="application/ld+json"
    />
  );
}

function CTAButton({ action }: { action: CTAAction }) {
  const className = `button button--${action.variant ?? "primary"}`;

  if (action.href) {
    return <a className={className} href={action.href}>{action.label}</a>;
  }

  return <Link className={className} to={action.to ?? "/"}>{action.label}</Link>;
}

export function CTASection({
  eyebrow,
  title,
  children,
  actions,
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions: CTAAction[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <section className={`public-v2-cta public-v2-cta--${tone}${className ? ` ${className}` : ""}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <div className="public-v2-cta__body">{children}</div>
      <div className="public-actions">
        {actions.map((action) => <CTAButton action={action} key={`${action.label}-${action.to ?? action.href}`} />)}
      </div>
    </section>
  );
}

export function CommercialBoundary({ current }: { current: CommercialBoundaryKind }) {
  const items: Array<{ kind: CommercialBoundaryKind; to: string; action: string }> = [
    { kind: "license", to: "/licencias", action: PUBLIC_ACTION_LABELS.licenses },
    { kind: "addon", to: "/addons", action: PUBLIC_ACTION_LABELS.addons },
    { kind: "service", to: "/servicios", action: PUBLIC_ACTION_LABELS.services },
  ];

  return (
    <section aria-labelledby="commercial-boundary-title" className="public-v2-commercial-boundary">
      <div className="public-v2-commercial-boundary__heading">
        <p className="eyebrow">CADA COSA TIENE SU LUGAR</p>
        <h2 id="commercial-boundary-title">Cada necesidad tiene su lugar.</h2>
      </div>
      <div className="public-v2-commercial-boundary__grid">
        {items.map(({ kind, to, action }) => {
          const copy = COMMERCIAL_BOUNDARY_COPY[kind];
          return (
            <div key={kind}>
              <span>{copy.eyebrow}</span>
              <strong>{copy.title}</strong>
              <p>→ {copy.label}</p>
              {current === kind ? <span className="public-v2-commercial-boundary__current">Estás aquí</span> : <Link className="text-link" to={to}>{action} <span aria-hidden="true">→</span></Link>}
            </div>
          );
        })}
      </div>
      <p className="public-v2-commercial-boundary__note">{COMMERCIAL_EXTERNAL_COSTS}</p>
    </section>
  );
}

export function EmptyState({
  eyebrow = "SIN RESULTADOS",
  title,
  children,
  actions = [],
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions?: CTAAction[];
}) {
  return (
    <section aria-live="polite" className="public-v2-empty">
      <img alt="" aria-hidden="true" className="public-v2-empty__asset" height={1254} loading="lazy" src={publicAssets.icons.vecidyaPin} width={1254} />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <div className="public-v2-empty__body">{children}</div>
        {actions.length ? <div className="public-actions">{actions.map((action) => <CTAButton action={action} key={`${action.label}-${action.to ?? action.href}`} />)}</div> : null}
      </div>
    </section>
  );
}

export function ServiceCard({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow?: string;
  title: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <article className="public-v2-card public-v2-service-card">
      {icon ? <img alt="" aria-hidden="true" className="public-v2-service-card__icon" height={48} src={icon} width={48} /> : null}
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}

export function DiagnosticChoice({
  icon,
  label,
  description,
  profile,
}: {
  icon: string;
  label: string;
  description: string;
  /** Perfil del Diagnóstico que esta puerta preselecciona (contrato `/diagnostico?perfil=`). */
  profile: ProfileId;
}) {
  return (
    <Link className="home-diagnostic-choice" to={buildDiagnosticPath({ profile })}>
      <span className="home-diagnostic-choice__icon"><img alt="" aria-hidden="true" height={48} src={icon} width={48} /></span>
      <span><strong>{label}</strong><small>{description}</small></span>
      <span aria-hidden="true" className="home-diagnostic-choice__arrow">→</span>
    </Link>
  );
}

export function VisualSection({
  eyebrow,
  title,
  children,
  visual,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <section className="public-v2-section public-v2-section--visual">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <div className="public-v2-section__body">{children}</div>
      </div>
      {visual ? <aside className="public-v2-visual">{visual}</aside> : null}
    </section>
  );
}

export function AssetVisual({
  src,
  alt = "",
  frame = "standard",
  width,
  height,
}: {
  src: string;
  alt?: string;
  frame?: "standard" | "soft" | "none";
  width: number;
  height: number;
}) {
  return (
    <figure className={`asset-visual asset-visual--${frame}`}>
      <img alt={alt} height={height} loading="lazy" src={src} width={width} />
    </figure>
  );
}

export function BusinessCardV2({ profile }: { profile: BusinessCardProfile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const tags = profile.offerings.slice(0, 3);

  return (
    <article className="public-v2-business-card">
      <div className="public-v2-business-card__identity" style={profile.coverUrl ? { backgroundImage: `linear-gradient(rgb(255 255 255 / 44%), rgb(255 255 255 / 44%)), url(${JSON.stringify(profile.coverUrl)})` } : undefined}>
        {profile.logoUrl ? (
          <img alt={`Logo de ${profile.displayName}`} height={160} loading="lazy" src={profile.logoUrl} width={160} />
        ) : (
          <img alt="" aria-hidden="true" className="public-v2-business-card__fallback-asset" height={1254} loading="lazy" src={publicAssets.icons.storefrontVerified} width={1254} />
        )}
      </div>
      <div className="public-v2-business-card__content">
        <p className="eyebrow">{profile.category ?? "NEGOCIO LOCAL"}</p>
        <h2><Link to={`/vecindario/${profile.slug}`}>{profile.displayName}</Link></h2>
        <div className="public-v2-business-card__facts">
          {location ? <p className="public-v2-business-card__location">{location}</p> : null}
          {profile.serviceArea ? <p className="public-v2-business-card__location">Atiende: {profile.serviceArea}</p> : null}
          {profile.serviceMode && profile.serviceMode in serviceModeLabels ? <p className="public-v2-business-card__location">{serviceModeLabels[profile.serviceMode]}</p> : null}
        </div>
        <p className="public-v2-business-card__summary">{profile.shortDescription}</p>
        <ul aria-label="Servicios y productos publicados" className="directory-card-offerings">
          {tags.map(({ kind, title }) => <li key={`${kind}:${title}`}>{title}</li>)}
        </ul>
        {profile.moduleLabels.length ? <p className="directory-card-modules">Secciones: {profile.moduleLabels.join(" · ")}</p> : null}
        <Link className="directory-card__link" to={`/vecindario/${profile.slug}`}>Ver perfil<span aria-hidden="true"> →</span></Link>
      </div>
    </article>
  );
}

export function SearchFilters({
  filters,
  categories,
  cities,
  serviceAreas,
  serviceModes,
  offeringKinds,
  modules,
}: {
  filters: NeighborhoodFilters;
  categories: string[];
  cities: string[];
  serviceAreas: string[];
  serviceModes: string[];
  offeringKinds: NeighborhoodOfferingKind[];
  modules: { type: MiniWebModuleType; label: string }[];
}) {
  const hasFilters = Boolean(filters.q || filters.category || filters.city || filters.serviceArea || filters.serviceMode || filters.offering || filters.module);

  return (
    <form className="directory-filters public-v2-search-filters" method="get">
      <label className="directory-search-field"><span>Buscar nombre, categoría u oferta</span><span className="directory-search-input"><svg aria-hidden="true" className="directory-search-icon" fill="none" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg><input defaultValue={filters.q} name="q" placeholder="Ej. diseño, asesoría, Bogotá" type="search" /></span></label>
      <label>Categoría<select defaultValue={filters.category ?? ""} name="category"><option value="">Todas</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>Ciudad<select defaultValue={filters.city ?? ""} name="city"><option value="">Todas</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
      {serviceAreas.length ? <label>Área de servicio<select defaultValue={filters.serviceArea ?? ""} name="serviceArea"><option value="">Todas</option>{serviceAreas.map((area) => <option key={area} value={area}>{area}</option>)}</select></label> : null}
      {serviceModes.length ? <label>Modalidad<select defaultValue={filters.serviceMode ?? ""} name="serviceMode"><option value="">Todas</option>{serviceModes.map((mode) => <option key={mode} value={mode}>{serviceModeLabels[mode] ?? mode}</option>)}</select></label> : null}
      {offeringKinds.length ? <label>Ofrece<select defaultValue={filters.offering ?? ""} name="offering"><option value="">Todo</option>{offeringKinds.map((kind) => <option key={kind} value={kind}>{kind === "service" ? "Servicios" : "Productos"}</option>)}</select></label> : null}
      {modules.length ? <label>Sección visible<select defaultValue={filters.module ?? ""} name="module"><option value="">Cualquiera</option>{modules.map(({ type, label }) => <option key={type} value={type}>{label}</option>)}</select></label> : null}
      <button className="button button--primary" type="submit">Buscar</button>
      {hasFilters ? <Link className="button button--secondary" to="/vecindario">Limpiar</Link> : null}
    </form>
  );
}
