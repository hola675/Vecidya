import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CommercialBoundary, CTASection } from "../components/public-v2";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { ADDON_OFFERS, APPROVED_ADDON_PRICES } from "../content/commercial-detail";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { PublicHeroArt } from "../components/public-hero-art";

import type { Route } from "./+types/addons";

const addonIcons = {
  "whatsapp-business": publicAssets.catalog.addons.whatsapp,
  "telephony-sms": publicAssets.catalog.addons.telefonia,
  "reputation-reviews": publicAssets.catalog.addons.automatizaciones,
  "campaigns-diffusion": publicAssets.catalog.addons.sms,
  "conversational-ai": publicAssets.catalog.addons.aiConversacional,
  "voice-ai": publicAssets.catalog.addons.aiVoice,
  "connections-integrations": publicAssets.catalog.addons.integraciones,
} as const;

const addons = ADDON_OFFERS.map((offer) => ({
  id: offer.id,
  name: offer.title,
  value: offer.promise,
  benefit: offer.benefits[0],
  price: offer.price.replace("USD ", "$"),
  dependency: offer.id === "connections-integrations" ? "Según sistema y licencia" : "Requiere Barrio o Ciudad",
  icon: addonIcons[offer.id as keyof typeof addonIcons],
  detailPath: offer.detailPath,
}));

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Complementos Vecidya",
    "Amplía tu sistema Vecidya con capacidades adicionales para comunicación, automatización, inteligencia artificial e integraciones.",
    "/addons",
  );
}

export default function Addons() {
  return (
    <PublicLayout>
      <main className="public-page addons-page">
        <section aria-labelledby="addons-title" className="addons-hero">
          <div className="addons-hero__copy">
            <p className="eyebrow">COMPLEMENTOS</p>
            <h1 id="addons-title">Añade capacidades cuando las necesites.</h1>
            <p>Revisa qué aporta cada complemento, qué licencia puede requerir y qué costes de uso se cobran aparte.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnosticDiscovery}</Link>
              <Link className="button button--secondary" to="/licencias">{PUBLIC_ACTION_LABELS.licenses}</Link>
            </div>
          </div>
          <div className="addons-hero__visual">
            <PublicHeroArt page="addons" />
            <div className="addons-hero__formula">
              <div><span>BASE</span><strong>Licencia Vecidya</strong></div>
              <div aria-hidden="true" className="addons-hero__operator">+</div>
              <div><span>CAPACIDAD</span><strong>Complemento específico</strong></div>
              <div aria-hidden="true" className="addons-hero__operator">↓</div>
              <div className="addons-hero__result"><span>RESULTADO</span><strong>Una nueva capacidad para tu momento.</strong></div>
            </div>
          </div>
        </section>

        <section aria-labelledby="addons-list-title" className="addons-list">
          <div className="addons-section-heading addons-section-heading--catalog">
            <div>
              <p className="eyebrow">CAPACIDADES ADICIONALES</p>
              <h2 id="addons-list-title">Una capacidad por necesidad.</h2>
            </div>
            <div className="addons-price-note">
              <strong>Costes de uso</strong>
              <p>La cuota fija del addon es independiente de mensajes, llamadas, emails, IA y otros consumos. Estos se facturan según uso real y tarifa aplicable, sin recargo automático del 25 % sobre el consumo. El cobro se coordina mediante un servicio externo; no hay pago automático aquí.</p>
            </div>
          </div>
          <div className="addons-grid">
            {addons.map((addon) => (
                <article className="addon-card" id={addon.id} key={addon.id}>
                  <div className="addon-card__top">
                    <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--feature" height={112} src={addon.icon} width={128} />
                  </div>
                  <h3>{addon.name}</h3>
                  <p className="addon-card__value">{addon.value}</p>
                  <p className="addon-card__benefit"><strong>Ventaja:</strong> {addon.benefit}</p>
                  <p className="addon-card__price">{addon.price}</p>
                  {addon.dependency ? <p className="addon-card__dependency">{addon.dependency}</p> : null}
                  <div className="addon-card__actions">
                    <Link className="button button--primary" to={addon.detailPath}>Ver detalles de {addon.name} <span aria-hidden="true">→</span></Link>
                    <Link className="button button--secondary" to={`/contacto?interes=complemento-${addon.id}`}>Consultar este complemento</Link>
                  </div>
                </article>
            ))}
          </div>
        </section>

        <section className="public-v2-section" aria-labelledby="approved-addon-prices-title">
          <div className="addons-section-heading">
            <div>
              <p className="eyebrow">TARIFAS APROBADAS</p>
              <h2 id="approved-addon-prices-title">Cuotas mensuales de addons específicos.</h2>
              <p>Precios en USD. Se activan únicamente cuando corresponden a tu negocio y están disponibles en el plan técnico contratado.</p>
            </div>
          </div>
          <div className="licenses-compare-table-wrap" role="region" tabIndex={0} aria-label="Precios mensuales de addons Vecidya">
            <table className="licenses-compare-table">
              <thead><tr><th scope="col">Addon</th><th scope="col">Cuota</th><th scope="col">Condiciones</th></tr></thead>
              <tbody>{APPROVED_ADDON_PRICES.map((item) => (
                <tr key={item.name}><th scope="row">{item.name}</th><td>{`USD ${item.priceUsd.toFixed(2)}/mes`}</td><td>{item.note}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p>Telefonía, SMS, email y acciones sin cuota fija de addon se cobran según consumo real. Las campañas gestionadas, integraciones a medida y configuraciones extraordinarias se presupuestan como servicios profesionales.</p>
          <p>Los importes publicados se confirman antes de contratar si el proveedor cambia sus tarifas o condiciones. La activación y el cobro se coordinan por contacto, no mediante compra automática.</p>
          <Link className="text-link" to="/contacto">Consultar disponibilidad y contratación <span aria-hidden="true">→</span></Link>
        </section>

        <CommercialBoundary current="addon" />

        <CTASection
          actions={[{ label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" }, { label: PUBLIC_ACTION_LABELS.contact, to: "/contacto", variant: "secondary" }]}
          eyebrow="NO TIENES QUE ELEGIR SOLO"
          title="Encuentra la capacidad que tu negocio realmente necesita."
          tone="dark"
        >
          <p>{DIAGNOSTIC_CTA_COPY}</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
