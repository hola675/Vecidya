import { Link } from "react-router";
import { CookieConsent } from "../cookie-consent";

import type { MiniWebModuleType } from "../../features/miniweb/registry";
import type { MiniWebPublicProfile } from "../../features/miniweb/public-model";
import { buildMiniWebPublicNavigation } from "../../features/miniweb/navigation";
import { resolveBusinessLogoUrl } from "../public-business-profile-view";

type ChromeProps = {
  profile: MiniWebPublicProfile;
  preview?: boolean;
};

export function MiniWebSiteHeader({
  profile,
  visibleModules,
  preview = false,
}: ChromeProps & { visibleModules: readonly MiniWebModuleType[] }) {
  const navigation = buildMiniWebPublicNavigation(visibleModules);
  const name = profile.displayName.trim() || "Tu negocio";
  const logoUrl = resolveBusinessLogoUrl(profile.logoUrl, preview);
  const brand = (
    <>
      {logoUrl ? <img alt="" height={40} src={logoUrl} width={40} /> : null}
      <span>{name}</span>
    </>
  );

  return (
    <header className="miniweb-standalone__header">
      {preview ? (
        <span className="miniweb-standalone__brand">{brand}</span>
      ) : (
        <Link className="miniweb-standalone__brand" to={`/vecindario/${profile.slug}`}>{brand}</Link>
      )}
      <nav aria-label="Navegación del negocio" className="miniweb-standalone__navigation">
        {preview ? <span>Inicio</span> : <a href="#miniweb-main">Inicio</a>}
        {navigation.map((item) => preview
          ? <span key={item.type}>{item.label}</span>
          : <a href={item.href} key={item.type}>{item.label}</a>,
        )}
      </nav>
    </header>
  );
}

export function MiniWebSiteFooter({ profile, preview = false }: ChromeProps) {
  return (
    <footer className="miniweb-standalone__footer">
      <div>
        <strong>{profile.displayName.trim() || "Tu negocio"}</strong>
        <p>{[profile.city, profile.country].filter(Boolean).join(", ") || "Página pública del negocio"}</p>
      </div>
      <nav aria-label="Enlaces de regreso">
        {preview ? (
          <>
            <span>Volver al Vecindario</span>
            <span>Conocer Vecidya</span>
          </>
        ) : (
          <>
            <Link to="/vecindario">Volver al Vecindario</Link>
            <Link to="/">Conocer Vecidya</Link>
          </>
        )}
      </nav>
      <p className="miniweb-standalone__credit">Creado con Vecidya</p>
      {!preview ? <CookieConsent /> : null}
    </footer>
  );
}
