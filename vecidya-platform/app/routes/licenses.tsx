import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";

import type { Route } from "./+types/licenses";

type License = {
  id: "cuadra" | "barrio" | "ciudad";
  name: string;
  objective: string;
  idealFor: string;
  marker: string;
  icon: string;
  includes: string[];
  level: string;
  priceUsd: number;
  activationUsd: number;
};

// Precios de referencia de docs/business/VECIDYA_PRODUCT_CATALOG.md, confirmados por el usuario
// el 2026-09-25 como precio público real (no un checkout: activación sigue siendo por contacto).
const licenses: License[] = [
  {
    id: "cuadra",
    name: "Cuadra",
    objective: "Organiza.",
    idealFor: "Para organizar presencia, información y prioridades.",
    marker: "C",
    icon: publicAssets.catalog.plans.cuadra,
    includes: ["Presencia organizada", "Información y prioridades", "Base Vecidya", "Acompañamiento inicial"],
    level: "Base",
    priceUsd: 39,
    activationUsd: 0,
  },
  {
    id: "barrio",
    name: "Barrio",
    objective: "Capta y da seguimiento.",
    idealFor: "Para consultas, oportunidades y seguimiento recurrente.",
    marker: "B",
    icon: publicAssets.catalog.plans.barrio,
    includes: ["CRM comercial", "Pipeline", "Calendario", "Captación", "Seguimiento"],
    level: "Crecimiento",
    priceUsd: 59,
    activationUsd: 10,
  },
  {
    id: "ciudad",
    name: "Ciudad",
    objective: "Automatiza y controla.",
    idealFor: "Para varios procesos, equipos y routing coordinado.",
    marker: "C",
    icon: publicAssets.catalog.plans.ciudad,
    includes: ["Todo Barrio", "Routing", "Handoffs", "Automatización multiproceso", "Control operativo"],
    level: "Escala",
    priceUsd: 89,
    activationUsd: 15,
  },
];

const comparisonRows = [
  { label: "Objetivo", values: ["Ordenar", "Captar", "Automatizar"] },
  { label: "Etapa", values: ["Inicio", "Crecimiento", "Escala"] },
  { label: "Organización", values: ["Base", "Base", "Base"] },
  { label: "Seguimiento CRM", values: ["No incluido", "Estándar", "Avanzado"] },
  { label: "Automatizaciones CRM", values: ["No incluidas", "Estándar", "Avanzadas"] },
] as const;

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Licencias Vecidya",
    "Conoce las licencias Vecidya y el nivel de sistema que corresponde a cada etapa de tu negocio.",
    "/licencias",
  );
}

export default function Licenses() {
  return (
    <PublicLayout>
      <main className="public-page licenses-page">
        <section aria-labelledby="licenses-title" className="licenses-hero">
          <div className="licenses-hero__copy">
            <p className="eyebrow">LICENCIAS VECIDYA</p>
            <h1 id="licenses-title">Elige tu sistema base.</h1>
            <p>Cuadra, Barrio o Ciudad. Tres formas de organizar, captar o controlar tu operación.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">Encontrar mi punto de partida</Link>
              <Link className="button button--secondary" to="/servicios">{PUBLIC_ACTION_LABELS.services}</Link>
            </div>
          </div>
          <aside aria-label="Evolución de las licencias" className="licenses-hero__path">
            <div className="licenses-hero__path-item"><span>01</span><strong>Organizar</strong><small>Cuadra</small></div>
            <div aria-hidden="true" className="licenses-hero__path-line" />
            <div className="licenses-hero__path-item"><span>02</span><strong>Seguir</strong><small>Barrio</small></div>
            <div aria-hidden="true" className="licenses-hero__path-line" />
            <div className="licenses-hero__path-item"><span>03</span><strong>Escalar</strong><small>Ciudad</small></div>
          </aside>
        </section>

        <section aria-labelledby="licenses-levels-title" className="licenses-levels">
          <div className="licenses-section-heading">
            <p className="eyebrow">TRES MOMENTOS</p>
            <h2 id="licenses-levels-title">Tres productos. Una decisión clara.</h2>
            <p className="licenses-price-note">Precios públicos en USD. La activación se coordina por contacto.</p>
          </div>
          <div className="licenses-grid">
            {licenses.map((license, index) => (
              <article className={`license-card license-card--${license.id}`} id={license.id} key={license.id}>
                <div className="license-card__top">
                  <span aria-hidden="true" className="license-card__marker">{license.marker}{index + 1}</span>
                  <div className="license-card__image-frame">
                    <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--plan" height={180} src={license.icon} width={144} />
                  </div>
                </div>
                <p className="eyebrow">{license.level}</p>
                <h3>{license.name}</h3>
                <p className="license-card__price">{`USD ${license.priceUsd}/mes`}</p>
                <p className="license-card__objective">{license.objective}</p>
                <p className="license-card__ideal">{license.idealFor}</p>
                <div className="license-card__includes">
                  <strong>Capacidades</strong>
                  <ul>{license.includes.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
                </div>
                <p className="license-card__activation">Puesta en marcha ${license.activationUsd} una vez</p>
                <Link className="license-card__availability" to="/contacto">Empezar con {license.name} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="licenses-compare-title" className="licenses-comparison public-v2-section">
          <div className="licenses-section-heading">
            <p className="eyebrow">A SIMPLE VISTA</p>
            <h2 id="licenses-compare-title">Compara el nivel de acompañamiento.</h2>
          </div>
          <div className="licenses-compare-table-wrap">
            <table className="licenses-compare-table">
              <caption className="sr-only">Comparación de capacidades entre Cuadra, Barrio y Ciudad</caption>
              <thead><tr><th scope="col">Capacidad</th>{licenses.map((license) => <th scope="col" key={license.id}>{license.name}</th>)}</tr></thead>
              <tbody>{comparisonRows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${licenses[index].id}`}>{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="licenses-compare-mobile">
            {licenses.map((license, licenseIndex) => (
              <details key={license.id}>
                <summary><span>{license.name}</span><small>{license.level}</small></summary>
                <dl>{comparisonRows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.values[licenseIndex]}</dd></div>)}</dl>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="licenses-addons-title" className="licenses-addons public-v2-section">
          <div>
            <p className="eyebrow">CAPACIDAD ADICIONAL</p>
            <h2 id="licenses-addons-title">Amplía tu sistema cuando lo necesites.</h2>
          </div>
          <div className="licenses-addons__content">
            <p>Los complementos añaden capacidades cuando realmente las necesitas.</p>
            <ul><li>WhatsApp</li><li>Inteligencia Artificial</li><li>Telefonía</li><li>Automatizaciones</li><li>Integraciones</li></ul>
            <Link className="text-link" to="/addons">Conoce los addons <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <CTASection
          actions={[{ label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" }, { label: PUBLIC_ACTION_LABELS.contact, to: "/contacto", variant: "secondary" }]}
          eyebrow="NO TIENES QUE DECIDIR SOLO"
          title="Encuentra el punto de partida que tiene sentido para ti."
          tone="dark"
        >
          <p>{DIAGNOSTIC_CTA_COPY}</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
