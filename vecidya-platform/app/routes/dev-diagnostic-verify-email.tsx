import { useEffect, useRef, useState } from "react";

type VerificationState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly requestId: string; readonly token: string }
  | { readonly kind: "invalid" }
  | { readonly kind: "submitting" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "verified"; readonly reportPath: string };

export const meta = () => [{ title: "Verificar acceso al diagnóstico" }, { name: "robots", content: "noindex, nofollow, noarchive" }];

export default function VerifyDiagnosticEmail() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const initialized = useRef(false);
  const [state, setState] = useState<VerificationState>({ kind: "loading" });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    titleRef.current?.focus();
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const requestId = fragment.get("requestId") ?? "";
    const token = fragment.get("token") ?? "";
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    if (!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/iu.test(requestId) || !/^[A-Za-z0-9_-]{40,44}$/u.test(token)) {
      setState({ kind: "invalid" });
      return;
    }
    setState({ kind: "ready", requestId, token });
  }, []);

  const verify = async () => {
    if (state.kind !== "ready") return;
    setState({ kind: "submitting" });
    try {
      const response = await fetch("/api/diagnostic/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ requestId: state.requestId, token: state.token }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || typeof payload !== "object" || payload === null || Array.isArray(payload) || typeof (payload as Record<string, unknown>).reportPath !== "string") {
        setState({ kind: "error", message: "El enlace venció o ya se utilizó. Vuelve al diagnóstico para solicitar otro." });
        return;
      }
      setState({ kind: "verified", reportPath: (payload as { reportPath: string }).reportPath });
    } catch {
      setState({ kind: "error", message: "No pudimos completar la verificación. Revisa tu conexión y vuelve a intentarlo desde el enlace." });
    }
  };

  return (
    <main className="df-page df-identification-page">
      <section aria-labelledby="df-verify-title" className="df-identification">
        <p className="df-identification__local-note" role="note">Entorno local de prueba. Usa datos sintéticos; no se envían correos reales.</p>
        <h1 id="df-verify-title" ref={titleRef} tabIndex={-1}>Confirma el acceso a tu diagnóstico</h1>
        {state.kind === "loading" ? <p aria-live="polite">Preparando la verificación…</p> : null}
        {state.kind === "ready" || state.kind === "submitting" ? <>
          <p>El enlace se confirma solo cuando pulsas el botón. Abrir esta página no consume la verificación.</p>
          <button className="button button--primary" disabled={state.kind === "submitting"} onClick={() => void verify()} type="button">
            {state.kind === "submitting" ? "Verificando…" : "Confirmar y abrir el informe"}
          </button>
        </> : null}
        {state.kind === "invalid" ? <p role="alert">Este enlace no está completo o ya no está disponible. Regresa al diagnóstico y solicita otro.</p> : null}
        {state.kind === "error" ? <p role="alert">{state.message}</p> : null}
        {state.kind === "verified" ? <div className="df-identification__success" role="status">
          <p>Correo verificado. Ya puedes abrir el informe completo.</p>
          <a className="button button--primary" href={state.reportPath}>Abrir informe</a>
        </div> : null}
        <p><a className="text-link" href="/diagnostico">Volver al resumen anónimo</a></p>
      </section>
    </main>
  );
}
