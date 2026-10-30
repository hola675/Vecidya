import type { MiniWebV2Document, MiniWebV2Section } from "../features/miniweb-v2/sections";
const dayNames = { monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo" } as const;
function SectionView({ section }: { section: MiniWebV2Section }) {
  if (!section.visible) return null;
  switch (section.type) {
    case "hero": return <header><h1>{section.content.title}</h1><p>{section.content.subtitle}</p>{section.content.cta && <a href={section.content.cta.href}>{section.content.cta.label}</a>}</header>;
    case "about": return <section><h2>{section.content.headline}</h2><p>{section.content.description}</p>{section.content.blocks.map(x => <article key={x.id}><h3>{x.title}</h3><p>{x.body}</p></article>)}</section>;
    case "services": return <section><h2>Servicios</h2>{section.content.items.map(x => <article key={x.id}><h3>{x.title}</h3><p>{x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</section>;
    case "products": return <section><h2>Productos</h2>{section.content.items.map(x => <article key={x.id}><h3>{x.title}</h3><p>{x.category} {x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</section>;
    case "gallery": return <section><h2>Galería</h2>{section.content.images.map(x => <figure key={x.assetId}><figcaption>{x.alt} {x.caption}</figcaption></figure>)}</section>;
    case "contact": return <section><h2>Contacto</h2>{section.content.phone && <p><a href={`tel:${section.content.phone}`}>{section.content.phone}</a></p>}{section.content.email && <p><a href={`mailto:${section.content.email}`}>{section.content.email}</a></p>}{section.content.links.map(x => <p key={x.href}><a href={x.href}>{x.label}</a></p>)}{section.content.cta && <a href={section.content.cta.href}>{section.content.cta.label}</a>}</section>;
    case "location": return <section><h2>Ubicación y cobertura</h2><p>{[section.content.address, section.content.area, section.content.city].filter(Boolean).join(", ")}</p>{section.content.mapUrl && <a href={section.content.mapUrl} rel="noreferrer">Ver mapa</a>}</section>;
    case "faq": return <section><h2>Preguntas frecuentes</h2>{section.content.items.map(x => <details key={x.id}><summary>{x.question}</summary><p>{x.answer}</p></details>)}</section>;
    case "team": return <section><h2>Equipo</h2>{section.content.people.filter(x => x.consented).map(x => <article key={x.id}><h3>{x.name}</h3><p>{x.role} {x.bio}</p></article>)}</section>;
    case "certifications": return <section><h2>Certificaciones</h2>{section.content.items.map(x => <article key={x.id}><h3>{x.title}</h3><p>{x.issuer} {x.date}</p></article>)}</section>;
    case "testimonials": return <section><h2>Testimonios</h2>{section.content.items.filter(x => x.consented).map(x => <figure key={x.id}><blockquote>{x.quote}</blockquote><figcaption>{x.author} {x.context}</figcaption></figure>)}</section>;
    case "hours": return <section><h2>{section.content.title}</h2><p>Zona horaria: {section.content.timezone}</p><dl>{section.content.days.map(x => <div key={x.day}><dt>{dayNames[x.day]}</dt><dd>{x.closed ? "Cerrado" : x.ranges.map(r => `${r.start}–${r.end}`).join(", ")}</dd></div>)}</dl>{section.content.note && <p>{section.content.note}</p>}</section>;
    default: return null;
  }
}
export function MiniWebV2Renderer({ document, familyKey, variant }: { document: MiniWebV2Document; familyKey: string; variant: string }) {
  return <main className={`miniweb-v2 miniweb-v2--${familyKey} miniweb-v2--${variant}`}>{[...document.sections].sort((a,b) => a.order-b.order || a.id.localeCompare(b.id)).map(section => <SectionView key={section.id} section={section}/>)}</main>;
}
