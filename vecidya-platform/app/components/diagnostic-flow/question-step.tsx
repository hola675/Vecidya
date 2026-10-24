import { useEffect, useRef, type FormEvent } from "react";

import { PROGRESS_STAGES_V3, type AnswerValueV3, type PresentedQuestionV3, type ProgressV3, type RenderedQuestionV2 } from "../../features/diagnostic";

import { HELP_SECTIONS, STAGE_LABELS } from "./flow-copy";

/** Progreso por etapas: comunica avance sin prometer un número fijo de preguntas. */
export function FlowProgress({ progress }: { progress: ProgressV3 }) {
  return (
    <div className="df-progress">
      <ol aria-label="Etapas del diagnóstico" className="df-progress__stages">
        {PROGRESS_STAGES_V3.map((stage, index) => (
          <li aria-current={index === progress.stageIndex ? "step" : undefined} className={index < progress.stageIndex ? "is-done" : index === progress.stageIndex ? "is-current" : undefined} key={stage}>
            <span className="df-progress__label">{STAGE_LABELS[stage]}</span>
          </li>
        ))}
      </ol>
      <p className="df-progress__count">
        <span className="df-progress__current">{STAGE_LABELS[progress.stage]}</span>
        {progress.answered > 0 ? <span> · {progress.answered === 1 ? "1 respuesta" : `${progress.answered} respuestas`}</span> : null}
      </p>
    </div>
  );
}

/** Ayuda «?» con las tres partes de `helpIntent`; disclosure nativo: teclado, lector de pantalla y móvil sin JS extra. */
export function QuestionHelp({ question }: { question: RenderedQuestionV2 }) {
  const help = question.help;
  if (!help) return null;
  const optionNotes = help.options ? question.options.filter((option) => help.options![option.value]).map((option) => ({ label: option.label, note: help.options![option.value]! })) : [];
  return (
    <details className="df-help">
      <summary>
        <span aria-hidden="true" className="df-help__mark">?</span>
        ¿Qué significa esta pregunta?
      </summary>
      <div className="df-help__body">
        <h2 className="df-help__title">{HELP_SECTIONS.understand}</h2>
        <p>{help.understand}</p>
        <h2 className="df-help__title">{HELP_SECTIONS.distinction}</h2>
        <p>{help.distinction}</p>
        {optionNotes.length > 0 ? (
          <dl className="df-help__options">
            {optionNotes.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.note}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {help.why ? (
          <>
            <h2 className="df-help__title">{HELP_SECTIONS.why}</h2>
            <p>{help.why}</p>
          </>
        ) : null}
      </div>
    </details>
  );
}

export type QuestionStepProps = {
  readonly presented: PresentedQuestionV3;
  readonly progress: ProgressV3;
  readonly value: AnswerValueV3 | undefined;
  readonly error: string | null;
  readonly reviewing: boolean;
  readonly canGoBack: boolean;
  readonly onSelect: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onBack: () => void;
};

/**
 * Una pregunta por pantalla: pregunta (el `h1`, que recibe el foco al cambiar), pista, opciones en su orden
 * canónico y ayuda. Las opciones son tarjetas completas con el input nativo dentro; todas tienen el mismo
 * aspecto antes de elegir, para no sugerir cuál es la «mejor».
 */
export function QuestionStep({ presented, progress, value, error, reviewing, canGoBack, onSelect, onSubmit, onBack }: QuestionStepProps) {
  const { question } = presented;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: false }); }, [question.id]);
  const multi = question.type === "multi";
  const selected = (option: string) => (Array.isArray(value) ? value.includes(option) : value === option);
  const describedBy = [question.hint ? `df-hint-${question.id}` : null, multi ? `df-multi-${question.id}` : null, error ? `df-error-${question.id}` : null].filter(Boolean).join(" ") || undefined;
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(); };
  const kicker = presented.aboutPreparation ? "Sobre la preparación de tu proyecto" : presented.foundational ? "Sobre tu situación" : null;
  return (
    <div className="df-step">
      <FlowProgress progress={progress} />
      <form className="df-question" key={question.id} noValidate onSubmit={submit}>
        {kicker ? <p className="df-question__kicker">{kicker}</p> : null}
        <h1 className="df-question__title" id={`df-question-title-${question.id}`} ref={headingRef} tabIndex={-1}>{question.prompt}</h1>
        <fieldset aria-describedby={describedBy} aria-labelledby={`df-question-title-${question.id}`} className="df-question__fieldset">
          {reviewing ? <p className="df-question__review">Estás revisando una respuesta anterior. Si la cambias, ajustaremos las preguntas siguientes.</p> : null}
          {question.hint ? <p className="df-question__hint" id={`df-hint-${question.id}`}>{question.hint}</p> : null}
          {multi ? <p className="df-question__multi" id={`df-multi-${question.id}`}>Puedes elegir varias opciones.</p> : null}
          <div className={`df-options df-options--${question.type}`}>
            {question.options.map((option) => {
              const inputId = `df-${question.id}-${option.value}`;
              const checked = selected(option.value);
              return (
                <label className={`df-option${checked ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                  <input
                    checked={checked}
                    className="df-option__input"
                    id={inputId}
                    name={question.id}
                    onChange={() => onSelect(option.value)}
                    type={multi ? "checkbox" : "radio"}
                    value={option.value}
                  />
                  <span aria-hidden="true" className="df-option__mark" />
                  <span className="df-option__label">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <QuestionHelp question={question} />
        {/* El error vive junto a los botones (fijos en móvil): siempre visible al pulsar «Continuar». */}
        <div className="df-actions">
          {error ? <p className="df-question__error" id={`df-error-${question.id}`} role="alert">{error}</p> : null}
          <div className="df-actions__buttons">
            {canGoBack ? <button className="button button--secondary" onClick={onBack} type="button">Volver</button> : <span />}
            <button className="button button--primary" type="submit">Continuar</button>
          </div>
        </div>
      </form>
    </div>
  );
}
