import { PublicLayout, publicMeta } from "../components/public-layout";
import { LegalContact } from "../components/legal-page";
import type { Route } from "./+types/cookies";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Política de cookies", "Información sobre cookies, almacenamiento local y tus opciones de consentimiento en Vecidya.", "/cookies");
}
export default function Cookies() {
  return <PublicLayout><main className="public-page legal-page">
    <section className="legal-section"><div className="legal-section__heading"><p className="eyebrow">PRIVACIDAD</p><h1>Política de cookies y almacenamiento</h1><p>Explicamos las tecnologías que pueden guardar información en tu navegador y cómo puedes decidir sobre las categorías opcionales.</p></div>
      <div className="legal-topic-grid">
        <article className="legal-topic"><h2>Necesarias</h2><p>El sitio puede utilizar cookies de sesión, autenticación y almacenamiento funcional para mantener el acceso, la seguridad y la continuidad de determinadas tareas. No dependen del consentimiento para fines opcionales cuando son estrictamente necesarias.</p></article>
        <article className="legal-topic"><h2>Analítica opcional</h2><p>Esta categoría queda desactivada por defecto. Solo debe utilizarse para mediciones no esenciales cuando exista una integración que respete tu selección.</p></article>
        <article className="legal-topic"><h2>Marketing opcional</h2><p>Esta categoría queda desactivada por defecto. Cualquier tecnología de publicidad o seguimiento no esencial debe respetar tu selección.</p></article>
      </div>
    </section>
    <section className="legal-section"><div className="legal-section__heading"><h2>Control de preferencias</h2><p>Puedes aceptar, rechazar o configurar las categorías opcionales desde el aviso o mediante «Preferencias de cookies» en el pie de página. La elección se guarda localmente con su versión y fecha. También puedes eliminar los datos del sitio desde tu navegador.</p><p>La lista definitiva de proveedores, identificadores, duraciones y finalidades específicas requiere una auditoría técnica de las integraciones realmente activas; no declaramos proveedores o plazos que todavía no se han verificado.</p><p>Consulta también <a href="/privacidad">Privacidad y tratamiento de datos</a>.</p></div></section>
    <LegalContact title="¿Dudas sobre cookies y almacenamiento?" />
  </main></PublicLayout>;
}
