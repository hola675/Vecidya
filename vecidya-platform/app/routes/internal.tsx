import { Link, useLoaderData, useLocation } from "react-router";
import { count, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organizationService } from "../../db/schema";
import { listPlatformOrganizations } from "../../db/queries/platform-organizations.server";
import { listPlatformBusinessProfiles } from "../../db/queries/platform-business-profiles.server";
import { listPlatformIntegrations } from "../../db/queries/platform-integrations.server";
import { listPlatformAuditLog } from "../../db/queries/platform-governance.server";
import { platformAuditActionLabels } from "../lib/platform-audit-labels";
import { AdminShell } from "../components/admin-shell";
import { Icon } from "../components/ui";
import { ComparisonBars, JourneyGuide, MetricCard } from "../components/experience-system";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administración de Vecidya | Vecidya" }];
}

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const [organizations, profiles, integrations, recentActivity, pendingServices] = await Promise.all([
    listPlatformOrganizations(database),
    listPlatformBusinessProfiles(database),
    listPlatformIntegrations(database),
    listPlatformAuditLog(database, { limit: 5 }),
    database.select({ total: count() }).from(organizationService).where(eq(organizationService.status, "pending")),
  ]);

  const draftProfiles = profiles.filter((profile) => profile.status !== "published");
  const suspendedProfiles = profiles.filter((profile) => profile.platformStatus === "suspended");
  const servicesAssigned = organizations.reduce((sum, organization) => sum + organization.servicesCount, 0);

  return {
    workspaceUser: access.workspaceUser,
    counts: {
      organizations: organizations.length,
      profiles: profiles.length,
      servicesAssigned,
      integrations: integrations.length,
    },
    attention: {
      draftCount: draftProfiles.length,
      suspendedCount: suspendedProfiles.length,
      pendingServicesCount: pendingServices[0]?.total ?? 0,
    },
    recentActivity,
  };
}

export default function InternalHome() {
  const location = useLocation();
  const routeBase = location.pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  const { workspaceUser, counts, attention, recentActivity } = useLoaderData<typeof loader>();
  const hasAttention = attention.draftCount > 0 || attention.suspendedCount > 0 || attention.pendingServicesCount > 0;

  return (
    <AdminShell active="home" workspaceUser={workspaceUser}>
      <main className="admin-main admin-dashboard admin-dashboard--redesign">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CENTRO DE OPERACIONES</p>
            <h1>Administración de Vecidya</h1>
            <p>Consulta la información de plataforma y accede a las tareas operativas disponibles.</p>
          </div>
        </div>

        <div className="admin-stat-grid" aria-label="Resumen de plataforma">
          <MetricCard className="admin-stat-card" icon="organizations" label="Espacios de trabajo" value={counts.organizations} />
          <MetricCard className="admin-stat-card" icon="building" label="Perfiles de negocio" value={counts.profiles} />
          <MetricCard className="admin-stat-card" icon="spark" label="Servicios asignados" value={counts.servicesAssigned} />
          <MetricCard className="admin-stat-card" icon="integrations" label="Integraciones registradas" value={counts.integrations} />
        </div>

        <section className="card admin-attention" aria-labelledby="workspace-profile-title">
          <p className="eyebrow">CLIENTE → NEGOCIO(S)</p>
          <h2 id="workspace-profile-title">Un cliente puede administrar varios negocios</h2>
          <p>El <strong>cliente</strong> es la cuenta responsable. Cada <strong>negocio</strong> tiene su propia licencia y su ficha pública. Por dentro, los datos de cada negocio viven en un espacio de trabajo con sus miembros, permisos y servicios; no necesitas separar esos conceptos para asignar licencias.</p>
          <Link className="button button--primary" to={`${routeBase}/licenses`}>Administrar licencias por cliente y negocio</Link>
        </section>

        <section aria-labelledby="admin-attention-title" className="card admin-attention">
          <p className="eyebrow">REQUIERE ATENCIÓN</p>
          <h2 id="admin-attention-title">Qué mirar primero</h2>
          {hasAttention ? (
            <ul className="admin-attention__list">
              {attention.draftCount > 0 ? <li><Link to="/app/internal/businesses">{attention.draftCount} perfil{attention.draftCount === 1 ? "" : "es"} en borrador, sin publicar</Link></li> : null}
              {attention.suspendedCount > 0 ? <li><Link to="/app/internal/businesses">{attention.suspendedCount} perfil{attention.suspendedCount === 1 ? "" : "es"} suspendido{attention.suspendedCount === 1 ? "" : "s"}</Link></li> : null}
              {attention.pendingServicesCount > 0 ? <li><Link to="/app/internal/services">{attention.pendingServicesCount} servicio{attention.pendingServicesCount === 1 ? "" : "s"} pendiente{attention.pendingServicesCount === 1 ? "" : "s"} de activación</Link></li> : null}
            </ul>
          ) : <p className="admin-attention__empty">No hay elementos que requieran revisión.</p>}
        </section>

        <JourneyGuide
          area="admin"
          title="Supervisa sin perder el contexto"
          description="Las tareas dependen de los permisos de administración de plataforma. Consultar no equivale a publicar, contratar ni modificar datos de una organización."
          steps={[
            { title: "Revisa los pendientes", description: "Comprueba los elementos que necesitan revisión antes de actuar.", to: "/app/internal/businesses", action: "Ver perfiles de negocio" },
            { title: "Consulta espacios de trabajo", description: "Inspecciona miembros, permisos y servicios del negocio dentro del área interna autorizada.", to: "/app/internal/organizations", action: "Abrir espacios de trabajo" },
            { title: "Verifica la trazabilidad", description: "Revisa las acciones registradas y su fecha antes de continuar.", to: "/app/internal/audit", action: "Ver auditoría" },
          ]}
        />

        <div className="experience-admin-data">
          <ComparisonBars
            title="Elementos que merecen revisión"
            description="Recuentos independientes del estado actual, no porcentajes de un único conjunto. Un perfil puede estar sin publicar y suspendido a la vez."
            values={[
              { label: "Perfiles sin publicar", value: attention.draftCount },
              { label: "Perfiles suspendidos", value: attention.suspendedCount },
              { label: "Servicios pendientes", value: attention.pendingServicesCount },
            ]}
          />
        </div>

        <section className="card admin-attention" aria-labelledby="admin-diagnostic-leads-title">
          <p className="eyebrow">CAPTACIÓN VECIDYA</p>
          <h2 id="admin-diagnostic-leads-title">Interesados del diagnóstico</h2>
          <p>Consulta solicitudes identificadas y permisos de contacto desde la base de datos de Vecidya. Sin integración con GHL.</p>
          <Link className="text-link" to="/app/internal/diagnostic-leads">Abrir interesados →</Link>
          <p><Link className="text-link" to="/app/internal/diagnostic-analytics">Ver analítica y gráficos del diagnóstico →</Link></p>
        </section>

        <div className="admin-overview-grid">
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon" aria-hidden="true"><Icon name="spark" /></span>
            <p className="eyebrow">ASIGNACIONES</p><h2>Servicios</h2>
            <p>Consulta y actualiza los estados de servicios asociados a cada organización.</p>
            <Link className="text-link" to="/app/internal/services">Abrir servicios <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--violet" aria-hidden="true"><Icon name="audit" /></span>
            <p className="eyebrow">ACCESO A PRODUCTOS</p><h2>Licencias</h2>
            <p>Asigna Cuadra, Barrio o Ciudad a cada negocio y revisa su estado.</p>
            <Link className="text-link" to="/app/internal/licenses">Administrar licencias <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--orange" aria-hidden="true"><Icon name="organizations" /></span>
            <p className="eyebrow">DATOS INTERNOS DEL NEGOCIO</p><h2>Espacios de trabajo</h2>
            <p>Consulta quién administra cada negocio, sus miembros, permisos, servicios e integraciones.</p>
            <Link className="text-link" to="/app/internal/organizations">Ver espacios de trabajo <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--green" aria-hidden="true"><Icon name="building" /></span>
            <p className="eyebrow">DIRECTORIO</p><h2>Perfiles de negocio</h2>
            <p>Revisa estado, completitud y presencia pública de los perfiles registrados.</p>
            <Link className="text-link" to="/app/internal/businesses">Ver perfiles <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card">
            <span className="admin-overview-card__icon admin-overview-card__icon--violet" aria-hidden="true"><Icon name="integrations" /></span>
            <p className="eyebrow">CONEXIONES</p><h2>Integraciones</h2>
            <p>Consulta metadata de conexiones registradas, sin conectar ni modificar proveedores.</p>
            <Link className="text-link" to="/app/internal/integrations">Ver integraciones <span aria-hidden="true">→</span></Link>
          </section>
          <section className="card admin-overview-card admin-overview-card--wide">
            <span className="admin-overview-card__icon admin-overview-card__icon--dark" aria-hidden="true"><Icon name="audit" /></span>
            <div className="admin-overview-card__copy"><p className="eyebrow">TRAZABILIDAD</p><h2>Auditoría</h2><p>Consulta acciones de gobierno sobre perfiles: actor, operación, estado y fecha.</p></div>
            <Link className="text-link" to="/app/internal/audit">Abrir auditoría <span aria-hidden="true">→</span></Link>
          </section>
        </div>

        <section aria-labelledby="admin-recent-activity-title" className="card admin-recent-activity">
          <div className="section-heading">
            <div><p className="eyebrow">ACTIVIDAD RECIENTE</p><h2 id="admin-recent-activity-title">Últimas acciones de gobierno</h2></div>
            <Link className="text-link" to="/app/internal/audit">Ver toda la auditoría →</Link>
          </div>
          {recentActivity.length ? (
            <ul className="admin-audit-list admin-audit-list--compact">
              {recentActivity.map((entry) => (
                <li key={entry.id}>
                  <span>{platformAuditActionLabels[entry.action] ?? entry.action} · {entry.businessProfileDisplayName ?? `${entry.entityType}: ${entry.entityId}`}</span>
                  <span className="admin-audit-list__meta">{entry.actorName ?? entry.actorEmail ?? "Actor desconocido"} · {formatTimestamp(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : <p>Todavía no hay acciones administrativas registradas.</p>}
        </section>
      </main>
    </AdminShell>
  );
}
