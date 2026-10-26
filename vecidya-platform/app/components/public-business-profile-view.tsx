import { compactBusinessHoursGroups, type BusinessHoursEntry } from "../../db/business-hours-rules";
import type { MiniWebPublicProfile } from "../features/miniweb/public-model";

export type PublicBusinessProfile = MiniWebPublicProfile;

type ContactAction = {
  key: "whatsapp" | "phone" | "email" | "website";
  label: string;
  href: string;
  opensNewTab: boolean;
};

function safeWebUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Acepta logos remotos HTTP(S), medios publicados del negocio y, solo
 * durante la previsualización, el archivo privado del usuario autenticado. */
export function resolveBusinessLogoUrl(value: string | null, preview = false): string | null {
  const logoPath = value ?? "";
  const isPublishedLogo = /^\/media\/business\/[^/?#]+\/[^/?#]+$/.test(logoPath);
  const isPrivatePreviewLogo = preview && /^\/api\/organizations\/[^/?#]+\/business-media\/[^/?#]+$/.test(logoPath);
  return safeWebUrl(value) ?? ((isPublishedLogo || isPrivatePreviewLogo) ? logoPath : null);
}

function safePhoneHref(value: string | null) {
  if (!value) return null;
  const number = value.trim().replace(/[\s().-]/g, "");
  return /^\+?\d{7,15}$/.test(number) ? `tel:${number}` : null;
}

function safeEmailHref(value: string | null) {
  if (!value) return null;
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
}

function safeWhatsAppHref(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return /^\d{8,15}$/.test(digits) ? `https://wa.me/${digits}` : null;
}

function getContactActions(profile: PublicBusinessProfile): ContactAction[] {
  const whatsapp = safeWhatsAppHref(profile.whatsapp);
  const phone = safePhoneHref(profile.phone);
  const email = safeEmailHref(profile.publicEmail);
  const website = safeWebUrl(profile.websiteUrl);

  return [
    whatsapp ? { key: "whatsapp", label: "Escribir por WhatsApp", href: whatsapp, opensNewTab: true } : null,
    phone ? { key: "phone", label: "Llamar", href: phone, opensNewTab: false } : null,
    email ? { key: "email", label: "Enviar email", href: email, opensNewTab: false } : null,
    website ? { key: "website", label: "Visitar sitio web", href: website, opensNewTab: true } : null,
  ].filter((action): action is ContactAction => action !== null);
}

function ContactActionLink({
  action,
  primary,
  preview,
  ariaLabel,
}: {
  action: ContactAction;
  primary: boolean;
  preview: boolean;
  ariaLabel: string;
}) {
  const className = `button button--${primary ? "primary" : "secondary"}`;
  if (preview) return <span aria-disabled="true" className={className}>{action.label}</span>;

  return (
    <a
      aria-label={ariaLabel}
      className={className}
      href={action.href}
      rel={action.opensNewTab ? "noopener noreferrer" : undefined}
      target={action.opensNewTab ? "_blank" : undefined}
    >
      {action.label}
    </a>
  );
}

export function PublicBusinessHeader({
  profile,
  preview = false,
  showContactActions = true,
  cover,
}: {
  profile: PublicBusinessProfile;
  preview?: boolean;
  showContactActions?: boolean;
  cover?: { publicUrl: string; altText: string };
}) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const actions = getContactActions(profile);
  const primaryAction = showContactActions ? actions[0] : undefined;
  const imageUrl = resolveBusinessLogoUrl(profile.logoUrl, preview);
  const initial = profile.displayName.trim().slice(0, 1).toLocaleUpperCase();

  return (
    <section aria-labelledby="public-business-title" className="public-business-profile__header">
      <div className={`public-business-profile__identity${cover ? " public-business-profile__identity--cover" : ""}`}>
        {cover ? <img alt={cover.altText} className="miniweb-cover" decoding="async" src={cover.publicUrl} /> : null}
        {imageUrl ? (
          <img alt={`Logo de ${profile.displayName}`} decoding="async" height={256} src={imageUrl} width={256} />
        ) : (
          <span aria-hidden="true" className="public-business-profile__monogram">{initial}</span>
        )}
      </div>
      <div className="public-business-profile__intro">
        <h1 id="public-business-title">{profile.displayName}</h1>
        {profile.verificationStatus === "verified" ? (
          <p className="public-business-profile__verified"><span aria-hidden="true">✓</span> Perfil verificado por Vecidya</p>
        ) : null}
        {profile.category || location ? (
          <ul aria-label="Datos del negocio" className="public-business-profile__metadata">
            {profile.category ? <li>{profile.category}</li> : null}
            {location ? <li>{location}</li> : null}
          </ul>
        ) : null}
        {profile.shortDescription ? <p className="public-business-profile__summary">{profile.shortDescription}</p> : null}
        {showContactActions && primaryAction ? (
          <div aria-label="Contacto principal" className="public-business-profile__hero-actions">
            <ContactActionLink
              action={primaryAction}
              ariaLabel={`${primaryAction.label} a ${profile.displayName}`}
              preview={preview}
              primary
            />
            {preview ? (
              <span aria-disabled="true" className="button button--secondary">Ver formas de contacto</span>
            ) : (
              <a className="button button--secondary" href="#business-contact">Ver formas de contacto</a>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PublicBusinessContact({ profile, preview = false }: { profile: PublicBusinessProfile; preview?: boolean }) {
  const actions = getContactActions(profile);
  const socialLinks = [
    profile.instagramUrl ? { label: "Instagram", href: safeWebUrl(profile.instagramUrl) } : null,
    profile.facebookUrl ? { label: "Facebook", href: safeWebUrl(profile.facebookUrl) } : null,
    profile.linkedinUrl ? { label: "LinkedIn", href: safeWebUrl(profile.linkedinUrl) } : null,
  ].filter((link): link is { label: string; href: string } => link?.href != null);

  return (
    <section aria-labelledby="public-business-contact-title" className="public-v2-card public-business-profile__contact" id="business-contact">
      <h2 id="public-business-contact-title">Contacto directo</h2>
      {actions.length ? (
        <div className="public-actions">
          {actions.map((action, index) => (
            <ContactActionLink
              action={action}
              ariaLabel={`${action.label} a ${profile.displayName}`}
              key={action.key}
              preview={preview}
              primary={index === 0}
            />
          ))}
        </div>
      ) : null}
      {socialLinks.length ? (
        <div className="public-business-profile__social-links">
          <h3>Redes sociales</h3>
          <div className="public-actions">
            {socialLinks.map((link) => preview ? (
              <span aria-disabled="true" className="button button--secondary" key={link.label}>{link.label}</span>
            ) : (
              <a aria-label={`${link.label} de ${profile.displayName}`} className="button button--secondary" href={link.href} key={link.label} rel="noopener noreferrer" target="_blank">{link.label}</a>
            ))}
          </div>
        </div>
      ) : null}
      {!actions.length && !socialLinks.length ? <p>Este negocio todavía no ha publicado canales de contacto.</p> : null}
    </section>
  );
}

export function PublicBusinessDetails({ profile }: { profile: PublicBusinessProfile }) {
  const details = [
    ["Modalidad", profile.serviceMode],
    ["Área de atención", profile.serviceArea],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  if (!details.length) return null;

  const serviceModeLabels: Record<string, string> = {
    in_person: "Presencial",
    remote: "Remoto / virtual",
    hybrid: "Presencial y remoto",
  };

  return (
    <section aria-labelledby="public-business-details-title" className="public-v2-card public-business-profile__details">
      <h2 id="public-business-details-title">Cómo y dónde atiende</h2>
      <dl>
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{label === "Modalidad" ? serviceModeLabels[value] ?? value : value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function PublicBusinessHours({ hours }: { hours: BusinessHoursEntry[] }) {
  const groups = compactBusinessHoursGroups(hours);
  if (!groups.length) return null;

  return (
    <section aria-labelledby="public-business-hours-title" className="public-v2-card public-business-profile__hours">
      <h2 id="public-business-hours-title">Horarios comerciales</h2>
      <ul>
        {groups.map((group) => {
          const label = `${group.label} · ${group.value}`;
          return <li key={`${group.firstDay}-${group.lastDay}`}><time>{label}</time></li>;
        })}
      </ul>
    </section>
  );
}

export function PublicBusinessProfilePreview({
  profile,
  hours,
  hidden = false,
}: {
  profile: PublicBusinessProfile;
  hours: BusinessHoursEntry[];
  hidden?: boolean;
}) {
  if (!profile.displayName.trim()) {
    return (
      <section aria-label="Vista previa privada del minisitio" className="business-profile-preview" hidden={hidden} id="business-profile-preview" role="region">
        <div className="business-profile-preview__notice">
          <strong>Añade el nombre de tu negocio</strong>
          <span>La vista previa mostrará el contenido real de los campos que completes.</span>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Vista previa privada del minisitio" className="business-profile-preview" hidden={hidden} id="business-profile-preview" role="region">
      <div className="business-profile-preview__notice">
        <strong>Vista previa privada</strong>
        <span>Solo visible para quienes pueden consultar este negocio. No guarda ni publica cambios.</span>
      </div>
      <div className="business-profile-preview__site">
        <PublicBusinessHeader preview profile={profile} />
        <div className={`public-business-profile__grid${profile.description ? "" : " public-business-profile__grid--single"}`}>
          {profile.description ? (
            <section aria-labelledby="preview-business-description-title" className="public-v2-card public-business-profile__description">
              <h2 id="preview-business-description-title">Qué hace este negocio</h2>
              <p>{profile.description}</p>
            </section>
          ) : null}
          <div className="public-business-profile__side">
            <PublicBusinessContact preview profile={profile} />
            <PublicBusinessDetails profile={profile} />
            <PublicBusinessHours hours={hours} />
          </div>
        </div>
      </div>
    </section>
  );
}
