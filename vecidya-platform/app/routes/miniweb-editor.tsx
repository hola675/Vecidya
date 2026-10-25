import { useEffect, useRef, useState } from "react";
import { Link, useBlocker, useLoaderData, useRevalidator } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getBusinessProfileForOrganization } from "../../db/queries/business-profile.server";
import { getBusinessProfileGovernance } from "../../db/queries/platform-governance.server";
import { createBusinessPublicationSnapshot, getBusinessPublicationSnapshotForOrganization, isBusinessPublicationCurrent, readConsistentBusinessDraft } from "../../db/queries/business-publication.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { getMiniWebContentForOrganization } from "../../db/queries/miniweb-content.server";
import { listBusinessMediaForOrganization, type BusinessMediaAsset, type BusinessMediaPurpose } from "../../db/queries/business-media.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { MiniWebRenderer } from "../components/miniweb/miniweb-renderer";
import { MiniWebSiteFooter, MiniWebSiteHeader } from "../components/miniweb/miniweb-site-chrome";
import type { PublicBusinessProfile } from "../components/public-business-profile-view";
import { Button, Card } from "../components/ui";
import { ClientAreaShell } from "../components/client-area-shell";
import { MINIWEB_MODULE_REGISTRY, MINIWEB_TEMPLATE_REGISTRY, type MiniWebConfiguration, type MiniWebModuleType } from "../features/miniweb/registry";
import { getMiniWebPublicationState, toMiniWebPublicProfile } from "../features/miniweb/public-model";
import { getRenderableMiniWebModules, hasMiniWebModuleContent } from "../features/miniweb/render";
import { MAX_BUSINESS_FAQ_ITEMS, MAX_BUSINESS_OFFERINGS, type BusinessFaqItem, type BusinessOffering } from "../features/miniweb/content";

import type { Route } from "./+types/miniweb-editor";

type ModuleEditingDestination = "business" | "content" | null;

const moduleEditingGuide: Record<MiniWebModuleType, { source: string; missing: string; destination: ModuleEditingDestination }> = {
  hero: { source: "Mi negocio · identidad", missing: "Añade un nombre público para tu negocio.", destination: "business" },
  about: { source: "Mi negocio · descripción", missing: "Completa la descripción detallada de tu negocio.", destination: "business" },
  contact: { source: "Mi negocio · contacto", missing: "Añade al menos un canal de contacto público válido.", destination: "business" },
  hours: { source: "Mi negocio · horarios", missing: "Configura los horarios de atención, incluso si algún día está cerrado.", destination: "business" },
  services: { source: "MiniWeb · servicios", missing: "Añade y activa un servicio con título y descripción.", destination: "content" },
  gallery: { source: "MiniWeb · archivos", missing: "Sube al menos una imagen o un vídeo con el uso Galería.", destination: "content" },
  location: { source: "Mi negocio · ubicación", missing: "Indica la ciudad, el país, la categoría o la modalidad de atención.", destination: "business" },
  products: { source: "MiniWeb · productos", missing: "Añade y activa un producto con título y descripción.", destination: "content" },
  faq: { source: "MiniWeb · preguntas", missing: "Añade y activa una pregunta con su respuesta.", destination: "content" },
  articles: { source: "Funcionalidad futura", missing: "Los artículos todavía no están disponibles.", destination: null },
  team: { source: "Funcionalidad futura", missing: "Los perfiles de equipo todavía no están disponibles.", destination: null },
  certifications: { source: "Funcionalidad futura", missing: "Las certificaciones todavía no están disponibles.", destination: null },
  testimonials: { source: "Funcionalidad futura", missing: "Los testimonios todavía no están disponibles.", destination: null },
};


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
  const [offerings, setOfferings] = useState<BusinessOffering[]>(data.offerings);
  const [faqs, setFaqs] = useState(data.faqs);
  const [savedDraft, setSavedDraft] = useState({
    configuration: data.draftConfiguration,
    offerings: data.offerings,
    faqs: data.faqs,
  });
  const [media, setMedia] = useState(data.media);
  const leaveDialogRef = useRef<HTMLDialogElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingMediaId, setRemovingMediaId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mediaPurpose, setMediaPurpose] = useState<BusinessMediaPurpose>("gallery");
  const [expandedOfferingIndex, setExpandedOfferingIndex] = useState<number | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "sections" | "content" | "preview" | "publish">("design");
  const [contentTab, setContentTab] = useState<"services" | "products" | "faq" | "media">("services");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const isDirty = JSON.stringify(configuration) !== JSON.stringify(savedDraft.configuration)
    || JSON.stringify(offerings) !== JSON.stringify(savedDraft.offerings)
    || JSON.stringify(faqs) !== JSON.stringify(savedDraft.faqs);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
  );
  const orderedModules = [...configuration.modules].sort((left, right) => left.sortOrder - right.sortOrder || left.type.localeCompare(right.type));
  const steps = [
    { key: "design", title: "Diseño", help: "Comprueba la plantilla y la identidad de tu negocio." },
    { key: "sections", title: "Secciones", help: "Elige qué mostrar y en qué orden." },
    { key: "content", title: "Contenido", help: "Completa servicios, productos, preguntas y galería." },
    { key: "preview", title: "Vista previa", help: "Revisa el resultado antes de publicarlo." },
    { key: "publish", title: "Publicar", help: "Guarda y confirma la versión visible para visitantes." },
  ] as const;
  const stepIndex = steps.findIndex((step) => step.key === activeTab);
  const currentStep = steps[stepIndex];
  function goToContent(type: MiniWebModuleType) {
    setContentTab(type === "faq" ? "faq" : type === "gallery" ? "media" : type === "products" ? "products" : "services");
    goToStep(2);
  }

  function goToStep(index: number) {
    const step = steps[index];
    if (!step) return;
    setActiveTab(step.key);
    window.requestAnimationFrame(() => {
      document.getElementById("miniweb-step-title")?.focus({ preventScroll: true });
      document.getElementById("miniweb-step-guide")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }


  // El cambio de organización remonta el editor mediante su key.
  // Una revalidación o subida de archivos no debe sobrescribir los campos locales.
  useEffect(() => {
    const dialog = leaveDialogRef.current;
    if (!dialog) return;
    if (blocker.state === "blocked" && !dialog.open) dialog.showModal();
    if (blocker.state !== "blocked" && dialog.open) dialog.close();
  }, [blocker.state]);

  useEffect(() => {
    if (!isDirty) return;
    const preventAccidentalExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventAccidentalExit);
    return () => window.removeEventListener("beforeunload", preventAccidentalExit);
  }, [isDirty]);

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
    setSavedDraft({
      configuration: result.configuration,
      offerings: result.offerings ?? offerings,
      faqs: result.faqs ?? faqs,
    });
    if (typeof result.draftRevision === "number") setDraftRevision(result.draftRevision);
    await revalidate();
    return result.draftRevision ?? expectedRevision;
  }

  function validateEditableContent() {
    if (offerings.some((item) => !item.title.trim() || !item.description.trim())) {
      setMessage({ kind: "error", text: "Hay servicios o productos sin título o descripción. Complétalos antes de guardar." });
      const invalidIndex = offerings.findIndex((item) => !item.title.trim() || !item.description.trim());
      setContentTab(offerings[invalidIndex]?.kind === "product" ? "products" : "services");
      setExpandedOfferingIndex(invalidIndex);
      goToStep(2);
      return false;
    }
    if (faqs.some((item) => !item.question.trim() || !item.answer.trim())) {
      setMessage({ kind: "error", text: "Hay preguntas frecuentes incompletas. Completa cada pregunta y su respuesta antes de guardar." });
      setContentTab("faq");
      setExpandedFaqIndex(faqs.findIndex((item) => !item.question.trim() || !item.answer.trim()));
      goToStep(2);
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validateEditableContent()) return;
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
    if (!validateEditableContent()) return;
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
    if (mediaPurpose !== "gallery" && !fileInput.files[0].type.startsWith("image/")) {
      setMessage({ kind: "error", text: "Portada, logo e icono solo admiten imágenes JPEG, PNG o WebP. Los vídeos se pueden subir a Galería." });
      return;
    }
    if (mediaPurpose !== "gallery" && media.some((asset) => asset.purpose === mediaPurpose)) {
      setMessage({ kind: "error", text: "Ya existe un archivo de este tipo. Retíralo del borrador antes de subir otro." });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", fileInput.files[0]);
      body.set("altText", altInput.value);
      body.set("draftRevision", String(draftRevision));
      body.set("purpose", mediaPurpose);
      const response = await fetch(`/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/business-media`, { method: "POST", body });
      const result = await response.json() as { error?: string; asset?: BusinessMediaAsset; draftRevision?: number };
      if (!response.ok || !result.asset) throw new Error(result.error ?? "No se pudo subir el archivo.");
      setMedia((current) => [...current, { ...result.asset!, createdAt: new Date(result.asset!.createdAt), publicUrl: `/api/organizations/${encodeURIComponent(data.activeOrganization.id)}/business-media/${encodeURIComponent(result.asset!.id)}` }]);
      if (typeof result.draftRevision === "number") setDraftRevision(result.draftRevision);
      form.reset();
      await revalidate();
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
      setOfferings((current) => current.map((item) => item.imageAssetId === asset.id ? { ...item, imageAssetId: null } : item));
      setDraftRevision(result.draftRevision);
      await revalidate();
      setMessage({ kind: "success", text: "Medio retirado del borrador. La publicación actual no cambia hasta publicar de nuevo." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo retirar el medio." });
    } finally {
      setRemovingMediaId(null);
    }
  }

  const template = MINIWEB_TEMPLATE_REGISTRY[configuration.templateKey];
  const profile = data.profile ?? emptyPreviewProfile();
  const previewProfile = { ...profile, logoUrl: media.find((asset) => asset.purpose === "logo")?.publicUrl ?? profile.logoUrl };
  const previewModuleTypes = getRenderableMiniWebModules(configuration, previewProfile, data.hours, offerings, faqs, media).map((module) => module.type);
  const readyModuleCount = orderedModules.filter((module) => module.enabled && hasMiniWebModuleContent(module.type, profile, data.hours, offerings, faqs, media)).length;
  const enabledModuleCount = orderedModules.filter((module) => module.enabled).length;
  const incompleteOfferings = offerings.filter((item) => !item.title.trim() || !item.description.trim()).length;
  const incompleteFaqs = faqs.filter((item) => !item.question.trim() || !item.answer.trim()).length;
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
      organizationSwitchLocked={isDirty || busy || uploading || removingMediaId !== null}
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
          <div className="miniweb-editor__header-actions">
            <Link className="button button--secondary" to="/app/business-profile">Editar Mi negocio</Link>
            {data.profileStatus === "published" && data.profile?.slug ? (
              <Link className="button button--secondary" rel="noopener noreferrer" target="_blank" to={`/vecindario/${data.profile.slug}`}>Ver MiniWeb pública</Link>
            ) : null}
          </div>
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
              onClick={() => goToStep(steps.findIndex((step) => step.key === key))}
              type="button"
            >
              <span>{number}</span> {label}
            </button>
          ))}
        </nav>
        <p className="miniweb-editor__note">Configura un apartado a la vez. Los cambios de los demás apartados se conservan mientras editas. Guarda el borrador antes de salir.</p>
        {message ? <p className={`alert miniweb-editor__message miniweb-editor__message--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
        <section aria-labelledby="miniweb-step-title" className="miniweb-editor__guide" id="miniweb-step-guide">
          <p className="eyebrow">PASO {stepIndex + 1} DE {steps.length}</p>
          <h2 id="miniweb-step-title" tabIndex={-1}>{currentStep.title}</h2>
          <p>{currentStep.help}</p>
          <div className="miniweb-editor__guide-navigation">
            <Button disabled={stepIndex === 0} onClick={() => goToStep(stepIndex - 1)} tone="ghost">Paso anterior</Button>
            <Button disabled={stepIndex === steps.length - 1} onClick={() => goToStep(stepIndex + 1)} tone="secondary">Siguiente paso</Button>
          </div>
        </section>
        <div className="miniweb-editor__tab-actions">
          <span role="status">{editorStatusLabel}</span>
          <Button disabled={!data.canEdit || busy || !isDirty} onClick={handleSave} tone="secondary">{busy ? "Guardando…" : "Guardar borrador"}</Button>
          <Button onClick={() => goToStep(3)} tone="ghost">Revisar vista previa</Button>
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
              <div className="miniweb-editor__brand-assets" aria-label="Identidad visual de tu MiniWeb">
                {([
                  ["logo", "Logo de la MiniWeb", "Identifica tu marca. Si no añades uno aquí, se conserva el logotipo de Mi negocio."],
                  ["icon", "Icono de la MiniWeb", "Símbolo cuadrado complementario para reconocer el negocio."],
                  ["cover", "Imagen de portada", "Fotografía que acompaña la presentación principal."],
                ] as const).map(([purpose, label, description]) => {
                  const image = media.find((asset) => asset.purpose === purpose && asset.mediaType === "image");
                  return (
                    <div className="miniweb-editor__brand-asset" key={purpose}>
                      {image ? <img alt={image.altText} decoding="async" loading="lazy" src={image.publicUrl} /> : <span aria-hidden="true" className="miniweb-editor__brand-placeholder">+</span>}
                      <div>
                        <strong>{label}</strong>
                        <p>{description}</p>
                        <span className="miniweb-editor__brand-status">{image ? "Imagen seleccionada" : purpose === "logo" ? "Se usa la identidad de Mi negocio" : "Sin imagen adicional"}</span>
                      </div>
                      <Button onClick={() => { setMediaPurpose(purpose); setContentTab("media"); goToStep(2); }} tone="secondary">{image ? "Gestionar" : "Añadir"}</Button>
                    </div>
                  );
                })}
              </div>
              <p className="miniweb-editor__note">Las imágenes de marca de esta MiniWeb no modifican los datos maestros de Mi negocio. Guardar los archivos no los publica automáticamente.</p>
            </Card>

            </div>
            <div hidden={activeTab !== "sections"}>
            <Card aria-labelledby="miniweb-sections-title" className="miniweb-editor__sections-card" id="miniweb-sections">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">2 · ESTRUCTURA</p><h2 id="miniweb-sections-title">Secciones</h2></div>
                <span className="miniweb-editor__count">{readyModuleCount} listas de {enabledModuleCount} activas</span>
              </div>
              <p className="miniweb-editor__note">Activa solo lo que necesitas. Una sección sin información suficiente no aparece en la página pública.</p>
              <p className="miniweb-editor__note">Los datos generales se actualizan en <Link to="/app/business-profile">Mi negocio</Link>; los servicios, productos, preguntas y medios se completan en el paso Contenido.</p>
              <ol className="miniweb-module-list">
                {orderedModules.map((module, position) => {
                  const type = module.type;
                  const definition = MINIWEB_MODULE_REGISTRY[type];
                  const ready = hasMiniWebModuleContent(type, profile, data.hours, offerings, faqs, media);
                  const guidance = moduleEditingGuide[type];
                  return (
                    <li className="miniweb-module-list__item" data-module-type={type} key={type}>
                      <div className="miniweb-module-list__copy">
                        <div className="miniweb-module-list__title">
                          <strong>{definition.label}</strong>
                          {definition.required ? <span className="badge">Requerida</span> : null}
                          <span className={`miniweb-module-status miniweb-module-status--${module.enabled ? ready ? "ready" : "missing" : "off"}`}>
                            {module.enabled ? ready ? "Lista para mostrar" : "Falta contenido" : ready ? "Disponible" : "Inactiva"}
                          </span>
                        </div>
                        <p>{definition.description}</p>
                        <p className="miniweb-module-list__source">{guidance.source}</p>
                        {!ready ? <p className="miniweb-module-list__help">{guidance.missing}</p> : null}
                        {!ready && guidance.destination === "business" ? <Link className="miniweb-module-list__action" to="/app/business-profile">Completar en Mi negocio</Link> : null}
                        {!ready && guidance.destination === "content" ? <button className="miniweb-module-list__action" onClick={() => goToContent(type)} type="button">Completar contenido</button> : null}
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
              <nav aria-label="Apartados del contenido MiniWeb" className="miniweb-editor__content-nav">
                {([
                  ["services", "Servicios", offerings.filter((item) => item.kind === "service").length],
                  ["products", "Productos", offerings.filter((item) => item.kind === "product").length],
                  ["faq", "Preguntas frecuentes", faqs.length],
                  ["media", "Archivos e identidad", media.length],
                ] as const).map(([key, label, count]) => (
                  <button
                    aria-pressed={contentTab === key}
                    className={contentTab === key ? "miniweb-editor__content-nav--active" : ""}
                    key={key}
                    onClick={() => setContentTab(key)}
                    type="button"
                  >{label} <span>{count}</span></button>
                ))}
              </nav>
              <div hidden={contentTab !== "services" && contentTab !== "products"}>
            <Card aria-labelledby="miniweb-offerings-title" className="miniweb-content-editor" id="miniweb-content">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">3 · CONTENIDO DEL NEGOCIO</p><h2 id="miniweb-offerings-title">{contentTab === "services" ? "Servicios" : "Productos"}</h2></div>
                <span className="miniweb-editor__count">{offerings.length}/{MAX_BUSINESS_OFFERINGS} entre ambos</span>
              </div>
              <p className="miniweb-editor__note">Añade información real y clara. Los precios son opcionales; esta MiniWeb no procesa compras ni pagos.</p>
              {!offerings.some((item) => item.kind === (contentTab === "services" ? "service" : "product")) ? (
                <div className="miniweb-editor__empty-state">
                  <strong>{contentTab === "services" ? "Presenta lo que haces" : "Presenta lo que ofreces"}</strong>
                  <p>{contentTab === "services" ? "Describe los servicios que puede solicitar un cliente, con sus principales beneficios." : "Añade los productos que deseas enseñar. No se habilitará un carrito ni pagos."}</p>
                </div>
              ) : null}
              {offerings.map((item, index) => item.kind === (contentTab === "services" ? "service" : "product") ? (
                <div className="miniweb-content-editor__entry" key={`offering-${index}`}>
                  <button
                    aria-controls={`miniweb-offering-fields-${index}`}
                    aria-expanded={expandedOfferingIndex === index}
                    className="miniweb-content-editor__entry-toggle"
                    onClick={() => setExpandedOfferingIndex((current) => current === index ? null : index)}
                    type="button"
                  >
                    <span><strong>{item.title.trim() || (item.kind === "service" ? "Servicio sin título" : "Producto sin título")}</strong>
                    <small>{item.isActive ? "Visible al publicar" : "Oculto"} · {item.description.trim() ? "Con descripción" : "Falta descripción"}</small></span>
                    <span aria-hidden="true" className="miniweb-content-editor__chevron" />
                  </button>
                <fieldset className="miniweb-content-editor__item" disabled={!data.canEdit || busy} hidden={expandedOfferingIndex !== index} id={`miniweb-offering-fields-${index}`}>
                  <legend>{item.kind === "service" ? "Servicio" : "Producto"} · {item.title.trim() || "Sin título"}</legend>
                  <label>Tipo
                    <select aria-label={`Tipo de oferta ${index + 1}`} onChange={(event) => updateOffering(index, { kind: event.currentTarget.value as BusinessOffering["kind"] })} value={item.kind}>
                      <option value="service">Servicio</option><option value="product">Producto</option>
                    </select>
                  </label>
                  <label>Título
                    <input maxLength={120} onChange={(event) => updateOffering(index, { title: event.currentTarget.value })} placeholder={item.kind === "service" ? "Nombre del servicio" : "Nombre del producto"} required value={item.title} />
                  </label>
                  <label>Descripción
                    <textarea maxLength={600} onChange={(event) => updateOffering(index, { description: event.currentTarget.value })} placeholder="Explica qué incluye y a quién va dirigido." required rows={3} value={item.description} />
                  </label>
                  <label>Imagen del {item.kind === "service" ? "servicio" : "producto"} (opcional)
                    <select
                      disabled={!data.canEdit || busy}
                      onChange={(event) => updateOffering(index, { imageAssetId: event.currentTarget.value || null })}
                      value={item.imageAssetId ?? ""}
                    >
                      <option value="">Sin imagen</option>
                      {media.filter((asset) => asset.mediaType === "image" && asset.purpose === "gallery").map((asset) => (
                        <option key={asset.id} value={asset.id}>{asset.altText}</option>
                      ))}
                    </select>
                  </label>
                  {item.imageAssetId && media.some((asset) => asset.id === item.imageAssetId && asset.mediaType === "image")
                    ? <img alt={media.find((asset) => asset.id === item.imageAssetId)?.altText ?? ""} className="miniweb-content-editor__image-preview" loading="lazy" src={media.find((asset) => asset.id === item.imageAssetId)?.publicUrl} />
                    : null}
                  {!media.some((asset) => asset.mediaType === "image" && asset.purpose === "gallery") ? (
                    <p className="miniweb-editor__note">Sube primero una fotografía en Galería para asociarla a esta oferta. <button className="miniweb-module-list__action" onClick={() => { setMediaPurpose("gallery"); setContentTab("media"); }} type="button">Abrir galería</button></p>
                  ) : null}
                  <label>Texto de precio (opcional)
                    <input maxLength={80} onChange={(event) => updateOffering(index, { priceLabel: event.currentTarget.value || null })} placeholder="Ej.: Consultar precio" value={item.priceLabel ?? ""} />
                  </label>
                  <label className="miniweb-content-editor__toggle"><input checked={item.isActive} onChange={(event) => updateOffering(index, { isActive: event.currentTarget.checked })} type="checkbox" /> Mostrar cuando se publique</label>
                  <Button onClick={() => { setExpandedOfferingIndex(null); setOfferings((current) => current.filter((_, position) => position !== index).map((entry, sortOrder) => ({ ...entry, sortOrder }))); }} tone="secondary">Quitar {item.kind === "service" ? "servicio" : "producto"}</Button>
                </fieldset>
                </div>
              ) : null)}
              <Button disabled={!data.canEdit || busy || offerings.length >= MAX_BUSINESS_OFFERINGS} onClick={() => { setExpandedOfferingIndex(offerings.length); setOfferings((current) => [...current, { kind: contentTab === "services" ? "service" : "product", title: "", description: "", priceLabel: null, imageAssetId: null, sortOrder: current.length, isActive: true }]); }} tone="secondary">Añadir {contentTab === "services" ? "servicio" : "producto"}</Button>
              {offerings.length >= MAX_BUSINESS_OFFERINGS ? <p className="miniweb-editor__note" role="status">Has alcanzado el máximo compartido de {MAX_BUSINESS_OFFERINGS} servicios y productos.</p> : null}
            </Card>
              </div>
              <div hidden={contentTab !== "faq"}>
            <Card aria-labelledby="miniweb-faq-title" className="miniweb-content-editor">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">AYUDA PARA TUS VISITANTES</p><h2 id="miniweb-faq-title">Preguntas frecuentes</h2></div>
                <span className="miniweb-editor__count">{faqs.length}/{MAX_BUSINESS_FAQ_ITEMS}</span>
              </div>
              {faqs.length === 0 ? (
                <div className="miniweb-editor__empty-state">
                  <strong>Resuelve las dudas antes de que te contacten</strong>
                  <p>Añade preguntas que realmente recibes, por ejemplo sobre reservas, disponibilidad o atención.</p>
                </div>
              ) : null}
              {faqs.map((item, index) => (
                <div className="miniweb-content-editor__entry" key={`faq-${index}`}>
                  <button
                    aria-controls={`miniweb-faq-fields-${index}`}
                    aria-expanded={expandedFaqIndex === index}
                    className="miniweb-content-editor__entry-toggle"
                    onClick={() => setExpandedFaqIndex((current) => current === index ? null : index)}
                    type="button"
                  >
                    <span><strong>{item.question.trim() || "Pregunta sin título"}</strong>
                    <small>{item.isActive ? "Visible al publicar" : "Oculta"} · {item.answer.trim() ? "Con respuesta" : "Falta respuesta"}</small></span>
                    <span aria-hidden="true" className="miniweb-content-editor__chevron" />
                  </button>
                <fieldset className="miniweb-content-editor__item" disabled={!data.canEdit || busy} hidden={expandedFaqIndex !== index} id={`miniweb-faq-fields-${index}`}>
                  <legend>Pregunta {index + 1}</legend>
                  <label>Pregunta
                    <input maxLength={240} onChange={(event) => updateFaq(index, { question: event.currentTarget.value })} placeholder="Escribe una pregunta frecuente" required value={item.question} />
                  </label>
                  <label>Respuesta
                    <textarea maxLength={1200} onChange={(event) => updateFaq(index, { answer: event.currentTarget.value })} placeholder="Responde con información comprobada de tu negocio." required rows={4} value={item.answer} />
                  </label>
                  <label className="miniweb-content-editor__toggle"><input checked={item.isActive} onChange={(event) => updateFaq(index, { isActive: event.currentTarget.checked })} type="checkbox" /> Mostrar cuando se publique</label>
                  <Button onClick={() => { setExpandedFaqIndex(null); setFaqs((current) => current.filter((_, position) => position !== index).map((entry, sortOrder) => ({ ...entry, sortOrder }))); }} tone="secondary">Quitar pregunta</Button>
                </fieldset>
                </div>
              ))}
              <Button disabled={!data.canEdit || busy || faqs.length >= MAX_BUSINESS_FAQ_ITEMS} onClick={() => { setExpandedFaqIndex(faqs.length); setFaqs((current) => [...current, { question: "", answer: "", sortOrder: current.length, isActive: true }]); }} tone="secondary">Añadir pregunta</Button>
              {faqs.length >= MAX_BUSINESS_FAQ_ITEMS ? <p role="status" className="miniweb-editor__note">Has alcanzado el máximo de {MAX_BUSINESS_FAQ_ITEMS} preguntas.</p> : null}
            </Card>
              </div>
              <div hidden={contentTab !== "media"}>
            <Card aria-labelledby="miniweb-media-title" className="miniweb-content-editor">
              <div className="miniweb-editor__section-heading">
                <div><p className="eyebrow">BIBLIOTECA VISUAL</p><h2 id="miniweb-media-title">Identidad, galería y portada</h2></div>
                <span className="miniweb-editor__count">{media.length} archivos</span>
              </div>
              <p className="miniweb-editor__note">Organiza los recursos del negocio sin duplicar Mi negocio: logo e icono propios de MiniWeb, portada y fotografías o vídeos para Galería. Formatos admitidos: JPEG, PNG, WebP, MP4 y WebM, hasta 32 MB por archivo. Solo se mostrarán al publicar.</p>
              <form className="miniweb-content-editor__item" onSubmit={handleMediaUpload}>
                <input name="draftRevision" type="hidden" value={draftRevision} />
                <label>Destino del archivo
                  <select disabled={!data.canEdit || uploading || busy} name="purpose" onChange={(event) => setMediaPurpose(event.currentTarget.value as BusinessMediaPurpose)} value={mediaPurpose}>
                    <option value="gallery">Galería · fotos o vídeos</option>
                    <option value="cover">Portada · solo imagen</option>
                    <option value="logo">Logo de MiniWeb · solo imagen</option>
                    <option value="icon">Icono de MiniWeb · solo imagen</option>
                  </select>
                </label>
                <p className="miniweb-editor__note">{
                  mediaPurpose === "gallery" ? "La galería admite imágenes o vídeos; solo se muestra si activas esa sección." :
                  mediaPurpose === "cover" ? "La portada es una sola imagen en la presentación principal." :
                  mediaPurpose === "logo" ? "El logo de MiniWeb sustituye visualmente al logo de Mi negocio únicamente en esta página pública." :
                  "El icono es una imagen cuadrada que acompaña el título del negocio."
                } Para sustituir una imagen de marca, retira primero la anterior.</p>
                <label>Archivo
                  <input accept={mediaPurpose === "gallery" ? "image/jpeg,image/png,image/webp,video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} disabled={!data.canEdit || uploading || busy} key={mediaPurpose} name="file" required type="file" />
                </label>
                <label>Texto alternativo o descripción breve
                  <input disabled={!data.canEdit || uploading || busy} maxLength={180} name="altText" required />
                </label>
                <Button disabled={!data.canEdit || uploading || busy} type="submit" tone="secondary">{uploading ? "Subiendo…" : "Subir medio"}</Button>
              </form>
              {!media.length ? <div className="miniweb-editor__empty-state"><strong>Tus imágenes cuentan la historia del negocio</strong><p>Añade una portada y, si quieres, más fotografías o vídeos para la galería. Puedes revisarlos antes de publicar.</p></div> : null}
              {media.length ? <ul className="miniweb-media-list">{media.map((asset) => <li key={asset.id}>{asset.mediaType === "image" ? <img alt="" height="72" loading="lazy" src={asset.publicUrl} width="96" /> : <span aria-hidden="true">▶</span>}<span>{asset.purpose === "cover" ? "Portada" : asset.purpose === "logo" ? "Logo" : asset.purpose === "icon" ? "Icono" : "Galería"}: {asset.altText}</span><span>{Math.ceil(asset.sizeBytes / 1024)} KB</span><Button disabled={!data.canEdit || busy || uploading || removingMediaId !== null} onClick={() => void handleRemoveMedia(asset)} tone="secondary">{removingMediaId === asset.id ? "Retirando…" : "Retirar del borrador"}</Button></li>)}</ul> : null}
              <p className="miniweb-editor__note">El logo, el icono y la portada se usan en la presentación. La galería solo se ve cuando está activada en Secciones. Las imágenes vinculadas a servicios o productos se muestran en esas tarjetas aunque Galería esté desactivada.</p>
            </Card>
              </div>
            </div>
          </div>

          <div className="miniweb-editor__review">
          <div hidden={activeTab !== "preview"}>
          <Card aria-labelledby="miniweb-preview-title" className="miniweb-editor__preview-card" id="miniweb-preview">
            <div className="miniweb-editor__section-heading">
              <div><p className="eyebrow">4 · SOLO PARA TI</p><h2 id="miniweb-preview-title">Vista previa privada</h2></div>
              <Button aria-expanded={previewVisible} onClick={() => setPreviewVisible((visible) => !visible)} tone="ghost">{previewVisible ? "Ocultar" : "Mostrar"}</Button>
            </div>
            <p className="miniweb-editor__note">Visualiza los cambios del borrador antes de guardarlos o publicarlos. La simulación móvil no sustituye la revisión en un teléfono real.</p>
            <div aria-label="Tamaño de la vista previa" className="miniweb-editor__device-switch">
              <button aria-pressed={previewDevice === "desktop"} onClick={() => setPreviewDevice("desktop")} type="button">Escritorio</button>
              <button aria-pressed={previewDevice === "mobile"} onClick={() => setPreviewDevice("mobile")} type="button">Móvil</button>
            </div>
            {previewVisible && activeTab === "preview" ? data.profile ? (
              <div aria-label={previewDevice === "mobile" ? "Vista previa estrecha" : "Vista previa amplia"} className="miniweb-editor__preview-stage" data-device={previewDevice} role="region">
                <div className="miniweb-editor__preview miniweb-standalone">
                  <MiniWebSiteHeader profile={previewProfile} visibleModules={previewModuleTypes} preview />
                  <div className="miniweb-editor__preview-body">
                    <MiniWebRenderer configuration={configuration} hours={data.hours} offerings={offerings} faqs={faqs} media={media} preview profile={previewProfile} />
                  </div>
                  <MiniWebSiteFooter profile={previewProfile} preview />
                </div>
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
            {data.profileStatus === "published" && data.profile?.slug ? (
              <p className="miniweb-editor__note">Tu versión actual sigue visible en <Link rel="noopener noreferrer" target="_blank" to={`/vecindario/${data.profile.slug}`}>la página pública del negocio</Link> mientras editas el borrador.</p>
            ) : null}
            <section aria-label="Comprobación de la MiniWeb" className="miniweb-editor__checklist">
              <h3>Comprobación antes de publicar</h3>
              <p><strong>{readyModuleCount} de {enabledModuleCount}</strong> secciones activas tienen contenido para mostrarse.</p>
              {readyModuleCount < enabledModuleCount ? (
                <div className="miniweb-editor__checklist-warning">
                  <p>{enabledModuleCount - readyModuleCount} secciones activas no aparecerán hasta completar sus datos.</p>
                  <Button onClick={() => goToStep(1)} tone="ghost">Revisar secciones</Button>
                </div>
              ) : <p>Las secciones activas cuentan con contenido visible.</p>}
              {incompleteOfferings + incompleteFaqs > 0 ? (
                <div className="miniweb-editor__checklist-warning" role="status">
                  <p>Hay {incompleteOfferings + incompleteFaqs} elementos incompletos que impiden guardar.</p>
                  <Button onClick={() => { setContentTab(incompleteOfferings ? "services" : "faq"); goToStep(2); }} tone="ghost">Completar contenido</Button>
                </div>
              ) : <p>Los servicios, productos y preguntas no tienen campos obligatorios vacíos.</p>}
              <p className="miniweb-editor__note">{isDirty ? "Hay cambios locales sin guardar. Publicar intentará guardarlos primero." : "No tienes cambios de contenido pendientes de guardar en este editor."}</p>
            </section>
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
      <dialog
        aria-describedby="miniweb-leave-description"
        aria-labelledby="miniweb-leave-title"
        className="miniweb-editor__leave-dialog"
        onCancel={(event) => {
          event.preventDefault();
          if (blocker.state === "blocked") blocker.reset();
        }}
        ref={leaveDialogRef}
      >
        <p className="eyebrow">CAMBIOS SIN GUARDAR</p>
        <h2 id="miniweb-leave-title">¿Quieres salir de Mi MiniWeb?</h2>
        <p id="miniweb-leave-description">Has modificado contenido que todavía no está guardado. Si sales ahora, perderás esos cambios locales.</p>
        <div className="miniweb-editor__leave-dialog-actions">
          <Button onClick={() => { if (blocker.state === "blocked") blocker.reset(); }} tone="secondary">Seguir editando</Button>
          <Button onClick={() => { if (blocker.state === "blocked") blocker.proceed(); }}>Salir sin guardar</Button>
        </div>
      </dialog>
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
