import { Link, useLoaderData } from "react-router";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { getCommercialOffer, LICENSE_OFFERS } from "../content/commercial-detail";

import type { CommercialKind, CommercialOffer } from "../content/commercial-detail";

const groupNames: Record<CommercialKind, string> = {
  license: "Licencias",
  addon: "Complementos",
  service: "Servicios profesionales",
};

function kindFromPath(path: string): CommercialKind | null {
  const first = path.split("/")[1];
  return first === "licencias" ? "license" : first === "addons" ? "addon" : first === "servicios" ? "service" : null;
}

export function loader({ request, params }: { request: Request; params: { slug?: string } }) {
  const kind = kindFromPath(new URL(request.url).pathname);
  const offer = kind && params.slug ? getCommercialOffer(kind, params.slug) : undefined;
  if (!kind || !offer) throw new Response("Ficha no encontrada", { status: 404 });
  return { offer };
}

export function meta({ loaderData }: { loaderData?: { offer?: CommercialOffer } }) {
  if (!loaderData?.offer) return publicMeta("Ficha no encontrada", "No encontramos esa oferta.", "/licencias", "noindex, nofollow");
  const { offer } = loaderData;
  return publicMeta(`${offer.title} — ${groupNames[offer.kind]}`, offer.summary, offer.detailPath);
}

function BulletGroup({ title, values }: { title: string; values: readonly string[] }) {
  return (
    <section className="commercial-detail__panel" aria-label={title}>
      <h2>{title}</h2>
      <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul>
    </section>
  );
}

export default function CommercialDetail() {
  const { offer } = useLoaderData<typeof loader>();
  const modules = offer.kind === "license" ? LICENSE_OFFERS.find((candidate) => candidate.id === offer.id)?.standardModules : undefined;
  return (
    <PublicLayout>
      <main className="public-page commercial-detail-page">
        <nav aria-label="Ruta del catálogo" className="commercial-detail__breadcrumb">
          <Link to={offer.catalogPath}>← Volver a {groupNames[offer.kind]}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{offer.title}</span>
        </nav>

        <header className="commercial-detail__hero">
          <div>
            <p className="eyebrow">{offer.kind === "license" ? "LICENCIA VECIDYA" : offer.kind === "addon" ? "COMPLEMENTO ADICIONAL" : "SERVICIO PROFESIONAL"}</p>
            <h1>{offer.title}</h1>
            <p className="commercial-detail__promise">{offer.promise}</p>
            <p>{offer.summary}</p>
            <div className="public-actions">
              <Link className="button button--primary" to={`/contacto?interes=${offer.contactInterest}`}>Consultar {offer.title}</Link>
              <Link className="button button--secondary" to={offer.catalogPath}>Comparar otras opciones</Link>
            </div>
          </div>
          <aside className="commercial-detail__price" aria-label="Precio y condiciones de la oferta">
            <span>{offer.kind === "license" ? "Licencia mensual" : offer.kind === "addon" ? "Complemento mensual" : "Cotización"}</span>
            <strong>{offer.price}</strong>
            {offer.kind === "license" && (
              <p>Puesta en marcha estándar: USD {LICENSE_OFFERS.find((candidate) => candidate.id === offer.id)?.setupUsd ?? 0} una vez para contratación inicial.</p>
            )}
            <p>La contratación se coordina por contacto. No hay compra ni activación automática.</p>
          </aside>
        </header>

        <section className="commercial-detail__introduction" aria-labelledby="commercial-ideal-title">
          <p className="eyebrow">CUÁNDO TIENE SENTIDO</p>
          <h2 id="commercial-ideal-title">¿Para quién es?</h2>
          <p>{offer.bestFor}</p>
        </section>

        <section className="commercial-detail__benefits" aria-labelledby="commercial-benefits-title">
          <p className="eyebrow">VENTAJAS EN EL DÍA A DÍA</p>
          <h2 id="commercial-benefits-title">¿Qué ganas realmente al contratarlo?</h2>
          <ul>{offer.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        </section>

        {offer.journey && offer.journey.length > 0 && (
          <section className="commercial-detail__journey" aria-labelledby="commercial-journey-title">
            <p className="eyebrow">RECORRIDO ILUSTRATIVO</p>
            <h2 id="commercial-journey-title">Así funciona en la práctica.</h2>
            <p>Ejemplo del funcionamiento objetivo cuando el canal, la configuración y los permisos correspondientes están habilitados.</p>
            <ol>{offer.journey.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
        )}

        {offer.continuity && (
          <aside className="commercial-detail__continuity" aria-labelledby="commercial-continuity-title">
            <p className="eyebrow">CONTINUIDAD Y LÍMITES</p>
            <h2 id="commercial-continuity-title">¿Qué pasa si se desconecta o bloquea un canal?</h2>
            <p>{offer.continuity}</p>
          </aside>
        )}

        <div className="commercial-detail__columns">
          <BulletGroup title={offer.kind === "service" ? "Qué trabajo incluye la propuesta" : "Qué incluye"} values={offer.includes} />
          <BulletGroup title="Qué no está incluido" values={offer.excludes} />
        </div>

        {modules && modules.length > 0 && (
          <section className="commercial-detail__modules" aria-labelledby="commercial-modules-title">
            <p className="eyebrow">{offer.id === "ciudad" ? "BIBLIOTECA MODULAR ESTÁNDAR" : "PLANTILLA OPERATIVA ESTÁNDAR"}</p>
            <h2 id="commercial-modules-title">{offer.id === "ciudad" ? "Activa los módulos que realmente necesitas." : "Un proceso comercial listo para organizar tu seguimiento."}</h2>
            <p>{offer.id === "ciudad"
              ? "Los módulos operativos estándar se seleccionan según tu necesidad. No son complementos de pago independientes: forman parte de Ciudad. Configuraciones o desarrollos especiales se presupuestan como servicios."
              : "Las etapas y automatizaciones estándar forman parte de Barrio. No son complementos que tengas que pagar por separado."}</p>
            <div className="commercial-detail__module-grid">
              {modules.map((module) => (
                <article key={module.name}>
                  <h3>{module.name}</h3>
                  <p>{module.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="commercial-detail__examples" aria-labelledby="commercial-examples-title">
          <p className="eyebrow">EJEMPLOS ORIENTATIVOS</p>
          <h2 id="commercial-examples-title">Cómo se aplicaría a tu negocio</h2>
          <ul>{offer.examples.map((example) => <li key={example}>{example}</li>)}</ul>
        </section>

        <section className="commercial-detail__decision" aria-labelledby="commercial-decision-title">
          <div>
            <p className="eyebrow">RECOMENDACIÓN HONESTA</p>
            <h2 id="commercial-decision-title">No contrates más de lo que necesitas.</h2>
            <p>{offer.decision}</p>
          </div>
          <div>
            <h3>Requisitos y compatibilidad</h3>
            <p>{offer.dependencies}</p>
            <h3>Costes adicionales</h3>
            <p>{offer.externalCosts}</p>
          </div>
        </section>

        <section className="commercial-detail__related" aria-labelledby="commercial-related-title">
          <h2 id="commercial-related-title">Diferencia entre las ofertas</h2>
          <p><strong>Licencia:</strong> tu sistema base de uso recurrente. <strong>Complemento:</strong> una capacidad adicional contratada aparte. <strong>Servicio:</strong> trabajo profesional con alcance definido. Los consumos de proveedores se muestran por separado.</p>
          <div className="commercial-detail__related-links">
            <Link to="/licencias">Comparar licencias</Link>
            <Link to="/addons">Ver complementos</Link>
            <Link to="/servicios">Ver servicios profesionales</Link>
          </div>
        </section>

        <div className="commercial-detail__closing">
          <p>Este catálogo explica el alcance comercial objetivo. Las condiciones y funciones efectivamente disponibles se confirman antes de contratar, sin prometer conexiones, módulos o consumos que todavía no estén habilitados.</p>
          <Link className="button button--primary" to={`/contacto?interes=${offer.contactInterest}`}>Preguntar por {offer.title}</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
