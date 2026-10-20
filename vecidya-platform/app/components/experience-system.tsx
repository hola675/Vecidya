import { Link } from "react-router";
import type { ReactNode } from "react";

import { Icon, type IconName } from "./ui";
import { clampPercentage, formatCount, nonNegativeCount, relativeBarWidth } from "../lib/experience-metrics";

export type ExperienceStep = {
  title: string;
  description: string;
  to?: string;
  action?: string;
  state?: "complete" | "current" | "upcoming";
};

export function JourneyGuide({
  area,
  title,
  description,
  steps,
  className = "",
}: {
  area: "public" | "client" | "admin";
  title: string;
  description: string;
  steps: readonly ExperienceStep[];
  className?: string;
}) {
  const areas = { public: "DESCUBRE VECIDYA", client: "TU RECORRIDO", admin: "GUÍA OPERATIVA" };
  return (
    <section aria-label={title} className={`experience-journey experience-journey--${area} ${className}`}>
      <div className="experience-journey__heading">
        <p className="eyebrow">{areas[area]}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ol className="experience-journey__steps">
        {steps.map((step, index) => (
          <li className={`experience-step experience-step--${step.state ?? "upcoming"}`} key={step.title}>
            <div className="experience-step__marker" aria-hidden="true">{step.state === "complete" ? "✓" : String(index + 1).padStart(2, "0")}</div>
            <div className="experience-step__body">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {step.to && step.action ? <Link className="text-link" to={step.to}>{step.action} <span aria-hidden="true">→</span></Link> : null}
              {step.state === "complete" ? <span className="experience-step__state">Paso completado</span> : null}
              {step.state === "current" ? <span className="experience-step__state">Siguiente paso</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Mismo contrato de métrica, independiente de origen y ámbito de permisos. */
export function MetricCard({
  label,
  value,
  description,
  icon,
  className = "",
}: {
  label: string;
  value: string | number;
  description?: ReactNode;
  icon?: IconName;
  className?: string;
}) {
  return (
    <section className={`card experience-metric ${className}`}>
      {icon ? <Icon name={icon} /> : null}
      <div className="experience-metric__body">
        <strong>{typeof value === "number" ? formatCount(value) : value}</strong>
        <p>{label}</p>
        {description ? <div className="experience-metric__detail">{description}</div> : null}
      </div>
    </section>
  );
}

/** Progreso real, solo para un objetivo con numerador y denominador comprobables. */
export function ProgressMeter({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  const percentage = clampPercentage(value);
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percentage}
      className={`completion-track experience-progress ${className}`}
      role="progressbar"
    >
      <span style={{ width: `${percentage}%` }} />
    </div>
  );
}

export type ComparisonValue = { label: string; value: number; detail?: string };

/**
 * Barras descriptivas, NO un funnel de usuarios únicos.
 * Solo representa magnitudes ya calculadas por el servidor o runtime autorizado.
 */
export function ComparisonBars({
  title,
  description,
  values,
}: {
  title: string;
  description: string;
  values: readonly ComparisonValue[];
}) {
  const largest = Math.max(0, ...values.map((item) => nonNegativeCount(item.value)));
  return (
    <section aria-label={title} className="experience-comparison">
      <div className="experience-comparison__intro">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ul className="experience-comparison__list">
        {values.map((item) => {
          const value = nonNegativeCount(item.value);
          return (
            <li key={item.label}>
              <div className="experience-comparison__labels">
                <span>{item.label}</span>
                <strong>{formatCount(value)}</strong>
              </div>
              <div aria-hidden="true" className="experience-comparison__track">
                <span style={{ width: `${relativeBarWidth(value, largest)}%` }} />
              </div>
              {item.detail ? <p>{item.detail}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
