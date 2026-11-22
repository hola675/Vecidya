import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useFetcher, useLoaderData, useRevalidator } from "react-router";
import { createDatabase } from "../../db/client.server";
import { listBusinessMediaForOrganization } from "../../db/queries/business-media.server";
import { getMiniWebV2EditorState, listMiniWebV2Sites } from "../../db/queries/miniweb-v2.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { ensureMiniWebV2Hero, miniWebV2EditorKey } from "../features/miniweb-v2/editor-state";
import { ClientAreaShell } from "../components/client-area-shell";
import { Button, Card } from "../components/ui";
import { MiniWebV2DesignControls } from "../components/miniweb-v2-design-controls";
import { MINIWEB_V2_DEFAULT_DESIGN, validateMiniWebV2Design, type MiniWebV2Design } from "../features/miniweb-v2/visual-design";
import { MiniWebV2Renderer } from "../components/miniweb-v2-renderer";
import { MiniWebV2SectionForm, MINIWEB_V2_SECTION_LABELS } from "../components/miniweb-v2-section-form";
import { createEmptyMiniWebV2Document, MINIWEB_V2_SECTION_TYPES, validateMiniWebV2Document, validateMiniWebV2Section, type MiniWebV2Document, type MiniWebV2Section, type MiniWebV2SectionType } from "../features/miniweb-v2/sections";
import { MINIWEB_V2_FAMILY_CATALOG, MINIWEB_V2_VARIANTS, type MiniWebV2Family, type MiniWebV2Variant } from "../features/miniweb-v2/visual-families";
import { isVisualFeatureEnabled } from "../lib/visual-rollout";
import type { Route } from "./+types/miniweb-v2-editor";

const templateCategories = [
  { label: "Servicios y profesionales", families: ["vecidya-default", "services-studio", "professional-profile"] },
  { label: "Comercios y catálogos", families: ["catalog-store"] },
  { label: "Gastronomía y experiencias", families: ["gastronomy-table"] },
] as const;
const variantLabels = { base: "Clásico", pro: "Editorial", premium: "Impacto" } as const;

const sectionGuidance: Record<MiniWebV2SectionType, string> = {
  hero: "Explica en pocas palabras qué ofrece tu negocio. Es lo primero que verá quien entre al sitio.",
  about: "Cuenta a qué te dedicas y qué debería saber alguien que todavía no te conoce.",
  services: "Describe cada servicio con palabras que una persona pueda entender sin conocimientos técnicos.",
  products: "Muestra los productos disponibles; evita prometer precios o existencias que no estén confirmados.",
  gallery: "Selecciona imágenes propias de tu negocio y describe su contenido para accesibilidad.",
  contact: "Comprueba los datos que podrán utilizar los visitantes para comunicarse contigo.",
  location: "Indica dónde atiendes o qué zonas cubres, según tu forma real de trabajar.",
  faq: "Responde preguntas frecuentes de forma breve, directa y verificable.",
  team: "Presenta personas solo con su consentimiento para publicar información personal.",
  certifications: "Añade únicamente acreditaciones reales cuya procedencia puedas demostrar.",
  testimonials: "Publica reseñas auténticas con autorización de quien las compartió.",
  hours: "Indica la zona horaria y los horarios verdaderos; añade excepciones para los días especiales.",
};

export function meta() {
  return [{ title: "Diseña tu sitio | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const membership = await requireOrganizationPermission(env, request, organization.id, "business-profile:read");
  const shell = await getClientWorkspaceContext(env, request);
  const siteId = new URL(request.url).searchParams.get("site");
  const database = createDatabase(env.DB);
  const [state, sites, media] = await Promise.all([
    getMiniWebV2EditorState(database, organization.id, siteId ?? undefined),
    listMiniWebV2Sites(database, organization.id),
    listBusinessMediaForOrganization(database, organization.id),
  ]);
  return { ...shell, organization: { id: organization.id, name: organization.name }, canEdit: membership.role === "owner" || membership.role === "admin", sites, media,
    state: state ? { site: state.site, revision: state.draft.revision, document: JSON.parse(state.draft.documentJson) as MiniWebV2Document } : null };
}
type MiniWebV2EditorData = Awaited<ReturnType<typeof loader>>;
export default function MiniWebV2Editor() {
  const data = useLoaderData<typeof loader>();
  return <MiniWebV2EditorState key={miniWebV2EditorKey(data.organization.id, data.state?.site.id ?? null)} data={data}/>;
}

function MiniWebV2EditorState({ data }: { data: MiniWebV2EditorData }) {
  const editorSurface = isVisualFeatureEnabled("miniWebEditorSolid") ? "solid" : "glass";
  const fetcher = useFetcher();
  const reloadFetcher = useFetcher<typeof loader>();
  const { revalidate } = useRevalidator();
  const initialDocument = () => ensureMiniWebV2Hero(data.state?.document);
  const [document, setDocument] = useState<MiniWebV2Document>(initialDocument);
  const [savedDocument, setSavedDocument] = useState<MiniWebV2Document>(initialDocument);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(() => document.sections[0]?.id ?? null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [revision, setRevision] = useState(data.state?.revision ?? 0);
  const [notice, setNotice] = useState("");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<"network" | "conflict" | null>(null);
  const [autoSaveWaiting, setAutoSaveWaiting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
  const [reviewedRevision, setReviewedRevision] = useState<number | null>(null);
  const [sectionToAdd, setSectionToAdd] = useState<MiniWebV2SectionType>("about");
  const [family, setFamily] = useState<MiniWebV2Family>((data.state?.site.familyKey as MiniWebV2Family | undefined) ?? "vecidya-default");
  const [variant, setVariant] = useState<MiniWebV2Variant>((data.state?.site.visualVariant as MiniWebV2Variant | undefined) ?? "base");
  const [createDesign, setCreateDesign] = useState<MiniWebV2Design>({ ...MINIWEB_V2_DEFAULT_DESIGN });
  const pending = useRef<{ operation: string; document: MiniWebV2Document; automatic: boolean; previousData: unknown; started: boolean } | null>(null);
  const autoSaveTimer = useRef<number | null>(null);
  const reloadConflictPending = useRef(false);
  const submitLocked = useRef(false);
  const isDirty = JSON.stringify(document) !== JSON.stringify(savedDocument);
  const editing = fetcher.state !== "idle";
  const validation = useMemo(() => validateMiniWebV2Document(document), [document]);
  const publicationValidation = useMemo(() => validateMiniWebV2Document(document, { publishable: true }), [document]);
  const orderedSections = [...document.sections].sort((a, b) => a.order - b.order);
  const activeSectionIndex = Math.max(0, orderedSections.findIndex((section) => section.id === activeSectionId));
  const activeSection = orderedSections[activeSectionIndex];
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Hay cambios sin guardar. ¿Quieres salir y descartarlos?")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  useEffect(() => {
    const pendingOperation = pending.current;
    if (!pendingOperation) return;
    if (fetcher.state !== "idle") {
      pendingOperation.started = true;
      return;
    }
    const response = fetcher.data;
    if (!pendingOperation.started && response === pendingOperation.previousData) return;
    if (!response || response === pendingOperation.previousData) {
      pending.current = null;
      submitLocked.current = false;
      setSaveError("network");
      setNotice("No se pudo confirmar el guardado. Tus cambios locales se conservaron; usa Guardar cambios para reintentar.");
      return;
    }
    if (response.siteId && response.imported) {
      window.location.assign(`/app/miniweb-v2?site=${encodeURIComponent(response.siteId)}`);
      return;
    }
    if (response.ok && response.siteId && pendingOperation.operation === "create") {
      window.location.assign(`/app/miniweb-v2?site=${encodeURIComponent(response.siteId)}`);
      return;
    }
    if (response.ok && typeof response.revision === "number") {
      setRevision(response.revision);
      const operation = pendingOperation.operation;
      if (operation === "save") {
        // Solo la copia realmente enviada queda guardada. No se pisan ediciones hechas mientras respondía el servidor.
        const newerEditsRemain = JSON.stringify(document) !== JSON.stringify(pendingOperation.document);
        setSavedDocument(pendingOperation.document);
        setSaveError(null);
        setNotice(newerEditsRemain
          ? `Se guardó la revisión ${response.revision}. Los cambios posteriores permanecen pendientes de autoguardado.`
          : pendingOperation.automatic ? `Autoguardado completado · revisión ${response.revision}.` : `Borrador guardado · revisión ${response.revision}.`);
        setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null);
      } else if (operation === "publish") {
        setNotice(`Sitio publicado correctamente (revisión ${response.revision}).`);
        setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null);
      } else {
        setNotice("Operación completada.");
      }
      setServerErrors([]);
      pending.current = null;
      submitLocked.current = false;
      revalidate();
    } else if (response.error) {
      const isConflict = response.code === "REVISION_CONFLICT";
      setSaveError(isConflict ? "conflict" : "network");
      setNotice(isConflict
        ? "El borrador cambió en otra sesión. Tus cambios locales siguen guardados aquí; revisa o carga la revisión actual antes de continuar."
        : `No se pudo guardar: ${response.error}`);
      setServerErrors(Array.isArray(response.details) ? response.details : [String(response.error)]);
      pending.current = null;
      submitLocked.current = false;
      if (isConflict) revalidate();
    }
  }, [document, fetcher.data, fetcher.state, revalidate]);
  useEffect(() => {
    // Una actualización externa no destruye un trabajo local ni descarta un conflicto sin avisar.
    if (data.state && data.state.revision > revision && !isDirty) {
      setRevision(data.state.revision);
      const next = ensureMiniWebV2Hero(data.state.document);
      setDocument(next); setSavedDocument(next);
      setSaveError(null);
      setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null);
      setActiveSectionId((current) => next.sections.some((section) => section.id === current) ? current : next.sections[0]?.id ?? null);
    }
  }, [data.state, revision, isDirty]);

  useEffect(() => {
    if (reloadFetcher.state !== "idle" || !reloadFetcher.data || !reloadConflictPending.current) return;
    reloadConflictPending.current = false;
    const latest = reloadFetcher.data.state;
    if (!latest) {
      setNotice("No se encontró un borrador para recargar. Tus cambios locales permanecen en esta pantalla.");
      return;
    }
    const refreshedDocument = ensureMiniWebV2Hero(latest.document);
    setDocument(refreshedDocument);
    setSavedDocument(refreshedDocument);
    setRevision(latest.revision);
    setSaveError(null);
    setServerErrors([]);
    setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null);
    setNotice(`Se cargó la revisión ${latest.revision}. Se descartaron los cambios locales que no estaban guardados.`);
  }, [reloadFetcher.data, reloadFetcher.state]);

  useEffect(() => {
    if (!isDirty) {
      setReviewOpen(false);
      setReviewAcknowledged(false);
      setReviewedRevision(null);
    }
  }, [document, isDirty]);

  const endpoint = `/api/organizations/${encodeURIComponent(data.organization.id)}/miniweb-v2`;
  const submit = useCallback((operation: string, input: Record<string, unknown>, automatic = false) => {
    if (submitLocked.current || saving || fetcher.state !== "idle") return false;
    submitLocked.current = true;
    pending.current = { operation, document: structuredClone(document), automatic, previousData: fetcher.data, started: false };
    setNotice(operation === "save" ? (automatic ? "Guardando automáticamente…" : "Guardando cambios…") : "Procesando…");
    setServerErrors([]);
    fetcher.submit(JSON.stringify({ operation, ...input }), { method: "post", action: endpoint, encType: "application/json" });
    return true;
  }, [document, endpoint, fetcher, saving]);
  const save = useCallback(async (automatic = false) => {
    if (!data.state || !validation.valid) {
      setServerErrors(validation.valid ? ["No existe un borrador activo."] : validation.errors);
      return;
    }
    if (saveError === "conflict") {
      setNotice("Carga la revisión actual o resuelve el conflicto antes de volver a guardar.");
      return;
    }
    if (autoSaveTimer.current !== null) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = null;
    setAutoSaveWaiting(false);
    setSaveError(null);
    if (submitLocked.current || saving || fetcher.state !== "idle") return;
    const snapshot = structuredClone(document);
    const expectedRevision = revision;
    submitLocked.current = true;
    setSaving(true);
    setAutoSaving(automatic);
    setNotice(automatic ? "Guardando automáticamente…" : "Guardando cambios…");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operation: "save", siteId: data.state.site.id, expectedRevision, document: snapshot }),
      });
      const payload = await response.json() as { ok?: boolean; revision?: number; error?: string; code?: string; details?: unknown };
      if (!response.ok || !payload.ok || typeof payload.revision !== "number") {
        const conflict = payload.code === "REVISION_CONFLICT";
        setSaveError(conflict ? "conflict" : "network");
        setNotice(conflict
          ? "El borrador cambió en otra sesión. Tus cambios locales siguen guardados aquí; revisa o carga la revisión actual antes de continuar."
          : `No se pudo guardar: ${payload.error ?? `HTTP ${response.status}`}`);
        setServerErrors(Array.isArray(payload.details) ? payload.details.filter((item): item is string => typeof item === "string") : []);
        if (conflict) revalidate();
        return;
      }
      setRevision(payload.revision);
      const newerEditsRemain = JSON.stringify(document) !== JSON.stringify(snapshot);
      setSavedDocument(snapshot);
      setSaveError(null);
      setServerErrors([]);
      setNotice(newerEditsRemain
        ? `Se guardó la revisión ${payload.revision}. Los cambios posteriores permanecen pendientes de autoguardado.`
        : automatic ? `Autoguardado completado · revisión ${payload.revision}.` : `Borrador guardado · revisión ${payload.revision}.`);
      setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null);
      revalidate();
    } catch {
      setSaveError("network");
      setNotice("No se pudo confirmar el guardado. Tus cambios locales se conservaron; usa Guardar cambios para reintentar.");
      setServerErrors([]);
    } finally {
      setSaving(false);
      setAutoSaving(false);
      submitLocked.current = false;
    }
  }, [data.state, document, fetcher.state, revalidate, revision, saveError, saving, validation]);

  useEffect(() => {
    if (autoSaveTimer.current !== null) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = null;
    if (!data.canEdit || !data.state || !isDirty || !validation.valid || saveError || saving || fetcher.state !== "idle" || submitLocked.current) {
      setAutoSaveWaiting(false);
      return;
    }
    setAutoSaveWaiting(true);
    autoSaveTimer.current = window.setTimeout(() => {
      autoSaveTimer.current = null;
      setAutoSaveWaiting(false);
      save(true);
    }, 800);
    return () => {
      if (autoSaveTimer.current !== null) window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    };
  }, [data.canEdit, data.state?.site.id, document, fetcher.state, isDirty, save, saveError, saving, validation.valid]);
  const startReview = useCallback(() => {
    if (!data.state || isDirty || !publicationValidation.valid || saving || fetcher.state !== "idle" || saveError) {
      setServerErrors(isDirty ? ["Guarda los cambios antes de iniciar la revisión."] : publicationValidation.valid ? ["No existe una revisión guardada disponible para revisar."] : publicationValidation.errors);
      return;
    }
    setReviewedRevision(revision);
    setReviewAcknowledged(false);
    setReviewOpen(true);
    setNotice(`Revisión privada del borrador guardado · revisión ${revision}.`);
  }, [data.state, fetcher.state, isDirty, publicationValidation, revision, saveError, saving]);
  const publish = useCallback(() => {
    if (!data.state || isDirty || !publicationValidation.valid || saving || reviewedRevision !== revision || !reviewAcknowledged) {
      setServerErrors(isDirty
        ? ["Guarda los cambios antes de publicar."]
        : reviewedRevision !== revision || !reviewAcknowledged
          ? ["Revisa el borrador guardado y confirma la revisión antes de publicar."]
          : publicationValidation.valid ? ["No existe un borrador activo."] : publicationValidation.errors);
      return;
    }
    if (!window.confirm(`Se hará público el contenido guardado de la revisión ${revision}. ¿Publicar el sitio?`)) return;
    submit("publish", { siteId: data.state.site.id, expectedRevision: revision });
  }, [data.state, isDirty, publicationValidation, reviewedRevision, reviewAcknowledged, revision, saving, submit]);
  const reloadLatestAfterConflict = useCallback(() => {
    if (!data.state || saveError !== "conflict") return;
    if (!window.confirm("Se descartarán los cambios locales no guardados y se cargará el borrador más reciente. ¿Continuar?")) return;
    reloadConflictPending.current = true;
    reloadFetcher.load(`/app/miniweb-v2?site=${encodeURIComponent(data.state.site.id)}`);
  }, [data.state, reloadFetcher, saveError]);
  function importPublishedV1() {
    if (isDirty) { setNotice("Guarda o descarta tus cambios antes de crear otro sitio."); return; }
    if (!window.confirm("Se creará un sitio independiente desde la última publicación anterior. Horarios, estilos y datos privados no se importarán. No se publicará automáticamente. ¿Continuar?")) return;
    submit("create-from-published-v1", { confirm: true, familyKey: family, visualVariant: variant, design: createDesign });
  }
  function updateSection(section: MiniWebV2Section) {
    setDocument((value) => ({ ...value, sections: value.sections.map((item) => item.id === section.id ? section : item) }));
    setServerErrors([]);
  }
  function addSection() {
    const item = createEmptyMiniWebV2Document([sectionToAdd]).sections[0];
    if (!item || (sectionToAdd === "hero" && document.sections.some((s) => s.type === "hero"))) return;
    setDocument((value) => ({ ...value, sections: [...value.sections, { ...item, order: value.sections.length }] }));
    setActiveSectionId(item.id);
  }
  function moveSection(id: string, direction: -1 | 1) {
    setDocument((value) => {
      const ordered = [...value.sections].sort((a,b) => a.order - b.order);
      const index = ordered.findIndex((item) => item.id === id), target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return value;
      [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
      return { ...value, sections: ordered.map((item, order) => ({ ...item, order })) };
    });
  }
  function removeSection(id: string) {
    setDocument((value) => ({ ...value, sections: value.sections.filter((item) => item.id !== id).map((item, order) => ({ ...item, order })) }));
    if (activeSectionId === id) setActiveSectionId(orderedSections.find((item) => item.id !== id)?.id ?? null);
  }
  const mediaUrl = (id: string) => `/api/organizations/${encodeURIComponent(data.organization.id)}/business-media/${encodeURIComponent(id)}`;
  const saveStatusText = saveError === "conflict"
    ? "Conflicto de revisión: tus cambios locales se conservaron; carga la versión más reciente para resolverlo."
    : saveError === "network"
      ? "No se confirmó el guardado. Tus cambios permanecen en esta pantalla; puedes reintentar con Guardar cambios."
      : saving
        ? autoSaving ? "Autoguardando el borrador…" : "Guardando el borrador…"
        : isDirty
          ? !validation.valid ? "Completa los campos marcados antes de guardar." : autoSaveWaiting ? "Autoguardado programado; tus cambios siguen visibles." : "Cambios pendientes; el borrador se guardará automáticamente."
          : `Borrador guardado · Revisión ${revision}`;
  return <ClientAreaShell active="miniweb" activeOrganization={data.organization} isPlatformAdmin={data.isPlatformAdmin}
    organizationSwitchLocked={isDirty || editing} organizations={data.organizations} workspaceUser={data.workspaceUser}>
    <main className="app-page miniweb-v2-editor miniweb-v2-editor--guided" id="client-page-content">
      <header className="miniweb-v2-editor__heading"><p className="eyebrow">MI VECIDYA · MI SITIO WEB</p><h1>Diseña tu sitio</h1>
        <p>Organiza tu contenido, comprueba cómo se ve y publícalo cuando esté preparado.</p>
        <p><Link to="/app/miniweb">Volver a Mi sitio web</Link></p>
      </header>
      {data.sites.length > 1 ? <nav aria-label="Elegir sitio web" className="miniweb-v2-editor__sites">
        <strong>Mis sitios</strong>{data.sites.map((site, index) => <Link key={site.id} to={`/app/miniweb-v2?site=${encodeURIComponent(site.id)}`} aria-current={data.state?.site.id === site.id ? "page" : undefined}>Sitio {index + 1} · {MINIWEB_V2_FAMILY_CATALOG[site.familyKey as MiniWebV2Family]?.label ?? "Personalizado"}</Link>)}
      </nav> : null}
      {data.state ? <nav className="miniweb-v2-editor__review-nav" aria-label="Accesos del editor"><a href="#miniweb-v2-sections" aria-current={mobileView === "edit" ? "true" : undefined} onClick={() => setMobileView("edit")}>Editar secciones</a><a href="#miniweb-v2-preview" aria-current={mobileView === "preview" ? "true" : undefined} onClick={() => setMobileView("preview")}>Ver vista previa actual</a><span>{isDirty ? "Cambios locales sin guardar" : "Borrador guardado"}</span></nav> : null}
      <div className="miniweb-v2-editor__workspace" data-mobile-view={mobileView}>
        <div className="miniweb-v2-editor__controls">
      {!data.canEdit ? <Card surface={editorSurface}><p>Tienes permiso para consultar este sitio, pero no para cambiarlo.</p></Card> : null}
      {!data.state ? <Card surface={editorSurface}><h2>Elige un punto de partida</h2><p>Selecciona un diseño para tu actividad. Todos pueden adaptarse después.</p>
        <div className="miniweb-v2-editor__template-grid">{templateCategories.map((group) => <fieldset key={group.label}><legend>{group.label}</legend>
          {group.families.map((key) => <label key={key} className={`miniweb-v2-editor__template${family === key ? " is-selected" : ""}`}><input type="radio" name="family" checked={family === key} disabled={!data.canEdit} onChange={() => setFamily(key)}/><strong>{MINIWEB_V2_FAMILY_CATALOG[key].label}</strong><small>{MINIWEB_V2_FAMILY_CATALOG[key].description}</small></label>)}
        </fieldset>)}</div>
        <label>Estilo visual<select value={variant} disabled={!data.canEdit} onChange={(event) => setVariant(event.currentTarget.value as MiniWebV2Variant)}>{MINIWEB_V2_VARIANTS.map((value) => <option key={value} value={value}>{variantLabels[value]}</option>)}</select></label>
        <MiniWebV2DesignControls value={createDesign} onChange={setCreateDesign} disabled={!data.canEdit}/>
        <Button tone="secondary" disabled={!data.canEdit || editing} onClick={() => setCreateDesign({ ...MINIWEB_V2_DEFAULT_DESIGN })}>Restaurar estilo inicial</Button>
        <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing || !validateMiniWebV2Design(createDesign)} onClick={() => submit("create", { familyKey: family, visualVariant: variant, design: createDesign })}>Crear mi sitio</Button>
          <Button tone="secondary" disabled={!data.canEdit || editing || !validateMiniWebV2Design(createDesign)} onClick={importPublishedV1}>Importar contenido de mi sitio anterior</Button></div>
      </Card> : <>
        <Card surface={editorSurface}><h2>Estado de tu sitio</h2><p aria-live="polite" className="miniweb-v2-editor__status">{saveError === null && !isDirty ? "✓ " : "● "}{saveStatusText}</p>
          <p>Diseño: {MINIWEB_V2_FAMILY_CATALOG[data.state.site.familyKey as MiniWebV2Family]?.label ?? "Personalizado"}. Estilo: {variantLabels[data.state.site.visualVariant as MiniWebV2Variant] ?? "Personalizado"}.</p>
          <p>Dirección pública: {data.state.site.publicSlug ? `/vecindario/${data.state.site.publicSlug}` : "Pendiente de asignación"}</p>
          <p>{data.state.site.activePublicationId && data.state.site.publicSlug
            ? <a href={`/vecindario/${encodeURIComponent(data.state.site.publicSlug)}`} target="_blank" rel="noreferrer">Ver sitio publicado</a>
            : "Este borrador todavía no tiene una página pública."}</p>
          <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing || saving || !isDirty || !validation.valid || saveError === "conflict"} onClick={() => save(false)}>Guardar cambios</Button>
            <Button tone="secondary" disabled={!data.canEdit || editing || saving || isDirty || !publicationValidation.valid || saveError !== null} onClick={startReview}>Revisar y publicar</Button></div>
          {saveError === "conflict" ? <Button tone="secondary" disabled={!data.canEdit || reloadFetcher.state !== "idle"} onClick={reloadLatestAfterConflict}>Cargar la revisión más reciente y descartar mis cambios</Button> : null}
        </Card>
        {reviewOpen && reviewedRevision !== null ? <section className="miniweb-v2-editor__review" aria-labelledby="miniweb-v2-review-heading">
          <h2 id="miniweb-v2-review-heading">Revisión previa · revisión {reviewedRevision}</h2>
          <p>Comprueba la vista previa privada y confirma los enlaces, datos de contacto, promociones y permisos de las reseñas. Esta confirmación la realiza la persona editora; no representa aprobación de un tercero.</p>
          <a href="#miniweb-v2-preview" onClick={() => setMobileView("preview")}>Ir a la vista previa privada</a>
          <label><input type="checkbox" checked={reviewAcknowledged} disabled={!data.canEdit || editing || saving || isDirty || saveError !== null} onChange={(event) => setReviewAcknowledged(event.currentTarget.checked)}/> Revisé la vista previa guardada y confirmo que está lista para publicar.</label>
          <div className="miniweb-v2-editor__actions">
            <Button disabled={!data.canEdit || editing || saving || isDirty || reviewedRevision !== revision || !reviewAcknowledged || !publicationValidation.valid || saveError !== null} onClick={publish}>Confirmar revisión y publicar revisión {reviewedRevision}</Button>
            <Button tone="secondary" disabled={editing || saving} onClick={() => { setReviewOpen(false); setReviewAcknowledged(false); setReviewedRevision(null); }}>Volver al editor</Button>
          </div>
        </section> : null}
        <Card surface={editorSurface} className="miniweb-v2-editor__design-card"><details className="miniweb-v2-editor__design-details"><summary>Personalizar diseño y colores del negocio</summary>
          <p>Ajusta la identidad visual de tu negocio. La vista previa se actualiza inmediatamente; guarda los cambios para conservarlos.</p>
          <MiniWebV2DesignControls value={document.design ?? { ...MINIWEB_V2_DEFAULT_DESIGN }} disabled={!data.canEdit || editing}
            onChange={(next) => { setDocument((current) => ({ ...current, design: next })); setServerErrors([]); }}/>
          <div className="miniweb-v2-editor__actions">
            <Button tone="secondary" disabled={!data.canEdit || editing} onClick={() => setDocument((current) => ({ ...current, design: { ...MINIWEB_V2_DEFAULT_DESIGN } }))}>Restaurar estilo inicial</Button>
            <Button disabled={!data.canEdit || editing || saving || !isDirty || !validation.valid} onClick={() => save(false)}>Guardar estilo y contenido</Button>
          </div>
        </details></Card>
        {data.state.site.conversionReportJson ? <Card surface={editorSurface}><h2>Contenido importado</h2><p>El sitio anterior sigue intacto. Se copiaron datos de la publicación {data.state.site.sourcePublicationVersion}; los horarios no se importaron.</p><details><summary>Ver detalles de la importación</summary><pre>{data.state.site.conversionReportJson}</pre></details></Card> : null}
        <Card id="miniweb-v2-sections" surface={editorSurface}><h2>Secciones de tu sitio</h2><p>Añade lo que necesites, activa cada sección y define el orden de aparición.</p>
          <div className="miniweb-v2-editor__actions"><label>Nueva sección<select value={sectionToAdd} disabled={!data.canEdit} onChange={(event) => setSectionToAdd(event.currentTarget.value as MiniWebV2SectionType)}>
            {MINIWEB_V2_SECTION_TYPES.map((type) => <option key={type} value={type}>{MINIWEB_V2_SECTION_LABELS[type]}</option>)}
          </select></label><Button disabled={!data.canEdit || (sectionToAdd === "hero" && document.sections.some((s) => s.type === "hero"))} onClick={addSection}>Añadir sección</Button></div>
        </Card>
        <nav aria-label="Pasos de edición del sitio" className="miniweb-v2-editor__steps">
          <p className="miniweb-v2-editor__steps-caption">Edita una sección a la vez. El contenido de las demás permanece en el borrador.</p>
          <div className="miniweb-v2-editor__steps-list">{orderedSections.map((item, index) =>
            <button key={item.id} type="button" className="miniweb-v2-editor__step" aria-current={activeSection?.id === item.id ? "step" : undefined}
              onClick={() => setActiveSectionId(item.id)}>
              <span className="miniweb-v2-editor__step-number">{index + 1}</span>
              <span>{MINIWEB_V2_SECTION_LABELS[item.type]}</span>
              {!validateMiniWebV2Section(item).valid ? <span className="miniweb-v2-editor__step-note">Revisar</span> : null}
            </button>)}
          </div>
        </nav>
        {activeSection ? <Card key={activeSection.id} surface={editorSurface} className="miniweb-v2-editor__active-section">
          <div className="miniweb-v2-editor__section-head"><h2>{activeSectionIndex + 1}. {MINIWEB_V2_SECTION_LABELS[activeSection.type]}</h2>
            <label><input type="checkbox" checked={activeSection.visible} disabled={!data.canEdit} onChange={(event) => updateSection({ ...activeSection, visible: event.currentTarget.checked })}/> Mostrar en el sitio</label>
          </div>
          <p className="miniweb-v2-editor__step-guidance">{sectionGuidance[activeSection.type]}</p>
          <MiniWebV2SectionForm section={activeSection} media={data.media} organizationId={data.organization.id} disabled={!data.canEdit} onChange={updateSection}/>
          {!validateMiniWebV2Section(activeSection).valid ? <p className="miniweb-v2-editor__validation">Completa o corrige los campos de esta sección antes de guardar.</p> : null}
          <div className="miniweb-v2-editor__actions miniweb-v2-editor__reorder-actions">
            <Button tone="secondary" disabled={!data.canEdit || activeSectionIndex === 0} onClick={() => moveSection(activeSection.id, -1)}>Subir sección</Button>
            <Button tone="secondary" disabled={!data.canEdit || activeSectionIndex === orderedSections.length - 1} onClick={() => moveSection(activeSection.id, 1)}>Bajar sección</Button>
            <Button tone="secondary" disabled={!data.canEdit || activeSection.type === "hero"} onClick={() => removeSection(activeSection.id)}>Quitar sección</Button>
          </div>
          <div className="miniweb-v2-editor__step-footer">
            <button type="button" disabled={activeSectionIndex === 0} onClick={() => setActiveSectionId(orderedSections[activeSectionIndex - 1]!.id)}>Anterior</button>
            <span aria-live="polite">Sección {activeSectionIndex + 1} de {orderedSections.length}</span>
            <button type="button" disabled={activeSectionIndex === orderedSections.length - 1} onClick={() => setActiveSectionId(orderedSections[activeSectionIndex + 1]!.id)}>Siguiente</button>
          </div>
        </Card> : null}
         <Card surface={editorSurface}><h2>Revisar y publicar</h2><p>{isDirty ? "Primero guarda los cambios. Esta vista previa muestra tu trabajo local." : "Revisa el contenido guardado y publica esta revisión cuando esté lista."}</p>
          <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing || saving || !isDirty || !validation.valid || saveError === "conflict"} onClick={() => save(false)}>Guardar cambios</Button>
          <Button tone="secondary" disabled={!data.canEdit || editing || saving || isDirty || !publicationValidation.valid || saveError !== null} onClick={startReview}>Revisar y publicar revisión {revision}</Button>
          <Button tone="secondary" disabled={!data.canEdit || editing || isDirty} onClick={importPublishedV1}>Crear otro sitio importando el anterior</Button></div>
        </Card>
      </>}
      <Card className="miniweb-v2-editor__guides"><h2>Aprende mientras preparas tu sitio</h2>
        <p>Dos guías de Vecidya que te ayudan a comprobar la información antes de compartirla. Tu avance en Aprende se conserva por separado.</p>
        <ul><li><Link to="/aprende/como-mantener-actualizada-y-confiable-tu-presencia-digital">Revisar horarios, datos y contacto</Link></li>
          <li><Link to="/aprende/dominio-hosting-sitio-web-como-funcionan">Entender el dominio y la dirección de tu sitio</Link></li></ul>
      </Card>
      {serverErrors.length > 0 ? <div role="alert" className="miniweb-v2-editor__errors"><strong>Revisa lo siguiente:</strong><ul>{serverErrors.map((error,index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div> : null}
      <p role="status" aria-live="polite">{notice}</p>
        </div>
        <section id="miniweb-v2-preview" aria-label="Vista previa de tu sitio" className="miniweb-v2-editor__preview" tabIndex={-1}><div className="miniweb-v2-editor__preview-heading"><h2>Vista previa</h2><a href="#miniweb-v2-sections" onClick={() => setMobileView("edit")}>Volver a editar</a></div><p>{isDirty ? "Esta vista refleja los cambios locales aún sin guardar; no modifica la versión publicada." : "Previsualización privada del borrador; no modifica la versión publicada."}</p>
        <MiniWebV2Renderer document={data.state ? document : { ...document, design: createDesign }} familyKey={data.state?.site.familyKey ?? family} variant={data.state?.site.visualVariant ?? variant} mediaUrl={mediaUrl} preview/>
        </section>
      </div>
    </main>
  </ClientAreaShell>;
}
