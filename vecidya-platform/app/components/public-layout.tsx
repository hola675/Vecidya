import { Link, NavLink } from "react-router";
import { useEffect, useRef } from "react";
import { publicAssets } from "../assets/public-assets";
import { PlatformFooter } from "./platform-footer";

export const commercialWhatsAppUrl = "https://wa.me/573244321864";
// Canal oficial de difusión de Vecidya en WhatsApp (sustituye al grupo comunitario retirado).
export const whatsAppChannelUrl = "https://whatsapp.com/channel/0029VbEBsKH2phHMnAgPOT1f";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const solutionsMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuRef.current?.open) {
        mobileMenuRef.current.open = false;
        mobileMenuRef.current.querySelector("summary")?.focus();
      }
      if (event.key === "Escape" && solutionsMenuRef.current?.open) {
        solutionsMenuRef.current.open = false;
        solutionsMenuRef.current.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <div className="public-site">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header">
        <Link aria-label="Vecidya, inicio" className="site-brand" to="/">
          <img alt="" height={32} src="/brand/vecidya-icon-3d.png" width={32} />Vecidya
        </Link>
        <nav className="site-nav" aria-label="Navegación pública">
          <NavLink to="/vecindario">Vecindario</NavLink>
          <NavLink to="/aprende">Aprende</NavLink>
          <NavLink to="/diagnostico">Diagnóstico</NavLink>
          <NavLink to="/servicios">Servicios</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          <details className="site-nav__group" ref={solutionsMenuRef}>
            <summary>Soluciones</summary>
            <div className="site-nav__panel" onClick={(event) => { if ((event.target as HTMLElement).closest("a") && solutionsMenuRef.current) solutionsMenuRef.current.open = false; }}>
              <NavLink to="/licencias">Licencias</NavLink>
              <NavLink to="/addons">Addons</NavLink>
              <NavLink to="/servicios">Servicios</NavLink>
              <NavLink to="/sobre-nosotros">Sobre nosotros</NavLink>
            </div>
          </details>
        </nav>
        <div className="site-header__actions">
          <Link className="site-login-link" to="/login">Acceder</Link>
          <Link className="button button--primary" to="/unete">Únete a Vecidya</Link>
        </div>
        <details className="site-mobile-menu" ref={mobileMenuRef}>
          <summary aria-label="Abrir navegación pública">Menú</summary>
          <nav aria-label="Navegación pública móvil" onClick={closeMobileMenu}>
            <NavLink end to="/">Inicio</NavLink>
            <NavLink to="/vecindario">Vecindario</NavLink>
            <NavLink to="/licencias">Licencias</NavLink>
            <NavLink to="/addons">Addons</NavLink>
            <NavLink to="/diagnostico">Diagnóstico</NavLink>
            <NavLink to="/aprende">Aprende</NavLink>
            <NavLink to="/servicios">Servicios</NavLink>
            <NavLink to="/sobre-nosotros">Sobre nosotros</NavLink>
            <NavLink to="/unete">Únete</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
            <NavLink to="/privacidad">Privacidad</NavLink>
            <NavLink to="/login">Acceder</NavLink>
            <NavLink className="button button--primary" to="/unete">Únete a Vecidya</NavLink>
          </nav>
        </details>
      </header>
      <div id="contenido" tabIndex={-1}>{children}</div>
      <footer className="site-footer">
        <div>
          <Link aria-label="Vecidya, inicio" className="site-footer__brand" to="/">
            <img alt="Vecidya" className="site-wordmark" height={28} src={publicAssets.brand.wordmark} width={84} />
          </Link>
          <p>Comunidad digital para ordenar presencia, aprendizaje y próximos pasos.</p>
        </div>
        <nav aria-label="Enlaces del pie" className="site-footer__nav">
          <div>
            <strong>Explorar</strong>
            <Link to="/vecindario">Vecindario</Link>
            <Link to="/licencias">Licencias</Link>
            <Link to="/addons">Addons</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/aprende">Aprende</Link>
            <Link to="/sobre-nosotros">Nosotros</Link>
          </div>
          <div>
            <strong>Empezar</strong>
            <Link to="/diagnostico">Diagnóstico</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/unete">Únete</Link>
            <a className="site-footer__community-link" href={commercialWhatsAppUrl} rel="noreferrer" target="_blank">
              <img alt="" height={18} src={publicAssets.icons.whatsapp} width={18} />
              WhatsApp Vecidya
            </a>
          </div>
          <div>
            <strong>Síguenos</strong>
            <a className="site-footer__community-link" href={whatsAppChannelUrl} rel="noreferrer" target="_blank">
              <img alt="" height={18} src={publicAssets.icons.whatsapp} width={18} />
              Canal de WhatsApp
            </a>
          </div>
          <div>
            <strong>Legal</strong>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/login">Acceder</Link>
          </div>
        </nav>
        <PlatformFooter area="public" />
      </footer>
    </div>
  );
}

const publicOrigin = "https://vecidya.com";

export const publicMeta = (title: string, description: string, canonical: string, robots = "index, follow") => {
  const pageTitle = title === "Vecidya" ? title : `${title} | Vecidya`;
  const canonicalUrl = canonical.startsWith("http") ? canonical : `${publicOrigin}${canonical}`;
  const imageUrl = `${publicOrigin}${publicAssets.social.openGraph}`;

  return [
    { title: pageTitle },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "es_ES" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
  ];
};
