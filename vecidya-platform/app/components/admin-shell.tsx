import type { ReactNode } from "react";
import { Link } from "react-router";
import { PlatformFooter } from "./platform-footer";

const navigation = [
  { label: "Inicio", to: "/app/internal", active: "home" },
  { label: "Servicios", to: "/app/internal/services", active: "services" },
  { label: "Organizaciones", to: "/app/internal/organizations", active: "organizations" },
  { label: "Negocios", to: "/app/internal/businesses", active: "businesses" },
  { label: "Integraciones", to: "/app/internal/integrations", active: "integrations" },
  { label: "Auditoría", to: "/app/internal/audit", active: "audit" },
] as const;

const plannedSections: string[] = [];

export function AdminShell({ active, children }: { active: "home" | "services" | "organizations" | "businesses" | "integrations" | "audit"; children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/app/internal">
          <span className="admin-brand__mark" aria-hidden="true">V</span>
          <span><strong>Vecidya Admin</strong><small>Operaciones de plataforma</small></span>
        </Link>
        <nav aria-label="Navegación administrativa" className="admin-navigation">
          {navigation.map((item) => (
            <Link aria-current={active === item.active ? "page" : undefined} className={active === item.active ? "is-active" : ""} key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          {plannedSections.length ? <><p className="admin-navigation__label">PRÓXIMAMENTE</p>{plannedSections.map((label) => <span aria-disabled="true" className="admin-navigation__planned" key={label}>{label}</span>)}</> : null}
        </nav>
      </aside>
      <div className="admin-frame">
        <header className="admin-header">
          <div><p className="eyebrow">ADMINISTRACIÓN DE VECIDYA</p><p className="admin-header__note">Estás administrando la plataforma, no una organización cliente.</p></div>
          <Link className="button button--secondary" to="/app">Volver a Mi Vecidya</Link>
        </header>
        {children}
        <PlatformFooter area="admin" />
      </div>
    </div>
  );
}
