import { useState } from "react";
import { Form, Link, useLoaderData, useLocation, useNavigate } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getBusinessProfileCompletion } from "../../db/business-profile-rules";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { listOrganizationServices } from "../../db/queries/organization-services.server";
import { countOrganizationMembers, listOrganizationsForUser } from "../../db/queries/organization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import {
  getActiveOrganization,
  requireSession,
} from "../../server/auth/session.server";
import { Alert, Badge, Button, Card } from "../components/ui";
import { PlatformFooter } from "../components/platform-footer";
import { authClient } from "../lib/auth-client";

import type { Route } from "./+types/app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mi Vecidya" },
    { name: "description", content: "Espacio de organización de Vecidya." },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const session = await requireSession(env, request);
  const database = createDatabase(env.DB);
  const [organizations, activeOrganization] = await Promise.all([
    listOrganizationsForUser(database, session.user.id),
    getActiveOrganization(env, request),
  ]);
  const [businessProfile, services, memberCount] = activeOrganization
    ? await Promise.all([
      getBusinessProfileForOrganization(database, activeOrganization.id),
      listOrganizationServices(database, activeOrganization.id),
      countOrganizationMembers(database, activeOrganization.id),
    ])
    : [null, [], 0];
  return { user: session.user, organizations, activeOrganization, businessProfile, businessProfileCompletion: getBusinessProfileCompletion(businessProfile), services, memberCount };
}

const navigation = [
  { label: "Inicio", icon: "home" as const, to: "/app" },
  { label: "Mi cuenta", icon: "user" as const, to: "/app/account" },
  { label: "Mi negocio", icon: "building" as const, to: "/app/business-profile" },
  { label: "Mi organización", icon: "shield" as const, to: "/app/organization" },
  { label: "Servicios", icon: "spark" as const, to: "/app/services" },
];

const serviceStatusLabels: Record<string, string> = {
  active: "Activo",
  ended: "Finalizado",
  pending: "Pendiente",
  suspended: "Suspendido",
};

const roleLabels: Record<string, string> = { owner: "Propietario", admin: "Administrador", member: "Miembro" };

function getServiceStatusLabel(status: string) {
  return serviceStatusLabels[status] ?? "Estado informado por Vecidya";
}

function Icon({ name }: { name: "home" | "building" | "menu" | "shield" | "spark" | "user" }) {
  const paths = {
    home: <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z M9 21v-6h6v6" />,
    building: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h4M8 11h4M8 15h4M16 9h2M16 13h2" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    shield: <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Zm-3 9 2 2 4-4" />,
    spark: <path d="m12 3 .9 5.1L18 9l-5.1.9L12 15l-.9-5.1L6 9l5.1-.9L12 3Z" />,
    user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  };

  return (
    <svg aria-hidden="true" className="icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

export default function AppPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeOrganization, businessProfile, businessProfileCompletion, organizations, user, services, memberCount } = useLoaderData<typeof loader>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);

  async function handleCreateOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await authClient.organization.create({
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
    });

    if (result.error) {
      setError(result.error.message ?? "No se pudo crear la organización.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate("/app", { replace: true });
  }

  async function handleSetActiveOrganization(organizationId: string) {
    if (!organizationId || organizationId === activeOrganization?.id) return;

    setSubmitting(true);
    setError(null);
    const result = await authClient.organization.setActive({ organizationId });

    if (result.error) {
      setError(result.error.message ?? "No se pudo cambiar la organización activa.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate("/app", { replace: true });
  }

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard">Saltar al contenido</a>
      <aside className="app-sidebar" data-open={navigationOpen}>
        <Link className="brand" to="/app" onClick={() => setNavigationOpen(false)}>
          <span className="brand-symbol-frame" aria-hidden="true">
            <img alt="" className="brand-symbol" height="691" src="/brand/vecidya-app-icon.png" width="691" />
          </span>
          <span>
            <strong>Vecidya</strong>
            <small>Presencia digital para negocios locales</small>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="app-navigation" id="app-navigation">
          {navigation.map((item) => (
              <Link aria-current={location.pathname === item.to ? "page" : undefined} to={item.to} key={item.label}>
                <Icon name={item.icon} />
                {item.label}
              </Link>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="sidebar-note__icon"><Icon name="spark" /></span>
          <p>Tu espacio Vecidya está protegido por organización.</p>
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

          <div className="organization-switcher">
            <label htmlFor="organization-switcher">Organización</label>
            <select
              disabled={submitting || organizations.length === 0}
              id="organization-switcher"
              onChange={(event) => handleSetActiveOrganization(event.currentTarget.value)}
              value={activeOrganization?.id ?? ""}
            >
              <option value="" disabled>Selecciona una organización</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </div>

          <details className="user-menu">
            <summary aria-label="Abrir menú de usuario">
              <span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="user-menu__label">{user.name}</span>
            </summary>
            <div className="user-menu__panel">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <Link to="/app/account">Gestionar cuenta</Link>
              <Form method="post" onSubmit={handleSignOut}>
                <Button disabled={submitting} tone="ghost" type="submit">
                  {submitting ? "Procesando…" : "Cerrar sesión"}
                </Button>
              </Form>
            </div>
          </details>
        </header>

        <main className="app-main" id="dashboard">
          <div className="page-heading">
            <div>
              <p className="eyebrow">MI VECIDYA</p>
              <h1>Bienvenido, {user.name.split(" ")[0]}</h1>
              <p>Consulta el estado real de tu negocio, organización y servicios Vecidya.</p>
            </div>
            {activeOrganization ? <Badge tone="brand">{roleLabels[activeOrganization.role] ?? "Miembro"}</Badge> : null}
          </div>

          {error ? <Alert>{error}</Alert> : null}

          {activeOrganization ? (
            <Card className="workspace-card">
              <div className="workspace-card__icon"><Icon name="shield" /></div>
              <div>
                <p className="eyebrow">ORGANIZACIÓN ACTIVA</p>
                <h2>{businessProfile?.displayName ?? activeOrganization.name}</h2>
                <p>{businessProfile ? `Perfil ${businessProfile.status === "published" ? "publicado" : "en borrador"}.` : "Esta organización todavía no tiene un perfil comercial."}</p>
              </div>
              <Badge tone={businessProfile?.status === "published" ? "success" : "neutral"}>{businessProfile?.status === "published" ? "Publicado" : businessProfile ? "Borrador" : "Sin perfil"}</Badge>
            </Card>
          ) : (
            <Card className="empty-state">
              <img alt="" height="691" src="/brand/vecidya-app-icon.png" width="691" />
              <div>
                <p className="eyebrow">PRIMER PASO</p>
                <h2>Crea tu primera organización</h2>
                <p>Será el espacio seguro desde el que gestionarás tu presencia digital.</p>
              </div>
            </Card>
          )}

          {activeOrganization ? (
            <Card className="business-profile-summary business-profile-summary--primary">
              <div>
                <p className="eyebrow">TU PERFIL PÚBLICO</p>
                <h2>{businessProfile ? businessProfile.displayName : `Da identidad a ${activeOrganization.name}`}</h2>
                <p>{businessProfile?.status === "published" ? "Tu página está publicada en Vecindario." : businessProfile ? "Completa la información pendiente para preparar la publicación." : "Crea el perfil que presentará tu negocio en Vecindario."}</p>
                {businessProfile ? <div className="app-profile-progress">
                  <div><span>Completitud del perfil</span><strong>{businessProfileCompletion.percentage}%</strong></div>
                  <div aria-label={`Perfil completo al ${businessProfileCompletion.percentage}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={businessProfileCompletion.percentage} className="app-profile-progress__track" role="progressbar"><span style={{ width: `${businessProfileCompletion.percentage}%` }} /></div>
                </div> : null}
              </div>
              <div className="business-profile-actions">
                <Link className="button button--primary" to="/app/business-profile">{businessProfile ? "Editar perfil" : "Crear perfil"}</Link>
                {businessProfile?.status === "published" ? <Link className="button button--secondary" to={`/vecindario/${businessProfile.slug}`}>Ver página pública</Link> : null}
              </div>
            </Card>
          ) : null}
          {activeOrganization ? <Card className="business-profile-summary"><div><p className="eyebrow">MIS SERVICIOS</p><h2>{services.length ? `${services.length} servicio${services.length === 1 ? "" : "s"} asociado${services.length === 1 ? "" : "s"}` : "Servicios Vecidya"}</h2><p>{services.length ? services.map((service) => `${service.name}: ${getServiceStatusLabel(service.status)}`).join(" · ") : "Aún no hay servicios asociados a esta organización."}</p></div><Link className="button button--secondary" to="/app/services">Ver servicios</Link></Card> : null}
          {activeOrganization ? <Card className="business-profile-summary"><div><p className="eyebrow">MI ORGANIZACIÓN</p><h2>{activeOrganization.name}</h2><p>Tu rol es {roleLabels[activeOrganization.role] ?? "Miembro"}. Esta organización tiene {memberCount} miembro{memberCount === 1 ? "" : "s"}.</p></div><div className="business-profile-actions"><Badge tone="brand">Activa</Badge><Link className="button button--secondary" to="/app/organization">Ver organización</Link></div></Card> : null}

          <Card className="setup-card" id="organization-setup">
            <div>
              <p className="eyebrow">ORGANIZACIONES</p>
              <h2>{organizations.length ? "Crea otro espacio" : "Crea tu espacio Vecidya"}</h2>
              <p>Usa un nombre claro y un slug único en minúsculas.</p>
            </div>
            <Form className="organization-form" method="post" onSubmit={handleCreateOrganization}>
              <label>
                Nombre
                <input autoComplete="organization" name="name" placeholder="Ej. Barrio Centro…" required />
              </label>
              <label>
                Slug
                <input autoComplete="off" name="slug" pattern="[a-z0-9-]+" placeholder="barrio-centro…" required spellCheck={false} />
              </label>
              <Button disabled={submitting} type="submit">
                {submitting ? "Creando…" : "Crear organización"}
              </Button>
            </Form>
          </Card>
        </main>
        <PlatformFooter area="app" />
      </div>
    </div>
  );
}
