import { Link, NavLink } from "react-router";
import { useEffect, useRef } from "react";
import { publicAssets } from "../assets/public-assets";
import { publicSiteUrl } from "../lib/public-seo";
import { PlatformFooter } from "./platform-footer";
import { PUBLIC_FOOTER_GROUPS, PUBLIC_HEADER_PRIMARY_LINKS, PUBLIC_HEADER_SOLUTIONS_LINKS, PUBLIC_MOBILE_LINKS, PUBLIC_NAVIGATION_LINKS } from "./public-navigation";

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

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenuRef.current?.open && !mobileMenuRef.current.contains(target)) {
        mobileMenuRef.current.open = false;
      }
      if (solutionsMenuRef.current?.open && !solutionsMenuRef.current.contains(target)) {
        solutionsMenuRef.current.open = false;
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, []);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <div className="public-site">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header">
        <Link aria-label="Vecidya, inicio" className="site-brand" to="/">
          <img alt="" height={32} src={publicAssets.brand.symbol3d} width={32} />Vecidya
        </Link>
        <nav className="site-nav" aria-label="Navegación pública">
          {PUBLIC_HEADER_PRIMARY_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
          <details className="site-nav__group" ref={solutionsMenuRef}>
            <summary>Soluciones</summary>
            <div className="site-nav__panel" onClick={(event) => { if ((event.target as HTMLElement).closest("a") && solutionsMenuRef.current) solutionsMenuRef.current.open = false; }}>
              {PUBLIC_HEADER_SOLUTIONS_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
              ))}
            </div>
          </details>
        </nav>
        <div className="site-header__actions">
          <Link className="site-login-link" to={PUBLIC_NAVIGATION_LINKS.acceder.to}>{PUBLIC_NAVIGATION_LINKS.acceder.label}</Link>
          <Link className="button button--primary" to={PUBLIC_NAVIGATION_LINKS.unete.to}>{PUBLIC_NAVIGATION_LINKS.unete.label}</Link>
        </div>
        <details className="site-mobile-menu" ref={mobileMenuRef}>
          <summary aria-label="Menú de navegación">Menú</summary>
          <nav aria-label="Navegación pública móvil" onClick={closeMobileMenu}>
            {PUBLIC_MOBILE_LINKS.map((link) => (
              <NavLink
                className={link.to === PUBLIC_NAVIGATION_LINKS.unete.to ? "button button--primary" : undefined}
                end={link.to === "/"}
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
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
          {PUBLIC_FOOTER_GROUPS.map((group) => (
            <div key={group.id}>
              <strong>{group.title}</strong>
              {group.links.map((link) => (
                <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
              ))}
              {group.id === "vecidya" ? (
                <>
                  <a className="site-footer__community-link" href={commercialWhatsAppUrl} rel="noopener noreferrer" target="_blank">
                    <img alt="" height={18} src={publicAssets.icons.whatsapp} width={18} />
                    WhatsApp directo
                  </a>
                  <a className="site-footer__community-link" href={whatsAppChannelUrl} rel="noopener noreferrer" target="_blank">
                    <img alt="" height={18} src={publicAssets.icons.whatsapp} width={18} />
                    Canal de WhatsApp
                  </a>
                </>
              ) : null}
            </div>
          ))}
        </nav>
        <PlatformFooter area="public" />
      </footer>
    </div>
  );
}

export const publicMeta = (title: string, description: string, canonical: string, robots = "index, follow") => {
  const pageTitle = title === "Vecidya" ? title : `${title} | Vecidya`;
  const canonicalUrl = canonical.startsWith("http") ? canonical : publicSiteUrl(canonical);
  const imageUrl = publicSiteUrl(publicAssets.social.openGraph);

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
