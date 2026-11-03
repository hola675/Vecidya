import { useEffect, useRef, useState } from "react";
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
import { MiniWebV2Renderer } from "../components/miniweb-v2-renderer";
import { MiniWebV2SectionForm, MINIWEB_V2_SECTION_LABELS } from "../components/miniweb-v2-section-form";
import { createEmptyMiniWebV2Document, MINIWEB_V2_SECTION_TYPES, validateMiniWebV2Document, validateMiniWebV2Section, type MiniWebV2Document, type MiniWebV2Section, type MiniWebV2SectionType } from "../features/miniweb-v2/sections";
import { MINIWEB_V2_FAMILY_CATALOG, MINIWEB_V2_VARIANTS, type MiniWebV2Family, type MiniWebV2Variant } from "../features/miniweb-v2/visual-families";
import type { Route } from "./+types/miniweb-v2-editor";

const templateCategories = [
  { label: "Servicios y profesionales", families: ["vecidya-default", "services-studio", "professional-profile"] },
  { label: "Comercios y catálogos", families: ["catalog-store"] },
  { label: "Gastronomía y experiencias", families: ["gastronomy-table"] },
] as const;
const variantLabels = { base: "Clásico", pro: "Editorial", premium: "Impacto" } as const;

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
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const initialDocument = () => ensureMiniWebV2Hero(data.state?.document);
  const [document, setDocument] = useState<MiniWebV2Document>(initialDocument);
  const [savedDocument, setSavedDocument] = useState<MiniWebV2Document>(initialDocument);
  const [revision, setRevision] = useState(data.state?.revision ?? 0);
  const [notice, setNotice] = useState("");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [sectionToAdd, setSectionToAdd] = useState<MiniWebV2SectionType>("about");
  const [family, setFamily] = useState<MiniWebV2Family>((data.state?.site.familyKey as MiniWebV2Family | undefined) ?? "vecidya-default");
  const [variant, setVariant] = useState<MiniWebV2Variant>((data.state?.site.visualVariant as MiniWebV2Variant | undefined) ?? "base");
  const pending = useRef<{ operation: string; document: MiniWebV2Document } | null>(null);
  const isDirty = JSON.stringify(document) !== JSON.stringify(savedDocument);
  const editing = fetcher.state !== "idle";
  const validation = validateMiniWebV2Document(document);
  const publicationValidation = validateMiniWebV2Document(document, { publishable: true });
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
    const response = fetcher.data;
    if (!response) return;
    if (response.siteId && response.imported) {
      window.location.assign(`/app/miniweb-v2?site=${encodeURIComponent(response.siteId)}`);
      return;
    }
    if (response.ok && response.siteId && pending.current?.operation === "create") {
      window.location.assign(`/app/miniweb-v2?site=${encodeURIComponent(response.siteId)}`);
      return;
    }
    if (response.ok && typeof response.revision === "number") {
      setRevision(response.revision);
      const operation = pending.current?.operation;
      if (operation === "save" && pending.current) {
        // Solo la copia realmente enviada queda guardada. No se pisan ediciones hechas mientras respondía el servidor.
        setSavedDocument(pending.current.document);
        setNotice("Borrador guardado. Puedes revisar y publicar la nueva revisión.");
      } else if (operation === "publish") {
        setNotice(`Sitio publicado correctamente (revisión ${response.revision}).`);
      } else {
        setNotice("Operación completada.");
      }
      setServerErrors([]);
      pending.current = null;
      revalidate();
    } else if (response.error) {
      setNotice(response.error);
      setServerErrors(Array.isArray(response.details) ? response.details : []);
      pending.current = null;
    }
  }, [fetcher.data, revalidate]);
  useEffect(() => {
    // Una actualización externa no destruye un trabajo local ni descarta un conflicto sin avisar.
    if (data.state && data.state.revision > revision && !isDirty) {
      setRevision(data.state.revision);
      const next = ensureMiniWebV2Hero(data.state.document);
      setDocument(next); setSavedDocument(next);
    }
  }, [data.state, revision, isDirty]);

  const endpoint = `/api/organizations/${encodeURIComponent(data.organization.id)}/miniweb-v2`;
  function submit(operation: string, input: Record<string, unknown>) {
    pending.current = { operation, document: structuredClone(document) };
    setNotice(""); setServerErrors([]);
    fetcher.submit(JSON.stringify({ operation, ...input }), { method: "post", action: endpoint, encType: "application/json" });
  }
  function save() {
    if (!data.state || !validation.valid) { setServerErrors(validation.valid ? ["No existe un borrador activo."] : validation.errors); return; }
    submit("save", { siteId: data.state.site.id, expectedRevision: revision, document });
  }
  function publish() {
    if (!data.state || isDirty || !publicationValidation.valid) {
      setServerErrors(isDirty ? ["Guarda primero los cambios antes de publicar."] : publicationValidation.valid ? ["No existe un borrador activo."] : publicationValidation.errors);
      return;
    }
    if (!window.confirm(`Se hará público el contenido guardado de la revisión ${revision}. ¿Publicar el sitio?`)) return;
    submit("publish", { siteId: data.state.site.id, expectedRevision: revision });
  }
  function importPublishedV1() {
    if (isDirty) { setNotice("Guarda o descarta tus cambios antes de crear otro sitio."); return; }
    if (!window.confirm("Se creará un sitio independiente desde la última publicación anterior. Horarios, estilos y datos privados no se importarán. No se publicará automáticamente. ¿Continuar?")) return;
    submit("create-from-published-v1", { confirm: true, familyKey: family, visualVariant: variant });
  }
  function updateSection(section: MiniWebV2Section) {
    setDocument((value) => ({ ...value, sections: value.sections.map((item) => item.id === section.id ? section : item) }));
    setServerErrors([]);
  }
  function addSection() {
    const item = createEmptyMiniWebV2Document([sectionToAdd]).sections[0];
    if (!item || (sectionToAdd === "hero" && document.sections.some((s) => s.type === "hero"))) return;
    setDocument((value) => ({ ...value, sections: [...value.sections, { ...item, order: value.sections.length }] }));
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
  }
  const mediaUrl = (id: string) => `/api/organizations/${encodeURIComponent(data.organization.id)}/business-media/${encodeURIComponent(id)}`;
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
      {!data.canEdit ? <Card><p>Tienes permiso para consultar este sitio, pero no para cambiarlo.</p></Card> : null}
      {!data.state ? <Card><h2>Elige un punto de partida</h2><p>Selecciona un diseño para tu actividad. Todos pueden adaptarse después.</p>
        <div className="miniweb-v2-editor__template-grid">{templateCategories.map((group) => <fieldset key={group.label}><legend>{group.label}</legend>
          {group.families.map((key) => <label key={key} className={`miniweb-v2-editor__template${family === key ? " is-selected" : ""}`}><input type="radio" name="family" checked={family === key} disabled={!data.canEdit} onChange={() => setFamily(key)}/><strong>{MINIWEB_V2_FAMILY_CATALOG[key].label}</strong><small>{MINIWEB_V2_FAMILY_CATALOG[key].description}</small></label>)}
        </fieldset>)}</div>
        <label>Estilo visual<select value={variant} disabled={!data.canEdit} onChange={(event) => setVariant(event.currentTarget.value as MiniWebV2Variant)}>{MINIWEB_V2_VARIANTS.map((value) => <option key={value} value={value}>{variantLabels[value]}</option>)}</select></label>
        <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing} onClick={() => submit("create", { familyKey: family, visualVariant: variant })}>Crear mi sitio</Button>
          <Button tone="secondary" disabled={!data.canEdit || editing} onClick={importPublishedV1}>Importar contenido de mi sitio anterior</Button></div>
      </Card> : <>
        <Card><h2>Estado de tu sitio</h2><p aria-live="polite" className="miniweb-v2-editor__status">{isDirty ? "● Hay cambios sin guardar" : `✓ Borrador guardado · Revisión ${revision}`}</p>
          <p>Diseño: {MINIWEB_V2_FAMILY_CATALOG[data.state.site.familyKey as MiniWebV2Family]?.label ?? "Personalizado"}. Estilo: {variantLabels[data.state.site.visualVariant as MiniWebV2Variant] ?? "Personalizado"}.</p>
          <p><a href={`/miniweb/${encodeURIComponent(data.state.site.id)}`} target="_blank" rel="noreferrer">Ver publicación (si existe)</a></p>
          <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing || !isDirty || !validation.valid} onClick={save}>Guardar cambios</Button>
            <Button tone="secondary" disabled={!data.canEdit || editing || isDirty || !publicationValidation.valid} onClick={publish}>Publicar sitio</Button></div>
        </Card>
        {data.state.site.conversionReportJson ? <Card><h2>Contenido importado</h2><p>El sitio anterior sigue intacto. Se copiaron datos de la publicación {data.state.site.sourcePublicationVersion}; los horarios no se importaron.</p><details><summary>Ver detalles de la importación</summary><pre>{data.state.site.conversionReportJson}</pre></details></Card> : null}
        <Card><h2>Secciones de tu sitio</h2><p>Añade lo que necesites, activa cada sección y define el orden de aparición.</p>
          <div className="miniweb-v2-editor__actions"><label>Nueva sección<select value={sectionToAdd} disabled={!data.canEdit} onChange={(event) => setSectionToAdd(event.currentTarget.value as MiniWebV2SectionType)}>
            {MINIWEB_V2_SECTION_TYPES.map((type) => <option key={type} value={type}>{MINIWEB_V2_SECTION_LABELS[type]}</option>)}
          </select></label><Button disabled={!data.canEdit || (sectionToAdd === "hero" && document.sections.some((s) => s.type === "hero"))} onClick={addSection}>Añadir sección</Button></div>
        </Card>
        {document.sections.slice().sort((a,b) => a.order-b.order).map((section, index) => <Card key={section.id}>
          <div className="miniweb-v2-editor__section-head"><h2>{index + 1}. {MINIWEB_V2_SECTION_LABELS[section.type]}</h2>
            <label><input type="checkbox" checked={section.visible} disabled={!data.canEdit} onChange={(event) => updateSection({ ...section, visible: event.currentTarget.checked })}/> Mostrar en el sitio</label>
          </div>
          <MiniWebV2SectionForm section={section} media={data.media} organizationId={data.organization.id} disabled={!data.canEdit} onChange={updateSection}/>
          {!validateMiniWebV2Section(section).valid ? <p className="miniweb-v2-editor__validation">Completa o corrige los campos de esta sección antes de guardar.</p> : null}
          <div className="miniweb-v2-editor__actions"><Button tone="secondary" disabled={!data.canEdit || index === 0} onClick={() => moveSection(section.id, -1)}>Subir</Button>
            <Button tone="secondary" disabled={!data.canEdit || index === document.sections.length - 1} onClick={() => moveSection(section.id, 1)}>Bajar</Button>
            <Button tone="secondary" disabled={!data.canEdit || section.type === "hero"} onClick={() => removeSection(section.id)}>Quitar sección</Button></div>
        </Card>)}
        <Card><h2>Revisar y publicar</h2><p>{isDirty ? "Primero guarda los cambios. Esta vista previa muestra tu trabajo local." : "Revisa el contenido guardado y publica esta revisión cuando esté lista."}</p>
          <div className="miniweb-v2-editor__actions"><Button disabled={!data.canEdit || editing || !isDirty || !validation.valid} onClick={save}>Guardar cambios</Button>
          <Button tone="secondary" disabled={!data.canEdit || editing || isDirty || !publicationValidation.valid} onClick={publish}>Publicar revisión {revision}</Button>
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
      <section aria-label="Vista previa de tu sitio" className="miniweb-v2-editor__preview"><h2>Vista previa</h2><p>Esta es una previsualización privada; no modifica lo que ya está publicado.</p>
        <MiniWebV2Renderer document={document} familyKey={data.state?.site.familyKey ?? family} variant={data.state?.site.visualVariant ?? variant} mediaUrl={mediaUrl} preview/>
      </section>
    </main>
  </ClientAreaShell>;
}
