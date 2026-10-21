import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CommercialBoundary, CTASection } from "../components/public-v2";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { ADDON_OFFERS } from "../content/commercial-detail";
import { PublicLayout, publicMeta } from "../components/public-layout";

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
            <p>Activa canales y herramientas adicionales cuando aporten valor. Cada complemento tiene requisitos y costes propios; ninguno sustituye tu licencia base.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnosticDiscovery}</Link>
              <Link className="button button--secondary" to="/licencias">{PUBLIC_ACTION_LABELS.licenses}</Link>
            </div>
          </div>
          <aside aria-label="Cómo funciona un complemento" className="addons-hero__formula">
            <div><span>BASE</span><strong>Licencia Vecidya</strong></div>
            <div aria-hidden="true" className="addons-hero__operator">+</div>
            <div><span>CAPACIDAD</span><strong>Complemento específico</strong></div>
            <div aria-hidden="true" className="addons-hero__operator">↓</div>
            <div className="addons-hero__result"><span>RESULTADO</span><strong>Una nueva capacidad para tu momento.</strong></div>
          </aside>
        </section>

        <section aria-labelledby="addons-list-title" className="addons-list">
          <div className="addons-section-heading">
            <p className="eyebrow">SIETE CAPACIDADES COMPLEMENTARIAS</p>
            <h2 id="addons-list-title">Una capacidad por necesidad.</h2>
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
                  <div className="commercial-catalog__actions">
                    <Link className="text-link" to={addon.detailPath}>Ver detalles de {addon.name} <span aria-hidden="true">→</span></Link>
                    <Link className="text-link" to={`/contacto?interes=complemento-${addon.id}`}>Consultar {addon.name} <span aria-hidden="true">→</span></Link>
                  </div>
                </article>
            ))}
          </div>
          <div className="addons-price-note"><strong>Qué se cobra aparte</strong><p>Algunas funciones estándar ya forman parte de Barrio o Ciudad. Cuando un canal, IA o proveedor genera un coste real, se informa el consumo y el recargo comercial antes de contratar. No se cobran por duplicado las funciones incluidas en la licencia.</p></div>
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
