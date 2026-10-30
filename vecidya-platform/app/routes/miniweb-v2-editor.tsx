import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getMiniWebV2EditorState, listMiniWebV2Sites } from "../../db/queries/miniweb-v2.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { ensureMiniWebV2Hero, miniWebV2EditorKey } from "../features/miniweb-v2/editor-state";
import { ClientAreaShell } from "../components/client-area-shell";
import { Button, Card } from "../components/ui";
import { MiniWebV2Renderer } from "../components/miniweb-v2-renderer";
import { createEmptyMiniWebV2Document, MINIWEB_V2_SECTION_TYPES, validateMiniWebV2Section, type MiniWebV2Document, type MiniWebV2SectionType } from "../features/miniweb-v2/sections";
import { MINIWEB_V2_FAMILY_CATALOG, MINIWEB_V2_VARIANTS, type MiniWebV2Family, type MiniWebV2Variant } from "../features/miniweb-v2/visual-families";
import type { Route } from "./+types/miniweb-v2-editor";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  const membership = await requireOrganizationPermission(env, request, organization.id, "business-profile:read");
  const shell = await getClientWorkspaceContext(env, request);
  const siteId = new URL(request.url).searchParams.get("site");
  const database = createDatabase(env.DB);
  const [state, sites] = await Promise.all([getMiniWebV2EditorState(database, organization.id, siteId ?? undefined), listMiniWebV2Sites(database, organization.id)]);
  return { ...shell, organization: { id: organization.id, name: organization.name }, canEdit: membership.role === "owner" || membership.role === "admin", sites, state: state ? { site: state.site, revision: state.draft.revision, document: JSON.parse(state.draft.documentJson) as MiniWebV2Document } : null };
}

type MiniWebV2EditorData = Awaited<ReturnType<typeof loader>>;

export default function MiniWebV2Editor() {
  const data = useLoaderData<typeof loader>();
  const editorKey = miniWebV2EditorKey(data.organization.id, data.state?.site.id ?? null);
  return <MiniWebV2EditorState key={editorKey} data={data} />;
}

function MiniWebV2EditorState({ data }: { data: MiniWebV2EditorData }) {
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const [document, setDocument] = useState<MiniWebV2Document>(() => ensureMiniWebV2Hero(data.state?.document));
  const [revision, setRevision] = useState(data.state?.revision ?? 0);
  const [notice, setNotice] = useState("");
  const [sectionInput, setSectionInput] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  const [sectionToAdd, setSectionToAdd] = useState<MiniWebV2SectionType>("about");
  const [family, setFamily] = useState<MiniWebV2Family>((data.state?.site.familyKey as MiniWebV2Family | undefined) ?? "vecidya-default");
  const [variant, setVariant] = useState<MiniWebV2Variant>((data.state?.site.visualVariant as MiniWebV2Variant | undefined) ?? "base");
  useEffect(() => {
    if (fetcher.data?.siteId && fetcher.data.imported) { window.location.assign(`/app/miniweb-v2?site=${encodeURIComponent(fetcher.data.siteId)}`); }
    else if (fetcher.data?.ok && typeof fetcher.data.revision === "number") { setRevision(fetcher.data.revision); if (fetcher.data.document) setDocument(ensureMiniWebV2Hero(fetcher.data.document)); setNotice(fetcher.data.siteId ? "Borrador creado." : "Borrador guardado."); if (fetcher.data.siteId) revalidate(); }
    else if (fetcher.data?.siteId) { setNotice("Espacio V2 creado."); revalidate(); }
    else if (fetcher.data?.error) setNotice(fetcher.data.error);
  }, [fetcher.data]);
  useEffect(() => {
    if (data.state && data.state.revision > revision) { setRevision(data.state.revision); setDocument(ensureMiniWebV2Hero(data.state.document)); }
  }, [data.state, revision]);
  const endpoint = `/api/organizations/${encodeURIComponent(data.organization.id)}/miniweb-v2`;
  function editSection(sectionId: string, raw: string) {
    setSectionInput((current) => ({ ...current, [sectionId]: raw }));
    try {
      const parsed: unknown = JSON.parse(raw);
      const current = document.sections.find((item) => item.id === sectionId);
      if (!current) return;
      const validation = validateMiniWebV2Section({ ...current, content: parsed });
      if (!validation.valid) { setSectionErrors((errors) => ({ ...errors, [sectionId]: validation.errors.join("; ") })); return; }
      setSectionErrors((errors) => { const next = { ...errors }; delete next[sectionId]; return next; });
      setDocument((doc) => ({ ...doc, sections: doc.sections.map((item) => item.id === sectionId ? validation.value : item) }));
    } catch {
      setSectionErrors((errors) => ({ ...errors, [sectionId]: "El contenido debe ser JSON válido." }));
    }
  }
  function addSection() {
    const empty = createEmptyMiniWebV2Document([sectionToAdd]).sections[0];
    if (!empty) return;
    setDocument((doc) => ({ ...doc, sections: [...doc.sections, { ...empty, order: doc.sections.length }] }));
  }
  function moveSection(sectionId: string, direction: -1 | 1) {
    setDocument((doc) => {
      const sections = [...doc.sections].sort((a, b) => a.order - b.order);
      const index = sections.findIndex((item) => item.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sections.length) return doc;
      [sections[index], sections[target]] = [sections[target]!, sections[index]!];
      return { ...doc, sections: sections.map((item, order) => ({ ...item, order })) };
    });
  }
  function removeSection(sectionId: string) {
    setDocument((doc) => ({ ...doc, sections: doc.sections.filter((item) => item.id !== sectionId).map((item, order) => ({ ...item, order })) }));
    setSectionInput((current) => { const next = { ...current }; delete next[sectionId]; return next; });
    setSectionErrors((current) => { const next = { ...current }; delete next[sectionId]; return next; });
  }
  function importPublishedV1() {
    if (!window.confirm("Se creará un borrador V2 nuevo e independiente con datos públicos seleccionados de la última publicación. Horarios, estilos y datos privados no se copiarán. La publicación V1 quedará intacta y el nuevo sitio no se publicará automáticamente. ¿Confirmas esta conversión?")) return;
    fetcher.submit(JSON.stringify({ operation: "create-from-published-v1", confirm: true, familyKey: family, visualVariant: variant }), { method: "post", action: endpoint, encType: "application/json" });
  }
  return <ClientAreaShell active="miniweb" activeOrganization={data.organization} isPlatformAdmin={data.isPlatformAdmin} organizationSwitchLocked={fetcher.state !== "idle"} organizations={data.organizations} workspaceUser={data.workspaceUser}><main className="app-page"><header><p className="eyebrow">MI VECIDYA · MINIWEB V2</p><h1>Editor V2</h1><p>Construye un borrador independiente. La publicación requiere una acción explícita.</p></header>
    {data.sites.length > 1 ? <nav aria-label="Sitios MiniWeb V2"><h2>Tus sitios V2</h2><ul>{data.sites.map((site) => <li key={site.id}><a href={`/app/miniweb-v2?site=${encodeURIComponent(site.id)}`} aria-current={data.state?.site.id === site.id ? "page" : undefined}>{site.familyKey} · {site.visualVariant}</a></li>)}</ul></nav> : null}
    {data.state?.site.conversionReportJson ? <Card><h2>Procedencia de conversión</h2><p>Datos copiados de la publicación V1 versión {data.state.site.sourcePublicationVersion}.</p><p>La publicación original se conservó intacta. El horario V1 no se importó.</p><details><summary>Reporte importado y omitido</summary><pre>{data.state.site.conversionReportJson}</pre></details></Card> : null}
    {!data.canEdit ? <Card><p>Tu rol permite consultar este borrador, pero no editarlo.</p></Card> : null}
    {!data.state ? <Card><h2>Crear tu MiniWeb V2</h2><p>Se inicia un borrador nuevo. No importa contenido ni horarios de MiniWeb anterior.</p><label>Familia visual<select value={family} disabled={!data.canEdit} onChange={(e) => setFamily(e.currentTarget.value as MiniWebV2Family)}>{Object.entries(MINIWEB_V2_FAMILY_CATALOG).map(([key, item]) => <option key={key} value={key}>{item.label} — {item.description}</option>)}</select></label><label>Variante visual<select value={variant} disabled={!data.canEdit} onChange={(e) => setVariant(e.currentTarget.value as MiniWebV2Variant)}>{MINIWEB_V2_VARIANTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><Button disabled={!data.canEdit || fetcher.state !== "idle"} onClick={() => fetcher.submit(JSON.stringify({ operation: "create", familyKey: family, visualVariant: variant }), { method: "post", action: endpoint, encType: "application/json" })}>Crear borrador V2 vacío</Button><Button tone="secondary" disabled={!data.canEdit || fetcher.state !== "idle"} onClick={importPublishedV1}>Crear borrador V2 desde publicación V1</Button></Card> : <>
      <Card><h2>Composición</h2><p>Sitio actual: {data.state.site.familyKey} · {data.state.site.visualVariant}. Las doce secciones están disponibles para todas las variantes.</p><label>Familia del próximo sitio<select value={family} disabled={!data.canEdit} onChange={(event) => setFamily(event.currentTarget.value as MiniWebV2Family)}>{Object.entries(MINIWEB_V2_FAMILY_CATALOG).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><label>Variante visual del próximo sitio<select value={variant} disabled={!data.canEdit} onChange={(event) => setVariant(event.currentTarget.value as MiniWebV2Variant)}>{MINIWEB_V2_VARIANTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Añadir sección<select value={sectionToAdd} disabled={!data.canEdit} onChange={(event) => setSectionToAdd(event.currentTarget.value as MiniWebV2SectionType)}>{MINIWEB_V2_SECTION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><Button disabled={!data.canEdit || fetcher.state !== "idle"} onClick={addSection}>Añadir sección</Button></Card>
      {document.sections.slice().sort((a, b) => a.order - b.order).map((item, index) => <Card key={item.id}><h2>{item.type}</h2><label><input type="checkbox" checked={item.visible} disabled={!data.canEdit} onChange={(event) => { const visible = event.currentTarget.checked; setDocument((doc) => ({ ...doc, sections: doc.sections.map((sectionItem) => sectionItem.id === item.id ? { ...sectionItem, visible } : sectionItem) })); }}/> Visible en la publicación</label><label>Contenido estructurado de {item.type}<textarea aria-describedby={`section-${item.id}-help`} rows={12} spellCheck={false} value={sectionInput[item.id] ?? JSON.stringify(item.content, null, 2)} disabled={!data.canEdit} onChange={(event) => editSection(item.id, event.currentTarget.value)}/></label><p id={`section-${item.id}-help`}>Edita los campos de esta sección en formato JSON. El esquema se valida antes de guardar.</p>{sectionErrors[item.id] ? <p role="alert">{sectionErrors[item.id]}</p> : null}<Button tone="secondary" disabled={!data.canEdit || index === 0} onClick={() => moveSection(item.id, -1)}>Subir sección</Button><Button tone="secondary" disabled={!data.canEdit || index === document.sections.length - 1} onClick={() => moveSection(item.id, 1)}>Bajar sección</Button><Button tone="secondary" disabled={!data.canEdit} onClick={() => removeSection(item.id)}>Quitar sección</Button></Card>)}
      <Card><p>Revisión {revision}</p><Button disabled={!data.canEdit || fetcher.state !== "idle" || Object.keys(sectionErrors).length > 0} onClick={() => fetcher.submit(JSON.stringify({ operation: "save", siteId: data.state!.site.id, expectedRevision: revision, document }), { method: "post", action: endpoint, encType: "application/json" })}>Guardar borrador</Button><Button tone="secondary" disabled={!data.canEdit || fetcher.state !== "idle"} onClick={importPublishedV1}>Crear borrador independiente desde publicación V1</Button><Button tone="secondary" disabled={!data.canEdit || fetcher.state !== "idle" || Object.keys(sectionErrors).length > 0} onClick={() => fetcher.submit(JSON.stringify({ operation: "publish", siteId: data.state!.site.id, expectedRevision: revision }), { method: "post", action: endpoint, encType: "application/json" })}>Publicar revisión {revision}</Button></Card>
    </>}
    <p role="status" aria-live="polite">{notice}</p>
    <section aria-label="Vista previa"><h2>Vista previa</h2><Card><MiniWebV2Renderer document={document} familyKey={data.state?.site.familyKey ?? family} variant={data.state?.site.visualVariant ?? variant}/></Card></section>
  </main></ClientAreaShell>;
}
