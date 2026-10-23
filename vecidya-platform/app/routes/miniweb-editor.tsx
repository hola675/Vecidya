import { useEffect, useState } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { getBusinessProfileGovernance } from "../../db/queries/platform-governance.server";
import { createBusinessPublicationSnapshot, getBusinessPublicationSnapshotForOrganization, isBusinessPublicationCurrent, readConsistentBusinessDraft } from "../../db/queries/business-publication.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { MiniWebRenderer } from "../components/miniweb/miniweb-renderer";
import type { PublicBusinessProfile } from "../components/public-business-profile-view";
import { Button, Card } from "../components/ui";
import { ClientAreaShell } from "../components/client-area-shell";
import { MINIWEB_MODULE_REGISTRY, MINIWEB_TEMPLATE_REGISTRY, type MiniWebConfiguration, type MiniWebModuleType } from "../features/miniweb/registry";
import { getMiniWebPublicationState, toMiniWebPublicProfile } from "../features/miniweb/public-model";

import type { Route } from "./+types/miniweb-editor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mi MiniWeb | Vecidya" },
    { name: "description", content: "Organiza las secciones y la publicación de tu MiniWeb." },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const [membership, shell] = await Promise.all([
    requireOrganizationPermission(env, request, organization.id, "business-profile:read"),
    getClientWorkspaceContext(env, request),
  ]);
  const database = createDatabase(env.DB);
  const { data: { profile, hours, state, publicationIsCurrent }, draftRevision } = await readConsistentBusinessDraft(database, organization.id, async () => {
    const [profile, hours] = await Promise.all([
      getBusinessProfileForOrganization(database, organization.id),
      listBusinessHoursForOrganization(database, organization.id),
    ]);
    const [state, publication] = await Promise.all([
      getMiniWebConfigurationForOrganization(database, organization.id, profile, hours),
      getBusinessPublicationSnapshotForOrganization(database, organization.id),
    ]);
    const currentSnapshot = profile?.status === "published"
      ? createBusinessPublicationSnapshot(profile, hours, state.draftConfiguration)
      : null;
    const publicationIsCurrent = isBusinessPublicationCurrent(publication.publishedVersion, publication.snapshot, currentSnapshot);
    return { profile, hours, state, publicationIsCurrent };
  });
  const governance = profile ? await getBusinessProfileGovernance(database, profile.id) : null;

  return {
    ...shell,
    activeOrganization: { id: organization.id, name: organization.name },
    canEdit: membership.role === "owner" || membership.role === "admin",
    canPublish: membership.role === "owner" || membership.role === "admin",
    hasPersistedConfiguration: state.hasPersistedConfiguration,
    draftConfiguration: state.draftConfiguration,
    draftRevision,
    publicationIsCurrent,
    publishedConfiguration: state.publishedConfiguration,
    profile: toMiniWebPublicProfile(profile, governance?.verificationStatus ?? "unverified"),
    hours: hours.map(({ dayOfWeek, isClosed, opensAt, closesAt }) => ({ dayOfWeek, isClosed, opensAt, closesAt })),
    profileStatus: getMiniWebPublicationState(profile?.status, governance?.platformStatus),
    template: MINIWEB_TEMPLATE_REGISTRY[state.draftConfiguration.templateKey],
  };
}

export default function MiniWebEditorPage() {
  const data = useLoaderData<typeof loader>();
  return <MiniWebEditor key={data.activeOrganization.id} data={data} />;
}

function MiniWebEditor({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  const { revalidate } = useRevalidator();
  const [configuration, setConfiguration] = useState(data.draftConfiguration);
  const [draftRevision, setDraftRevision] = useState(data.draftRevision);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const isDirty = JSON.stringify(configuration) !== JSON.stringify(data.draftConfiguration);
  const orderedModules = [...configuration.modules].sort((left, right) => left.sortOrder - right.sortOrder || left.type.localeCompare(right.type));

  useEffect(() => setConfiguration(data.draftConfiguration), [data.draftConfiguration]);

  function setEnabled(type: MiniWebModuleType, enabled: boolean) {
    setConfiguration((current) => ({
      ...current,
      modules: current.modules.map((module) => module.type === type ? { ...module, enabled } : module),
    }));
  }

  function moveModule(type: MiniWebModuleType, direction: -1 | 1) {
    setConfiguration((current) => {
      const modules = [...current.modules].sort((left, right) => left.sortOrder - right.sortOrder || left.type.localeCompare(right.type));
      const index = modules.findIndex((module) => module.type === type);
      const target = index + direction;
      if (index < 1 || target < 1 || target >= modules.length) return current;
      [modules[index], modules[target]] = [modules[target], modules[index]];
      return { ...current, modules: modules.map((module, sortOrder) => ({ ...module, sortOrder })) };
    });
  }

  async function sendConfiguration(intent: "save" | "publish", value: MiniWebConfiguration, expectedRevision: number) {
    const response = await fetch(`/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/miniweb-config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ intent, ...(intent === "save" ? { configuration: value } : {}), draftRevision: expectedRevision }),
    });
    const result = await response.json() as { error?: string; configuration?: MiniWebConfiguration; draftRevision?: number };
    if (!response.ok || !result.configuration) throw new Error(result.error ?? "No se pudo guardar la configuración.");
    setConfiguration(result.configuration);
    if (typeof result.draftRevision === "number") setDraftRevision(result.draftRevision);
    await revalidate();
    return result.draftRevision ?? expectedRevision;
  }

  async function handleSave() {
    setBusy(true);
    setMessage(null);
    try {
      await sendConfiguration("save", configuration, draftRevision);
      setMessage({ kind: "success", text: "Borrador guardado. La página pública no cambia hasta publicar la configuración." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo guardar la configuración." });
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    setBusy(true);
    setMessage(null);
    try {
      let revision = draftRevision;
      if (isDirty) revision = await sendConfiguration("save", configuration, revision);
      await sendConfiguration("publish", configuration, revision);
      setMessage({ kind: "success", text: "La página completa quedó publicada." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo publicar la configuración." });
    } finally {
      setBusy(false);
    }
  }

  const template = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey];
  const profile = data.profile ?? emptyPreviewProfile();

  return (
    <ClientAreaShell
      active="miniweb"
      activeOrganization={data.activeOrganization}
      isPlatformAdmin={data.isPlatformAdmin}
      organizations={data.organizations}
      workspaceUser={data.workspaceUser}
    >
      <main className="client-page miniweb-editor" id="client-page-content">
        <header className="page-header miniweb-editor__header">
          <div>
            <p className="eyebrow">TU PRESENCIA DIGITAL</p>
            <h1>Mi MiniWeb</h1>
            <p>Organiza las secciones que presentan tu negocio en Vecindario.</p>
          </div>
          <Link className="button button--secondary" to="/app/business-profile">Editar información del negocio</Link>
        </header>

        <div className="miniweb-editor__layout">
          <div className="miniweb-editor__controls">
            <Card aria-labelledby="miniweb-template-title" className="miniweb-editor__template">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">PLANTILLA ACTUAL</p><h2 id="miniweb-template-title">{template.name}</h2></div>
                <span className="badge">v{template.version}</span>
              </div>
              <p>{template.description}</p>
              <p className="miniweb-editor__note">Las otras familias están reservadas hasta que sus plantillas estén implementadas.</p>
            </Card>

            <Card aria-labelledby="miniweb-sections-title" className="miniweb-editor__sections-card">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">ESTRUCTURA</p><h2 id="miniweb-sections-title">Secciones</h2></div>
                <span className="miniweb-editor__count">{configuration.modules.filter((module) => module.enabled).length} activas</span>
              </div>
              <p className="miniweb-editor__note">Cada sección utiliza datos existentes. Si no tiene contenido útil, no se muestra al público.</p>
              <ol className="miniweb-module-list">
                {orderedModules.map((module, position) => {
                  const type = module.type;
                  const definition = MINIWEB_MODULE_REGISTRY[type];
                  return (
                    <li className="miniweb-module-list__item" data-module-type={type} key={type}>
                      <div className="miniweb-module-list__copy">
                        <div className="miniweb-module-list__title">
                          <strong>{definition.label}</strong>
                          {definition.required ? <span className="badge">Requerida</span> : null}
                        </div>
                        <p>{definition.description}</p>
                      </div>
                      <label className="miniweb-module-toggle">
                        <span>{module.enabled ? "Activa" : "Inactiva"}</span>
                        <input
                          aria-label={`${module.enabled ? "Desactivar" : "Activar"} ${definition.label}`}
                          checked={module.enabled}
                          disabled={!data.canEdit || busy || definition.required}
                          onChange={(event) => setEnabled(type, event.currentTarget.checked)}
                          type="checkbox"
                        />
                      </label>
                      <div className="miniweb-module-list__order" aria-label={`Orden de ${definition.label}`}>
                        <Button aria-label={`Subir ${definition.label}`} disabled={!data.canEdit || busy || !definition.reorderable || position <= 1} onClick={() => moveModule(type, -1)} tone="ghost">↑</Button>
                        <span>{module.sortOrder + 1}</span>
                        <Button aria-label={`Bajar ${definition.label}`} disabled={!data.canEdit || busy || !definition.reorderable || position < 1 || position >= orderedModules.length - 1} onClick={() => moveModule(type, 1)} tone="ghost">↓</Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {!data.canEdit ? <p className="miniweb-editor__note">Tu acceso permite consultar la configuración, no modificarla.</p> : null}
              <div className="miniweb-editor__actions">
                <Button disabled={!data.canEdit || busy || !isDirty} onClick={handleSave} tone="secondary">{busy ? "Guardando…" : "Guardar borrador"}</Button>
                <Button disabled={!data.canPublish || busy} onClick={handlePublish}>{busy ? "Procesando…" : "Publicar configuración"}</Button>
              </div>
              {message ? <p className={`alert miniweb-editor__message miniweb-editor__message--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
              <p className="miniweb-editor__note">El perfil, los horarios y esta estructura se publican juntos desde el botón de publicación.</p>
            </Card>
          </div>

          <Card aria-labelledby="miniweb-preview-title" className="miniweb-editor__preview-card">
            <div className="miniweb-editor__section-heading">
              <div><p className="eyebrow">SOLO PARA TI</p><h2 id="miniweb-preview-title">Vista previa privada</h2></div>
              <Button aria-expanded={previewVisible} onClick={() => setPreviewVisible((visible) => !visible)} tone="ghost">{previewVisible ? "Ocultar" : "Mostrar"}</Button>
            </div>
            <p className="miniweb-editor__note">El borrador se previsualiza aquí; no se guarda ni publica automáticamente.</p>
            {previewVisible ? data.profile ? (
              <div className="miniweb-editor__preview">
                <MiniWebRenderer configuration={configuration} hours={data.hours} preview profile={profile} />
              </div>
            ) : <div className="miniweb-editor__empty-preview">Completa primero la información de tu negocio para generar una vista previa.</div> : null}
            <p className="miniweb-editor__publication-state">
              {data.profileStatus === "suspended" ? "El perfil del negocio está suspendido y no aparece en público." : data.profileStatus === "published" ? "El perfil del negocio está publicado." : "El perfil del negocio todavía es un borrador."} {data.hasPersistedConfiguration ? "La configuración tiene cambios guardados." : "La configuración usa los valores iniciales."} {data.publicationIsCurrent ? "El perfil, los horarios y la configuración coinciden con la publicación." : "Hay cambios guardados que todavía no se han publicado."}
            </p>
          </Card>
        </div>
      </main>
    </ClientAreaShell>
  );
}

function emptyPreviewProfile(): PublicBusinessProfile {
  return {
    slug: "",
    displayName: "",
    shortDescription: null,
    description: null,
    category: null,
    city: null,
    country: null,
    logoUrl: null,
    phone: null,
    publicEmail: null,
    websiteUrl: null,
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    linkedinUrl: null,
    serviceMode: null,
    serviceArea: null,
    verificationStatus: "unverified",
  };
}
