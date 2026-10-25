import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PlatformFooter } from "./platform-footer";

/** Presentation-only compatibility gate for private workspaces on narrow viewports. */
export function UnsupportedDeviceNotice({ area, onContinue }: { area: "client" | "admin"; onContinue: () => void }) {
  const footerArea = area === "admin" ? "admin" : "app";
  return (
    <div className="unsupported-device-shell" data-testid="unsupported-device-notice">
      <main aria-labelledby="unsupported-device-title" className="unsupported-device">
      <section className="unsupported-device__card">
        <img alt="" className="unsupported-device__brand" height="512" src={publicAssets.brand.symbol3d} width="512" />
        <p className="eyebrow">Vecidya · espacio privado</p>
        <h1 id="unsupported-device-title">Este espacio necesita una pantalla más amplia</h1>
        <p>Para que puedas trabajar con comodidad y ver formularios, tablas y controles completos, {area === "admin" ? "la administración" : "tu espacio de gestión"} está disponible desde 768 píxeles de ancho.</p>
        <div className="unsupported-device__actions">
          <Link className="button button--primary" to="/">Ir al sitio público</Link>
          <button className="button button--secondary" onClick={onContinue} type="button">Continuar en esta ventana</button>
        </div>
        <p className="unsupported-device__hint">Si estás usando zoom, puedes continuar y desplazarte por el espacio de trabajo.</p>
      </section>
      </main>
      <PlatformFooter area={footerArea} />
    </div>
  );
}
