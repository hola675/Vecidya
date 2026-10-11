import type { DiagnosticNarrative, DiagnosticOutcome, OverallState } from "../../features/diagnostic";
import { publicAssets } from "../../assets/public-assets";

import { DigitalPresenceStatusCard } from "./presence-status";
import { PriorityList } from "./focus-section";
import { CONSTRAINT_COPY, actionSteps, dimensionDisplay, EMPTY_ACTION_PATH_NOTE, LIFECYCLE_DISPLAY, PROFILE_DISPLAY, showNextFocus } from "./presentation";

const STATUS_ILLUSTRATIONS: Readonly<Record<OverallState | "insufficient", string>> = {
  low: publicAssets.illustrations.diagnosticStatusLow,
  developing: publicAssets.illustrations.diagnosticStatusDeveloping,
  solid: publicAssets.illustrations.diagnosticStatusSolid,
  insufficient: publicAssets.brand.symbol3d,
};

/** Nivel 1 — resultado y asset de estado; la imagen acompaña el texto y no sustituye la lectura accesible. */
export function ResultHero({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  return (
    <header className={`dr-hero dr-hero--${narrative.lifecycle}`} data-overall-state={outcome.overall.state}>
      <h1 className="eyebrow dr-hero__title" id="dr-title" tabIndex={-1}>Tu diagnóstico en un vistazo</h1>
      <ul aria-label="Contexto del diagnóstico" className="dr-context">
        <li>{PROFILE_DISPLAY[narrative.profile]}</li>
        <li>{LIFECYCLE_DISPLAY[narrative.lifecycle]}</li>
      </ul>
      <DigitalPresenceStatusCard status={outcome.overall} />
      <div aria-hidden="true" className="dr-hero__visual">
        <img alt="" decoding="async" height="256" src={STATUS_ILLUSTRATIONS[outcome.overall.state]} width="256" />
      </div>
    </header>
  );
}

/** Nivel 2 — tres tarjetas que contestan qué pasó, qué importa y cuál es el primer paso. */
export function DiagnosticQuickRead({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  const [headline, ...additionalSummary] = narrative.executiveSummary;
  const headlineMatchesCurrentState = headline?.text === narrative.currentState.text;
  const firstStep = actionSteps(narrative, outcome)[0];
  const focus = narrative.primaryConstraint;
  const focusDimension = focus ? narrative.dimensions.find((item) => item.dimension === focus.dimension) : null;
  const firstStepDimension = firstStep ? narrative.dimensions.find((item) => item.dimension === firstStep.recommendation.dimension) : null;
  const focusIcon = focusDimension ? dimensionDisplay(focusDimension).icon : publicAssets.icons.diagnosticStatusDeveloping;
  const actionIcon = firstStepDimension ? dimensionDisplay(firstStepDimension).icon : publicAssets.icons.diagnosticStatusPriority;

  return (
    <section aria-labelledby="dr-focus-title" className="dr-section dr-quick-read">
      <h2 className="dr-section__title" id="dr-focus-title">Lo más importante ahora</h2>
      <div className="dr-quick-grid">
        <article className="dr-quick-card dr-quick-card--finding">
          <img alt="" className="dr-quick-card__icon" height="44" src={publicAssets.icons.search} width="44" />
          <p className="dr-quick-card__kicker">Qué encontramos</p>
          <p className="dr-quick-card__copy dr-summary__headline">{headline?.text ?? narrative.currentState.text}</p>
          {!headlineMatchesCurrentState ? <p className="dr-quick-card__support">{narrative.currentState.text}</p> : null}
          {additionalSummary.length > 0 ? (
            <details className="dr-quick-disclosure">
              <summary>Ver el resumen completo</summary>
              <div>{additionalSummary.map((block) => <p key={block.id}>{block.text}</p>)}</div>
            </details>
          ) : null}
        </article>

        <article className="dr-quick-card dr-quick-card--focus">
          <img alt="" className="dr-quick-card__icon" height="44" src={focusIcon} width="44" />
          <p className="dr-quick-card__kicker">{focus?.certainty === "unknown" ? CONSTRAINT_COPY.verifyKicker : "Lo que más importa"}</p>
          <h3 className="dr-quick-card__title">{focusDimension?.label ?? (focus ? "Punto por confirmar" : CONSTRAINT_COPY.clearTitle)}</h3>
          <p className="dr-quick-card__copy">{focus?.text ?? narrative.nextFocus.text}</p>
          {focus && showNextFocus(narrative) ? <p className="dr-next-focus dr-quick-card__support">{narrative.nextFocus.text}</p> : null}
          {narrative.priorities.length > 0 ? (
            <details className="dr-quick-disclosure">
              <summary>Ver prioridades y motivos</summary>
              <PriorityList narrative={narrative} />
            </details>
          ) : null}
        </article>

        <article className="dr-quick-card dr-quick-card--action">
          <img alt="" className="dr-quick-card__icon" height="44" src={actionIcon} width="44" />
          <p className="dr-quick-card__kicker">Qué hacer primero</p>
          {firstStep ? (
            <>
              <h3 className="dr-quick-card__title">{firstStep.recommendation.title}</h3>
              <p className="dr-quick-card__copy">{firstStep.recommendation.whatToImprove}</p>
            </>
          ) : <p className="dr-quick-card__copy">{EMPTY_ACTION_PATH_NOTE}</p>}
        </article>
      </div>
    </section>
  );
}

/** Compatibilidad de la exportación previa: conserva el resumen narrativo plano para consumidores existentes. */
export function ExecutiveSummary({ narrative }: { narrative: DiagnosticNarrative }) {
  const [headline, ...lead] = narrative.executiveSummary;
  return (
    <section aria-labelledby="dr-summary-title" className="dr-section dr-summary">
      <h2 className="dr-section__title" id="dr-summary-title">Lo que encontró el diagnóstico</h2>
      {headline ? <p className="dr-summary__headline">{headline.text}</p> : null}
      {lead.map((block) => <p className="dr-summary__lead" key={block.id}>{block.text}</p>)}
      <div className="dr-summary__state">
        <p className="dr-summary__state-label">Dónde estás hoy</p>
        <p>{narrative.currentState.text}</p>
      </div>
    </section>
  );
}
