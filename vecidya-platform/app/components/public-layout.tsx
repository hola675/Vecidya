import { Link, NavLink } from "react-router";
import { useEffect, useRef } from "react";
import { PlatformFooter } from "./platform-footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuRef.current?.open) {
        mobileMenuRef.current.open = false;
        mobileMenuRef.current.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return <div className="public-site"><a className="skip-link" href="#contenido">Saltar al contenido</a><header className="site-header"><Link aria-label="Vecidya, inicio" className="site-brand" to="/"><img alt="" src="/brand/vecidya-app-icon.png" />Vecidya</Link><nav className="site-nav" aria-label="Navegación pública"><NavLink to="/">Inicio</NavLink><NavLink to="/vecindario">Vecindario</NavLink><NavLink to="/diagnostico">Diagnóstico</NavLink><NavLink to="/que-debes-saber">Aprende</NavLink><NavLink to="/servicios">Servicios</NavLink><NavLink to="/sobre-nosotros">Nosotros</NavLink><NavLink to="/contacto">Contacto</NavLink></nav><div className="site-header__actions"><Link className="site-login-link" to="/login">Acceder</Link><Link className="button button--primary" to="/unete">Únete a Vecidya</Link></div><details className="site-mobile-menu" ref={mobileMenuRef}><summary>Menú</summary><nav aria-label="Navegación pública móvil" onClick={closeMobileMenu}><NavLink to="/">Inicio</NavLink><NavLink to="/vecindario">Vecindario</NavLink><NavLink to="/diagnostico">Diagnóstico</NavLink><NavLink to="/que-debes-saber">Qué debes saber</NavLink><NavLink to="/servicios">Servicios</NavLink><NavLink to="/sobre-nosotros">Sobre nosotros</NavLink><NavLink to="/unete">Únete</NavLink><NavLink to="/contacto">Contacto</NavLink><NavLink to="/privacidad">Privacidad</NavLink><NavLink to="/login">Acceder</NavLink><NavLink className="button button--primary" to="/unete">Únete a Vecidya</NavLink></nav></details></header><main id="contenido" tabIndex={-1}>{children}</main><footer className="site-footer"><div><Link aria-label="Vecidya, inicio" className="site-brand" to="/"><img alt="" src="/brand/vecidya-app-icon.png" />Vecidya</Link><p>Comunidad digital para ordenar presencia, aprendizaje y próximos pasos.</p></div><nav aria-label="Enlaces del pie"><Link to="/vecindario">Vecindario</Link><Link to="/diagnostico">Diagnóstico</Link><Link to="/que-debes-saber">Qué debes saber</Link><Link to="/servicios">Servicios</Link><Link to="/sobre-nosotros">Sobre nosotros</Link><Link to="/unete">Únete</Link><Link to="/contacto">Contacto</Link><Link to="/privacidad">Privacidad</Link><Link to="/login">Acceder</Link></nav><PlatformFooter /></footer></div>;
}

const publicOrigin = "https://vecidya.com";

export const publicMeta = (title: string, description: string, canonical: string) => {
  const pageTitle = title === "Vecidya" ? title : `${title} | Vecidya`;
  const canonicalUrl = canonical.startsWith("http") ? canonical : `${publicOrigin}${canonical}`;
  return [{ title: pageTitle }, { name: "description", content: description }, { name: "robots", content: "index, follow" }, { property: "og:title", content: pageTitle }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:locale", content: "es_ES" }, { tagName: "link", rel: "canonical", href: canonicalUrl }];
};
