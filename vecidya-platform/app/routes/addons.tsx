import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CommercialBoundary, CTASection } from "../components/public-v2";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/addons";

type Addon = {
  id: string;
  name: string;
  value: string;
  price: string;
  dependency?: string;
  icon: string;
};

const addons: Addon[] = [
  { id: "whatsapp-business", name: "WhatsApp Business", value: "Centraliza conversaciones y próximos pasos.", price: "$9/mes + uso", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.whatsapp },
  { id: "telephony-sms", name: "Telefonía & SMS", value: "Conecta llamadas, recordatorios y mensajes.", price: "$9/mes + uso", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.telefonia },
  { id: "reputation-reviews", name: "Reputación & Reseñas", value: "Haz más constante la solicitud de reseñas.", price: "$12/mes", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.automatizaciones },
  { id: "campaigns-diffusion", name: "Campañas & Difusión", value: "Mantén informada a tu comunidad.", price: "$15/mes + uso", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.sms },
  { id: "conversational-ai", name: "IA Conversacional", value: "Asiste respuestas y clasificación inicial.", price: "$15/mes + uso", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.aiConversacional },
  { id: "voice-ai", name: "IA de Voz", value: "Atiende conversaciones iniciales por voz.", price: "$20/mes + uso", dependency: "Requiere Barrio o Ciudad", icon: publicAssets.catalog.addons.aiVoice },
  { id: "connections-integrations", name: "Conexiones & Integraciones", value: "Conecta Vecidya con otras herramientas.", price: "$12/mes/conexión + uso", icon: publicAssets.catalog.addons.integraciones },
];

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
          <aside aria-label="Cómo funciona un addon" className="addons-hero__formula">
            <div><span>BASE</span><strong>Licencia Vecidya</strong></div>
            <div aria-hidden="true" className="addons-hero__operator">+</div>
            <div><span>CAPACIDAD</span><strong>Addon específico</strong></div>
            <div aria-hidden="true" className="addons-hero__operator">↓</div>
            <div className="addons-hero__result"><span>RESULTADO</span><strong>Una nueva capacidad para tu momento.</strong></div>
          </aside>
        </section>

        <section aria-labelledby="addons-list-title" className="addons-list">
          <div className="addons-section-heading">
            <p className="eyebrow">SIETE COMPLEMENTOS V1</p>
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
                  <p className="addon-card__price">{addon.price}</p>
                  {addon.dependency ? <p className="addon-card__dependency">{addon.dependency}</p> : null}
                  <Link className="text-link" to={`/contacto?interes=complemento-${addon.id}`}>Consultar {addon.name} <span aria-hidden="true">→</span></Link>
                </article>
            ))}
          </div>
          <div className="addons-price-note"><strong>Costes de uso</strong><p>Algunos canales y proveedores cobran según mensajes, llamadas, IA, envíos o APIs. Estos costes se muestran aparte del precio Vecidya.</p></div>
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
