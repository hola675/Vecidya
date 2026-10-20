import { type ReactNode, useState } from "react";
import { Form, Link, useNavigate, useRevalidator } from "react-router";

import { authClient } from "../lib/auth-client";
import { Button, Icon, type IconName } from "./ui";
import { PlatformFooter } from "./platform-footer";
import { publicAssets } from "../assets/public-assets";

type NavLink = { id: string; label: string; to: string; icon: IconName };
type NavGroup = { label: string | null; links: NavLink[] };

const groups: NavGroup[] = [
  { label: null, links: [{ id: "home", label: "Inicio", to: "/app", icon: "home" }] },
  {
    label: "MI NEGOCIO",
    links: [
      { id: "miniweb", label: "Mi MiniWeb", to: "/app/miniweb", icon: "spark" },
      { id: "business", label: "Mi negocio", to: "/app/business-profile", icon: "building" },
      { id: "services", label: "Servicios", to: "/app/services", icon: "spark" },
      { id: "crm", label: "Mi CRM", to: "/app/crm", icon: "integrations" },
    ],
  },
  { label: "ORGANIZACIÓN", links: [{ id: "organization", label: "Equipo", to: "/app/organization", icon: "team" }] },
  { label: "CUENTA", links: [{ id: "account", label: "Mi cuenta", to: "/app/account", icon: "user" }] },
];

type WorkspaceUser = { name: string; email: string };
type WorkspaceOrganization = { id: string; name: string; slug: string; role: string };

type ClientAreaShellProps = {
  active: (typeof groups)[number]["links"][number]["id"];
  children: ReactNode;
  workspaceUser: WorkspaceUser;
  organizations: WorkspaceOrganization[];
  activeOrganization: { id: string; name: string } | null;
  isPlatformAdmin?: boolean;
};

export function ClientAreaShell({ active, children, workspaceUser, organizations, activeOrganization, isPlatformAdmin = false }: ClientAreaShellProps) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasOrganization = organizations.length > 0;
  const visibleGroups = hasOrganization ? groups : groups.filter((group) => group.label === null || group.label === "CUENTA");

  async function handleSetActiveOrganization(organizationId: string) {
    if (!organizationId || organizationId === activeOrganization?.id) return;
    setSubmitting(true);
    await authClient.organization.setActive({ organizationId });
    setSubmitting(false);
    revalidate();
  }

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#client-page-content">Saltar al contenido</a>
      <aside className="app-sidebar" data-open={navigationOpen}>
        <Link className="brand" to="/app" onClick={() => setNavigationOpen(false)}>
          <span className="brand-symbol-frame" aria-hidden="true">
            <img alt="" className="brand-symbol" height="512" src={publicAssets.brand.symbol3d} width="512" />
          </span>
          <span>
            <strong>Vecidya</strong>
            <small>Presencia digital para negocios locales</small>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="app-navigation app-navigation--grouped" id="app-navigation">
          {visibleGroups.map((group) => (
            <div className="app-navigation__group" key={group.label ?? "root"}>
              {group.label ? <p className="app-navigation__group-label">{group.label}</p> : null}
              {group.links.map((link) => (
                <Link aria-current={active === link.id ? "page" : undefined} to={link.to} key={link.id} onClick={() => setNavigationOpen(false)}>
                  <Icon name={link.icon} />
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          {isPlatformAdmin ? (
            <Link className="app-sidebar__admin-link" to="/app/internal">
              <Icon name="admin" /> Administración Vecidya
            </Link>
          ) : null}
          <Link className="app-sidebar__public-link" to="/vecindario"><Icon name="eye" /> Explorar el Vecindario</Link>
          <div className="sidebar-note">
            <span className="sidebar-note__icon"><Icon name="spark" /></span>
            <p>{activeOrganization ? `Trabajando en ${activeOrganization.name}.` : "Tu espacio Vecidya está protegido por organización."}</p>
          </div>
        </div>
      </aside>

      <div className="app-frame">
        <header className="app-header">
          <Button
            aria-controls="app-navigation"
            aria-expanded={navigationOpen}
            aria-label="Abrir navegación"
            className="mobile-menu"
            onClick={() => setNavigationOpen((open) => !open)}
            tone="ghost"
          >
            <Icon name="menu" />
          </Button>

          {hasOrganization ? (
            <div className="organization-switcher">
              <label htmlFor="organization-switcher">Organización</label>
              <select
                disabled={submitting}
                id="organization-switcher"
                onChange={(event) => handleSetActiveOrganization(event.currentTarget.value)}
                value={activeOrganization?.id ?? ""}
              >
                <option value="" disabled>Selecciona una organización</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>{organization.name}</option>
                ))}
              </select>
            </div>
          ) : <span />}

          <details className="user-menu">
            <summary aria-label="Abrir menú de usuario">
              <span className="avatar" aria-hidden="true">{workspaceUser.name.slice(0, 1).toUpperCase()}</span>
              <span className="user-menu__label">{workspaceUser.name}</span>
            </summary>
            <div className="user-menu__panel">
              <strong>{workspaceUser.name}</strong>
              <span>{workspaceUser.email}</span>
              <Link to="/app/account">Gestionar cuenta</Link>
              <Form method="post" onSubmit={handleSignOut}>
                <Button disabled={submitting} tone="ghost" type="submit">
                  {submitting ? "Procesando…" : "Cerrar sesión"}
                </Button>
              </Form>
            </div>
          </details>
        </header>

        {children}
        <PlatformFooter area="app" />
      </div>
    </div>
  );
}
