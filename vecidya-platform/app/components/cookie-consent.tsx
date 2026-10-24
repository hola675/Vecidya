import { useEffect, useState } from "react";
import { Link } from "react-router";

import { COOKIE_PREFERENCES_EVENT, COOKIE_PREFERENCES_KEY, createCookiePreferences, readCookiePreferences } from "../lib/cookie-preferences";
import type { CookiePreferences } from "../lib/cookie-preferences";

/** Consentimiento local. Los scripts opcionales deben consultar estas preferencias antes de cargarse. */
export function CookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [configure, setConfigure] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    const value = readCookiePreferences(window.localStorage);
    if (value) { setPreferences(value); setAnalytics(value.analytics); setMarketing(value.marketing); }
    setReady(true);
  }, []);
  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== COOKIE_PREFERENCES_KEY && event.key !== null) return;
      const value = readCookiePreferences(window.localStorage);
      setPreferences(value);
      setAnalytics(value?.analytics ?? false);
      setMarketing(value?.marketing ?? false);
      if (!value) { setOpen(true); setConfigure(false); }
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);
  const choose = (a: boolean, m: boolean) => {
    const next = createCookiePreferences(a, m);
    try { window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(next)); setStorageUnavailable(false); }
    catch { setStorageUnavailable(true); }
    setPreferences(next);
    setAnalytics(a);
    setMarketing(m);
    setOpen(false);
    setConfigure(false);
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: next }));
  };
  if (!ready) return null;
  return (
    <>
      {storageUnavailable && <p role="status">No pudimos guardar tu elección en este navegador. Las preferencias opcionales no se conservarán al recargar.</p>}
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
