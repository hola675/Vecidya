import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { compactBusinessHours, type BusinessHoursEntry } from "../../db/business-hours-rules";
import { serviceModeLabels } from "../../db/business-profile-rules";

import type { ReactNode } from "react";

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
};

type PublicBusinessProfile = BusinessCardProfile & {
  description: string | null;
  phone: string | null;
  publicEmail: string | null;
  websiteUrl: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  serviceMode: string | null;
  serviceArea: string | null;
  verificationStatus?: string;
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
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions: CTAAction[];
  tone?: "light" | "dark";
}) {
  return (
    <section className={`public-v2-cta public-v2-cta--${tone}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <div className="public-v2-cta__body">{children}</div>
      <div className="public-actions">
        {actions.map((action) => <CTAButton action={action} key={`${action.label}-${action.to ?? action.href}`} />)}
      </div>
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
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="public-v2-card public-v2-service-card">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
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
      {visual ? <aside className="public-v2-visual" aria-hidden="true">{visual}</aside> : null}
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

  return (
    <article className="public-v2-business-card">
      <div className="public-v2-business-card__identity">
        {profile.logoUrl ? (
          <img alt={`Logo de ${profile.displayName}`} src={profile.logoUrl} />
        ) : (
          <img alt="" aria-hidden="true" className="public-v2-business-card__fallback-asset" height={1254} loading="lazy" src={publicAssets.icons.storefrontVerified} width={1254} />
        )}
      </div>
      <div className="public-v2-business-card__content">
        <p className="eyebrow">{profile.category ?? "NEGOCIO LOCAL"}</p>
        <h2><Link to={`/vecindario/${profile.slug}`}>{profile.displayName}</Link></h2>
        {location ? <p className="public-v2-business-card__location">{location}</p> : null}
        {profile.shortDescription ? <p>{profile.shortDescription}</p> : null}
        <Link className="directory-card__link" to={`/vecindario/${profile.slug}`}>Ver perfil<span aria-hidden="true"> →</span></Link>
      </div>
    </article>
  );
}

export function PublicBusinessHeader({ profile }: { profile: PublicBusinessProfile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <section className="public-business-profile__header">
      <div className="public-business-profile__identity">
        {profile.logoUrl ? (
          <img alt={`Logo de ${profile.displayName}`} src={profile.logoUrl} />
        ) : (
          <img alt="" aria-hidden="true" className="public-business-profile__fallback-asset" height={1254} src={publicAssets.icons.storefrontVerified} width={1254} />
        )}
      </div>
      <div>
        <p className="eyebrow">{profile.category ?? "NEGOCIO LOCAL"}</p>
        <h1>{profile.displayName}</h1>
        {profile.verificationStatus === "verified" ? (
          <p className="public-business-profile__verified">✓ Perfil verificado por Vecidya</p>
        ) : null}
        {location ? <p className="public-business-profile__location">{location}</p> : null}
        {profile.shortDescription ? <p className="public-business-profile__summary">{profile.shortDescription}</p> : null}
      </div>
    </section>
  );
}

export function PublicBusinessContact({ profile }: { profile: PublicBusinessProfile }) {
  const hasContact = Boolean(profile.whatsapp || profile.phone || profile.publicEmail || profile.websiteUrl);
  const primaryChannel = profile.whatsapp ? "whatsapp" : profile.phone ? "phone" : profile.websiteUrl ? "website" : null;
  const socialLinks = [
    profile.instagramUrl ? { label: "Instagram", href: profile.instagramUrl } : null,
    profile.facebookUrl ? { label: "Facebook", href: profile.facebookUrl } : null,
    profile.linkedinUrl ? { label: "LinkedIn", href: profile.linkedinUrl } : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  return (
    <section className="public-v2-card public-business-profile__contact">
      <p className="eyebrow">CONTACTO</p>
      <h2>Canales disponibles</h2>
      {hasContact ? (
        <div className="public-actions">
          {profile.whatsapp ? (
            <a className={`button button--${primaryChannel === "whatsapp" ? "primary" : "secondary"}`} href={`https://wa.me/${profile.whatsapp.replace("+", "")}`} rel="noreferrer" target="_blank">
              Escribir por WhatsApp
            </a>
          ) : null}
          {profile.phone ? (
            <a className={`button button--${primaryChannel === "phone" ? "primary" : "secondary"}`} href={`tel:${profile.phone}`}>Llamar</a>
          ) : null}
          {profile.websiteUrl ? (
            <a className={`button button--${primaryChannel === "website" ? "primary" : "secondary"}`} href={profile.websiteUrl} rel="noreferrer" target="_blank">Visitar sitio web</a>
          ) : null}
          {profile.publicEmail ? <a className="button button--secondary" href={`mailto:${profile.publicEmail}`}>Enviar email</a> : null}
        </div>
      ) : (
        <p>Este perfil todavía no tiene canales públicos de contacto. Puedes volver al Vecindario para explorar otros negocios.</p>
      )}
      {socialLinks.length ? (
        <div className="public-business-profile__social-links">
          <p className="eyebrow">PRESENCIA DIGITAL</p>
          <div className="public-actions">
            {socialLinks.map((link) => (
              <a className="button button--light" href={link.href} key={link.label} rel="noreferrer" target="_blank">{link.label}</a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function PublicBusinessDetails({ profile }: { profile: PublicBusinessProfile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const details = [
    ["Categoría", profile.category],
    ["Ubicación", location],
    ["Cómo atiende", profile.serviceMode ? serviceModeLabels[profile.serviceMode] : null],
    ["Cobertura", profile.serviceArea],
    ["Teléfono", profile.phone],
    ["Email", profile.publicEmail],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  if (!details.length) return null;

  return (
    <section className="public-v2-card public-business-profile__details">
      <p className="eyebrow">DETALLES</p>
      <h2>Información publicada</h2>
      <dl>
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function PublicBusinessHours({ hours }: { hours: BusinessHoursEntry[] }) {
  const lines = compactBusinessHours(hours);
  if (!lines.length) return null;

  return (
    <section className="public-v2-card public-business-profile__hours">
      <p className="eyebrow">HORARIOS</p>
      <h2>Cuándo atiende</h2>
      <ul>
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </section>
  );
}

export function SearchFilters({
  filters,
  categories,
  cities,
}: {
  filters: { q?: string; category?: string; city?: string };
  categories: string[];
  cities: string[];
}) {
  const hasFilters = Boolean(filters.q || filters.category || filters.city);

  return (
    <form className="directory-filters public-v2-search-filters" method="get">
      <label>Buscar por nombre<input defaultValue={filters.q} name="q" placeholder="Ej. cafetería, taller, barbería" type="search" /></label>
      <label>Categoría<select defaultValue={filters.category ?? ""} name="category"><option value="">Todas</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>Ciudad<select defaultValue={filters.city ?? ""} name="city"><option value="">Todas</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
      <button className="button button--primary" type="submit">Buscar</button>
      {hasFilters ? <Link className="button button--secondary" to="/vecindario">Limpiar</Link> : null}
    </form>
  );
}
