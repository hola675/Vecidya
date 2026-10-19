import { Link } from "react-router";

/** Navegación editorial común: no sustituye las condiciones o avisos particulares de cada servicio. */
export function LegalPageIntro({
  kind,
  eyebrow,
  title,
  description,
  sections,
}: {
  kind: "privacy" | "terms";
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly { id: string; label: string }[];
}) {
  return (
    <>
      <section aria-labelledby="legal-page-title" className="legal-hero">
        <div className="legal-hero__main">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="legal-page-title">{title}</h1>
          <p className="legal-hero__intro">{description}</p>
          <nav aria-label="Explorar información legal" className="legal-switcher">
            <Link aria-current={kind === "privacy" ? "page" : undefined} to="/privacidad">Privacidad y datos</Link>
            <Link aria-current={kind === "terms" ? "page" : undefined} to="/terminos">Condiciones de uso</Link>
          </nav>
        </div>
        <aside className="legal-hero__aside" aria-label="Nuestro compromiso de comunicación">
          <img alt="" aria-hidden="true" height={48} src="/brand/vecidya-icon-3d.png" width={48} />
          <strong>Entender también es un derecho.</strong>
          <p>Explicamos lo importante con palabras sencillas, sin letras pequeñas ni promesas imposibles.</p>
        </aside>
      </section>
      <nav aria-label="En esta página" className="legal-jump-nav">
        <strong>En esta página</strong>
        <div>
          {sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.label}</a>)}
        </div>
      </nav>
    </>
  );
}

export function LegalContact({
  title = "¿Quieres preguntar o solicitar una revisión?",
  description = "Cuéntanos qué necesitas consultar, corregir o aclarar. Escribe solo la información necesaria para identificar tu solicitud; no envíes contraseñas ni códigos de acceso.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section aria-labelledby="legal-contact-title" className="legal-contact" id="contacto-legal">
      <div>
        <p className="eyebrow">HABLEMOS CON CLARIDAD</p>
        <h2 id="legal-contact-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div className="legal-contact__actions">
        <a className="button button--primary" href="mailto:hola@vecidya.com?subject=Consulta%20legal%20Vecidya">Escribir a Vecidya</a>
        <Link className="text-link" to="/contacto">Otros canales de contacto <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
