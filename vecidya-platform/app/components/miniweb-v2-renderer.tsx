import { useId, useState } from "react";
import { miniWebV2DesignStyle } from "../features/miniweb-v2/visual-design";
import type { MiniWebV2Document, MiniWebV2Section, V2Image } from "../features/miniweb-v2/sections";

const dayNames = { monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo" } as const;

function ImageView({ image, src, priority = false }: { image: V2Image | null; src?: (assetId: string) => string; priority?: boolean }) {
  if (!image || !src) return null;
  return <figure className="miniweb-v2__media"><img alt={image.alt} decoding="async" loading={priority ? "eager" : "lazy"} src={src(image.assetId)} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>;
}

function ContactEmailForm({ config, recipient, preview }: { config: { title: string; introduction: string; submitLabel: string }; recipient: string | null; preview: boolean }) {
  const formTitleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consented, setConsented] = useState(false);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);
  const safeRecipient = recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) ? recipient : null;
  if (preview) return <aside className="miniweb-v2__form-note">El formulario de correo solo se activa en la página publicada.</aside>;
  if (!safeRecipient) return <p role="status">El formulario no está disponible hasta configurar un correo público válido.</p>;

  return <section className="miniweb-v2__contact-form" aria-labelledby={formTitleId}>
    <h3 id={formTitleId}>{config.title}</h3>
    <p>{config.introduction}</p>
    <p>El borrador se prepara en tu dispositivo y se abre en tu aplicación de correo. Vecidya no recibe ni almacena estos datos.</p>
    <form onSubmit={(event) => {
      event.preventDefault();
      const subject = `Consulta desde Vecindario: ${config.title}`;
      const body = [`Nombre: ${name}`, `Correo para responder: ${email}`, "", message, "", "La persona indicó que acepta enviar este mensaje al correo público del negocio."].join("\n");
      setMailtoHref(`mailto:${safeRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }}>
      <label>Nombre<input autoComplete="name" maxLength={120} required value={name} onChange={(event) => setName(event.currentTarget.value)}/></label>
      <label>Correo electrónico<input autoComplete="email" maxLength={254} required type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)}/></label>
      <label>Mensaje<textarea maxLength={1000} required rows={5} value={message} onChange={(event) => setMessage(event.currentTarget.value)}/></label>
      <label><input checked={consented} required type="checkbox" onChange={(event) => setConsented(event.currentTarget.checked)}/> Acepto enviar este mensaje al correo público del negocio indicado en esta página.</label>
      <button className="miniweb-v2__action" type="submit">{config.submitLabel}</button>
    </form>
    {mailtoHref ? <p role="status">Se preparó el borrador. <a href={mailtoHref}>Abrir aplicación de correo</a> para enviarlo.</p> : null}
  </section>;
}

function SectionView({ section, mediaUrl, contactAnchor, preview }: { section: MiniWebV2Section; mediaUrl?: (assetId: string) => string; contactAnchor: boolean; preview: boolean }) {
  if (!section.visible) return null;
  const id = contactAnchor ? "contacto" : section.id;
  switch (section.type) {
    case "hero": return <header id={id} className="miniweb-v2__hero" data-image={section.content.image ? "present" : "absent"}><div><h1>{section.content.title}</h1><p>{section.content.subtitle}</p>{section.content.cta && <a className="miniweb-v2__action" href={section.content.cta.href}>{section.content.cta.label}</a>}</div><ImageView image={section.content.image} priority src={mediaUrl}/></header>;
    case "about": return <section id={id}><h2>{section.content.headline || "Conócenos"}</h2><p>{section.content.description}</p><div className="miniweb-v2__cards">{section.content.blocks.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3><p>{x.body}</p></article>)}</div></section>;
    case "services": return <section id={id}><h2>Servicios</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3><p>{x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</div></section>;
    case "products": return <section id={id}><h2>Productos y promociones</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.title}</h3>{x.category && <small>{x.category}</small>}<p>{x.description}</p>{x.cta && <a href={x.cta.href}>{x.cta.label}</a>}</article>)}</div>{section.content.promotions?.length ? <div className="miniweb-v2__promotions"><h3>Promociones vigentes</h3><div className="miniweb-v2__cards">{section.content.promotions.map((promotion) => <article key={promotion.id}><span>Promoción</span><h4>{promotion.title}</h4><p>{promotion.description}</p>{promotion.startsOn ? <p>Válida desde {promotion.startsOn} (UTC)</p> : null}<p>Válida hasta {promotion.endsOn} (UTC)</p>{promotion.terms ? <p>Condiciones: {promotion.terms}</p> : null}{promotion.cta ? <a href={promotion.cta.href}>{promotion.cta.label}</a> : null}</article>)}</div></div> : null}</section>;
    case "gallery": return <section id={id}><h2>Galería</h2><div className="miniweb-v2__gallery">{section.content.images.map((x, index) => <ImageView key={`${x.assetId}-${index}`} image={x} src={mediaUrl}/>)}</div></section>;
    case "contact": return <section id={id}><h2>Contacto</h2>{section.content.phone && <p><a href={`tel:${section.content.phone}`}>{section.content.phone}</a></p>}{section.content.email && <p><a href={`mailto:${section.content.email}`}>{section.content.email}</a></p>}{section.content.whatsapp ? <p><a aria-label="Contactar por WhatsApp" href={`https://wa.me/${section.content.whatsapp.phone.replace(/\D/g, "")}${section.content.whatsapp.message ? `?text=${encodeURIComponent(section.content.whatsapp.message)}` : ""}`} rel="noopener noreferrer" target="_blank">WhatsApp</a></p> : null}{section.content.links.map((x,index) => <p key={`${x.href}-${index}`}><a href={x.href}>{x.label}</a></p>)}{section.content.cta && <a className="miniweb-v2__action" href={section.content.cta.href}>{section.content.cta.label}</a>}{section.content.form ? <ContactEmailForm config={section.content.form} recipient={section.content.email} preview={preview}/> : null}</section>;
    case "location": return <section id={id}><h2>Ubicación y cobertura</h2><p>{[section.content.address, section.content.area, section.content.city].filter(Boolean).join(", ")}</p>{section.content.mapUrl && <a href={section.content.mapUrl} rel="noreferrer">Ver mapa</a>}</section>;
    case "faq": return <section id={id}><h2>Preguntas frecuentes</h2>{section.content.items.map(x => <details key={x.id}><summary>{x.question}</summary><p>{x.answer}</p></details>)}</section>;
    case "team": return <section id={id}><h2>Equipo</h2><div className="miniweb-v2__cards">{section.content.people.filter(x => x.consented).map(x => <article key={x.id}><ImageView image={x.image} src={mediaUrl}/><h3>{x.name}</h3><p>{x.role} {x.bio}</p></article>)}</div></section>;
    case "certifications": return <section id={id}><h2>Certificaciones</h2><div className="miniweb-v2__cards">{section.content.items.map(x => <article key={x.id}><ImageView image={x.document} src={mediaUrl}/><h3>{x.title}</h3><p>{x.issuer} {x.date}</p></article>)}</div></section>;
    case "testimonials": return <section id={id}><h2>Reseñas autorizadas</h2>{section.content.items.filter(x => x.consented).map(x => <figure key={x.id}><blockquote>{x.quote}</blockquote><figcaption>{x.author} {x.context}{x.reviewedOn ? ` · ${x.reviewedOn}` : ""}{x.sourceUrl ? <> · <a href={x.sourceUrl} rel="nofollow noopener noreferrer" target="_blank">{x.sourceLabel || "Ver fuente de la reseña"}</a></> : null}</figcaption><small>Contenido publicado con consentimiento del negocio; Vecidya no verifica de forma independiente la reseña.</small></figure>)}</section>;
    case "hours": return <section id={id}><h2>{section.content.title}</h2><p>Zona horaria: {section.content.timezone}</p><dl>{section.content.days.map(x => <div key={x.day}><dt>{dayNames[x.day]}</dt><dd>{x.closed ? "Cerrado" : x.ranges.map(r => `${r.start}–${r.end}`).join(", ")}</dd></div>)}</dl>{section.content.note && <p>{section.content.note}</p>}</section>;
    default: return null;
  }
}

export function MiniWebV2Renderer({ document, familyKey, variant, preview = false, mainId, mediaUrl }: { document: MiniWebV2Document; familyKey: string; variant: string; preview?: boolean; mainId?: string; mediaUrl?: (assetId: string) => string }) {
  const visual = document.design;
  const designAttributes = { style: miniWebV2DesignStyle(visual), "data-layout": visual?.layout, "data-align": visual?.align, "data-image-position": visual?.imagePosition };
  const orderedSections = [...document.sections].sort((a,b) => a.order-b.order || a.id.localeCompare(b.id));
  const firstContactId = orderedSections.find((section) => section.type === "contact" && section.visible)?.id;
  const sections = orderedSections.map(section => <SectionView key={section.id} section={section} mediaUrl={mediaUrl} preview={preview} contactAnchor={section.type === "contact" && section.id === firstContactId}/>);
  return preview
    ? <div className="miniweb-v2 miniweb-v2--editor-preview" data-family={familyKey} data-variant={variant} {...designAttributes}>{sections}</div>
    : <main id={mainId} className="miniweb-v2" data-family={familyKey} data-variant={variant} {...designAttributes}>{sections}</main>;
}
