import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listIntegrationConnections } from "../../db/queries/integration-connections.server";
import { listOrganizationServices } from "../../db/queries/organization-services.server";
import { ClientAreaShell } from "../components/client-area-shell";
import { Badge, Card } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { getActiveOrganization, requireSession } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { resolveCrmPortalState } from "../lib/crm-portal-state";

import type { Route } from "./+types/crm-app";

export function meta() {
  return [
    { title: "Mi CRM | Vecidya" },
    { name: "description", content: "Consulta el estado del acceso al CRM comercial externo de tu negocio." },
    { name: "robots", content: "noindex,nofollow" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireSession(env, request);
  const [activeOrganization, shell] = await Promise.all([
    getActiveOrganization(env, request),
    getClientWorkspaceContext(env, request),
  ]);
  if (!activeOrganization) {
    return { ...shell, activeOrganization: null, crmState: "not_included" as const };
  }
  const database = createDatabase(env.DB);
  const [services, connections] = await Promise.all([
    listOrganizationServices(database, activeOrganization.id),
    listIntegrationConnections(database, activeOrganization.id),
  ]);
  return { ...shell, activeOrganization, crmState: resolveCrmPortalState(services, connections) };
}

const messages = {
  not_included: { title: "CRM no incluido", message: "Tu organización no tiene asignado un servicio CRM. Puedes consultar los servicios disponibles en Vecidya.", badge: "No incluido" },
  pending_setup: { title: "Estamos preparando tu CRM", message: "La activación de tu subcuenta de GoHighLevel todavía no está verificada. Cuando esté configurada, se habilitará el acceso correspondiente.", badge: "Pendiente" },
  ready: { title: "Tu CRM está preparado", message: "Puedes abrir GoHighLevel. Es un servicio externo y te solicitará sus propias credenciales.", badge: "Activo" },
  suspended: { title: "Acceso no disponible", message: "El servicio CRM figura como suspendido o finalizado. Consulta con soporte antes de intentar acceder.", badge: "Suspendido" },
  unavailable: { title: "No se puede confirmar el acceso", message: "No podemos comprobar el estado de la conexión CRM. Por seguridad, no mostramos un enlace de acceso.", badge: "No disponible" },
} as const;

export default function CrmAppPage() {
  const { activeOrganization, workspaceUser, organizations, isPlatformAdmin, crmState } = useLoaderData<typeof loader>();
  const display = messages[crmState];
  return (
    <ClientAreaShell active="crm" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
      <main className="app-main" id="client-page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">MI VECIDYA · SISTEMA COMERCIAL</p>
            <h1>Mi CRM</h1>
            <p>Un punto de acceso al CRM de tu negocio, sin salir de la identidad Vecidya.</p>
          </div>
        </div>
        <Card className="app-primary-action" aria-labelledby="crm-access-title">
          <div>
            <p className="eyebrow">ACCESO CRM · {activeOrganization?.name ?? "SIN ORGANIZACIÓN"}</p>
            <h2 id="crm-access-title">{display.title}</h2>
            <p>{display.message}</p>
            <Badge tone={crmState === "ready" ? "success" : "neutral"}>{display.badge}</Badge>
          </div>
          <img src={publicAssets.brand.symbol3d} alt="" width="120" height="120" loading="lazy" />
        </Card>
        <Card aria-labelledby="crm-about-title">
          <h2 id="crm-about-title">¿Dónde se administra tu actividad comercial?</h2>
          <p>GoHighLevel gestiona contactos, oportunidades, conversaciones, calendarios y automatizaciones. Vecidya administra tu negocio, la presencia digital, la licencia y el vínculo con el servicio.</p>
          <p>Tu sesión de Vecidya no es una sesión de GoHighLevel. Nunca introduzcas contraseñas de GHL en un formulario de Vecidya.</p>
          {crmState === "ready" ? (
            <a className="button button--primary" href="https://app.gohighlevel.com/" target="_blank" rel="noopener noreferrer">
              Abrir CRM en GoHighLevel ↗
            </a>
          ) : (
            <Link className="button button--secondary" to="/app/services">Consultar mis servicios →</Link>
          )}
        </Card>
      </main>
    </ClientAreaShell>
  );
}
