import type { MiniWebV2Document, MiniWebV2Section, V2Image } from "../features/miniweb-v2/sections";
const dayNames = { monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo" } as const;
function ImageView({ image, src, priority = false }: { image: V2Image | null; src?: (assetId: string) => string; priority?: boolean }) {
  if (!image || !src) return null;
  return <figure className="miniweb-v2__media"><img alt={image.alt} decoding="async" loading={priority ? "eager" : "lazy"} src={src(image.assetId)} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>;
}
function SectionView({ section, mediaUrl }: { section: MiniWebV2Section; mediaUrl?: (assetId: string) => string }) {
  if (!section.visible) return null;
  switch (section.type) {
    case "hero": return <header className="miniweb-v2__hero"><div><h1>{section.content.title}</h1><p>{section.content.subtitle}</p>{section.content.cta && <a className="miniweb-v2__action" href={section.content.cta.href}>{section.content.cta.label}</a>}</div><ImageView image={section.content.image} priority src={mediaUrl}/></header>;
    case "about": return <section><h2>{section.content.headline || "Conócenos"}</h2><p>{section.content.description}</p><div className="miniweb-v2__cards">{section.content.blocks.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3><p>{x.body}</p></article>)}</div></section>;
    case "services": return <section><h2>Servicios</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3><p>{x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</div></section>;
    case "products": return <section><h2>Productos</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3>{x.category && <small>{x.category}</small>}<p>{x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</div></section>;
    case "gallery": return <section><h2>Galería</h2><div className="miniweb-v2__gallery">{section.content.images.map((x, index) => <ImageView key={`${x.assetId}-${index}`} image={x} src={mediaUrl}/>)}</div></section>;
    case "contact": return <section id="contacto"><h2>Contacto</h2>{section.content.phone && <p><a href={`tel:${section.content.phone}`}>{section.content.phone}</a></p>}{section.content.email && <p><a href={`mailto:${section.content.email}`}>{section.content.email}</a></p>}{section.content.links.map((x,index) => <p key={`${x.href}-${index}`}><a href={x.href}>{x.label}</a></p>)}{section.content.cta && <a className="miniweb-v2__action" href={section.content.cta.href}>{section.content.cta.label}</a>}</section>;
    case "location": return <section><h2>Ubicación y cobertura</h2><p>{[section.content.address, section.content.area, section.content.city].filter(Boolean).join(", ")}</p>{section.content.mapUrl && <a href={section.content.mapUrl} rel="noreferrer">Ver mapa</a>}</section>;
    case "faq": return <section><h2>Preguntas frecuentes</h2>{section.content.items.map(x => <details key={x.id}><summary>{x.question}</summary><p>{x.answer}</p></details>)}</section>;
    case "team": return <section><h2>Equipo</h2><div className="miniweb-v2__cards">{section.content.people.filter(x => x.consented).map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.name}</h3><p>{x.role} {x.bio}</p></article>)}</div></section>;
    case "certifications": return <section><h2>Certificaciones</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.document} src={mediaUrl}/><h3>{x.title}</h3><p>{x.issuer} {x.date}</p></article>)}</div></section>;
    case "testimonials": return <section><h2>Testimonios</h2>{section.content.items.filter(x => x.consented).map(x => <figure key={x.id}><blockquote>{x.quote}</blockquote><figcaption>{x.author} {x.context}</figcaption></figure>)}</section>;
    case "hours": return <section><h2>{section.content.title}</h2><p>Zona horaria: {section.content.timezone}</p><dl>{section.content.days.map(x => <div key={x.day}><dt>{dayNames[x.day]}</dt><dd>{x.closed ? "Cerrado" : x.ranges.map(r => `${r.start}–${r.end}`).join(", ")}</dd></div>)}</dl>{section.content.note && <p>{section.content.note}</p>}</section>;
    default: return null;
  }
}
export function MiniWebV2Renderer({ document, familyKey, variant, preview = false, mediaUrl }: { document: MiniWebV2Document; familyKey: string; variant: string; preview?: boolean; mediaUrl?: (assetId: string) => string }) {
  const sections = [...document.sections].sort((a,b) => a.order-b.order || a.id.localeCompare(b.id)).map(section => <SectionView key={section.id} section={section} mediaUrl={mediaUrl}/>);
  return preview
    ? <div className="miniweb-v2 miniweb-v2--editor-preview" data-family={familyKey} data-variant={variant}>{sections}</div>
    : <main className="miniweb-v2" data-family={familyKey} data-variant={variant}>{sections}</main>;
}
