import { useEffect, useRef, type FormEvent } from "react";

import {
  QA03B_CANDIDATE_SECTOR_V4,
  QA03B_SPECIALTY_SELECTORS_V1,
} from "../../features/diagnostic/qa03b/specialty-candidate-bank";
import type { ClassificationSelectionV9 } from "../../features/diagnostic/qa03b/v9-classification-bundle";

import { FlowProgress } from "./question-step";
import type { ProgressV3 } from "../../features/diagnostic/qbv2-session";

export type ClassificationDraftV9 = {
  readonly sector?: string;
  readonly niche?: string;
};

export type ClassificationStepV9Props = {
  readonly value: ClassificationDraftV9;
  readonly progress: ProgressV3;
  readonly error: string | null;
  readonly reviewing: boolean;
  readonly canGoBack: boolean;
  readonly entityType?: string;
  readonly onChange: (value: ClassificationDraftV9) => void;
  readonly onSubmit: (value: ClassificationSelectionV9) => void;
  readonly onBack: () => void;
};

const selectorBySector = new Map(
  QA03B_SPECIALTY_SELECTORS_V1.map((question) => [
    question.id.replace("q2_niche_", ""),
    question,
  ] as const),
);

export function specialtySelectorForSectorV9(sector: string | undefined) {
  return sector ? selectorBySector.get(sector) : undefined;
}

export function classificationSelectionReadyV9(value: ClassificationDraftV9): boolean {
  if (!value.sector) return false;
  const selector = specialtySelectorForSectorV9(value.sector);
  return selector ? !!value.niche && selector.options.some((option) => option.value === value.niche) : value.niche === undefined;
}

export function classificationPromptV9(entityType: string | undefined): string {
  return entityType === "organization"
    ? "¿A qué se dedica principalmente tu organización?"
    : "¿A qué se dedica principalmente tu negocio, trabajo o proyecto?";
}

/**
 * V9 candidate-only compound classification.
 *
 * Sector and specialty remain two explicit engine answers, but the user handles
 * them in one visible interaction. The specialty field is progressively revealed
 * only for sectors whose taxonomy has a reviewed selector.
 */
export function Qa03bV9ClassificationStep({
  value,
  progress,
  error,
  reviewing,
  canGoBack,
  entityType,
  onChange,
  onSubmit,
  onBack,
}: ClassificationStepV9Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const specialty = specialtySelectorForSectorV9(value.sector);
  const ready = classificationSelectionReadyV9(value);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready || !value.sector) return;
    onSubmit({
      sector: value.sector,
      ...(value.niche === undefined ? {} : { niche: value.niche }),
    });
  };

  const describedBy = [
    "df-v9-sector-hint",
    specialty ? "df-v9-specialty-hint" : null,
    error ? "df-v9-classification-error" : null,
  ].filter(Boolean).join(" ");

  return (
    <div className="df-step df-v9-classification">
      <FlowProgress progress={progress} />
      <form className="df-question" noValidate onSubmit={submit}>
        <p className="df-question__kicker">Sobre tu actividad</p>
        <h1
          className="df-question__title"
          id="df-v9-classification-title"
          ref={headingRef}
          tabIndex={-1}
        >
          {classificationPromptV9(entityType)}
        </h1>

        {reviewing ? (
          <p className="df-question__review">
            Estás revisando tu actividad. Si cambias el sector o la especialidad, ajustaremos las preguntas siguientes.
          </p>
        ) : null}

        <fieldset
          aria-describedby={describedBy || undefined}
          aria-labelledby="df-v9-classification-title"
          className="df-question__fieldset df-v9-classification__sector"
        >
          <p className="df-question__hint" id="df-v9-sector-hint">
            Elige la actividad que mejor representa lo que haces hoy o, si estás preparando el proyecto, lo que planeas hacer.
          </p>
          <div className="df-options df-options--single">
            {QA03B_CANDIDATE_SECTOR_V4.options.map((option) => {
              const inputId = `df-v9-sector-${option.value}`;
              const checked = value.sector === option.value;
              return (
                <label className={`df-option${checked ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                  <input
                    checked={checked}
                    className="df-option__input"
                    id={inputId}
                    name="q2_sector"
                    onChange={() => onChange({ sector: option.value })}
                    type="radio"
                    value={option.value}
                  />
                  <span aria-hidden="true" className="df-option__mark" />
                  <span className="df-option__label">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {specialty ? (
          <fieldset
            aria-describedby="df-v9-specialty-hint"
            className="df-question__fieldset df-v9-classification__specialty"
          >
            <legend className="df-v9-classification__legend">
              ¿Qué especialidad se acerca más a tu actividad?
            </legend>
            <p className="df-question__hint" id="df-v9-specialty-hint">
              Esto nos permite adaptar las preguntas sin asumir cómo funciona tu negocio. Si ninguna encaja, elige «Otra especialidad».
            </p>
            <div className="df-options df-options--single">
              {specialty.options.map((option) => {
                const inputId = `df-v9-specialty-${option.value}`;
                const checked = value.niche === option.value;
                return (
                  <label className={`df-option${checked ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                    <input
                      checked={checked}
                      className="df-option__input"
                      id={inputId}
                      name={specialty.id}
                      onChange={() => onChange({ sector: value.sector, niche: option.value })}
                      type="radio"
                      value={option.value}
                    />
                    <span aria-hidden="true" className="df-option__mark" />
                    <span className="df-option__label">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : value.sector ? (
          <p className="df-v9-classification__no-specialty" role="status">
            Con este sector no necesitamos una segunda clasificación para continuar.
          </p>
        ) : null}

        <div className="df-actions">
          {error ? (
            <p className="df-question__error" id="df-v9-classification-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="df-actions__buttons">
            {canGoBack ? (
              <button className="button button--secondary" onClick={onBack} type="button">
                Volver
              </button>
            ) : <span />}
            <button aria-disabled={!ready} className="button button--primary" disabled={!ready} type="submit">
              Continuar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
