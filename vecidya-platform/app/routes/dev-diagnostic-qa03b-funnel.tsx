import { useEffect, useRef, useState } from "react";
import { isRouteErrorResponse, Link, useRouteError, type MetaFunction } from "react-router";

import { PublicLayout } from "../components/public-layout";
import funnelStylesUrl from "../components/diagnostic-flow/qa03b-funnel.css?url";
import {
  buildAnonymousDiagnosticSummaryV2,
  DIAGNOSTIC_FUNNEL_STATES_V1,
  validateFunnelIdentificationV1,
  type DiagnosticFunnelStateV1,
  type FunnelIdentificationInputV1,
} from "../features/diagnostic/qa03b/qbv2-candidate-funnel";
import {
  buildCandidateFunnelPreviewV1,
  type CandidateFunnelPreviewCaseV1,
} from "../features/diagnostic/qa03b/qbv2-candidate-funnel-preview";

export const meta: MetaFunction = () => [
  { title: "Embudo del diagnóstico (prototipo local)" },
  { name: "robots", content: "noindex, nofollow" },
];

export function links() {
  return [{ rel: "stylesheet", href: funnelStylesUrl }];
}

export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

const EMPTY_FORM: FunnelIdentificationInputV1 = {
  businessOrProjectName: "",
  responsibleName: "",
  email: "",
  phone: "",
  commercialFollowUp: false,
  researchParticipation: false,
};

function FunnelPrototype() {
  const [sample, setSample] = useState<CandidateFunnelPreviewCaseV1>("insufficient-evidence");
  const [state, setState] = useState<DiagnosticFunnelStateV1>("ANONYMOUS_SUMMARY");
  const [form, setForm] = useState<FunnelIdentificationInputV1>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"responsibleName" | "email" | "phone", string>>>({});
  const [message, setMessage] = useState("");
  const stateHeading = useRef<HTMLHeadingElement>(null);
  const result = buildCandidateFunnelPreviewV1(sample);
  const summary = buildAnonymousDiagnosticSummaryV2(result);
  const formVisible = state === "IDENTIFICATION_REQUIRED";

  useEffect(() => {
    if (state !== "ANONYMOUS_SUMMARY") stateHeading.current?.focus();
  }, [state]);

  const resetToSummary = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setMessage("");
    setState("ANONYMOUS_SUMMARY");
  };

  const update = <K extends keyof FunnelIdentificationInputV1>(key: K, value: FunnelIdentificationInputV1[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setMessage("");
  };

  const submitWithoutBackend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const checked = validateFunnelIdentificationV1(form);
    if (!checked.valid) {
      setFieldErrors(checked.errors);
      return;
    }
    // Prototipo: no fetch, persistencia, correo, evento analítico ni respuesta de éxito.
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setMessage("No se envió ni guardó esta solicitud. El servicio de registro todavía no está conectado; los campos se borraron de la página.");
    setState("ERROR_RECOVERABLE");
  };

  return (
    <main className="df-page q03bf-page">
      <div className="q03bf-shell">
        <header className="q03bf-header">
          <div>
            <h1>Tu diagnóstico, en dos niveles</h1>
            <p>Primero una lectura gratuita y anónima. Si después quieres más detalle, podrás solicitar un informe identificado.</p>
          </div>
          <span className="badge badge--warning">Prototipo local · datos sintéticos · no público</span>
        </header>

        <div className="q03bf-sample-control">
          <label htmlFor="q03bf-sample">Muestra de evaluación</label>
          <select
            id="q03bf-sample"
            value={sample}
            onChange={(event) => setSample(event.currentTarget.value as CandidateFunnelPreviewCaseV1)}
          >
            <option value="insufficient-evidence">Información insuficiente</option>
            <option value="contextual-focus">Orientación que requiere confirmación</option>
          </select>
          <span>La vista usa el resultado del motor candidato sin cambiarlo.</span>
        </div>

        {state === "ANONYMOUS_SUMMARY" ? (
          <div className="q03bf-layout">
            <section aria-labelledby="q03bf-summary-title" className="q03bf-summary">
              <h2 id="q03bf-summary-title">Resumen anónimo</h2>
              <p className="q03bf-summary__status">{summary.overallStatus}</p>
              {summary.score === null ? (
                <div className="q03bf-no-score">
                  <strong>No hay un porcentaje que mostrar</strong>
                  <p>La información disponible todavía no permite confirmar un estado general. Esto no significa que el resultado sea negativo.</p>
                </div>
              ) : (
                <p className="q03bf-score" aria-label={`Índice general ${summary.score} por ciento`}>{summary.score}<span>%</span></p>
              )}
              <p className="q03bf-summary__copy">{summary.executiveSummary}</p>

              {summary.primaryOpportunity ? (
                <section aria-labelledby="q03bf-opportunity-title" className="q03bf-focus">
                  <h3 id="q03bf-opportunity-title">Foco principal</h3>
                  <p>{summary.primaryOpportunity}</p>
                </section>
              ) : null}
              {summary.firstRecommendedAction ? (
                <section aria-labelledby="q03bf-action-title" className="q03bf-action">
                  <h3 id="q03bf-action-title">Una orientación inicial</h3>
                  <p className="q03bf-action__title">{summary.firstRecommendedAction.title}</p>
                  <p>{summary.firstRecommendedAction.explanation}</p>
                </section>
              ) : (
                <p className="q03bf-note">No hay una acción respaldada que debamos recomendar todavía.</p>
              )}

              <details className="q03bf-coverage">
                <summary>Confianza, cobertura y alcance</summary>
                <dl>
                  <div><dt>Confianza</dt><dd>{summary.confidence}</dd></div>
                  <div><dt>Cobertura</dt><dd>{summary.coverage}</dd></div>
                  <div><dt>Metodología</dt><dd>{summary.methodologyVersion}</dd></div>
                </dl>
                {summary.limitations.map((limitation) => <p key={limitation}>{limitation}</p>)}
              </details>

              <div className="q03bf-actions">
                <button className="button button--primary" onClick={() => setState("DETAILS_REQUESTED")} type="button">Ver diagnóstico completo</button>
                <button className="button button--secondary" disabled title="La descarga anónima aún no está implementada" type="button">Descargar resumen · aún no disponible</button>
              </div>
              <p className="q03bf-footnote">El resumen aporta una lectura útil sin mostrar el inventario de evidencias ni el plan detallado.</p>
            </section>

            <aside aria-label="Estado de la muestra" className="q03bf-aside">
              <h3>Qué incluye esta lectura</h3>
              <dl>
                <div><dt>Privacidad</dt><dd>Sin nombre, correo ni teléfono</dd></div>
                <div><dt>Resultado</dt><dd>{summary.score === null ? "Sin porcentaje" : "Porcentaje disponible"}</dd></div>
                <div><dt>Siguiente nivel</dt><dd>Informe completo personalizado</dd></div>
              </dl>
              <p>La identificación no debe cambiar el cálculo ni las reglas comerciales del diagnóstico.</p>
              <p>El informe completo requiere autorización verificada antes de entregar dimensiones, evidencia y recomendaciones detalladas.</p>
            </aside>
          </div>
        ) : null}

        {state === "DETAILS_REQUESTED" ? (
          <section aria-labelledby="q03bf-request-title" className="q03bf-form-panel">
            <h2 id="q03bf-request-title" ref={stateHeading} tabIndex={-1}>El informe completo requiere identificación</h2>
            <p>El resumen sigue disponible sin identificarte. Para preparar y recuperar un informe personalizado, el diseño prevé pedir solo los datos de contacto necesarios.</p>
            <div className="q03bf-purpose-note"><strong>Este prototipo no crea una solicitud.</strong> No escribe en una base de datos ni envía correos. No ingreses datos personales reales.</div>
            <div className="q03bf-actions">
              <button className="button button--primary" onClick={() => setState("IDENTIFICATION_REQUIRED")} type="button">Continuar a identificación</button>
              <button className="button button--secondary" onClick={resetToSummary} type="button">Volver al resumen</button>
            </div>
          </section>
        ) : null}

        {formVisible ? (
          <section aria-labelledby="q03bf-identification-title" className="q03bf-form-panel">
            <h2 id="q03bf-identification-title" ref={stateHeading} tabIndex={-1}>¿A quién debe prepararse?</h2>
            <p>El negocio o proyecto es opcional para personas independientes. No necesitas crear una cuenta.</p>
            <div className="q03bf-purpose-note">
              <strong>Uso necesario (A)</strong>
              <span>En una versión activa, el nombre responsable y el correo servirían para preparar, entregar y recuperar el informe que solicites. Este formulario local no los transmite ni conserva.</span>
            </div>

            <form className="q03bf-form" noValidate onSubmit={submitWithoutBackend}>
              <label htmlFor="q03bf-business">Nombre del negocio o proyecto <span>Opcional</span></label>
              <input id="q03bf-business" autoComplete="organization" value={form.businessOrProjectName} onChange={(event) => update("businessOrProjectName", event.currentTarget.value)} />

              <label htmlFor="q03bf-responsible">Nombre de la persona responsable <span>Requerido</span></label>
              <input id="q03bf-responsible" autoComplete="name" aria-invalid={Boolean(fieldErrors.responsibleName)} aria-describedby={fieldErrors.responsibleName ? "q03bf-responsible-error" : undefined} value={form.responsibleName} onChange={(event) => update("responsibleName", event.currentTarget.value)} />
              {fieldErrors.responsibleName ? <span className="q03bf-error" id="q03bf-responsible-error">{fieldErrors.responsibleName}</span> : null}

              <label htmlFor="q03bf-email">Correo electrónico <span>Requerido</span></label>
              <input id="q03bf-email" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "q03bf-email-error" : undefined} value={form.email} onChange={(event) => update("email", event.currentTarget.value)} />
              {fieldErrors.email ? <span className="q03bf-error" id="q03bf-email-error">{fieldErrors.email}</span> : null}

              <label htmlFor="q03bf-phone">Teléfono <span>Opcional</span></label>
              <input id="q03bf-phone" type="tel" autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "q03bf-phone-error" : undefined} value={form.phone} onChange={(event) => update("phone", event.currentTarget.value)} />
              {fieldErrors.phone ? <span className="q03bf-error" id="q03bf-phone-error">{fieldErrors.phone}</span> : null}

              <fieldset className="q03bf-preferences">
                <legend>Preferencias opcionales</legend>
                <label><input type="checkbox" checked={form.commercialFollowUp} onChange={(event) => update("commercialFollowUp", event.currentTarget.checked)} />
                  <span><strong>Seguimiento comercial (B)</strong><small>Autorizo que Vecidya me contacte sobre sus servicios. No recibirás comunicaciones comerciales si no marcas esta casilla.</small></span>
                </label>
                <label><input type="checkbox" checked={form.researchParticipation} onChange={(event) => update("researchParticipation", event.currentTarget.checked)} />
                  <span><strong>Estudios y validación (C)</strong><small>Acepto una invitación voluntaria para estudios que podrían reutilizar mis respuestas de forma identificable. Se definirá un mecanismo para cambiar o retirar esta preferencia.</small></span>
                </label>
              </fieldset>

              <p className="q03bf-legal-note">Las finalidades, el aviso de privacidad, la base legal, la retención y el mecanismo de retirada requieren revisión antes de activar este formulario. <Link to="/privacidad">Leer la política de privacidad vigente</Link>.</p>
              <div className="q03bf-actions">
                <button className="button button--primary" type="submit">Solicitar informe completo</button>
                <button className="button button--secondary" onClick={resetToSummary} type="button">Volver al resumen</button>
              </div>
            </form>
          </section>
        ) : null}

        {state === "ERROR_RECOVERABLE" ? (
          <section aria-labelledby="q03bf-error-title" className="q03bf-form-panel" role="alert">
            <h2 id="q03bf-error-title" ref={stateHeading} tabIndex={-1}>La solicitud no se registró</h2>
            <p>{message}</p>
            <div className="q03bf-purpose-note">No recibiste acceso al informe. El prototipo no muestra una pantalla de éxito porque no hubo confirmación del servidor.</div>
            <button className="button button--primary" onClick={resetToSummary} type="button">Volver al resumen</button>
          </section>
        ) : null}

        <footer className="q03bf-footer">
          <span>Estados de contrato: {DIAGNOSTIC_FUNNEL_STATES_V1.length} · la experiencia posterior a la identificación sigue pendiente.</span>
          <Link to="/diagnostico">Diagnóstico público actual</Link>
        </footer>
      </div>
    </main>
  );
}

export default function DevDiagnosticQa03bFunnel() {
  return <PublicLayout><FunnelPrototype /></PublicLayout>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="df-page"><section className="df-screen" role="alert"><h1 className="df-screen__title">{notFound ? "Página no encontrada" : "No pudimos cargar el prototipo"}</h1><p className="df-screen__lead">{notFound ? "Esta experiencia solo está disponible en desarrollo local." : "Recarga el entorno local para continuar."}</p></section></main>;
}
