import { useRef, useState, type FormEvent } from "react";

import {
  COMMERCIAL_CONTACT_NOTICE_VERSION,
  DIAGNOSTIC_RESEARCH_NOTICE_VERSION,
  REPORT_SERVICE_NOTICE_VERSION,
} from "../../features/diagnostic/identified-report-constants";
import type { PublicDiagnosticEngineIdentityV1 } from "../../features/diagnostic/public-diagnostic-engine-identity";
import type { DiagnosticSessionV3 } from "../../features/diagnostic/qbv2-session";

export function IdentifiedDiagnosticRequestForm({
  engineIdentity,
  onCancel,
  onSubmitted,
  session,
}: {
  readonly engineIdentity: PublicDiagnosticEngineIdentityV1;
  readonly onCancel: () => void;
  readonly onSubmitted: (requestId: string) => void;
  readonly session: DiagnosticSessionV3;
}) {
  const idempotencyKey = useRef<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceAcknowledged, setServiceAcknowledged] = useState(false);
  const [commercialOptIn, setCommercialOptIn] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [state, setState] = useState<{ readonly kind: "ready" } | { readonly kind: "submitting" } | { readonly kind: "error"; readonly message: string }>({ kind: "ready" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });
    idempotencyKey.current ??= window.crypto.randomUUID();
    try {
      const answers = session.answeredQuestionIds.map((questionId) => ({ questionId, value: session.answers[questionId] }));
      if (answers.some((entry) => entry.value === undefined)) throw new Error("INCOMPLETE_SESSION");
      const response = await fetch("/api/diagnostic/report-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify({
          engineIdentity,
          answers,
          fullName,
          businessName: businessName.trim() || null,
          email,
          phone: phone.trim() || null,
          serviceNoticeVersion: REPORT_SERVICE_NOTICE_VERSION,
          serviceNoticeAcknowledged: serviceAcknowledged,
          commercialContactOptIn: commercialOptIn,
          commercialNoticeVersion: commercialOptIn ? COMMERCIAL_CONTACT_NOTICE_VERSION : null,
          researchParticipationOptIn: researchOptIn,
          researchNoticeVersion: researchOptIn ? DIAGNOSTIC_RESEARCH_NOTICE_VERSION : null,
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || typeof payload !== "object" || payload === null || Array.isArray(payload) || typeof (payload as Record<string, unknown>).requestId !== "string") {
        setState({ kind: "error", message: (payload as { error?: unknown } | null)?.error === "Este resultado pertenece a otra versión. Inicia un diagnóstico nuevo para solicitar el informe." ? "Este resumen pertenece a una sesión anterior. Conserva su lectura o inicia un diagnóstico nuevo para solicitar el informe completo." : "No se registró la solicitud. Revisa tus datos y vuelve a intentarlo." });
        return;
      }
      onSubmitted((payload as { requestId: string }).requestId);
    } catch {
      setState({ kind: "error", message: "No pudimos enviar la solicitud. Tus respuestas siguen en este navegador; vuelve a intentarlo cuando tengas conexión." });
    }
  };

  return (
    <section aria-labelledby="df-identification-title" className="df-identification">
      <p className="df-identification__local-note" role="note">Entorno local de prueba. Usa datos sintéticos; el correo es simulado y no sale de este proceso.</p>
      <h1 id="df-identification-title">Solicita tu diagnóstico completo</h1>
      <p className="df-identification__intro">El resumen anónimo sigue disponible. Para preparar el informe detallado, necesitamos un nombre y un correo donde verificar el acceso.</p>

      <form className="df-identification__form" onSubmit={(event) => void submit(event)}>
        <div className="df-identification__fields">
          <label htmlFor="df-request-full-name">Tu nombre <span aria-hidden="true">*</span>
            <input autoComplete="name" id="df-request-full-name" maxLength={120} name="fullName" onChange={(event) => setFullName(event.target.value)} required value={fullName} />
          </label>
          <label htmlFor="df-request-business-name">Negocio o proyecto <span className="df-identification__optional">Opcional</span>
            <input autoComplete="organization" id="df-request-business-name" maxLength={160} name="businessName" onChange={(event) => setBusinessName(event.target.value)} value={businessName} />
          </label>
          <label htmlFor="df-request-email">Correo electrónico <span aria-hidden="true">*</span>
            <input autoComplete="email" id="df-request-email" maxLength={254} name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label htmlFor="df-request-phone">Teléfono <span className="df-identification__optional">Opcional</span>
            <input autoComplete="tel" id="df-request-phone" maxLength={40} name="phone" onChange={(event) => setPhone(event.target.value)} type="tel" value={phone} />
          </label>
        </div>

        <fieldset className="df-identification__permissions">
          <legend>Cómo usaremos tus datos</legend>
          <label className="df-identification__check">
            <input checked={serviceAcknowledged} onChange={(event) => setServiceAcknowledged(event.target.checked)} required type="checkbox" />
            <span>He leído el <a href="/privacidad" rel="noreferrer" target="_blank">aviso de privacidad</a> y solicito usar estos datos para preparar y darme acceso a este informe. <span aria-hidden="true">*</span></span>
          </label>
          <p className="df-identification__permission-note">Esta solicitud de servicio no autoriza comunicaciones comerciales.</p>
          <label className="df-identification__check">
            <input checked={commercialOptIn} onChange={(event) => setCommercialOptIn(event.target.checked)} type="checkbox" />
            <span>Quiero recibir información comercial de Vecidya. Es opcional y puedo cambiar esta preferencia.</span>
          </label>
          <label className="df-identification__check">
            <input checked={researchOptIn} onChange={(event) => setResearchOptIn(event.target.checked)} type="checkbox" />
            <span>Me interesa participar voluntariamente en futuras conversaciones para mejorar el diagnóstico. Esta elección es independiente de la información comercial.</span>
          </label>
        </fieldset>

        <p className="df-identification__retention">Prueba local: se asignan 30 días a la solicitud y al informe, y 24 horas al enlace. La limpieza automática todavía no está configurada; estos plazos y el tratamiento no están aprobados para producción.</p>
        {state.kind === "error" ? <p className="df-identification__error" role="alert">{state.message}</p> : null}
        <div className="df-identification__actions">
          <button className="button button--primary" disabled={state.kind === "submitting" || !serviceAcknowledged} type="submit">{state.kind === "submitting" ? "Preparando solicitud…" : "Solicitar acceso al informe"}</button>
          <button className="button button--ghost" disabled={state.kind === "submitting"} onClick={onCancel} type="button">Volver al resumen</button>
        </div>
        <p className="df-identification__required-note">Los campos con * son necesarios para tramitar el informe.</p>
      </form>
    </section>
  );
}

export function DiagnosticVerificationPending({ requestId, onBack }: { readonly requestId: string; readonly onBack: () => void }) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const resend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/diagnostic/report-requests/${encodeURIComponent(requestId)}/resend`, { method: "POST" });
      setMessage(response.ok ? "Enlace simulado actualizado. Abre el buzón local para continuar." : "No pudimos generar otro enlace. Espera un momento y vuelve a intentarlo.");
    } catch {
      setMessage("No pudimos conectar con el servicio local. Vuelve a intentarlo.");
    } finally {
      setResending(false);
    }
  };
  return (
    <section aria-labelledby="df-pending-title" className="df-identification">
      <p className="df-identification__local-note" role="note">Entorno local de prueba. No se envió un correo real.</p>
      <h1 id="df-pending-title">Revisa la verificación de tu correo</h1>
      <p>La solicitud quedó registrada en D1 local. El informe no se abre hasta confirmar el enlace de un solo uso.</p>
      <a className="button button--primary" href={`/__dev/diagnostico/buzon/${encodeURIComponent(requestId)}`}>Abrir buzón simulado</a>
      <p className="df-identification__permission-note">El enlace vence en 24 horas y abrirlo no lo consume; debes pulsar “Confirmar” en la página de verificación.</p>
      <button className="button button--secondary" disabled={resending} onClick={() => void resend()} type="button">{resending ? "Preparando enlace…" : "Generar otro enlace"}</button>
      {message ? <p aria-live="polite" role="status">{message}</p> : null}
      <button className="button button--ghost" onClick={onBack} type="button">Volver al resumen anónimo</button>
    </section>
  );
}
