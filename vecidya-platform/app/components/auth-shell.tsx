import type { ReactNode } from "react";
import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { Card } from "./ui";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  privacyNote?: string;
};

export function AuthShell({ eyebrow, title, description, children, privacyNote }: AuthShellProps) {
  return (
    <>
      <a className="skip-link" href="#auth-content">Saltar al contenido</a>
      <main className="auth-shell" id="auth-content">
        <div className="auth-layout">
          <section aria-label="Tu espacio Vecidya" className="auth-welcome">
            <Link aria-label="Vecidya, inicio" className="auth-brand" to="/">
              <img alt="" decoding="async" height={691} src="/brand/vecidya-app-icon.png" width={691} />
              <span>Vecidya</span>
            </Link>
            <div className="auth-welcome__copy">
              <p className="eyebrow">VECIDYA</p>
              <h2>Tu presencia, más clara y organizada.</h2>
              <p>Accede a tu espacio para gestionar la información y las capacidades disponibles para tu organización.</p>
            </div>
            <img className="auth-welcome__art" alt="Vista ilustrada de descubrimiento local en Vecidya" decoding="async" height={1086} src={publicAssets.illustrations.mobileLocalDiscovery} width={1448} />
            <div className="auth-welcome__note"><span aria-hidden="true">✓</span> Tu información de cuenta se trata con privacidad</div>
          </section>
          <Card className="auth-card">
            <div className="auth-card__heading">
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
            {privacyNote ? <p className="auth-card__privacy">{privacyNote}</p> : null}
          </Card>
        </div>
      </main>
    </>
  );
}
