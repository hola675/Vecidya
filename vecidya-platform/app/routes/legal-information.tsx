import { Link } from "react-router";

import { LegalContact } from "../components/legal-page";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/legal-information";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Información legal y comercial",
    "Consulta los canales oficiales y la información disponible sobre la identidad comercial y las condiciones de contratación de Vecidya.",
    "/informacion-legal",
  );
}

export default function LegalInformation() {
  return (
    <PublicLayout>
      <main className="public-page legal-page">
        <section className="legal-section">
          <div className="legal-section__heading">
            <p className="eyebrow">TRANSPARENCIA</p>
            <h1>Información legal y comercial</h1>
            <p>Este espacio reúne la información pública para identificar al responsable del servicio y consultar sus condiciones. Los datos registrales y fiscales se incorporarán únicamente después de su verificación.</p>
          </div>
          <div className="legal-topic-grid">
            <article className="legal-topic">
              <div className="legal-topic__tag">Identificación</div>
              <h2>Datos del responsable</h2>
              <p>La identificación jurídica, el registro fiscal y el domicilio de notificaciones están pendientes de confirmación para su publicación. No se presenta una entidad o registro sin verificar.</p>
            </article>
            <article className="legal-topic">
              <div className="legal-topic__tag">Contratación</div>
              <h2>Antes de contratar</h2>
              <p>Solicita por el canal de contacto la identificación del proveedor, el alcance, precio total, periodicidad, renovación, cancelación y condiciones aplicables a tu contratación. No interpretes esta página como una oferta contractual completa.</p>
              <p><Link className="text-link" to="/licencias">Consultar las licencias</Link></p>
            </article>
            <article className="legal-topic">
              <div className="legal-topic__tag">Protección de datos</div>
              <h2>Privacidad y condiciones</h2>
              <p>Consulta las páginas de privacidad y uso del sitio. Las condiciones específicas de una contratación pueden requerir un acuerdo adicional.</p>
              <p><Link className="text-link" to="/privacidad">Privacidad y datos</Link> · <Link className="text-link" to="/terminos">Condiciones de uso</Link></p>
            </article>
          </div>
        </section>
        <LegalContact
          title="Consulta los datos antes de contratar."
          description="Si necesitas información de identificación, facturación o condiciones comerciales, solicítala por el canal de contacto antes de contratar."
        />
      </main>
    </PublicLayout>
  );
}
