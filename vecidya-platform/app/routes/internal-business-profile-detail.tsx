import { data, Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";

import { getPlatformBusinessProfileDetail } from "../../db/queries/platform-business-profiles.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { dayOfWeekLabels } from "../../db/business-hours-rules";
import { serviceModeLabels } from "../../db/business-profile-rules";
import {
  applyGovernanceAction,
  isGovernanceAction,
  listPlatformAuditLog,
  PlatformGovernanceConflict,
  type GovernanceAction,
} from "../../db/queries/platform-governance.server";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Alert, Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-business-profile-detail";

const governanceActionMessages: Record<GovernanceAction, string> = {
  verify: "Perfil verificado.",
  unverify: "Verificación retirada.",
  suspend: "Perfil suspendido.",
  reactivate: "Perfil reactivado.",
};

const auditActionLabels: Record<string, string> = {
  "business_profile.verify": "Verificó el perfil",
  "business_profile.unverify": "Retiró la verificación",
  "business_profile.suspend": "Suspendió el perfil",
  "business_profile.reactivate": "Reactivó el perfil",
};

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const businessProfileId = params.businessProfileId ?? "";
  const detail = await getPlatformBusinessProfileDetail(database, businessProfileId);
  if (!detail) throw new Response("Business Profile no encontrado", { status: 404 });
  const [activity, businessHours] = await Promise.all([
    listPlatformAuditLog(database, { entityId: businessProfileId, limit: 20 }),
    listBusinessHoursForOrganization(database, detail.profile.organizationId),
  ]);
  return { ...detail, activity, businessHours, workspaceUser: access.workspaceUser };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData ? `${loaderData.profile.displayName} | Administración Vecidya` : "Negocio | Administración Vecidya" }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const businessProfileId = params.businessProfileId ?? "";
  const detail = await getPlatformBusinessProfileDetail(database, businessProfileId);
  if (!detail) throw new Response("Business Profile no encontrado", { status: 404 });

  const formData = await request.formData();
  const requestedAction = formData.get("action");
  const expectedUpdatedAtValue = formData.get("expectedUpdatedAt");
  const expectedUpdatedAt = expectedUpdatedAtValue === "" ? null : Number(expectedUpdatedAtValue);
  if (typeof expectedUpdatedAtValue !== "string" || (expectedUpdatedAt !== null && !Number.isSafeInteger(expectedUpdatedAt))) {
    return data({ error: "La vista quedó desactualizada. Recarga la página e inténtalo de nuevo." }, { status: 409 });
  }
  if (!isGovernanceAction(requestedAction)) {
    return { error: "Acción administrativa no reconocida." };
  }

  try {
    await applyGovernanceAction(database, businessProfileId, detail.profile.organizationId, access.userId, requestedAction, expectedUpdatedAt);
  } catch (error) {
    if (error instanceof PlatformGovernanceConflict) return data({ error: error.message }, { status: 409 });
    throw error;
  }
  return { success: governanceActionMessages[requestedAction] };
}

export default function InternalBusinessProfileDetail() {
  const { activity, profile, completion, services, businessHours, workspaceUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const isVerified = profile.verificationStatus === "verified";
  const isSuspended = profile.platformStatus === "suspended";

  function confirmSuspend(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("¿Suspender este perfil? Dejará de ser visible en el Vecindario y en su página pública.")) {
      event.preventDefault();
    }
  }

  function confirmReactivate(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("¿Reactivar este perfil? Volverá a ser visible públicamente si está publicado.")) {
      event.preventDefault();
    }
  }

  return (
    <AdminShell active="businesses" workspaceUser={workspaceUser}>
      <main className="admin-content">
        <Link className="back-link" to="/app/internal/businesses">← Volver a Business Profiles</Link>
        <div className="page-heading">
          <div><p className="eyebrow">{profile.organizationSlug}</p><h1>{profile.displayName}</h1><p>{profile.organizationName} · /{profile.slug}</p></div>
          <div className="admin-business-card__badges">
            <Badge tone={profile.status === "published" ? "success" : "neutral"}>{profile.status === "published" ? "Publicado" : "Borrador"}</Badge>
            {isVerified ? <Badge tone="success">Verificado</Badge> : <Badge tone="neutral">No verificado</Badge>}
            {isSuspended ? <Badge tone="danger">Suspendido</Badge> : <Badge tone="neutral">Activo</Badge>}
          </div>
        </div>

        {actionData && "error" in actionData ? <Alert>{actionData.error}</Alert> : null}
        {actionData && "success" in actionData ? <p className="success-message" role="status" aria-live="polite">{actionData.success}</p> : null}

        <div className="admin-business-detail-grid">
          <section className="card"><p className="eyebrow">ESTADO DE PUBLICACIÓN</p><h2>{completion.percentage}% completo</h2>{completion.issues.length ? <><p>Campos pendientes:</p><ul className="admin-pending-list">{completion.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></> : <p>El perfil cumple los campos requeridos para publicar.</p>}{profile.status === "published" && !isSuspended ? <Link className="button button--secondary" to={`/vecindario/${profile.slug}`}>Ver página pública</Link> : null}</section>
          <section className="card"><p className="eyebrow">NEGOCIO Y ORGANIZACIÓN</p><dl className="admin-detail-list"><div><dt>Organización</dt><dd>{profile.organizationName}</dd></div><div><dt>Slug organización</dt><dd>{profile.organizationSlug}</dd></div><div><dt>Slug público</dt><dd>{profile.slug}</dd></div><div><dt>Categoría</dt><dd>{profile.category || "Pendiente"}</dd></div><div><dt>Ciudad / país</dt><dd>{[profile.city, profile.country].filter(Boolean).join(", ") || "Pendiente"}</dd></div></dl></section>
        </div>

        <section className="card admin-review-context" aria-labelledby="admin-review-context-title">
          <div className="section-heading"><div><p className="eyebrow">CONTEXTO DE REVISIÓN</p><h2 id="admin-review-context-title">Contacto y operación pública</h2></div><span>Solo lectura</span></div>
          <dl className="admin-review-context__grid">
            <div><dt>Teléfono</dt><dd>{profile.phone ? <a href={`tel:${profile.phone}`}>{profile.phone}</a> : "No informado"}</dd></div>
            <div><dt>Correo público</dt><dd>{profile.publicEmail ? <a href={`mailto:${profile.publicEmail}`}>{profile.publicEmail}</a> : "No informado"}</dd></div>
            <div><dt>Sitio web</dt><dd>{profile.websiteUrl ? <a href={profile.websiteUrl} rel="noreferrer" target="_blank">Abrir sitio ↗</a> : "No informado"}</dd></div>
            <div><dt>WhatsApp</dt><dd>{profile.whatsapp || "No informado"}</dd></div>
            <div><dt>Modalidad</dt><dd>{profile.serviceMode ? serviceModeLabels[profile.serviceMode] ?? profile.serviceMode : "No informada"}</dd></div>
            <div><dt>Área de servicio</dt><dd>{profile.serviceArea || "No informada"}</dd></div>
            <div><dt>Instagram</dt><dd>{profile.instagramUrl ? <a href={profile.instagramUrl} rel="noreferrer" target="_blank">Ver perfil ↗</a> : "No informado"}</dd></div>
            <div><dt>Facebook</dt><dd>{profile.facebookUrl ? <a href={profile.facebookUrl} rel="noreferrer" target="_blank">Ver perfil ↗</a> : "No informado"}</dd></div>
            <div><dt>LinkedIn</dt><dd>{profile.linkedinUrl ? <a href={profile.linkedinUrl} rel="noreferrer" target="_blank">Ver perfil ↗</a> : "No informado"}</dd></div>
          </dl>
          <div className="admin-review-hours"><h3>Horarios declarados</h3>
            {businessHours.length ? <ul>{businessHours.map((hours) => <li key={hours.dayOfWeek}><span>{dayOfWeekLabels[hours.dayOfWeek] ?? `Día ${hours.dayOfWeek}`}</span><strong>{hours.isClosed ? "Cerrado" : hours.opensAt && hours.closesAt ? `${hours.opensAt}–${hours.closesAt}` : "Horario incompleto"}</strong></li>)}</ul> : <p>Este perfil no tiene horarios declarados.</p>}
          </div>
        </section>

        <section className="card admin-governance">
          <p className="eyebrow">GOBIERNO DE PLATAFORMA</p>
          <h2>Verificación y estado</h2>
          <dl className="admin-detail-list">
            <div><dt>Verificación</dt><dd>{isVerified ? "Verificado" : "No verificado"}</dd></div>
            <div><dt>Estado de plataforma</dt><dd>{isSuspended ? "Suspendido" : "Activo"}</dd></div>
          </dl>
          <p className="form-help">"Verificado" significa únicamente que Vecidya revisó administrativamente este perfil bajo el proceso interno vigente; no es una garantía, certificación legal ni recomendación comercial.</p>
          <div className="admin-governance-actions">
            {isVerified ? (
              <Form method="post"><input name="action" type="hidden" value="unverify" /><input name="expectedUpdatedAt" type="hidden" value={profile.governanceUpdatedAt?.getTime() ?? ""} /><button className="button button--secondary" disabled={isSaving} type="submit">Retirar verificación</button></Form>
            ) : (
              <Form method="post"><input name="action" type="hidden" value="verify" /><input name="expectedUpdatedAt" type="hidden" value={profile.governanceUpdatedAt?.getTime() ?? ""} /><button className="button button--secondary" disabled={isSaving} type="submit">Verificar</button></Form>
            )}
            {isSuspended ? (
              <Form method="post" onSubmit={confirmReactivate}><input name="action" type="hidden" value="reactivate" /><input name="expectedUpdatedAt" type="hidden" value={profile.governanceUpdatedAt?.getTime() ?? ""} /><button className="button button--primary" disabled={isSaving} type="submit">Reactivar</button></Form>
            ) : (
              <Form method="post" onSubmit={confirmSuspend}><input name="action" type="hidden" value="suspend" /><input name="expectedUpdatedAt" type="hidden" value={profile.governanceUpdatedAt?.getTime() ?? ""} /><button className="button button--danger" disabled={isSaving} type="submit">Suspender</button></Form>
            )}
          </div>
        </section>

        <section className="card admin-business-description"><p className="eyebrow">CONTENIDO</p><h2>Descripción corta</h2><p>{profile.shortDescription || "Pendiente"}</p><h2>Descripción</h2><p>{profile.description || "No registrada"}</p></section>
        <section className="card"><div className="section-heading"><div><p className="eyebrow">SERVICIOS DE LA ORGANIZACIÓN</p><h2>Servicios relacionados</h2></div><span>{services.length}</span></div>{services.length ? <ul className="admin-service-list">{services.map((service) => <li key={service.code}><span>{service.name}</span><Badge tone={service.status === "active" ? "success" : "neutral"}>{service.status}</Badge></li>)}</ul> : <p>No hay servicios asignados.</p>}</section>

        <section className="card admin-audit-log">
          <p className="eyebrow">ACTIVIDAD ADMINISTRATIVA</p>
          <h2>Historial de gobierno</h2>
          {activity.length ? (
            <ul className="admin-audit-list">
              {activity.map((entry) => (
                <li key={entry.id}>
                  <p><strong>{auditActionLabels[entry.action] ?? entry.action}</strong> · {entry.actorName ?? entry.actorEmail ?? "Actor desconocido"}</p>
                  <p className="admin-audit-list__meta">{entry.previousValue} → {entry.newValue} · {formatTimestamp(entry.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : <p>Todavía no hay acciones administrativas registradas para este perfil.</p>}
        </section>
      </main>
    </AdminShell>
  );
}
