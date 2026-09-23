import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/addons";

type Addon = {
  id: string;
  category: string;
  name: string;
  problem: string;
  solution: string;
  icon: string;
};

const categories = [
  {
    id: "comunicacion",
    eyebrow: "CONECTAR",
    title: "Comunicación",
    description: "Para negocios que necesitan gestionar conversaciones y seguimiento con más claridad.",
    addons: ["WhatsApp Business", "SMS", "Telefonía"],
  },
  {
    id: "automatizacion",
    eyebrow: "SIMPLIFICAR",
    title: "Automatización",
    description: "Para reducir tareas repetitivas y sostener procesos que ya tienen un patrón.",
    addons: ["Workflows", "Recordatorios", "Procesos automáticos", "Integraciones"],
  },
  {
    id: "inteligencia-artificial",
    eyebrow: "ASISTIR",
    title: "Inteligencia Artificial",
    description: "Para ayudar en conversaciones, atención inicial y clasificación de necesidades.",
    addons: ["IA conversacional", "AI Voice"],
  },
  {
    id: "integraciones",
    eyebrow: "CONECTAR SISTEMAS",
    title: "Integraciones",
    description: "Para conectar la operación con otras herramientas cuando el flujo lo requiere.",
    addons: ["APIs", "Sistemas externos", "Conexiones personalizadas"],
  },
] as const;

const addons: Addon[] = [
  {
    id: "whatsapp",
    category: "COMUNICACIÓN",
    name: "WhatsApp",
    problem: "Las conversaciones están dispersas y el seguimiento depende de mensajes sueltos.",
    solution: "Centraliza la comunicación y conecta cada conversación con el siguiente paso del proceso.",
    icon: publicAssets.icons.diagnosticBusiness,
  },
  {
    id: "sms",
    category: "COMUNICACIÓN",
    name: "SMS",
    problem: "Necesitas enviar avisos o seguimientos breves a través de mensajes de texto.",
    solution: "Añade una vía directa para recordatorios y comunicaciones puntuales.",
    icon: publicAssets.icons.diagnosticProfessional,
  },
  {
    id: "telefonia",
    category: "COMUNICACIÓN",
    name: "Telefonía",
    problem: "Pierdes contexto cuando las llamadas y los datos del proceso viven separados.",
    solution: "Organiza la gestión de llamadas y números dentro del flujo acordado.",
    icon: publicAssets.icons.diagnosticProject,
  },
  {
    id: "automatizaciones",
    category: "AUTOMATIZACIÓN",
    name: "Automatizaciones",
    problem: "Las tareas repetitivas consumen tiempo y dependen de que alguien las recuerde.",
    solution: "Crea procesos automáticos para sostener recordatorios, reglas y seguimientos.",
    icon: publicAssets.icons.serviceStructure,
  },
  {
    id: "ai-conversacional",
    category: "INTELIGENCIA ARTIFICIAL",
    name: "IA conversacional",
    problem: "Quieres responder o clasificar conversaciones sin perder el criterio humano.",
    solution: "Añade asistencia para respuestas iniciales, clasificación y orientación de conversaciones.",
    icon: publicAssets.icons.serviceDigitalPresence,
  },
  {
    id: "ai-voice",
    category: "INTELIGENCIA ARTIFICIAL",
    name: "AI Voice",
    problem: "Pierdes llamadas cuando no puedes responder o atender una primera conversación.",
    solution: "Un asistente virtual puede atender conversaciones iniciales y ayudar con la gestión.",
    icon: publicAssets.icons.serviceVisibility,
  },
  {
    id: "integraciones-externas",
    category: "INTEGRACIONES",
    name: "Integraciones",
    problem: "Tu operación necesita conectar Vecidya con otra herramienta o sistema.",
    solution: "Diseña una conexión externa con alcance, datos y responsabilidades definidos.",
    icon: publicAssets.icons.storefrontVerified,
  },
];

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Addons Vecidya",
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
            <p className="eyebrow">ADDONS VECIDYA</p>
            <h1 id="addons-title">Amplía tu sistema cuando tu negocio lo necesite.</h1>
            <p>Una licencia Vecidya te da una base organizada. Los addons permiten incorporar capacidades adicionales para necesidades específicas, sin convertir cada herramienta en una nueva licencia.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">Encontrar qué necesito</Link>
              <Link className="button button--secondary" to="/licencias">Ver licencias</Link>
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

        <section aria-labelledby="addons-definition-title" className="addons-definition public-v2-section">
          <div>
            <p className="eyebrow">UNA CAPACIDAD ADICIONAL</p>
            <h2 id="addons-definition-title">¿Qué es un addon?</h2>
          </div>
          <div className="addons-definition__content">
            <p>Un addon es una capacidad adicional que puedes incorporar a una licencia cuando aparece una necesidad concreta. No tienes que cambiar de licencia para resolver cada necesidad específica.</p>
            <dl>
              <div><dt>Se suma a</dt><dd>Una base Vecidya que ya existe.</dd></div>
              <div><dt>Se activa por</dt><dd>Una necesidad real y un alcance definido.</dd></div>
              <div><dt>No incluye</dt><dd>Consumos externos, volumen ilimitado o trabajo personalizado automático.</dd></div>
            </dl>
          </div>
        </section>

        <section aria-labelledby="addons-categories-title" className="addons-categories">
          <div className="addons-section-heading">
            <p className="eyebrow">CUATRO PUERTAS</p>
            <h2 id="addons-categories-title">Elige la capacidad según el problema que quieres resolver.</h2>
            <p>No es un catálogo infinito. Son cuatro formas de ampliar el sistema cuando el negocio lo necesita.</p>
          </div>
          <div className="addons-category-grid">
            {categories.map((category) => (
              <a className="addons-category" href={`#${category.id}`} key={category.id}>
                <p className="eyebrow">{category.eyebrow}</p>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <span aria-hidden="true">↓</span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="addons-list-title" className="addons-list">
          <div className="addons-section-heading">
            <p className="eyebrow">CAPACIDADES DISPONIBLES</p>
            <h2 id="addons-list-title">Agrega solo lo que tenga sentido para tu operación.</h2>
          </div>
          <div className="addons-grid">
            {addons.map((addon) => (
              <article className="addon-card" id={addon.id} key={addon.id}>
                <div className="addon-card__top">
                  <img alt="" aria-hidden="true" height={48} src={addon.icon} width={48} />
                  <p className="eyebrow">{addon.category}</p>
                </div>
                <h3>{addon.name}</h3>
                <div className="addon-card__problem"><span>EL PROBLEMA</span><p>{addon.problem}</p></div>
                <div className="addon-card__solution"><span>LA CAPACIDAD</span><p>{addon.solution}</p></div>
                <p className="addon-card__availability">Disponible según necesidad</p>
              </article>
            ))}
          </div>
          <p className="addons-price-note">Los addons no tienen precios publicados en esta fase. Su coste depende del proveedor, la configuración, el volumen y los consumos externos aplicables.</p>
        </section>

        <section aria-labelledby="addons-choice-title" className="addons-choice">
          <div className="addons-section-heading">
            <p className="eyebrow">NO TODO ES UN ADDON</p>
            <h2 id="addons-choice-title">Cada necesidad tiene su lugar.</h2>
          </div>
          <div className="addons-choice__grid">
            <div><span>BASE DEL SISTEMA</span><strong>Si necesitas una base organizada</strong><p>→ Licencia</p><Link className="text-link" to="/licencias">Ver licencias <span aria-hidden="true">→</span></Link></div>
            <div><span>CAPACIDAD ADICIONAL</span><strong>Si necesitas ampliar una capacidad</strong><p>→ Addon</p><span className="addons-choice__current">Estás aquí</span></div>
            <div><span>TRABAJO PERSONALIZADO</span><strong>Si necesitas construir algo específico</strong><p>→ Servicio</p><Link className="text-link" to="/servicios">Ver servicios <span aria-hidden="true">→</span></Link></div>
          </div>
          <p className="addons-choice__note">Los consumos variables de WhatsApp, SMS, llamadas, números, email, IA o publicidad se mantienen separados del addon.</p>
        </section>

        <CTASection
          actions={[{ label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" }, { label: "Contactar", to: "/contacto", variant: "secondary" }]}
          eyebrow="NO TIENES QUE ELEGIR SOLO"
          title="Encuentra la capacidad que tu negocio realmente necesita."
          tone="dark"
        >
          <p>El diagnóstico te ayuda a ubicar si necesitas una licencia, un addon o un servicio personalizado.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
