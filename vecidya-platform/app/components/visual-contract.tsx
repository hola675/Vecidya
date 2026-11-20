import type { ReactNode } from "react";
import { Form, Link } from "react-router";

import { Card } from "./ui";

/**
 * Componentes compartidos Vecidya UX-R1.6.
 * Son presentación: autorizaciones, estadísticas y guardado proceden de datos reales.
 */
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
  level = 1,
  className = "",
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  level?: 1 | 2;
  className?: string;
  titleId?: string;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <header className={["page-heading", "v-page-heading", className].filter(Boolean).join(" ")}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Heading id={titleId}>{title}</Heading>
        {description ? <p className="v-page-heading__description">{description}</p> : null}
      </div>
      {action ? <div className="v-page-heading__action">{action}</div> : null}
    </header>
  );
}

export type SharedStatus = "idle" | "loading" | "empty" | "error" | "access-denied" | "success";

/** El estado se recibe del flujo real; el componente jamás simula un resultado. */
export function SharedStatusPanel({
  state,
  title,
  children,
  action,
  className = "",
}: {
  state: SharedStatus;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const urgent = state === "error" || state === "access-denied";
  return (
    <section
      aria-live={urgent ? "assertive" : "polite"}
      className={["v-status-panel", className].filter(Boolean).join(" ")}
      data-state={state}
      role={urgent ? "alert" : "status"}
    >
      <h2>{title}</h2>
      <div className="v-status-panel__message">{children}</div>
      {action ? <div className="v-status-panel__action">{action}</div> : null}
    </section>
  );
}

/**
 * Estado explícito de consentimiento recibido de una fuente autorizada.
 * No infiere autorización a partir de cuenta, registro ni actividad.
 */
export function ConsentStatus({
  status,
  purpose,
  className = "",
}: {
  status: "authorized" | "not-authorized" | "unknown";
  purpose: string;
  className?: string;
}) {
  const text = {
    authorized: "Consentimiento autorizado",
    "not-authorized": "Consentimiento no autorizado",
    unknown: "Consentimiento sin confirmar",
  }[status];
  return (
    <p className={["v-consent-status", className].filter(Boolean).join(" ")} data-consent={status}>
      <strong>{text}</strong><span> · {purpose}</span>
    </p>
  );
}

/** Filtros GET, reseteo por ruta canónica y submit explícito; sin estado local oculto. */
export function AdminFilterBar({
  label,
  resetTo,
  children,
  action,
  submitLabel = "Aplicar filtros",
  className = "",
}: {
  label: string;
  resetTo: string;
  children: ReactNode;
  action?: string;
  submitLabel?: string;
  className?: string;
}) {
  return (
    <Form aria-label={label} action={action} className={["v-admin-filterbar", className].filter(Boolean).join(" ")} method="get" role="search">
      <div className="v-admin-filterbar__fields">{children}</div>
      <div className="v-admin-filterbar__actions">
        <button className="button button--primary" type="submit">{submitLabel}</button>
        <Link className="button button--secondary" to={resetTo}>Limpiar filtros</Link>
      </div>
    </Form>
  );
}

/** Una métrica es nula si no existe evidencia; el cero verificado se muestra como cero. */
export function DiagnosticMetricCard({
  label,
  value,
  unit,
  period,
  source,
  emptyLabel = "Sin datos verificados",
}: {
  label: string;
  value: string | number | null;
  unit: string;
  period: string;
  source: string;
  emptyLabel?: string;
}) {
  return (
    <Card className="v-diagnostic-metric" depth="rest" surface="solid">
      <h3>{label}</h3>
      <p className="v-diagnostic-metric__value">{value === null ? emptyLabel : typeof value === "number" ? value.toLocaleString("es-CO") : value} <span>{unit}</span></p>
      <p className="v-diagnostic-metric__meta">Periodo: {period} · Fuente: {source}</p>
    </Card>
  );
}

export type DiagnosticTrendPoint = { date: string; value: number | null };

/** Serie diaria con tabla accesible; la visualización no pretende medir usuarios únicos. */
export function DiagnosticTrend({
  title,
  description,
  points,
  unit,
  source,
}: {
  title: string;
  description: string;
  points: readonly DiagnosticTrendPoint[];
  unit: string;
  source: string;
}) {
  const max = Math.max(0, ...points.map(point => point.value ?? 0));
  return (
    <figure className="v-diagnostic-trend">
      <figcaption>
        <strong>{title}</strong>
        <p>{description}</p>
      </figcaption>
      {points.length === 0 ? <p>Sin registros para este periodo.</p> : (
        <>
          <div aria-hidden="true" className="v-diagnostic-trend__bars">
            {points.map((point, index) => (
              <span
                className="v-diagnostic-trend__bar"
                key={point.date + "-" + index}
                style={{ height: point.value === null || max === 0 ? "0%" : Math.max(0, point.value / max * 100) + "%" }}
              />
            ))}
          </div>
          <div className="v-diagnostic-trend__table-wrap" role="region" aria-label={title + " en tabla"} tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Día</th><th scope="col">Valor ({unit})</th></tr></thead>
              <tbody>{points.map((point, index) => (
                <tr key={point.date + "-" + index}><th scope="row">{point.date}</th><td>{point.value === null ? "Sin dato" : point.value.toLocaleString("es-CO")}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      <p className="v-diagnostic-trend__source">Fuente: {source}. No inferir conversiones ni personas únicas a partir de eventos agregados.</p>
    </figure>
  );
}
