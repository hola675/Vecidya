import type { ReactNode } from "react";
import { useState } from "react";
import { Form, Link, useNavigate } from "react-router";

import { authClient } from "../lib/auth-client";
import { Button, Icon, type IconName } from "./ui";
import { PlatformFooter } from "./platform-footer";
import { publicAssets } from "../assets/public-assets";

const navigation: { label: string; to: string; active: string; icon: IconName }[] = [
  { label: "Resumen", to: "/app/internal", active: "home", icon: "home" },
  { label: "Diagnóstico", to: "/app/internal/diagnostic-analytics", active: "diagnostic", icon: "spark" },
  { label: "Interesados", to: "/app/internal/diagnostic-leads", active: "leads", icon: "user" },
  { label: "Servicios", to: "/app/internal/services", active: "services", icon: "spark" },
  { label: "Organizaciones", to: "/app/internal/organizations", active: "organizations", icon: "organizations" },
  { label: "Negocios", to: "/app/internal/businesses", active: "businesses", icon: "building" },
  { label: "Integraciones", to: "/app/internal/integrations", active: "integrations", icon: "integrations" },
  { label: "Auditoría", to: "/app/internal/audit", active: "audit", icon: "audit" },
];

type AdminShellProps = {
  active: "home" | "diagnostic" | "leads" | "services" | "organizations" | "businesses" | "integrations" | "audit";
  children: ReactNode;
  workspaceUser?: { name: string; email: string };
};

export function AdminShell({ active, children, workspaceUser }: AdminShellProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#internal-page-content">Saltar al contenido administrativo</a>
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/app/internal">
          <span className="brand-symbol-frame" aria-hidden="true">
            <img alt="" className="brand-symbol" height="512" src={publicAssets.brand.symbol3d} width="512" />
          </span>
          <span><strong>Vecidya</strong><small>Operaciones de plataforma</small></span>
        </Link>
        <nav aria-label="Navegación administrativa" className="admin-navigation">
          {navigation.map((item) => (
            <Link aria-current={active === item.active ? "page" : undefined} className={active === item.active ? "is-active" : ""} key={item.to} to={item.to}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          {workspaceUser ? (
            <div className="admin-sidebar__user">
              <span className="avatar" aria-hidden="true">{workspaceUser.name.slice(0, 1).toUpperCase()}</span>
              <span><strong>{workspaceUser.name}</strong><small>Platform Admin</small></span>
            </div>
          ) : null}
          <Link className="admin-sidebar__return" to="/app"><Icon name="user" /> Volver al espacio cliente</Link>
          <Form method="post" onSubmit={handleSignOut}>
            <Button className="admin-sidebar__signout" disabled={submitting} tone="ghost" type="submit">
              {submitting ? "Procesando…" : "Cerrar sesión"}
            </Button>
          </Form>
        </div>
      </aside>
      <div className="admin-frame">
        <header className="admin-header">
          <div><p className="eyebrow">ADMINISTRACIÓN DE VECIDYA</p><p className="admin-header__note">Estás administrando la plataforma, no una organización cliente.</p></div>
          <Link className="button button--secondary" to="/app">Volver a Mi Vecidya</Link>
        </header>
        <div id="internal-page-content" tabIndex={-1}>{children}</div>
        <PlatformFooter area="admin" />
      </div>
    </div>
  );
}
