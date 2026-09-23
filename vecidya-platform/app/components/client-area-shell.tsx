import type { ReactNode } from "react";
import { Link } from "react-router";

import { PlatformFooter } from "./platform-footer";

const links = [
  { id: "home", label: "Inicio", to: "/app", path: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" },
  { id: "business", label: "Mi negocio", to: "/app/business-profile", path: "M4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15M2 21h20M8 8h2m4 0h2M8 12h2m4 0h2M10 21v-5h4v5" },
  { id: "organization", label: "Organización", to: "/app/organization", path: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.5a4 4 0 0 1 0 7.8m3 9.7v-2a4 4 0 0 0-3-3.9" },
  { id: "services", label: "Servicios", to: "/app/services", path: "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" },
  { id: "account", label: "Mi cuenta", to: "/app/account", path: "M20 21a8 8 0 0 0-16 0m8-9a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" },
] as const;

export function ClientAreaShell({ active, children, hasOrganization = true }: { active: (typeof links)[number]["id"]; children: ReactNode; hasOrganization?: boolean }) {
  const visibleLinks = hasOrganization ? links : links.filter((link) => link.id === "home" || link.id === "account");
  return (
    <div className="client-area-shell">
      <a className="skip-link" href="#client-page-content">Saltar al contenido</a>
      <header className="client-area-header">
        <Link className="client-area-brand" to="/app">
          <span aria-hidden="true">V</span>
          <span><strong>Mi Vecidya</strong><small>Espacio de organización</small></span>
        </Link>
        <nav aria-label="Navegación de Mi Vecidya" className="client-area-navigation">
          {visibleLinks.map((link) => (
            <Link aria-current={active === link.id ? "page" : undefined} key={link.id} to={link.to}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24"><path d={link.path} /></svg>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <Link className="client-area-return" to="/app">Vista general <span aria-hidden="true">↗</span></Link>
      </header>
      {children}
      <PlatformFooter area="app" />
    </div>
  );
}
