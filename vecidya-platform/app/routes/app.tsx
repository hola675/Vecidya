import { Form, Link, useLoaderData, useNavigate } from "react-router";
import { useState } from "react";

import { createDatabase } from "../../db/client.server";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { billingAccount, organizationLicense } from "../../db/schema";
import { getBusinessProfileCompletion } from "../../db/business-profile-rules";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { listOrganizationServices } from "../../db/queries/organization-services.server";
import { countOrganizationMembers } from "../../db/queries/organization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { Alert, Badge, Button, Card, Icon } from "../components/ui";
import { authClient } from "../lib/auth-client";
import { ClientAreaShell } from "../components/client-area-shell";
import { JourneyGuide, ProgressMeter } from "../components/experience-system";
import { publicAssets } from "../assets/public-assets";

import type { Route } from "./+types/app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mi Vecidya" },
    { name: "description", content: "Espacio de organización de Vecidya." },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const [{ workspaceUser, organizations, isPlatformAdmin }, activeOrganization] = await Promise.all([
    getClientWorkspaceContext(env, request),
    getActiveOrganization(env, request),
  ]);
  const database = createDatabase(env.DB);
  const billing = await database.query.billingAccount.findFirst({ where: eq(billingAccount.ownerUserId, workspaceUser.id) });
  const activeLicense = billing ? await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.billingAccountId, billing.id), eq(organizationLicense.status, "active"), or(isNull(organizationLicense.endsAt), gt(organizationLicense.endsAt, new Date()))) }) : null;
  const canCreateOrganizations = Boolean(activeLicense) || !organizations.some((item) => item.role === "owner");
  const [businessProfile, services, memberCount] = activeOrganization
    ? await Promise.all([
      getBusinessProfileForOrganization(database, activeOrganization.id),
      listOrganizationServices(database, activeOrganization.id),
      countOrganizationMembers(database, activeOrganization.id),
    ])
    : [null, [], 0];
  return {
    workspaceUser,
    organizations,
    isPlatformAdmin,
    activeOrganization,
    businessProfile,
    businessProfileCompletion: getBusinessProfileCompletion(businessProfile),
    services,
    memberCount,
    canCreateOrganizations,
  };
}

const roleLabels: Record<string, string> = { owner: "Propietario", admin: "Administrador", member: "Miembro" };

type LoaderData = Awaited<ReturnType<typeof loader>>;

function getPrimaryAction(businessProfile: LoaderData["businessProfile"], completion: LoaderData["businessProfileCompletion"]) {
  if (!businessProfile) {
    return { label: "Crear perfil", to: "/app/business-profile", helper: "Todavía no tienes un perfil de negocio en Vecidya." };
  }
  if (businessProfile.status !== "published") {
    if (completion.issues.length > 0) {
      return {
        label: "Completar perfil",
        to: "/app/business-profile",
        helper: `Faltan ${completion.issues.length} campo${completion.issues.length === 1 ? "" : "s"} para poder publicarlo: ${completion.issues.join(", ")}.`,
      };
    }
    return { label: "Revisar para publicar", to: "/app/business-profile", helper: "Tu perfil tiene los datos mínimos. Revísalo y publícalo cuando quieras." };
  }
  return { label: "Administrar perfil", to: "/app/business-profile", helper: "Tu perfil está publicado en Vecindario." };
}

export default function AppPage() {
  const { activeOrganization, businessProfile, businessProfileCompletion, organizations, workspaceUser, isPlatformAdmin, services, memberCount, canCreateOrganizations } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await authClient.organization.create({
      name: String(formData.get("name")).trim(),
      slug: String(formData.get("slug")).trim(),
    });
    if (result.error) {
      setError(result.error.message ?? "No se pudo crear la organización.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    navigate("/app", { replace: true });
  }

  const greeting = "Hola";
  const firstName = workspaceUser.name.split(" ")[0];
  const primaryAction = activeOrganization ? getPrimaryAction(businessProfile, businessProfileCompletion) : null;

  return (
    <ClientAreaShell active="home" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="app-main app-home" id="client-page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI VECIDYA</p>
          <h1>{greeting}, {firstName}</h1>
          <p>{activeOrganization ? `Estás trabajando en ${activeOrganization.name}.` : "Consulta el estado real de tu negocio, organización y servicios Vecidya."}</p>
        </div>
        {activeOrganization ? <Badge tone="brand">{roleLabels[activeOrganization.role] ?? "Miembro"}</Badge> : null}
      </div>

      {activeOrganization ? <h2 className="sr-only">Organización activa: {activeOrganization.name}</h2> : null}

      {error ? <Alert>{error}</Alert> : null}

      {!activeOrganization ? (
        <Card className="empty-state">
          <img alt="" height="512" src={publicAssets.brand.symbol3d} width="512" />
          <div>
            <p className="eyebrow">ACCESO CONTROLADO</p>
            <h2>Comienza con tu primera organización</h2>
            <p>Con al menos una licencia Vecidya activa puedes gestionar varios negocios, completar sus perfiles, solicitar servicios y aparecer en Vecindario. El CRM de Barrio o Ciudad requiere licencia propia por organización.</p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="app-primary-action">
            <div>
              <p className="eyebrow">TU SIGUIENTE PASO</p>
              <h2>{primaryAction!.label}</h2>
              <p>{primaryAction!.helper}</p>
            </div>
            <div className="app-primary-action__buttons">
              <Link className="button button--primary" to={primaryAction!.to}>{primaryAction!.label}</Link>
              {businessProfile?.status === "published" ? (
                <Link className="button button--secondary" to={`/vecindario/${businessProfile.slug}`}>Ver página pública</Link>
              ) : null}
            </div>
          </Card>

          <section aria-label="Estado de tu negocio" className="app-state-grid">
            <Card className="app-state-tile">
              <p className="eyebrow">MI NEGOCIO</p>
              <strong>{businessProfile ? (businessProfile.status === "published" ? "Publicado" : "Borrador") : "Sin crear"}</strong>
              <ProgressMeter
                className="app-state-tile__progress"
                label={`${businessProfileCompletion.percentage}% del perfil completado`}
                value={businessProfileCompletion.percentage}
              />
              <p>{businessProfile ? `${businessProfileCompletion.percentage}% · ${businessProfileCompletion.completed} de ${businessProfileCompletion.total} campos mínimos completos.` : "Crea tu perfil para empezar."}</p>
            </Card>
            <Card className="app-state-tile">
              <p className="eyebrow">SERVICIOS VECIDYA</p>
              <strong>{services.length ? `${services.length} servicio${services.length === 1 ? "" : "s"}` : "Ninguno todavía"}</strong>
              <p>{services.length ? services.map((service) => service.name).join(" · ") : "Vecidya no te ha asignado servicios."}</p>
            </Card>
            <Card className="app-state-tile">
              <p className="eyebrow">EQUIPO</p>
              <strong>{memberCount} miembro{memberCount === 1 ? "" : "s"}</strong>
              <p>Tu rol es {roleLabels[activeOrganization.role] ?? "Miembro"}.</p>
            </Card>
          </section>

          <JourneyGuide
            area="client"
            title="De tu perfil a tu presencia pública"
            description="Esta guía refleja el estado del perfil de la organización seleccionada. No mide ventas ni rendimiento comercial."
            steps={[
              {
                title: "Completa la información",
                description: "Añade los campos necesarios para que las personas entiendan qué haces.",
                to: "/app/business-profile",
                action: "Revisar mi perfil",
                state: businessProfile && businessProfileCompletion.issues.length === 0 ? "complete" : "current",
              },
              {
                title: "Revisa y publica",
                description: "Comprueba los datos y decide cuándo mostrar el perfil en Vecindario.",
                to: "/app/business-profile",
                action: "Gestionar publicación",
                state: businessProfile?.status === "published" ? "complete" : businessProfile && businessProfileCompletion.issues.length === 0 ? "current" : "upcoming",
              },
              {
                title: "Mantén tu información al día",
                description: "Una vez publicado, puedes regresar para corregir contactos, horarios y descripción.",
                to: "/app/business-profile",
                action: "Actualizar mi negocio",
                state: businessProfile?.status === "published" ? "current" : "upcoming",
              },
            ]}
          />

          <section aria-label="Acciones rápidas" className="app-quick-actions">
            <p className="eyebrow">ACCIONES RÁPIDAS</p>
            <div className="app-quick-actions__grid">
              <Link className="app-quick-action" to="/app/business-profile"><Icon name="building" />Editar mi negocio</Link>
              {businessProfile?.status === "published" ? (
                <Link className="app-quick-action" to={`/vecindario/${businessProfile.slug}`}><Icon name="eye" />Ver página pública</Link>
              ) : null}
              <Link className="app-quick-action" to="/app/organization"><Icon name="team" />Gestionar equipo</Link>
              <Link className="app-quick-action" to="/app/services"><Icon name="spark" />Ver servicios</Link>
              <Link className="app-quick-action" to="/app/account"><Icon name="user" />Mi cuenta</Link>
            </div>
          </section>
        </>
      )}

      <Card className="setup-card" id="organization-setup">
        <div>
          <p className="eyebrow">NUEVA ORGANIZACIÓN</p>
          <h2>{organizations.length ? "Añadir otro negocio" : "Crear mi organización"}</h2>
          <p>Una licencia Vecidya activa permite administrar varios negocios y su presencia en Vecindario. Barrio y Ciudad habilitan el CRM solo en la organización que tenga contratada esa licencia.</p>
        </div>
        {canCreateOrganizations ? <Form className="organization-form" method="post" onSubmit={handleCreateOrganization}>
          <label>Nombre del negocio<input autoComplete="organization" name="name" required maxLength={100} placeholder="Ej. Barrio Centro" /></label>
          <label>Identificador público<input autoComplete="off" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="barrio-centro" spellCheck={false} /></label>
          <Button disabled={submitting} type="submit">{submitting ? "Creando…" : "Crear organización"}</Button>
        </Form> : <p>Para añadir organizaciones necesitas al menos una licencia Vecidya activa. <Link to="/licencias">Consultar licencias</Link>.</p>}
      </Card>
    </main>
    </ClientAreaShell>
  );
}
