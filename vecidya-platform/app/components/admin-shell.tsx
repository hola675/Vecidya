import type { ReactNode } from "react";
import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";

import { authClient } from "../lib/auth-client";
import { Button, Icon, type IconName } from "./ui";
import { PlatformFooter } from "./platform-footer";
import { publicAssets } from "../assets/public-assets";
import { useResponsiveNavigationDrawer } from "../hooks/use-responsive-navigation-drawer";

const navigation: { label: string; to: string; active: string; icon: IconName }[] = [
  { label: "Resumen", to: "/app/internal", active: "home", icon: "home" },
  { label: "Diagnóstico", to: "/app/internal/diagnostic-analytics", active: "diagnostic", icon: "spark" },
  { label: "Interesados", to: "/app/internal/diagnostic-leads", active: "leads", icon: "user" },
  { label: "Servicios", to: "/app/internal/services", active: "services", icon: "spark" },
  { label: "Espacios de trabajo", to: "/app/internal/organizations", active: "organizations", icon: "organizations" },
  { label: "Licencias", to: "/app/internal/licenses", active: "licenses", icon: "audit" },
  { label: "Negocios", to: "/app/internal/businesses", active: "businesses", icon: "building" },
  { label: "Integraciones", to: "/app/internal/integrations", active: "integrations", icon: "integrations" },
  { label: "Auditoría", to: "/app/internal/audit", active: "audit", icon: "audit" },
];

type AdminShellProps = {
  active: "home" | "diagnostic" | "leads" | "services" | "organizations" | "licenses" | "businesses" | "integrations" | "audit";
  children: ReactNode;
  workspaceUser?: { name: string; email: string };
  platformRole?: "staff" | "platform_admin";
};

export function AdminShell({ active, children, workspaceUser, platformRole = "platform_admin" }: AdminShellProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { closeNavigation, isMobileNavigation, menuButtonRef, navigationOpen, navigationRef, setNavigationOpen } =
    useResponsiveNavigationDrawer({ breakpoint: 980, firstItemSelector: "#admin-navigation a" });

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <a
        aria-hidden={isMobileNavigation && navigationOpen ? true : undefined}
        className="skip-link"
        href="#internal-page-content"
        inert={isMobileNavigation && navigationOpen}
        tabIndex={isMobileNavigation && navigationOpen ? -1 : undefined}
      >Saltar al contenido administrativo</a>
      <aside
        aria-hidden={isMobileNavigation && !navigationOpen ? true : undefined}
        aria-label={isMobileNavigation && navigationOpen ? "Navegación administrativa" : undefined}
        aria-modal={isMobileNavigation && navigationOpen ? true : undefined}
        className="admin-sidebar"
        data-open={navigationOpen}
        inert={isMobileNavigation && !navigationOpen}
        ref={navigationRef}
        role={isMobileNavigation && navigationOpen ? "dialog" : undefined}
        tabIndex={isMobileNavigation && navigationOpen ? -1 : undefined}
      >
        <Link className="admin-brand" to="/app/internal">
          <span className="brand-symbol-frame" aria-hidden="true">
            <img alt="" className="brand-symbol" height="512" src={publicAssets.brand.symbol3d} width="512" />
          </span>
          <span><strong>Vecidya</strong><small>Operaciones de plataforma</small></span>
        </Link>
        <nav aria-label="Navegación administrativa" className="admin-navigation" id="admin-navigation">
          {navigation.filter((item) => platformRole === "platform_admin" || item.active === "organizations").map((item) => (
            <Link aria-current={active === item.active ? "page" : undefined} className={active === item.active ? "is-active" : ""} key={item.to} to={item.to} onClick={() => setNavigationOpen(false)}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          {workspaceUser ? (
            <div className="admin-sidebar__user">
              <span className="avatar" aria-hidden="true">{workspaceUser.name.slice(0, 1).toUpperCase()}</span>
              <span><strong>{workspaceUser.name}</strong><small>{platformRole === "staff" ? "Personal de plataforma · solo lectura" : "Administrador de plataforma"}</small></span>
            </div>
          ) : null}
          <Link className="admin-sidebar__return" to="/app"><Icon name="user" /> Volver a Mi Vecidya</Link>
          <Link className="admin-sidebar__return" to="/vecindario"><Icon name="eye" /> Ver sitio público</Link>
          <Form method="post" onSubmit={handleSignOut}>
            <Button className="admin-sidebar__signout" disabled={submitting} tone="ghost" type="submit">
              {submitting ? "Procesando…" : "Cerrar sesión"}
            </Button>
          </Form>
        </div>
      </aside>
      {isMobileNavigation && navigationOpen ? <button aria-label="Cerrar navegación administrativa" className="admin-sidebar-backdrop" onClick={() => closeNavigation(true)} type="button" /> : null}
      <div className="admin-frame" inert={isMobileNavigation && navigationOpen}>
        <header className="admin-header">
          <Button
            aria-controls="admin-navigation"
            aria-expanded={navigationOpen}
            aria-label={navigationOpen ? "Cerrar navegación administrativa" : "Abrir navegación administrativa"}
            className="admin-mobile-menu"
            onClick={() => setNavigationOpen((open) => !open)}
            ref={menuButtonRef}
            tone="ghost"
          >
            <Icon name="menu" />
          </Button>
          <div><p className="eyebrow">ADMINISTRACIÓN DE VECIDYA</p><p className="admin-header__note">Estás administrando la plataforma, no una organización cliente.</p></div>
          <Link className="button button--secondary admin-header__back-link" to="/app">Volver a Mi Vecidya</Link>
        </header>
        <div id="internal-page-content" tabIndex={-1}>{children}</div>
        <PlatformFooter area="admin" />
      </div>
    </div>
  );
}
