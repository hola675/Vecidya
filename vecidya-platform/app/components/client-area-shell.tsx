import { type ReactNode, useState } from "react";
import { Form, Link, useNavigate, useRevalidator } from "react-router";

import { authClient } from "../lib/auth-client";
import { LearnOfflineQueue } from "../features/learn/learn-offline";
import { Button, Icon, type IconName } from "./ui";
import { PlatformFooter } from "./platform-footer";
import { publicAssets } from "../assets/public-assets";
import { useResponsiveNavigationDrawer } from "../hooks/use-responsive-navigation-drawer";

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
  { label: "APRENDIZAJE", links: [{ id: "learn", label: "Mi aprendizaje", to: "/app/aprende", icon: "spark" }, { id: "training", label: "Capacitación", to: "/app/training", icon: "team" }] },
  { label: "CUENTA", links: [{ id: "account", label: "Mi cuenta", to: "/app/account", icon: "user" }] },
];

type WorkspaceUser = { id?: string; name: string; email: string };
type WorkspaceOrganization = { id: string; name: string; slug: string; role?: string };

type ClientAreaShellProps = {
  active: (typeof groups)[number]["links"][number]["id"];
  children: ReactNode;
  workspaceUser: WorkspaceUser;
  organizations: WorkspaceOrganization[];
  platformOrganizationOptions?: WorkspaceOrganization[];
  activeOrganization: { id: string; name: string } | null;
  isPlatformAdmin?: boolean;
  organizationSwitchLocked?: boolean;
};

export function ClientAreaShell({ active, children, workspaceUser, organizations, platformOrganizationOptions = [], activeOrganization, isPlatformAdmin = false, organizationSwitchLocked = false }: ClientAreaShellProps) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const [submitting, setSubmitting] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);
  const { closeNavigation, isMobileNavigation, menuButtonRef, navigationOpen, navigationRef, setNavigationOpen } =
    useResponsiveNavigationDrawer({ breakpoint: 980, firstItemSelector: "#app-navigation a" });
  const switcherOrganizations = isPlatformAdmin ? (platformOrganizationOptions.length ? platformOrganizationOptions : organizations) : organizations;
  const hasOrganization = organizations.length > 0 || switcherOrganizations.length > 0;
  const visibleGroups = hasOrganization ? groups : groups.filter((group) => group.label === null || group.label === "CUENTA" || group.label === "APRENDIZAJE").map((group) => group.label === "APRENDIZAJE" ? { ...group, links: group.links.filter((link) => link.id === "learn") } : group);

  async function handleSetActiveOrganization(organizationId: string) {
    if (organizationSwitchLocked || !organizationId) return;
    if (isPlatformAdmin) {
      navigate(`/app/platform/organizations/${encodeURIComponent(organizationId)}`);
      return;
    }
    if (organizationId === activeOrganization?.id) return;
    setSubmitting(true);
    setOrganizationError(null);
    try {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) {
        setOrganizationError(result.error.message ?? "No se pudo cambiar de negocio. Inténtalo de nuevo.");
        return;
      }
      revalidate();
    } catch {
      setOrganizationError("No se pudo cambiar de negocio. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await authClient.signOut();
    if (workspaceUser.id) {
      const queue = new LearnOfflineQueue(window.localStorage);
      if (!queue.retainAfterSignOut(workspaceUser.id)) queue.clear(workspaceUser.id);
    }
    navigate("/login");
  }

  return (
    <div className={`app-shell app-shell--${active}`}>
      <a
        aria-hidden={isMobileNavigation && navigationOpen ? true : undefined}
        className="skip-link"
        href="#client-page-content"
        inert={isMobileNavigation && navigationOpen}
        tabIndex={isMobileNavigation && navigationOpen ? -1 : undefined}
      >Saltar al contenido</a>
      <aside
        aria-hidden={isMobileNavigation && !navigationOpen ? true : undefined}
        aria-label={isMobileNavigation && navigationOpen ? "Navegación principal" : undefined}
        aria-modal={isMobileNavigation && navigationOpen ? true : undefined}
        className="app-sidebar"
        data-open={navigationOpen}
        inert={isMobileNavigation && !navigationOpen}
        ref={navigationRef}
        role={isMobileNavigation && navigationOpen ? "dialog" : undefined}
        tabIndex={isMobileNavigation && navigationOpen ? -1 : undefined}
      >
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
            <Link className="app-sidebar__admin-link" to="/app/platform/organizations">
              <Icon name="admin" /> Superadministración
            </Link>
          ) : null}
          <Link className="app-sidebar__public-link" to="/vecindario"><Icon name="eye" /> Explorar el Vecindario</Link>
          <div className="sidebar-note">
            <span className="sidebar-note__icon"><Icon name="spark" /></span>
            <p>{activeOrganization ? `Trabajando en ${activeOrganization.name}.` : "Tu espacio Vecidya está protegido por organización."}</p>
          </div>
        </div>
      </aside>
      {isMobileNavigation && navigationOpen ? <button aria-label="Cerrar navegación principal" className="app-sidebar-backdrop" onClick={() => closeNavigation(true)} type="button" /> : null}

      <div className="app-frame" inert={isMobileNavigation && navigationOpen}>
        <header className="app-header">
          <Button
            aria-controls="app-navigation"
            aria-expanded={navigationOpen}
            aria-label={navigationOpen ? "Cerrar navegación principal" : "Abrir navegación principal"}
            className="mobile-menu"
            onClick={() => setNavigationOpen((open) => !open)}
            ref={menuButtonRef}
            tone="ghost"
          >
            <Icon name="menu" />
          </Button>

          {hasOrganization ? (
            <div className="organization-switcher">
              <label htmlFor="organization-switcher">{isPlatformAdmin ? "Administrar organización" : "Negocio activo"}</label>
              {organizationSwitchLocked ? <span className="organization-switcher__locked" id="organization-switcher-locked">Guarda tus cambios antes de cambiar de negocio.</span> : null}
              <select
                aria-describedby={[organizationError ? "organization-switcher-error" : null, organizationSwitchLocked ? "organization-switcher-locked" : null].filter(Boolean).join(" ") || undefined}
                aria-invalid={organizationError ? true : undefined}
                disabled={submitting || organizationSwitchLocked}
                id="organization-switcher"
                onChange={(event) => handleSetActiveOrganization(event.currentTarget.value)}
                value={isPlatformAdmin ? "" : activeOrganization?.id ?? ""}
              >
                <option value="" disabled>Selecciona un negocio</option>
                {switcherOrganizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>{organization.name}</option>
                ))}
              </select>
              {organizationError ? <p id="organization-switcher-error" role="alert">{organizationError}</p> : null}
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
