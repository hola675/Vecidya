import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { PublicLayout, publicMeta } from "../components/public-layout";

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
};

const licenses: License[] = [
  {
    id: "cuadra",
    name: "Cuadra",
    objective: "Ordenar el negocio.",
    idealFor: "Para un negocio que necesita una base organizada para empezar.",
    marker: "C",
    icon: publicAssets.icons.serviceStructure,
    includes: ["Perfil público", "Información organizada", "Contactos, notas y tareas", "Oportunidades y pipeline", "Calendario y capacidades base"],
    level: "Base",
  },
  {
    id: "barrio",
    name: "Barrio",
    objective: "Captar oportunidades y hacer seguimiento.",
    idealFor: "Para un negocio que necesita convertir consultas en procesos.",
    marker: "B",
    icon: publicAssets.icons.serviceDigitalPresence,
    includes: ["Todo Cuadra", "Formularios y landing estándar", "Agenda", "Automatizaciones estándar", "Seguimiento, posventa y reportes básicos"],
    level: "Crecimiento",
  },
  {
    id: "ciudad",
    name: "Ciudad",
    objective: "Automatizar y escalar.",
    idealFor: "Para un negocio con volumen y procesos repetitivos.",
    marker: "C",
    icon: publicAssets.icons.serviceVisibility,
    includes: ["Todo Barrio", "Automatización avanzada", "Segmentación y reactivación", "Procesos avanzados", "Control operativo"],
    level: "Escala",
  },
];

const comparisonRows = [
  { label: "Objetivo", values: ["Ordenar", "Captar", "Automatizar"] },
  { label: "Etapa", values: ["Inicio", "Crecimiento", "Escala"] },
  { label: "Organización", values: ["Base", "Base", "Base"] },
  { label: "Seguimiento", values: ["Básico", "Completo", "Operativo"] },
  { label: "Automatización", values: ["Inicial", "Estándar", "Avanzada"] },
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
            <h1 id="licenses-title">Una base digital que crece contigo.</h1>
            <p>Un negocio no necesita todas las herramientas desde el primer día. Necesita una base adecuada para su momento actual y un camino claro para evolucionar.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">Encontrar mi punto de partida</Link>
              <Link className="button button--secondary" to="/servicios">Ver servicios</Link>
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

        <section aria-labelledby="licenses-definition-title" className="licenses-definition public-v2-section">
          <div>
            <p className="eyebrow">UN SISTEMA CONTINUO</p>
            <h2 id="licenses-definition-title">¿Qué es una licencia Vecidya?</h2>
          </div>
          <div className="licenses-definition__grid">
            <p>Una licencia reúne capacidades digitales continuas para ayudarte a organizar, gestionar y evolucionar tu negocio.</p>
            <dl>
              <div><dt>Incluye</dt><dd>Capacidades del sistema, herramientas disponibles y un nivel de evolución.</dd></div>
              <div><dt>Se separa de</dt><dd>Servicios personalizados, consumos externos y trabajos especiales.</dd></div>
            </dl>
          </div>
        </section>

        <section aria-labelledby="licenses-levels-title" className="licenses-levels">
          <div className="licenses-section-heading">
            <p className="eyebrow">TRES MOMENTOS</p>
            <h2 id="licenses-levels-title">Elige la base que corresponde a tu momento.</h2>
            <p>No tienes que empezar con todo. Cada licencia responde a una necesidad distinta.</p>
            <p className="licenses-price-note">Aún no hay precios públicos ni contratación en línea. Consulta disponibilidad y condiciones para tu caso.</p>
          </div>
          <div className="licenses-grid">
            {licenses.map((license, index) => (
              <article className={`license-card license-card--${license.id}`} id={license.id} key={license.id}>
                <div className="license-card__top">
                  <span aria-hidden="true" className="license-card__marker">{license.marker}{index + 1}</span>
                  <img alt="" aria-hidden="true" height={56} src={license.icon} width={56} />
                </div>
                <p className="eyebrow">{license.level}</p>
                <h3>{license.name}</h3>
                <p className="license-card__objective">{license.objective}</p>
                <p className="license-card__ideal">{license.idealFor}</p>
                <Link className="license-card__availability" to="/contacto">Consultar disponibilidad <span aria-hidden="true">→</span></Link>
                <div className="license-card__includes">
                  <strong>Incluye</strong>
                  <ul>{license.includes.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
                </div>
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

        <section aria-labelledby="licenses-evolution-title" className="licenses-evolution">
          <div className="licenses-section-heading">
            <p className="eyebrow">CUANDO CAMBIA LA NECESIDAD</p>
            <h2 id="licenses-evolution-title">La evolución empieza con una señal real.</h2>
            <p>No subes para comprar más. Evolucionas cuando la base actual ya no resuelve lo que necesitas.</p>
          </div>
          <div className="licenses-evolution__steps">
            <div><span>CUADRA</span><strong>Necesito organizarme.</strong><small>Una base clara para saber qué existe y qué falta.</small></div>
            <div aria-hidden="true" className="licenses-evolution__arrow">↓</div>
            <div><span>BARRIO</span><strong>Necesito captar y seguir oportunidades.</strong><small>Un flujo para convertir consultas en seguimiento.</small></div>
            <div aria-hidden="true" className="licenses-evolution__arrow">↓</div>
            <div><span>CIUDAD</span><strong>Necesito automatizar y controlar.</strong><small>Procesos repetibles y una lectura operativa más clara.</small></div>
          </div>
        </section>

        <section aria-labelledby="licenses-addons-title" className="licenses-addons public-v2-section">
          <div>
            <p className="eyebrow">CAPACIDAD ADICIONAL</p>
            <h2 id="licenses-addons-title">Amplía tu sistema cuando lo necesites.</h2>
          </div>
          <div className="licenses-addons__content">
            <p>Los addons agregan capacidades específicas a una licencia existente. No sustituyen la licencia ni esconden consumos variables de proveedores externos.</p>
            <ul><li>WhatsApp</li><li>Inteligencia Artificial</li><li>Telefonía</li><li>Automatizaciones</li><li>Integraciones</li></ul>
            <Link className="text-link" to="/addons">Conoce los addons <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section aria-labelledby="licenses-faq-title" className="licenses-faq public-v2-section">
          <div className="licenses-section-heading"><p className="eyebrow">PREGUNTAS FRECUENTES</p><h2 id="licenses-faq-title">Decidir también puede ser sencillo.</h2></div>
          <div className="licenses-faq__list">
            <details open><summary>¿Tengo que empezar con la licencia más completa?</summary><p>No. La recomendación depende de la etapa y las necesidades actuales del negocio.</p></details>
            <details><summary>¿Puedo cambiar de licencia?</summary><p>Sí, cuando cambien las necesidades del negocio y la licencia actual ya no sea suficiente.</p></details>
            <details><summary>¿Los servicios están incluidos?</summary><p>No. Los servicios personalizados tienen un alcance y un resultado separados.</p></details>
            <details><summary>¿Los addons están incluidos?</summary><p>No siempre. Dependen de la capacidad específica que necesites añadir a tu sistema.</p></details>
          </div>
        </section>

        <CTASection
          actions={[{ label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" }, { label: "Contactar", to: "/contacto", variant: "secondary" }]}
          eyebrow="NO TIENES QUE DECIDIR SOLO"
          title="Encuentra el punto de partida que tiene sentido para ti."
          tone="dark"
        >
          <p>El diagnóstico te ayuda a entender tu momento antes de elegir una licencia, un servicio o una capacidad adicional.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
