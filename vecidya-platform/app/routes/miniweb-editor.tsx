import { useEffect, useState } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { getBusinessProfileGovernance } from "../../db/queries/platform-governance.server";
import { createBusinessPublicationSnapshot, getBusinessPublicationSnapshotForOrganization, isBusinessPublicationCurrent, readConsistentBusinessDraft } from "../../db/queries/business-publication.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { getMiniWebContentForOrganization } from "../../db/queries/miniweb-content.server";
import { listBusinessMediaForOrganization, type BusinessMediaAsset } from "../../db/queries/business-media.server";
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
import { MAX_BUSINESS_FAQ_ITEMS, MAX_BUSINESS_OFFERINGS, type BusinessFaqItem, type BusinessOffering } from "../features/miniweb/content";

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
  const { data: { profile, hours, state, content, media, publicationIsCurrent }, draftRevision } = await readConsistentBusinessDraft(database, organization.id, async () => {
    const [profile, hours] = await Promise.all([
      getBusinessProfileForOrganization(database, organization.id),
      listBusinessHoursForOrganization(database, organization.id),
    ]);
    const [state, publication, content, media] = await Promise.all([
      getMiniWebConfigurationForOrganization(database, organization.id, profile, hours),
      getBusinessPublicationSnapshotForOrganization(database, organization.id),
      getMiniWebContentForOrganization(database, organization.id),
      listBusinessMediaForOrganization(database, organization.id),
    ]);
    const currentSnapshot = profile?.status === "published"
      ? createBusinessPublicationSnapshot(profile, hours, state.draftConfiguration, content.offerings, content.faqs, media)
      : null;
    const publicationIsCurrent = isBusinessPublicationCurrent(publication.publishedVersion, publication.snapshot, currentSnapshot);
    return { profile, hours, state, content, media, publicationIsCurrent };
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
    offerings: content.offerings,
    faqs: content.faqs,
    media: media.map((asset) => ({ ...asset, publicUrl: `/api/organizations/${encodeURIComponent(organization.id)}/business-media/${encodeURIComponent(asset.id)}` })),
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
  const [offerings, setOfferings] = useState(data.offerings);
  const [faqs, setFaqs] = useState(data.faqs);
  const [media, setMedia] = useState(data.media);
  const [uploading, setUploading] = useState(false);
  const [removingMediaId, setRemovingMediaId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<"design" | "sections" | "content" | "preview" | "publish">("design");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const isDirty = JSON.stringify(configuration) !== JSON.stringify(data.draftConfiguration)
    || JSON.stringify(offerings) !== JSON.stringify(data.offerings)
    || JSON.stringify(faqs) !== JSON.stringify(data.faqs);
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

  function updateOffering(index: number, patch: Partial<BusinessOffering>) {
    setOfferings((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
  }

  function updateFaq(index: number, patch: Partial<BusinessFaqItem>) {
    setFaqs((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
  }

  async function sendConfiguration(intent: "save" | "publish", value: MiniWebConfiguration, expectedRevision: number) {
    const response = await fetch(`/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/miniweb-config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ intent, ...(intent === "save" ? { configuration: value, offerings, faqs } : {}), draftRevision: expectedRevision }),
    });
    const result = await response.json() as { error?: string; configuration?: MiniWebConfiguration; offerings?: BusinessOffering[]; faqs?: BusinessFaqItem[]; draftRevision?: number };
    if (!response.ok || !result.configuration) throw new Error(result.error ?? "No se pudo guardar la configuración.");
    setConfiguration(result.configuration);
    if (result.offerings) setOfferings(result.offerings);
    if (result.faqs) setFaqs(result.faqs);
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

  async function handleMediaUpload(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file");
    const altInput = form.elements.namedItem("altText");
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.[0] || !(altInput instanceof HTMLInputElement)) return;
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", fileInput.files[0]);
      body.set("altText", altInput.value);
      body.set("draftRevision", String(draftRevision));
      const purposeInput = form.elements.namedItem("purpose");
      if (purposeInput instanceof HTMLSelectElement) body.set("purpose", purposeInput.value);
      const response = await fetch(`/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/business-media`, { method: "POST", body });
      const result = await response.json() as { error?: string; asset?: BusinessMediaAsset; draftRevision?: number };
      if (!response.ok || !result.asset) throw new Error(result.error ?? "No se pudo subir el archivo.");
      setMedia((current) => [...current, { ...result.asset!, createdAt: new Date(result.asset!.createdAt), publicUrl: `/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/business-media/${encodeURIComponent(result.asset!.id)}` }]);
      if (typeof result.draftRevision === "number") setDraftRevision(result.draftRevision);
      form.reset();
      setMessage({ kind: "success", text: "Medio guardado como borrador. Solo será visible después de publicar la MiniWeb." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo subir el archivo." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveMedia(asset: BusinessMediaAsset) {
    setRemovingMediaId(asset.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/business-media/${encodeURIComponent(asset.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftRevision }),
      });
      const result = await response.json() as { error?: string; draftRevision?: number };
      if (!response.ok || typeof result.draftRevision !== "number") throw new Error(result.error ?? "No se pudo retirar el medio.");
      setMedia((current) => current.filter((item) => item.id !== asset.id));
      setDraftRevision(result.draftRevision);
      setMessage({ kind: "success", text: "Medio retirado del borrador. La publicación actual no cambia hasta publicar de nuevo." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo retirar el medio." });
    } finally {
      setRemovingMediaId(null);
    }
  }

  const template = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey];
  const profile = data.profile ?? emptyPreviewProfile();
  const publicStatusLabel = data.profileStatus === "suspended"
    ? "Suspendido"
    : data.profileStatus === "published" ? "Publicado" : "Aún sin publicar";
  const publicStatusDescription = data.profileStatus === "suspended"
    ? "El perfil del negocio está suspendido y no aparece en público."
    : data.profileStatus === "published" ? "El perfil del negocio está publicado." : "El perfil del negocio todavía es un borrador.";
  const configurationStatusLabel = data.hasPersistedConfiguration
    ? "La configuración tiene cambios guardados."
    : "La configuración usa los valores iniciales.";
  const editorStatusLabel = isDirty ? "Hay cambios sin guardar" : "Sin cambios pendientes de guardar";
  const publicationStatusLabel = data.profileStatus !== "published"
    ? "No hay una versión pública activa."
    : data.publicationIsCurrent
      ? "El perfil, los horarios y la configuración coinciden con la publicación."
      : "Hay cambios guardados que todavía no se han publicado.";

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

        <nav aria-label="Pasos para preparar tu MiniWeb" className="miniweb-editor__steps miniweb-editor__tabs">
          {([
            ["design", "1", "Diseño"],
            ["sections", "2", "Secciones"],
            ["content", "3", "Contenido"],
            ["preview", "4", "Vista previa"],
            ["publish", "5", "Publicar"],
          ] as const).map(([key, number, label]) => (
            <button
              aria-current={activeTab === key ? "step" : undefined}
              aria-pressed={activeTab === key}
              className={activeTab === key ? "miniweb-editor__tab--active" : ""}
              key={key}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              <span>{number}</span> {label}
            </button>
          ))}
        </nav>
        <p className="miniweb-editor__note">Configura un apartado a la vez. Los cambios de los demás apartados se conservan mientras editas. Guarda el borrador antes de salir.</p>
        {message ? <p className={`alert miniweb-editor__message miniweb-editor__message--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
        <div className="miniweb-editor__tab-actions">
          <span role="status">{editorStatusLabel}</span>
          <Button disabled={!data.canEdit || busy || !isDirty} onClick={handleSave} tone="secondary">{busy ? "Guardando…" : "Guardar borrador"}</Button>
          <Button onClick={() => setActiveTab("preview")} tone="ghost">Revisar vista previa</Button>
        </div>

        <div className="miniweb-editor__layout">
          <div className="miniweb-editor__controls">
            <div hidden={activeTab !== "design"}>
            <Card aria-labelledby="miniweb-template-title" className="miniweb-editor__template" id="miniweb-design">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">1 · DISEÑO</p><h2 id="miniweb-template-title">{template.name}</h2></div>
                <span className="badge">v{template.version}</span>
              </div>
              <p>{template.description}</p>
              <p className="miniweb-editor__note">Esta es la plantilla disponible actualmente. Las demás opciones aparecerán cuando estén listas; no se cambiará tu diseño sin que lo elijas.</p>
            </Card>

            </div>
            <div hidden={activeTab !== "sections"}>
            <Card aria-labelledby="miniweb-sections-title" className="miniweb-editor__sections-card" id="miniweb-sections">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">2 · ESTRUCTURA</p><h2 id="miniweb-sections-title">Secciones</h2></div>
                <span className="miniweb-editor__count">{configuration.modules.filter((module) => module.enabled).length} activas</span>
              </div>
              <p className="miniweb-editor__note">Activa solo lo que necesitas. Una sección sin información suficiente no aparece en la página pública.</p>
              <p className="miniweb-editor__note">Los datos generales se actualizan en <Link to="/app/negocio">Mi negocio</Link>; los servicios, productos, preguntas y medios se completan en el paso Contenido.</p>
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
              <p className="miniweb-editor__note">El perfil, los horarios, las ofertas, las preguntas frecuentes y esta estructura se publican juntos.</p>
            </Card>

            </div>
            <div hidden={activeTab !== "content"}>
            <Card aria-labelledby="miniweb-offerings-title" className="miniweb-content-editor" id="miniweb-content">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">3 · CONTENIDO DEL NEGOCIO</p><h2 id="miniweb-offerings-title">Servicios y productos</h2></div>
                <span className="miniweb-editor__count">{offerings.length}/{MAX_BUSINESS_OFFERINGS}</span>
              </div>
              <p className="miniweb-editor__note">Añade solo información confirmada por tu negocio. El texto de precio es opcional y no procesa pagos ni pedidos.</p>
              {offerings.map((item, index) => (
                <fieldset className="miniweb-content-editor__item" key={`offering-${index}`} disabled={!data.canEdit || busy}>
                  <legend>{item.kind === "service" ? "Servicio" : "Producto"} {index + 1}</legend>
                  <label>Tipo
                    <select aria-label={`Tipo de oferta ${index + 1}`} onChange={(event) => updateOffering(index, { kind: event.currentTarget.value as BusinessOffering["kind"] })} value={item.kind}>
                      <option value="service">Servicio</option><option value="product">Producto</option>
                    </select>
                  </label>
                  <label>Título
                    <input maxLength={120} onChange={(event) => updateOffering(index, { title: event.currentTarget.value })} required value={item.title} />
                  </label>
                  <label>Descripción
                    <textarea maxLength={600} onChange={(event) => updateOffering(index, { description: event.currentTarget.value })} required rows={3} value={item.description} />
                  </label>
                  <label>Texto de precio (opcional)
                    <input maxLength={80} onChange={(event) => updateOffering(index, { priceLabel: event.currentTarget.value || null })} value={item.priceLabel ?? ""} />
                  </label>
                  <label className="miniweb-content-editor__toggle"><input checked={item.isActive} onChange={(event) => updateOffering(index, { isActive: event.currentTarget.checked })} type="checkbox" /> Mostrar cuando se publique</label>
                  <Button onClick={() => setOfferings((current) => current.filter((_, position) => position !== index).map((entry, sortOrder) => ({ ...entry, sortOrder })))} tone="secondary">Quitar oferta</Button>
                </fieldset>
              ))}
              <Button disabled={!data.canEdit || busy || offerings.length >= MAX_BUSINESS_OFFERINGS} onClick={() => setOfferings((current) => [...current, { kind: "service", title: "", description: "", priceLabel: null, sortOrder: current.length, isActive: true }])} tone="secondary">Añadir servicio o producto</Button>
            </Card>

            <Card aria-labelledby="miniweb-faq-title" className="miniweb-content-editor">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">AYUDA PARA TUS VISITANTES</p><h2 id="miniweb-faq-title">Preguntas frecuentes</h2></div>
                <span className="miniweb-editor__count">{faqs.length}/{MAX_BUSINESS_FAQ_ITEMS}</span>
              </div>
              {faqs.map((item, index) => (
                <fieldset className="miniweb-content-editor__item" key={`faq-${index}`} disabled={!data.canEdit || busy}>
                  <legend>Pregunta {index + 1}</legend>
                  <label>Pregunta
                    <input maxLength={240} onChange={(event) => updateFaq(index, { question: event.currentTarget.value })} required value={item.question} />
                  </label>
                  <label>Respuesta
                    <textarea maxLength={1200} onChange={(event) => updateFaq(index, { answer: event.currentTarget.value })} required rows={4} value={item.answer} />
                  </label>
                  <label className="miniweb-content-editor__toggle"><input checked={item.isActive} onChange={(event) => updateFaq(index, { isActive: event.currentTarget.checked })} type="checkbox" /> Mostrar cuando se publique</label>
                  <Button onClick={() => setFaqs((current) => current.filter((_, position) => position !== index).map((entry, sortOrder) => ({ ...entry, sortOrder })))} tone="secondary">Quitar pregunta</Button>
                </fieldset>
              ))}
              <Button disabled={!data.canEdit || busy || faqs.length >= MAX_BUSINESS_FAQ_ITEMS} onClick={() => setFaqs((current) => [...current, { question: "", answer: "", sortOrder: current.length, isActive: true }])} tone="secondary">Añadir pregunta</Button>
            </Card>

            <Card aria-labelledby="miniweb-media-title" className="miniweb-content-editor">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">MEDIOS DEL NEGOCIO</p><h2 id="miniweb-media-title">Imágenes y videos</h2></div>
                <span className="miniweb-editor__count">{media.length} archivos</span>
              </div>
              <p className="miniweb-editor__note">Sube imágenes JPEG, PNG o WebP, o videos MP4 o WebM de hasta 32 MB. Los medios se almacenan en privado y pasan a la página pública únicamente al publicar el snapshot.</p>
              <form className="miniweb-content-editor__item" onSubmit={handleMediaUpload}>
                <input name="draftRevision" type="hidden" value={draftRevision} />
                <label>Uso
                  <select disabled={!data.canEdit || uploading || busy} name="purpose" defaultValue="gallery"><option value="gallery">Galería</option><option value="cover">Portada (una imagen)</option></select>
                </label>
                <label>Archivo
                  <input accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" disabled={!data.canEdit || uploading || busy} name="file" required type="file" />
                </label>
                <label>Texto alternativo o descripción breve
                  <input disabled={!data.canEdit || uploading || busy} maxLength={180} name="altText" required />
                </label>
                <Button disabled={!data.canEdit || uploading || busy} type="submit" tone="secondary">{uploading ? "Subiendo…" : "Subir medio"}</Button>
              </form>
              {media.length ? <ul className="miniweb-media-list">{media.map((asset) => <li key={asset.id}>{asset.mediaType === "image" ? <img alt="" height="72" loading="lazy" src={asset.publicUrl} width="96" /> : <span aria-hidden="true">▶</span>}<span>{asset.purpose === "cover" ? "Portada" : "Galería"}: {asset.altText}</span><span>{Math.ceil(asset.sizeBytes / 1024)} KB</span><Button disabled={!data.canEdit || busy || uploading || removingMediaId !== null} onClick={() => void handleRemoveMedia(asset)} tone="secondary">{removingMediaId === asset.id ? "Retirando…" : "Retirar del borrador"}</Button></li>)}</ul> : <p className="miniweb-editor__note">Todavía no has subido medios.</p>}
              <p className="miniweb-editor__note">Activa la sección «Galería» y publica para incluir los medios actuales en el snapshot público. Los archivos nuevos aún no se muestran a visitantes.</p>
            </Card>
            </div>
          </div>

          <div className="miniweb-editor__review">
          <div hidden={activeTab !== "preview"}>
          <Card aria-labelledby="miniweb-preview-title" className="miniweb-editor__preview-card" id="miniweb-preview">
            <div className="miniweb-editor__section-heading">
              <div><p className="eyebrow">4 · SOLO PARA TI</p><h2 id="miniweb-preview-title">Vista previa privada</h2></div>
              <Button aria-expanded={previewVisible} onClick={() => setPreviewVisible((visible) => !visible)} tone="ghost">{previewVisible ? "Ocultar" : "Mostrar"}</Button>
            </div>
            <p className="miniweb-editor__note">El borrador se previsualiza aquí; no se guarda ni publica automáticamente.</p>
            {previewVisible ? data.profile ? (
              <div className="miniweb-editor__preview">
              <MiniWebRenderer configuration={configuration} hours={data.hours} offerings={offerings} faqs={faqs} media={media} preview profile={profile} />
              </div>
            ) : <div className="miniweb-editor__empty-preview">Completa primero la información de tu negocio para generar una vista previa.</div> : null}
            <div className="miniweb-editor__publication-state">
              <dl className="miniweb-editor__publication-grid">
                <div>
                  <dt>Estado público</dt>
                  <dd className="miniweb-editor__publication-public">
                    <span className={`badge ${data.profileStatus === "published" ? "badge--success" : data.profileStatus === "suspended" ? "badge--danger" : "badge--neutral"}`}>{publicStatusLabel}</span>
                    <span>{publicStatusDescription}</span>
                  </dd>
                </div>
                <div><dt>Configuración</dt><dd>{configurationStatusLabel}</dd></div>
                <div><dt>Edición actual</dt><dd>{editorStatusLabel}</dd></div>
                <div>
                  <dt>Versión pública</dt>
                  <dd>{publicationStatusLabel}</dd>
                </div>
              </dl>
              {isDirty ? <p className="miniweb-editor__publication-note">Los cambios sin guardar solo aparecen en esta vista previa privada.</p> : null}
            </div>
          </Card>
          </div>
          <div hidden={activeTab !== "publish"}>
          <Card aria-labelledby="miniweb-publish-title" className="miniweb-editor__publish-card" id="miniweb-publish">
            <div className="miniweb-editor__section-heading">
              <div><p className="eyebrow">5 · ÚLTIMO PASO</p><h2 id="miniweb-publish-title">Guardar y publicar</h2></div>
            </div>
            <p>Guardar conserva tus cambios como borrador. Publicar actualiza juntos el perfil, horarios, secciones, contenido y medios aprobados.</p>
            <p className="miniweb-editor__note">La vista pública no cambia hasta que elijas publicar. Revisa el resultado anterior antes de confirmar.</p>
            <div className="miniweb-editor__actions">
              <Button disabled={!data.canEdit || busy || !isDirty} onClick={handleSave} tone="secondary">{busy ? "Guardando…" : "Guardar borrador"}</Button>
              <Button disabled={!data.canPublish || busy} onClick={handlePublish}>{busy ? "Procesando…" : "Publicar configuración"}</Button>
            </div>
            {!data.canPublish ? <p className="miniweb-editor__note">Tu acceso permite consultar la MiniWeb, no guardar ni publicar cambios.</p> : null}
          </Card>
          </div>
          </div>
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
