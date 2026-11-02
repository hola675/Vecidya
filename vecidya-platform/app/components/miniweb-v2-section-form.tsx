import type { MiniWebV2Section, MiniWebV2SectionType, V2Image, V2Link } from "../features/miniweb-v2/sections";
import { V2_WEEKDAYS } from "../features/miniweb-v2/hours";

type Path = readonly (string | number)[];
type MediaAsset = { id: string; altText: string; purpose: string };
type Field = { path: Path; label: string; multiline?: boolean; type?: string; help?: string };
const sectionNames: Record<MiniWebV2SectionType, string> = {
  hero: "Portada", about: "Quiénes somos", services: "Servicios", products: "Productos",
  gallery: "Galería", contact: "Contacto", location: "Ubicación", faq: "Preguntas frecuentes",
  team: "Equipo", certifications: "Certificaciones", testimonials: "Testimonios", hours: "Horarios",
};
export { sectionNames as MINIWEB_V2_SECTION_LABELS };

function writePath(source: unknown, path: Path, value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(source) && typeof head === "number") {
    const updated = [...source]; updated[head] = writePath(source[head], rest, value); return updated;
  }
  if (source !== null && typeof source === "object") {
    const current = source as Record<string, unknown>;
    return { ...current, [head]: writePath(current[String(head)], rest, value) };
  }
  return source;
}
function readPath(source: unknown, path: Path): unknown {
  return path.reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string | number, unknown>)[part];
  }, source);
}
const detailFields: Partial<Record<MiniWebV2SectionType, Field[]>> = {
  hero: [{ path: ["title"], label: "Título principal" }, { path: ["subtitle"], label: "Descripción breve", multiline: true }],
  about: [{ path: ["headline"], label: "Título de la sección" }, { path: ["description"], label: "Presentación del negocio", multiline: true }],
  contact: [{ path: ["phone"], label: "Teléfono", type: "tel" }, { path: ["email"], label: "Correo público", type: "email" }],
  location: [{ path: ["address"], label: "Dirección" }, { path: ["city"], label: "Ciudad" }, { path: ["area"], label: "Zona de atención" }, { path: ["mapUrl"], label: "Enlace al mapa", type: "url" }],
  hours: [{ path: ["title"], label: "Título" }, { path: ["timezone"], label: "Zona horaria IANA", help: "Ejemplo: America/Bogota" }, { path: ["note"], label: "Nota sobre el horario", multiline: true }],
};
const lists: Partial<Record<MiniWebV2SectionType, { key: string; title: string; fields: Field[]; imageKey?: string; canConsent?: boolean; blank: Record<string, unknown> }>> = {
  about: { key: "blocks", title: "Bloques de información", fields: [{ path: ["title"], label: "Título" }, { path: ["body"], label: "Texto", multiline: true }], imageKey: "image", blank: { title: "", body: "", image: null } },
  services: { key: "items", title: "Servicios", fields: [{ path: ["title"], label: "Servicio" }, { path: ["description"], label: "Descripción", multiline: true }], imageKey: "image", blank: { title: "", description: "", image: null, cta: null } },
  products: { key: "items", title: "Productos", fields: [{ path: ["title"], label: "Producto" }, { path: ["category"], label: "Categoría del producto" }, { path: ["description"], label: "Descripción", multiline: true }], imageKey: "image", blank: { title: "", category: null, description: "", image: null, cta: null } },
  faq: { key: "items", title: "Preguntas y respuestas", fields: [{ path: ["question"], label: "Pregunta" }, { path: ["answer"], label: "Respuesta", multiline: true }], blank: { question: "", answer: "" } },
  team: { key: "people", title: "Personas", fields: [{ path: ["name"], label: "Nombre" }, { path: ["role"], label: "Función" }, { path: ["bio"], label: "Presentación", multiline: true }], imageKey: "image", canConsent: true, blank: { name: "", role: null, bio: "", image: null, consented: false } },
  certifications: { key: "items", title: "Acreditaciones", fields: [{ path: ["title"], label: "Nombre de la acreditación" }, { path: ["issuer"], label: "Entidad emisora" }, { path: ["date"], label: "Fecha o año" }], imageKey: "document", blank: { title: "", issuer: "", date: null, document: null } },
  testimonials: { key: "items", title: "Reseñas autorizadas", fields: [{ path: ["author"], label: "Autor" }, { path: ["quote"], label: "Testimonio", multiline: true }, { path: ["context"], label: "Contexto" }], canConsent: true, blank: { author: "", quote: "", context: null, consented: false } },
  contact: { key: "links", title: "Enlaces de contacto", fields: [{ path: ["label"], label: "Texto del enlace" }, { path: ["href"], label: "Dirección web, teléfono o correo" }], blank: { label: "", href: "" } },
  gallery: { key: "images", title: "Fotografías de la galería", fields: [], imageKey: "self", blank: { assetId: "", alt: "" } },
};
const weekLabels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export function MiniWebV2SectionForm({ section, media, organizationId, disabled, onChange }: {
  section: MiniWebV2Section; media: MediaAsset[]; organizationId: string; disabled: boolean; onChange: (updated: MiniWebV2Section) => void;
}) {
  const read = (path: Path) => readPath(section.content, path);
  const update = (path: Path, value: unknown) => onChange({ ...section, content: writePath(section.content, path, value) } as MiniWebV2Section);
  const assetUrl = (id: string) => `/api/organizations/${encodeURIComponent(organizationId)}/business-media/${encodeURIComponent(id)}`;
  function renderText(field: Field, base: Path = []) {
    const path = [...base, ...field.path];
    const old = read(path);
    const value = typeof old === "string" ? old : "";
    const control = field.multiline
      ? <textarea value={value} rows={3} disabled={disabled} onChange={(e) => update(path, e.currentTarget.value || (old === null ? null : ""))}/>
      : <input value={value} type={field.type ?? "text"} disabled={disabled} onChange={(e) => update(path, e.currentTarget.value || (old === null ? null : ""))}/>;
    return <label className="miniweb-v2-form__field" key={path.join(".")}><span>{field.label}</span>{control}{field.help ? <small>{field.help}</small> : null}</label>;
  }
  function renderImage(path: Path, title: string) {
    const image = read(path) as V2Image | null | undefined;
    const asset = image ? media.find((item) => item.id === image.assetId) : null;
    return <fieldset className="miniweb-v2-form__image" key={`${path.join(".")}-image`}><legend>{title}</legend>
      <label>Imagen disponible
        <select value={image?.assetId ?? ""} disabled={disabled} onChange={(e) => {
          const id = e.currentTarget.value;
          update(path, id ? { assetId: id, alt: image?.alt || media.find((item) => item.id === id)?.altText || "" } : null);
        }}><option value="">Sin imagen</option>{media.map((item) => <option key={item.id} value={item.id}>{item.altText || `Imagen ${item.id.slice(0, 8)}`} · {item.purpose}</option>)}</select>
      </label>
      {image ? <>{asset ? <img src={assetUrl(image.assetId)} loading="lazy" alt="Vista previa del medio seleccionado"/> : <p role="alert">El archivo seleccionado ya no está disponible. Elige uno válido.</p>}
        <label>Texto alternativo<input value={image.alt} disabled={disabled} onChange={(e) => update(path, { ...image, alt: e.currentTarget.value })}/></label>
        <label>Pie de foto (opcional)<input value={image.caption ?? ""} disabled={disabled} onChange={(e) => update(path, { ...image, caption: e.currentTarget.value || undefined })}/></label>
      </> : null}
    </fieldset>;
  }
  function renderCta(path: Path, title = "Botón de acción") {
    const link = read(path) as V2Link | null | undefined;
    return <fieldset className="miniweb-v2-form__cta"><legend>{title}</legend>
      <label><input type="checkbox" checked={Boolean(link)} disabled={disabled} onChange={(e) => update(path, e.currentTarget.checked ? { label: "Contactar", href: "/contacto" } : null)}/> Mostrar enlace</label>
      {link ? <div className="miniweb-v2-form__fields">
        <label>Texto del botón<input value={link.label} disabled={disabled} onChange={(e) => update(path, { ...link, label: e.currentTarget.value })}/></label>
        <label>Destino del botón<input value={link.href} disabled={disabled} onChange={(e) => update(path, { ...link, href: e.currentTarget.value })}/></label>
        <small>Usa una dirección https://, mailto:, tel: o una ruta que comience por /.</small>
      </div> : null}
    </fieldset>;
  }
  const def = lists[section.type];
  const rowItems = def ? (read([def.key]) as Record<string, unknown>[] | undefined) ?? [] : [];
  return <div className="miniweb-v2-form">
    <div className="miniweb-v2-form__fields">{(detailFields[section.type] ?? []).map((field) => renderText(field))}</div>
    {section.type === "hero" ? <>{renderImage(["image"], "Imagen de portada")}{renderCta(["cta"], "Botón principal")}</> : null}
    {section.type === "contact" ? renderCta(["cta"], "Botón adicional") : null}
    {def ? <fieldset className="miniweb-v2-form__list"><legend>{def.title}</legend>
      {rowItems.map((row, index) => <div className="miniweb-v2-form__item" key={String(row.id ?? `${index}-${row.assetId ?? "item"}`)}>
        <div className="miniweb-v2-form__item-head"><strong>{def.title} · {index + 1}</strong><button type="button" disabled={disabled} onClick={() => update([def.key], rowItems.filter((_, position) => position !== index))}>Eliminar</button></div>
        <div className="miniweb-v2-form__fields">{def.fields.map((field) => renderText(field, [def.key, index]))}</div>
        {def.imageKey === "self" ? renderImage([def.key, index], "Fotografía") : def.imageKey ? renderImage([def.key, index, def.imageKey], "Imagen") : null}
        {(section.type === "services" || section.type === "products") ? renderCta([def.key, index, "cta"], "Enlace opcional") : null}
        {def.canConsent ? <label className="miniweb-v2-form__consent"><input type="checkbox" checked={Boolean(read([def.key,index,"consented"]))} disabled={disabled} onChange={(e) => update([def.key,index,"consented"], e.currentTarget.checked)}/> Tengo consentimiento para publicar esta información.</label> : null}
      </div>)}
      <button type="button" className="miniweb-v2-form__add" disabled={disabled || rowItems.length >= 50} onClick={() => update([def.key], [...rowItems, { ...def.blank, ...(def.key !== "images" && def.key !== "links" ? { id: crypto.randomUUID() } : {}) }])}>Añadir {sectionNames[section.type].toLowerCase()}</button>
    </fieldset> : null}
    {section.type === "hours" ? <fieldset className="miniweb-v2-form__hours"><legend>Horario semanal</legend><p>Elige la zona horaria antes de publicar. Los horarios de MiniWeb anterior no se importan automáticamente.</p>
      {V2_WEEKDAYS.map((day, index) => { const entry = (read(["days", index]) as { day: string; closed: boolean; ranges: { start: string; end: string }[] });
        return <div className="miniweb-v2-form__day" key={day}><strong>{weekLabels[index]}</strong>
          <label><input type="checkbox" disabled={disabled} checked={entry.closed} onChange={(e) => update(["days", index], { ...entry, closed: e.currentTarget.checked, ranges: e.currentTarget.checked ? [] : [{ start: "09:00", end: "17:00" }] })}/> Cerrado</label>
          {!entry.closed ? <div className="miniweb-v2-form__times">{entry.ranges.map((range, rangeIndex) => <div key={rangeIndex}>
            <label>Abre<input type="time" value={range.start} disabled={disabled} onChange={(e) => update(["days", index, "ranges", rangeIndex, "start"], e.currentTarget.value)}/></label>
            <label>Cierra<input type="time" value={range.end} disabled={disabled} onChange={(e) => update(["days", index, "ranges", rangeIndex, "end"], e.currentTarget.value)}/></label>
            <button type="button" disabled={disabled} onClick={() => update(["days", index, "ranges"], entry.ranges.filter((_, i) => i !== rangeIndex))}>Quitar tramo</button>
          </div>)}<button type="button" disabled={disabled || entry.ranges.length >= 4} onClick={() => update(["days", index, "ranges"], [...entry.ranges, { start: "09:00", end: "17:00" }])}>Añadir tramo</button></div> : null}
        </div>;
      })}
      <div className="miniweb-v2-form__exceptions"><h3>Excepciones y días especiales</h3><p>Añade cierres, feriados u horarios distintos sin modificar el horario semanal.</p>
        {((read(["exceptions"]) as { date: string; closed: boolean; ranges: { start: string; end: string }[]; note: string | null }[]) ?? []).map((exception, index, all) => <div className="miniweb-v2-form__item" key={`${exception.date}-${index}`}>
          <div className="miniweb-v2-form__item-head"><strong>Excepción {index + 1}</strong><button type="button" disabled={disabled} onClick={() => update(["exceptions"], all.filter((_, i) => i !== index))}>Eliminar excepción</button></div>
          <div className="miniweb-v2-form__fields"><label>Fecha<input type="date" value={exception.date} disabled={disabled} onChange={(e) => update(["exceptions",index,"date"], e.currentTarget.value)}/></label>
          <label>Motivo o nota<input value={exception.note ?? ""} disabled={disabled} onChange={(e) => update(["exceptions",index,"note"], e.currentTarget.value || null)}/></label></div>
          <label className="miniweb-v2-form__consent"><input type="checkbox" checked={exception.closed} disabled={disabled} onChange={(e) => update(["exceptions", index], { ...exception, closed: e.currentTarget.checked, ranges: e.currentTarget.checked ? [] : [{ start: "09:00", end: "17:00" }] })}/> Cerrado todo el día</label>
          {!exception.closed ? <div className="miniweb-v2-form__times">{exception.ranges.map((range, rangeIndex) => <div key={rangeIndex}>
            <label>Abre<input type="time" disabled={disabled} value={range.start} onChange={(e) => update(["exceptions",index,"ranges",rangeIndex,"start"], e.currentTarget.value)}/></label>
            <label>Cierra<input type="time" disabled={disabled} value={range.end} onChange={(e) => update(["exceptions",index,"ranges",rangeIndex,"end"], e.currentTarget.value)}/></label>
            <button type="button" disabled={disabled} onClick={() => update(["exceptions",index,"ranges"], exception.ranges.filter((_, i) => i !== rangeIndex))}>Quitar tramo</button>
          </div>)}<button type="button" disabled={disabled || exception.ranges.length >= 4} onClick={() => update(["exceptions",index,"ranges"], [...exception.ranges, { start: "09:00", end: "17:00" }])}>Añadir tramo</button></div> : null}
        </div>)}
        <button type="button" className="miniweb-v2-form__add" disabled={disabled || ((read(["exceptions"]) as unknown[])?.length ?? 0) >= 366} onClick={() => update(["exceptions"], [...((read(["exceptions"]) as unknown[]) ?? []), { date: "", closed: true, ranges: [], note: null }])}>Añadir día especial</button>
      </div>
    </fieldset> : null}
    {media.length === 0 && ["hero", "about", "services", "products", "gallery", "team", "certifications"].includes(section.type) ? <p className="miniweb-v2-form__help">Todavía no hay imágenes en la biblioteca del negocio. Puedes añadirlas desde «Mi sitio web» (editor anterior) y volver aquí; no se copiarán imágenes de otras organizaciones.</p> : null}
  </div>;
}
