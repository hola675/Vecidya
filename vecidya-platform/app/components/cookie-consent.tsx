import { useEffect, useState } from "react";
import { Link } from "react-router";

const KEY = "vecidya:cookie-preferences:v1";
type Preferences = { version: 1; necessary: true; analytics: boolean; marketing: boolean; savedAt: string };
const save = (analytics: boolean, marketing: boolean): Preferences => ({ version: 1, necessary: true, analytics, marketing, savedAt: new Date().toISOString() });

/** Consentimiento local. Los scripts opcionales deben consultar estas preferencias antes de cargarse. */
export function CookieConsent() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [configure, setConfigure] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "version" in parsed && parsed.version === 1 && "analytics" in parsed && typeof parsed.analytics === "boolean" && "marketing" in parsed && typeof parsed.marketing === "boolean") {
          const value = parsed as Preferences;
          setPreferences(value);
          setAnalytics(value.analytics);
          setMarketing(value.marketing);
        }
      }
    } catch { /* Un navegador sin almacenamiento debe seguir siendo utilizable. */ }
    setReady(true);
  }, []);
  const choose = (a: boolean, m: boolean) => {
    const next = save(a, m);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Sin persistencia, las opciones se aplican a esta sesión de UI. */ }
    setPreferences(next);
    setAnalytics(a);
    setMarketing(m);
    setOpen(false);
    setConfigure(false);
    window.dispatchEvent(new CustomEvent("vecidya:cookie-preferences-changed", { detail: next }));
  };
  if (!ready) return null;
  return (
    <>
      <button className="cookie-preferences-trigger" type="button" onClick={() => { setOpen(true); setConfigure(true); }}>Preferencias de cookies</button>
      {(!preferences || open) && (
        <section aria-label="Preferencias de cookies" className="cookie-consent" role="region">
          <div className="cookie-consent__content">
            <strong>Tu privacidad, tus decisiones</strong>
            <p>Utilizamos almacenamiento necesario para el funcionamiento del sitio. Las categorías opcionales requieren tu elección. Puedes cambiarla cuando quieras. <Link to="/cookies">Consultar la política de cookies</Link>.</p>
            {configure && (
              <div className="cookie-consent__options">
                <p><strong>Necesarias</strong> — Siempre activas para el funcionamiento básico.</p>
                <label><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /> Analítica opcional</label>
                <label><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /> Marketing opcional</label>
              </div>
            )}
            <div className="cookie-consent__actions">
              <button type="button" onClick={() => choose(false, false)}>Rechazar opcionales</button>
              {configure ? <button type="button" onClick={() => choose(analytics, marketing)}>Guardar selección</button> : <button type="button" onClick={() => setConfigure(true)}>Configurar</button>}
              <button type="button" onClick={() => choose(true, true)}>Aceptar todas</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
