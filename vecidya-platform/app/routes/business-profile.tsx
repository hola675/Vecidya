import { useEffect, useRef, useState } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";

import { createDatabase } from "../../db/client.server";
import { dayOfWeekLabels, type BusinessHoursEntry } from "../../db/business-hours-rules";
import { businessProfileSlugMaxLength, serviceModeLabels, slugifyBusinessName } from "../../db/business-profile-rules";
import {
  getBusinessProfileForOrganization,
  hasActiveLicenseForOrganizationOwner,
  saveBusinessProfileForOrganization,
} from "../../db/queries/business-profile.server";
import { readConsistentBusinessDraft, publishBusinessPublicationForOrganization } from "../../db/queries/business-publication.server";
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
import { PublicBusinessProfilePreview, type PublicBusinessProfile } from "../components/public-business-profile-view";

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

const profileSteps = [
  { id: "business-profile-identity", label: "Identidad" },
  { id: "business-profile-description", label: "Presentación" },
  { id: "business-profile-contact", label: "Contacto" },
  { id: "business-profile-social", label: "Redes" },
  { id: "business-profile-operations", label: "Atención" },
  { id: "business-profile-hours", label: "Horarios" },
] as const;

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const [membership, shell] = await Promise.all([
    requireOrganizationPermission(env, request, organization.id, "business-profile:read"),
    getClientWorkspaceContext(env, request),
  ]);
  const database = createDatabase(env.DB);
  const { data: { profile, hours }, draftRevision } = await readConsistentBusinessDraft(database, organization.id, async () => {
    const [profile, hours] = await Promise.all([
      getBusinessProfileForOrganization(database, organization.id),
      listBusinessHoursForOrganization(database, organization.id),
    ]);
    return { profile, hours };
  });
  const governance = profile ? await getBusinessProfileGovernance(database, profile.id) : null;
  const canPublish = await hasActiveLicenseForOrganizationOwner(database, organization.id);
  return { completion: getBusinessProfileCompletion(profile), governance, membership, profile, hours, canPublish, draftRevision, ...shell, activeOrganization: organization };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  await requireOrganizationPermission(env, request, organization.id, "business-profile:update");
  const database = createDatabase(env.DB);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const expectedRevision = Number(formData.get("draftRevision"));

  try {
    if (intent === "save-hours") {
      const entries = parseBusinessHoursForm(formData);
      const hours = await replaceBusinessHoursForOrganization(database, organization.id, entries, expectedRevision);
      return { kind: "hours" as const, hours, draftRevision: expectedRevision + 1, success: "Horarios guardados." };
    }

    const input = parseBusinessProfileForm(formData);
    const currentProfile = await getBusinessProfileForOrganization(database, organization.id);
    const publicationIssues = getBusinessProfilePublicationIssues(input);

    if (currentProfile?.status === "published" && publicationIssues.length) {
      return { kind: "profile" as const, error: `Un perfil publicado debe conservar: ${publicationIssues.join(", ")}.`, publicationIssues };
    }

    if (intent === "publish") {
      const activeLicense = await hasActiveLicenseForOrganizationOwner(database, organization.id);
      if (!activeLicense) return { kind: "profile" as const, error: "Necesitas una licencia Vecidya activa para publicar en Vecindario." };
      await requireOrganizationPermission(env, request, organization.id, "business-profile:publish");

      if (publicationIssues.length) {
        return { kind: "profile" as const, error: `Completa estos campos antes de publicar: ${publicationIssues.join(", ")}.`, publicationIssues };
      }
    }

    const profile = await saveBusinessProfileForOrganization(database, organization.id, input, expectedRevision);
    if (!profile) throw new Error("No se pudo guardar el perfil.");

    if (intent === "publish") {
      const publication = await publishBusinessPublicationForOrganization(database, organization.id, expectedRevision + 1);
      const publishedProfile = await getBusinessProfileForOrganization(database, organization.id);
      if (!publishedProfile) throw new Error("El perfil desapareció durante la publicación.");
      return {
        kind: "profile" as const,
        completion: getBusinessProfileCompletion(publishedProfile),
        profile: publishedProfile,
        draftRevision: publication.state.draftRevision,
        success: "Perfil publicado.",
      };
    }

    return {
      kind: "profile" as const,
      completion: getBusinessProfileCompletion(profile),
      profile,
      draftRevision: expectedRevision + 1,
      success: profile.status === "published" ? "Perfil actualizado." : "Perfil guardado como borrador.",
    };
  } catch (error) {
    if (error instanceof Response && (error.status === 400 || error.status === 409)) {
      const message = await error.text();
      if (intent === "save-hours") {
        return { kind: "hours" as const, hoursDraft: readHoursFormDraft(formData), error: message, status: error.status };
      }
      return { kind: "profile" as const, error: message, status: error.status };
    }
    throw error;
  }
}

function value(value: string | null | undefined) {
  return value ?? "";
}

function previewText(formData: FormData | undefined, key: string, savedValue: string | null | undefined) {
  if (!formData) return savedValue ?? null;
  const field = formData.get(key);
  return typeof field === "string" && field.trim() ? field.trim() : null;
}

function getProfilePreview(
  profile: Awaited<ReturnType<typeof getBusinessProfileForOrganization>>,
  governance: Awaited<ReturnType<typeof getBusinessProfileGovernance>> | null,
  formData?: FormData,
): PublicBusinessProfile {
  return {
    slug: previewText(formData, "slug", profile?.slug) ?? "",
    displayName: previewText(formData, "displayName", profile?.displayName) ?? "",
    shortDescription: previewText(formData, "shortDescription", profile?.shortDescription),
    category: previewText(formData, "category", profile?.category),
    city: previewText(formData, "city", profile?.city),
    country: previewText(formData, "country", profile?.country),
    logoUrl: null,
    description: previewText(formData, "description", profile?.description),
    phone: previewText(formData, "phone", profile?.phone),
    publicEmail: previewText(formData, "publicEmail", profile?.publicEmail),
    websiteUrl: previewText(formData, "websiteUrl", profile?.websiteUrl),
    whatsapp: previewText(formData, "whatsapp", profile?.whatsapp),
    instagramUrl: previewText(formData, "instagramUrl", profile?.instagramUrl),
    facebookUrl: previewText(formData, "facebookUrl", profile?.facebookUrl),
    linkedinUrl: previewText(formData, "linkedinUrl", profile?.linkedinUrl),
    serviceMode: previewText(formData, "serviceMode", profile?.serviceMode),
    serviceArea: previewText(formData, "serviceArea", profile?.serviceArea),
    verificationStatus: governance?.verificationStatus ?? "unverified",
  };
}

function getHoursPreview(formData: FormData): BusinessHoursEntry[] {
  return daysOfWeek.flatMap((day) => {
    const isClosed = formData.get(`hours_${day}_closed`) === "on";
    const opensAt = previewText(formData, `hours_${day}_opens`, null);
    const closesAt = previewText(formData, `hours_${day}_closes`, null);
    if (!isClosed && (!opensAt || !closesAt)) return [];
    return [{ dayOfWeek: day, isClosed, opensAt: isClosed ? null : opensAt, closesAt: isClosed ? null : closesAt }];
  });
}

function readHoursFormDraft(formData: FormData): BusinessHoursEntry[] {
  return daysOfWeek.map((dayOfWeek) => {
    const isClosed = formData.get(`hours_${dayOfWeek}_closed`) === "on";
    const opensAt = formData.get(`hours_${dayOfWeek}_opens`);
    const closesAt = formData.get(`hours_${dayOfWeek}_closes`);
    return {
      dayOfWeek,
      isClosed,
      opensAt: isClosed || typeof opensAt !== "string" || !opensAt ? null : opensAt,
      closesAt: isClosed || typeof closesAt !== "string" || !closesAt ? null : closesAt,
    };
  });
}

export default function BusinessProfilePage() {
  const { completion: loaderCompletion, governance, hours: loaderHours, membership, profile: loaderProfile, workspaceUser, organizations, isPlatformAdmin, activeOrganization, canPublish, draftRevision } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const profileActionData = actionData?.kind === "profile" ? actionData : undefined;
  const hoursActionData = actionData?.kind === "hours" ? actionData : undefined;
  const profile = profileActionData?.profile ?? loaderProfile;
  const completion = profileActionData?.completion ?? loaderCompletion;
  const hours = hoursActionData?.hours ?? loaderHours;
  const hasDraftConflict = profileActionData?.status === 409 || hoursActionData?.status === 409;
  const hoursByDay = new Map(hours.map((entry) => [entry.dayOfWeek, entry]));
  const canEdit = membership.role === "owner" || membership.role === "admin";
  const isSaving = navigation.state === "submitting";
  const [formDraftRevision, setFormDraftRevision] = useState(draftRevision);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [previewProfile, setPreviewProfile] = useState(() => getProfilePreview(profile, governance));
  const [previewHours, setPreviewHours] = useState<BusinessHoursEntry[]>(hours);
  // El slug solo se sugiere mientras el perfil no se ha guardado nunca (`profile` viene del loader o de la
  // action): una vez persistido es la URL pública, y renombrar el negocio no debe moverla.
  const suggestsSlug = !profile;
  const slugTouchedRef = useRef(false);

  useEffect(() => {
    const savedRevision = profileActionData?.success
      ? profileActionData.draftRevision
      : hoursActionData?.success
        ? hoursActionData.draftRevision
        : null;
    if (savedRevision !== null && savedRevision !== undefined) setFormDraftRevision(savedRevision);
  }, [hoursActionData, profileActionData]);

  useEffect(() => {
    setPreviewProfile(getProfilePreview(profile, governance));
    setPreviewHours(hours);
  }, [governance, hours, profile]);

  function goToProfileStep(index: number) {
    const step = profileSteps[index];
    if (!step) return;
    setActiveStep(index);
    const target = document.getElementById(step.id);
    if (!target) return;
    target.scrollIntoView({ behavior: "auto", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  function updateProfilePreview(event: React.FormEvent<HTMLFormElement>) {
    setPreviewProfile(getProfilePreview(profile, governance, new FormData(event.currentTarget)));
  }

  function updateHoursPreview(event: React.FormEvent<HTMLFormElement>) {
    setPreviewHours(getHoursPreview(new FormData(event.currentTarget)));
  }

  return (
    <ClientAreaShell active="business" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="business-profile-page" id="client-page-content">
      <div className="page-heading">
        <div>
        <h1>{profile ? "Tu negocio" : "Crea tu perfil de negocio"}</h1>
        <p>Administra la identidad y la presencia pública de {membership.name}.</p>
      </div>
      <div className="business-profile-heading-actions">
        <Badge tone={profile?.status === "published" ? "success" : "neutral"}>
          {profile?.status === "published" ? "Publicado" : "Borrador"}
        </Badge>
        <Button
          aria-controls="business-profile-preview"
          aria-expanded={previewOpen}
          onClick={() => setPreviewOpen((open) => !open)}
          tone="secondary"
          type="button"
        >
          {previewOpen ? "Ocultar vista previa" : "Vista previa del minisitio"}
        </Button>
      </div>
      </div>

      {governance?.platformStatus === "suspended" ? (
        <Alert>
          <strong>Estado de plataforma: Suspendido.</strong> Este perfil no está visible públicamente. Contacta con Vecidya si necesitas revisar esta decisión.
        </Alert>
      ) : null}

      {hasDraftConflict ? <><Alert>El borrador cambió mientras editabas. Tus campos no se guardaron y no podrás guardar con esta revisión. Recarga para ver la versión más reciente y continuar.</Alert><div className="business-profile-actions"><Button onClick={() => window.location.reload()} tone="secondary" type="button">Recargar para continuar</Button></div></> : null}
      {profileActionData?.error && profileActionData.status !== 409 ? <Alert>{profileActionData.error}</Alert> : null}
      {profileActionData?.success ? <p className="success-message" role="status">{profileActionData.success}</p> : null}

      <Card aria-labelledby="profile-status-title" className="business-profile-status">
        <div className="business-profile-status__heading">
          <div>
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

      <PublicBusinessProfilePreview hidden={!previewOpen} hours={previewHours} profile={previewProfile} />

      <nav aria-label="Pasos para configurar tu negocio" className="miniweb-editor__steps">
        {profileSteps.map((step, index) => (
          <a
            aria-current={activeStep === index ? "step" : undefined}
            href={`#${step.id}`}
            key={step.id}
            onClick={() => setActiveStep(index)}
          >
            <span>{index + 1}</span> {step.label}
          </a>
        ))}
      </nav>
      <div className="business-profile-actions" aria-label="Navegar entre pasos de configuración">
        <Button
          disabled={activeStep === 0}
          onClick={() => goToProfileStep(activeStep - 1)}
          tone="secondary"
          type="button"
        >Paso anterior</Button>
        <p className="form-help" role="status">Paso {activeStep + 1} de {profileSteps.length}: {profileSteps[activeStep].label}</p>
        <Button
          disabled={activeStep === profileSteps.length - 1}
          onClick={() => goToProfileStep(activeStep + 1)}
          tone="secondary"
          type="button"
        >Siguiente paso</Button>
      </div>
      <p className="form-help">Los pasos son accesos a secciones del mismo formulario: tus campos permanecen disponibles y se guardan juntos. Los horarios tienen un guardado independiente.</p>

      <Card className="business-profile-card">
        {canEdit ? (
          <Form className="business-profile-form" method="post" onChange={updateProfilePreview} onSubmit={(event) => { if (hasDraftConflict) event.preventDefault(); }}>
            <input name="draftRevision" type="hidden" value={formDraftRevision} />
            <fieldset disabled={isSaving} id="business-profile-identity">
              <legend>Identidad del negocio</legend>
              <div className="form-grid">
                <label>Nombre visible<input defaultValue={value(profile?.displayName)} name="displayName" onChange={(event) => { if (suggestsSlug && !slugTouchedRef.current && slugInputRef.current) slugInputRef.current.value = slugifyBusinessName(event.currentTarget.value); }} required maxLength={120} /></label>
                <label>Categoría<input defaultValue={value(profile?.category)} name="category" maxLength={100} /></label>
                <label className="form-grid__full">Enlace público<input defaultValue={value(profile?.slug)} name="slug" onChange={(event) => { slugTouchedRef.current = event.currentTarget.value.trim() !== ""; }} ref={slugInputRef} required maxLength={businessProfileSlugMaxLength} pattern="[a-z0-9]+(-[a-z0-9]+)*" spellCheck={false} /></label>
                <p className="form-grid__full form-help">Este enlace identifica tu negocio en Vecindario y permanece estable después del primer guardado.</p>
              </div>
            </fieldset>

            <fieldset disabled={isSaving} id="business-profile-description">
              <legend>Presentación</legend>
              <div className="form-grid">
                <label className="form-grid__full">Descripción breve<textarea defaultValue={value(profile?.shortDescription)} name="shortDescription" maxLength={280} rows={3} /></label>
                <label className="form-grid__full">Acerca del negocio<textarea defaultValue={value(profile?.description)} name="description" maxLength={5000} rows={6} /></label>
              </div>
            </fieldset>

            <fieldset disabled={isSaving} id="business-profile-contact">
              <legend>Ubicación y contacto</legend>
              <div className="form-grid">
                <label>Ciudad<input defaultValue={value(profile?.city)} name="city" maxLength={120} /></label>
                <label>País<input defaultValue={value(profile?.country)} name="country" maxLength={120} /></label>
                <label>Teléfono público<input autoComplete="tel" defaultValue={value(profile?.phone)} name="phone" type="tel" maxLength={50} /></label>
                <label>Email de contacto<input autoComplete="email" defaultValue={value(profile?.publicEmail)} name="publicEmail" type="email" maxLength={254} /></label>
                <label>Sitio web<input autoComplete="url" defaultValue={value(profile?.websiteUrl)} name="websiteUrl" type="url" maxLength={2048} /></label>
              </div>
            </fieldset>

            <fieldset disabled={isSaving} className="business-profile-form__contact" id="business-profile-social">
              <legend>Redes y WhatsApp</legend>
              <div className="form-grid">
                <label>WhatsApp<input defaultValue={value(profile?.whatsapp)} name="whatsapp" placeholder="+573244321864" maxLength={20} /></label>
                <label>Instagram<input defaultValue={value(profile?.instagramUrl)} name="instagramUrl" placeholder="https://instagram.com/tu-negocio" type="url" maxLength={2048} /></label>
                <label>Facebook<input defaultValue={value(profile?.facebookUrl)} name="facebookUrl" placeholder="https://facebook.com/tu-negocio" type="url" maxLength={2048} /></label>
                <label>LinkedIn<input defaultValue={value(profile?.linkedinUrl)} name="linkedinUrl" placeholder="https://linkedin.com/company/tu-negocio" type="url" maxLength={2048} /></label>
              </div>
              <p className="form-help">Todos estos campos son opcionales; déjalos vacíos si tu negocio no los usa.</p>
            </fieldset>

            <fieldset disabled={isSaving} className="business-profile-form__operations" id="business-profile-operations">
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
                <Button disabled={hasDraftConflict} name="intent" type="submit" value="save">
                  {isSaving ? "Guardando…" : "Guardar"}
                </Button>
                {profile?.status !== "published" && canPublish ? (
                  <Button disabled={hasDraftConflict} name="intent" tone="secondary" type="submit" value="publish">
                    Publicar perfil
                  </Button>
                ) : null}
              </div>
              {!canPublish && profile?.status !== "published" ? <p className="form-help">Para publicar en Vecindario necesitas una licencia Vecidya activa. Puedes guardar el perfil como borrador.</p> : null}
              {profile?.status === "published" ? <p className="form-help">Para mantener la página pública, los campos necesarios no pueden quedar incompletos.</p> : null}
            </fieldset>
          </Form>
        ) : (
          <p>Tu rol permite consultar este perfil, pero no modificarlo.</p>
        )}
      </Card>

      {canEdit ? (
        <Card className="business-profile-card business-profile-hours" id="business-profile-hours">
          <p className="eyebrow">HORARIOS</p>
          <h2>¿Cuándo atiendes?</h2>
          <p className="form-help">Marca "Cerrado" o deja ambas horas vacías para un día sin definir. Los horarios son los que tu negocio publica; Vecidya no verifica huso horario ni excepciones.</p>

          {hoursActionData?.error && hoursActionData.status !== 409 ? <Alert>{hoursActionData.error}</Alert> : null}
          {hoursActionData?.success ? <p className="success-message" role="status">{hoursActionData.success}</p> : null}

          <Form className="business-hours-form" method="post" onChange={updateHoursPreview} onSubmit={(event) => { if (hasDraftConflict) event.preventDefault(); }}>
            <input name="draftRevision" type="hidden" value={formDraftRevision} />
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
              <Button disabled={isSaving || hasDraftConflict} name="intent" type="submit" value="save-hours">
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
