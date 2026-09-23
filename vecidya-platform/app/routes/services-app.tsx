import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { ClientAreaShell } from "../components/client-area-shell";
import { listOrganizationServices } from "../../db/queries/organization-services.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization, requireSession } from "../../server/auth/session.server";
import { Badge, Card } from "../components/ui";

import type { Route } from "./+types/services-app";

const statusLabels = {
  active: "Activo",
  ended: "Finalizado",
  pending: "Pendiente",
  suspended: "Suspendido",
} as const;

const statusDescriptions = {
  active: "Este servicio está activo para tu organización.",
  ended: "Este servicio ya no está activo para tu organización.",
  pending: "Este servicio está pendiente de activación por Vecidya.",
  suspended: "Este servicio está temporalmente suspendido por Vecidya.",
} as const;

type ServiceStatus = keyof typeof statusLabels;

function getStatusLabel(status: string) {
  return statusLabels[status as ServiceStatus] ?? status;
}

function getStatusDescription(status: string) {
  return statusDescriptions[status as ServiceStatus] ?? "Estado informado por Vecidya.";
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mis servicios | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireSession(env, request);
  const organization = await getActiveOrganization(env, request);
  if (!organization) throw new Response("Organización activa requerida", { status: 403 });
  return {
    organization,
    services: await listOrganizationServices(createDatabase(env.DB), organization.id),
  };
}

export default function AppServices() {
  const { organization, services } = useLoaderData<typeof loader>();

  return (
    <ClientAreaShell active="services">
    <main className="app-main services-page" id="client-page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MIS SERVICIOS</p>
          <h1>{organization.name}</h1>
          <p>Consulta qué servicios tienes con Vecidya y qué significa cada estado.</p>
        </div>
      </div>

      {services.length ? (
        <div aria-label="Servicios de la organización" className="services-list">
          {services.map((service) => (
            <Card className="service-card" key={service.code}>
              <div className="service-card__heading">
                <div>
                  <p className="eyebrow">SERVICIO VECIDYA</p>
                  <h2>{service.name}</h2>
                </div>
                <Badge tone={service.status === "active" ? "success" : service.status === "pending" ? "brand" : "neutral"}>
                  {getStatusLabel(service.status)}
                </Badge>
              </div>
              <p className="service-card__description">{service.description ?? "Servicio de Vecidya."}</p>
              <p className="service-card__status">{getStatusDescription(service.status)}</p>
              {service.code === "crm" && service.status === "active" ? (
                <p className="service-card__note">La asignación de CRM no habilita una herramienta CRM externa.</p>
              ) : null}
              {service.code === "presence" && service.status === "active" ? (
                <Link className="text-link" to="/app/business-profile">Ver mi negocio →</Link>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <section aria-labelledby="services-empty-title" className="empty-state card">
          <div>
            <p className="eyebrow">SIN SERVICIOS</p>
            <h2 id="services-empty-title">Aún no hay servicios asociados</h2>
            <p>Cuando Vecidya active un servicio para tu organización, aparecerá aquí.</p>
          </div>
        </section>
      )}
    </main>
    </ClientAreaShell>
  );
}
