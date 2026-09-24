import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";

import { createDatabase } from "../../db/client.server";
import { dayOfWeekLabels } from "../../db/business-hours-rules";
import { serviceModeLabels } from "../../db/business-profile-rules";
import {
  getBusinessProfileForOrganization,
  publishBusinessProfileForOrganization,
  saveBusinessProfileForOrganization,
} from "../../db/queries/business-profile.server";
import {
  listBusinessHoursForOrganization,
  replaceBusinessHoursForOrganization,
} from "../../db/queries/business-hours.server";
import { getBusinessProfileGovernance } from "../../db/queries/platform-governance.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import {
  getBusinessProfileCompletion,
  getBusinessProfilePublicationIssues,
  parseBusinessHoursForm,
  parseBusinessProfileForm,
} from "../../server/business-profile-validation.server";
import { Alert, Badge, Button, Card } from "../components/ui";
import { ClientAreaShell } from "../components/client-area-shell";

import type { Route } from "./+types/business-profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mi negocio | Vecidya" },
    { name: "description", content: "Gestiona el perfil comercial de tu organización." },
  ];
}

const serviceModeOptions = [
  { value: "", label: "Sin definir" },
  ...Object.entries(serviceModeLabels).map(([value, label]) => ({ value, label })),
];

const daysOfWeek = [1, 2, 3, 4, 5, 6, 7] as const;

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const [membership, shell] = await Promise.all([
    requireOrganizationPermission(env, request, organization.id, "business-profile:read"),
    getClientWorkspaceContext(env, request),
  ]);
  const database = createDatabase(env.DB);
  const [profile, hours] = await Promise.all([
    getBusinessProfileForOrganization(database, organization.id),
    listBusinessHoursForOrganization(database, organization.id),
  ]);
  const governance = profile ? await getBusinessProfileGovernance(database, profile.id) : null;

  return { completion: getBusinessProfileCompletion(profile), governance, membership, profile, hours, ...shell, activeOrganization: organization };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  await requireOrganizationPermission(env, request, organization.id, "business-profile:update");
  const database = createDatabase(env.DB);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "save-hours") {
      const entries = parseBusinessHoursForm(formData);
      const hours = await replaceBusinessHoursForOrganization(database, organization.id, entries);
      return { kind: "hours" as const, hours, success: "Horarios guardados." };
    }

    const input = parseBusinessProfileForm(formData);
    const currentProfile = await getBusinessProfileForOrganization(database, organization.id);
    const publicationIssues = getBusinessProfilePublicationIssues(input);

    if (currentProfile?.status === "published" && publicationIssues.length) {
      return { kind: "profile" as const, error: `Un perfil publicado debe conservar: ${publicationIssues.join(", ")}.`, publicationIssues };
    }

    if (intent === "publish") {
      await requireOrganizationPermission(env, request, organization.id, "business-profile:publish");

      if (publicationIssues.length) {
        return { kind: "profile" as const, error: `Completa estos campos antes de publicar: ${publicationIssues.join(", ")}.`, publicationIssues };
      }
    }

    const profile = await saveBusinessProfileForOrganization(database, organization.id, input);

    if (intent === "publish") {
      const publishedProfile = await publishBusinessProfileForOrganization(database, organization.id);
      return {
        kind: "profile" as const,
        completion: getBusinessProfileCompletion(publishedProfile),
        profile: publishedProfile,
        success: "Perfil publicado.",
      };
    }

    return {
      kind: "profile" as const,
      completion: getBusinessProfileCompletion(profile),
      profile,
      success: profile.status === "published" ? "Perfil actualizado." : "Perfil guardado como borrador.",
    };
  } catch (error) {
    if (error instanceof Response && error.status === 400) {
      const message = await error.text();
      return { kind: intent === "save-hours" ? ("hours" as const) : ("profile" as const), error: message };
    }
    throw error;
  }
}

function value(value: string | null | undefined) {
  return value ?? "";
}

export default function BusinessProfilePage() {
  const { completion: loaderCompletion, governance, hours: loaderHours, membership, profile: loaderProfile, workspaceUser, organizations, isPlatformAdmin, activeOrganization } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const profileActionData = actionData?.kind === "profile" ? actionData : undefined;
  const hoursActionData = actionData?.kind === "hours" ? actionData : undefined;
  const profile = profileActionData?.profile ?? loaderProfile;
  const completion = profileActionData?.completion ?? loaderCompletion;
  const hours = hoursActionData?.hours ?? loaderHours;
  const hoursByDay = new Map(hours.map((entry) => [entry.dayOfWeek, entry]));
  const canEdit = membership.role === "owner" || membership.role === "admin";
  const isSaving = navigation.state === "submitting";

  return (
    <ClientAreaShell active="business" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="business-profile-page" id="client-page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MI NEGOCIO</p>
          <h1>{profile ? "Edita tu perfil de negocio" : "Crea tu perfil de negocio"}</h1>
          <p>Este perfil pertenece a {membership.name} y su estado se guarda por organización.</p>
        </div>
        <Badge tone={profile?.status === "published" ? "success" : "neutral"}>
          {profile?.status === "published" ? "Publicado" : "Borrador"}
        </Badge>
      </div>

      {governance?.platformStatus === "suspended" ? (
        <Alert>
          <strong>Estado de plataforma: Suspendido.</strong> Este perfil no está visible públicamente. Contacta con Vecidya si necesitas revisar esta decisión.
        </Alert>
      ) : null}

      {profileActionData?.error ? <Alert>{profileActionData.error}</Alert> : null}
      {profileActionData?.success ? <p className="success-message" role="status">{profileActionData.success}</p> : null}

      <Card aria-labelledby="profile-status-title" className="business-profile-status">
        <div className="business-profile-status__heading">
          <div>
            <p className="eyebrow">ESTADO DEL PERFIL</p>
            <h2 id="profile-status-title">{completion.percentage}% completo</h2>
          </div>
          <Badge tone={profile?.status === "published" ? "success" : "neutral"}>
            {profile?.status === "published" ? "Publicado" : "Borrador"}
          </Badge>
        </div>
        <div aria-label={`${completion.percentage}% del perfil completado`} className="completion-track" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={completion.percentage}>
          <span style={{ width: `${completion.percentage}%` }} />
        </div>
        {completion.issues.length ? (
          <div className="completion-issues">
            <h3>Tu perfil todavía necesita:</h3>
            <ul>
              {completion.issues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
            <p>Completa estos campos para publicarlo.</p>
          </div>
        ) : (
          <p className="completion-ready">Tu perfil tiene los datos mínimos para publicarse.</p>
        )}
        {profile?.status === "published" ? (
          <div className="business-profile-public-link">
            <p>Tu página pública está disponible.</p>
            <Link className="text-link" to={`/vecindario/${profile.slug}`}>Ver página pública →</Link>
          </div>
        ) : null}
      </Card>

      <Card className="business-profile-card">
        {canEdit ? (
          <Form className="business-profile-form" method="post">
            <fieldset disabled={isSaving}>
              <legend>Información del negocio</legend>
              <div className="form-grid">
                <label>Nombre visible<input defaultValue={value(profile?.displayName)} name="displayName" required maxLength={120} /></label>
                <label>Slug<input defaultValue={value(profile?.slug)} name="slug" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" spellCheck={false} /></label>
                <label className="form-grid__full">Descripción corta<textarea defaultValue={value(profile?.shortDescription)} name="shortDescription" maxLength={280} rows={3} /></label>
                <label className="form-grid__full">Descripción<input defaultValue={value(profile?.description)} name="description" maxLength={5000} /></label>
                <label>Categoría<input defaultValue={value(profile?.category)} name="category" maxLength={100} /></label>
                <label>Ciudad<input defaultValue={value(profile?.city)} name="city" maxLength={120} /></label>
                <label>País<input defaultValue={value(profile?.country)} name="country" maxLength={120} /></label>
                <label>Teléfono<input defaultValue={value(profile?.phone)} name="phone" maxLength={50} /></label>
                <label>Email público<input defaultValue={value(profile?.publicEmail)} name="publicEmail" type="email" maxLength={254} /></label>
                <label>Web<input defaultValue={value(profile?.websiteUrl)} name="websiteUrl" type="url" maxLength={2048} /></label>
                <label>URL del logo<input defaultValue={value(profile?.logoUrl)} name="logoUrl" type="url" maxLength={2048} /></label>
              </div>
            </fieldset>

            <fieldset disabled={isSaving} className="business-profile-form__contact">
              <legend>Contacto y presencia digital</legend>
              <div className="form-grid">
                <label>WhatsApp<input defaultValue={value(profile?.whatsapp)} name="whatsapp" placeholder="+573244321864" maxLength={20} /></label>
                <label>Instagram<input defaultValue={value(profile?.instagramUrl)} name="instagramUrl" placeholder="https://instagram.com/tu-negocio" type="url" maxLength={2048} /></label>
                <label>Facebook<input defaultValue={value(profile?.facebookUrl)} name="facebookUrl" placeholder="https://facebook.com/tu-negocio" type="url" maxLength={2048} /></label>
                <label>LinkedIn<input defaultValue={value(profile?.linkedinUrl)} name="linkedinUrl" placeholder="https://linkedin.com/company/tu-negocio" type="url" maxLength={2048} /></label>
              </div>
              <p className="form-help">Todos estos campos son opcionales; déjalos vacíos si tu negocio no los usa.</p>
            </fieldset>

            <fieldset disabled={isSaving} className="business-profile-form__operations">
              <legend>Cómo y dónde atiendes</legend>
              <div className="form-grid">
                <label>Modalidad de atención
                  <select defaultValue={value(profile?.serviceMode)} name="serviceMode">
                    {serviceModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="form-grid__full">Cobertura / área de servicio
                  <input defaultValue={value(profile?.serviceArea)} name="serviceArea" placeholder="Ej. Medellín y área metropolitana, o Toda Colombia" maxLength={280} />
                </label>
              </div>
              <p className="form-help">Describe con tus palabras dónde puedes atender; no es necesario un radio o coordenadas exactas.</p>
            </fieldset>

            <fieldset disabled={isSaving} className="business-profile-form__submit">
              <div className="business-profile-actions">
                <Button name="intent" type="submit" value="save">
                  {isSaving ? "Guardando…" : "Guardar"}
                </Button>
                {profile?.status !== "published" ? (
                  <Button name="intent" tone="secondary" type="submit" value="publish">
                    Publicar perfil
                  </Button>
                ) : null}
              </div>
              {profile?.status === "published" ? <p className="form-help">Para mantener la página pública, los campos necesarios no pueden quedar incompletos.</p> : null}
            </fieldset>
          </Form>
        ) : (
          <p>Tu rol permite consultar este perfil, pero no modificarlo.</p>
        )}
      </Card>

      {canEdit ? (
        <Card className="business-profile-card business-profile-hours">
          <p className="eyebrow">HORARIOS</p>
          <h2>¿Cuándo atiendes?</h2>
          <p className="form-help">Marca "Cerrado" o deja ambas horas vacías para un día sin definir. Los horarios son los que tu negocio publica; Vecidya no verifica huso horario ni excepciones.</p>

          {hoursActionData?.error ? <Alert>{hoursActionData.error}</Alert> : null}
          {hoursActionData?.success ? <p className="success-message" role="status">{hoursActionData.success}</p> : null}

          <Form className="business-hours-form" method="post">
            <div className="business-hours-grid">
              {daysOfWeek.map((day) => {
                const entry = hoursByDay.get(day);
                return (
                  <div className="business-hours-row" key={day}>
                    <span className="business-hours-row__label">{dayOfWeekLabels[day]}</span>
                    <label className="business-hours-row__closed">
                      <input defaultChecked={entry?.isClosed ?? false} name={`hours_${day}_closed`} type="checkbox" />
                      Cerrado
                    </label>
                    <label>Abre
                      <input defaultValue={value(entry?.opensAt)} disabled={isSaving} name={`hours_${day}_opens`} type="time" />
                    </label>
                    <label>Cierra
                      <input defaultValue={value(entry?.closesAt)} disabled={isSaving} name={`hours_${day}_closes`} type="time" />
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="business-profile-actions">
              <Button disabled={isSaving} name="intent" type="submit" value="save-hours">
                {isSaving ? "Guardando…" : "Guardar horarios"}
              </Button>
            </div>
          </Form>
        </Card>
      ) : null}
    </main>
    </ClientAreaShell>
  );
}
