import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import {
  applyAnswer,
  buildContactMailto,
  DIAGNOSTIC_PATH,
  dimensionDescriptions,
  entryToAnswers,
  getApplicableQuestions,
  getInitialStep,
  getProfile,
  getProgress,
  isAnswered,
  isSelected,
  learnPath,
  levelLabels,
  optionLabel,
  parseDiagnosticEntry,
  PROFILE_PARAM,
  questionCopy,
  runDiagnostic,
  servicePath,
  type Answers,
  type DiagnosticResult,
  type Issue,
  type ProfileId,
  type Question,
} from "../features/diagnostic";

import type { Route } from "./+types/diagnostic";

const diagnosticDeliverables = [
  "Tu estado actual y cómo llegamos a él",
  "Qué te frena primero y por qué",
  "Hasta tres prioridades explicadas con tus respuestas",
  "Siguiente paso y encaje Vecidya, si aplica",
];

const profileIcons: Record<ProfileId, string> = {
  business: publicAssets.icons.diagnosticBusiness,
  professional: publicAssets.icons.diagnosticProfessional,
  creator: publicAssets.icons.diagnosticCreator,
  project: publicAssets.icons.diagnosticProject,
  organization: publicAssets.icons.serviceStructure,
};

const confidenceCopy = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
} as const;

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Diagnóstico Vecidya",
    "Entiende dónde estás, qué funciona, qué te frena y qué conviene hacer primero. Diagnóstico anónimo, adaptado a tu perfil y sin guardar respuestas.",
    DIAGNOSTIC_PATH,
  );
}

export default function Diagnostic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialAnswers = useMemo(() => entryToAnswers(parseDiagnosticEntry(searchParams)), [searchParams]);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(() => getInitialStep(initialAnswers));
  const headingRef = useRef<HTMLHeadingElement>(null);

  const applicable = useMemo(() => getApplicableQuestions(answers), [answers]);
  const safeStep = Math.min(step, applicable.length);
  const complete = safeStep >= applicable.length;
  const currentQuestion: Question | undefined = complete ? undefined : applicable[safeStep];
  const progress = useMemo(() => getProgress(answers, safeStep), [answers, safeStep]);
  const result = useMemo(() => (complete ? runDiagnostic(answers) : null), [answers, complete]);
  const profile = typeof answers.profile === "string" ? (answers.profile as ProfileId) : undefined;
  const copy = currentQuestion ? questionCopy(currentQuestion, profile) : undefined;

  const sectionQuestions = currentQuestion ? applicable.filter((question) => question.section === currentQuestion.section) : [];
  const withinSection = currentQuestion ? Math.max(0, sectionQuestions.findIndex((question) => question.id === currentQuestion.id)) : 0;
  const meterFraction = complete
    ? 1
    : progress.sectionCount
      ? (progress.sectionIndex + (sectionQuestions.length ? withinSection / sectionQuestions.length : 0)) / progress.sectionCount
      : 0;

  const canContinue = Boolean(currentQuestion && isAnswered(currentQuestion, answers));
  const isLast = !complete && progress.known && safeStep === applicable.length - 1;

  const answer = (question: Question, value: string) => {
    const next = applyAnswer(answers, question, value);
    setAnswers(next);
    if (question.id === "profile" && next.profile !== answers.profile && typeof next.profile === "string") {
      setSearchParams(new URLSearchParams({ [PROFILE_PARAM]: next.profile }), { replace: true, preventScrollReset: true });
    }
  };

  const goNext = () => {
    if (!canContinue) return;
    setStep(Math.min(safeStep + 1, applicable.length));
  };

  const goBack = () => setStep(Math.max(0, safeStep - 1));

  const restart = () => {
    setAnswers({});
    setStep(0);
    navigate(DIAGNOSTIC_PATH, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [complete, currentQuestion?.id]);

  return (
    <PublicLayout>
      <main className="public-page diagnostic-page">
        <section className="diagnostic-hero">
          <div>
            <p className="eyebrow">DIAGNÓSTICO VECIDYA</p>
            <h1>Entiende dónde estás y qué conviene hacer primero.</h1>
            <p>
              Responde preguntas breves adaptadas a tu perfil y recibe una orientación inicial:
              qué funciona, qué te frena y cuál es el siguiente paso razonable. No necesitas dejar
              tu correo y no guardamos tus respuestas.
            </p>
          </div>
          <div className="diagnostic-hero__panel">
            <img alt="" aria-hidden="true" decoding="async" height={1254} src={publicAssets.icons.vecidyaPin} width={1254} />
            <span>Recibirás</span>
            <ul>
              {diagnosticDeliverables.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="diagnostic-shell" aria-labelledby="diagnostic-title">
          <ol className="diagnostic-stepper" aria-label="Secciones del diagnóstico">
            {progress.sections.map((section) => (
              <li aria-current={section.state === "current" ? "step" : undefined} className={`is-${section.state}`} key={section.id}>{section.label}</li>
            ))}
          </ol>
          <div
            aria-label="Avance del diagnóstico por secciones"
            aria-valuemax={progress.sectionCount}
            aria-valuemin={0}
            aria-valuenow={complete ? progress.sectionCount : progress.sectionIndex}
            aria-valuetext={complete ? "Diagnóstico completo" : `Sección ${progress.sectionIndex + 1} de ${progress.sectionCount}: ${progress.sectionLabel}`}
            className="diagnostic-meter"
            role="progressbar"
          >
            <span style={{ width: `${Math.round(meterFraction * 100)}%` }} />
          </div>
          <p aria-live="polite" className="diagnostic-progress-label">
            {complete
              ? "Diagnóstico completo"
              : progress.known
                ? `Sección ${progress.sectionIndex + 1} de ${progress.sectionCount} · ${progress.sectionLabel} · Pregunta ${progress.questionNumber} de ${progress.questionCount}`
                : `Sección ${progress.sectionIndex + 1} de ${progress.sectionCount} · ${progress.sectionLabel} · Elige un perfil para adaptar el recorrido`}
          </p>

          {currentQuestion && copy ? (
            <article className="diagnostic-question">
              <fieldset aria-describedby="diagnostic-helper" className="diagnostic-fieldset">
                <legend>
                  <span className="eyebrow">{progress.sectionLabel} · {currentQuestion.eyebrow}</span>
                  <h2 id="diagnostic-title" ref={headingRef} tabIndex={-1}>{copy.prompt}</h2>
                </legend>
                <p id="diagnostic-helper">{copy.helper}</p>
                <div className={`diagnostic-options diagnostic-options--${currentQuestion.type}`}>
                  {currentQuestion.options.map((option) => {
                    const selected = isSelected(answers[currentQuestion.id], option.value);
                    const inputId = `diagnostic-${currentQuestion.id}-${option.value}`;
                    const icon = currentQuestion.id === "profile" ? profileIcons[option.value as ProfileId] : undefined;
                    return (
                      <label className={`diagnostic-choice${selected ? " is-selected" : ""}`} htmlFor={inputId} key={option.value}>
                        <input
                          checked={selected}
                          className="diagnostic-choice__input"
                          id={inputId}
                          name={currentQuestion.id}
                          onChange={() => answer(currentQuestion, option.value)}
                          type={currentQuestion.type === "multi" ? "checkbox" : "radio"}
                          value={option.value}
                        />
                        {icon ? <img alt="" aria-hidden="true" className="diagnostic-option__icon" height={36} src={icon} width={36} /> : null}
                        <span className="diagnostic-option__mark" aria-hidden="true" />
                        <span className="diagnostic-choice__label">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="diagnostic-actions">
                <button className="button button--secondary" disabled={safeStep === 0} onClick={goBack} type="button">Volver</button>
                <button className="button button--primary" disabled={!canContinue} onClick={goNext} type="button">{isLast ? "Ver resultado" : "Continuar"}</button>
              </div>
            </article>
          ) : result ? (
            <ResultView headingRef={headingRef} onRestart={restart} result={result} />
          ) : null}
        </section>
      </main>
    </PublicLayout>
  );
}

function PriorityCard({ issue, primary }: { issue: Issue; primary: boolean }) {
  return (
    <li className={`diagnostic-priority${primary ? " diagnostic-priority--primary" : ""}`}>
      <h4>{issue.title}{issue.tentative ? <em className="diagnostic-tag"> por confirmar</em> : null}</h4>
      <p><strong>Por qué:</strong> {issue.why}</p>
      <p><strong>Qué hacer:</strong> {issue.action}</p>
      <p className="diagnostic-priority__links">
        {issue.learn ? <Link className="text-link" to={learnPath(issue.learn as never)}>Leer en Aprende <span aria-hidden="true">→</span></Link> : null}
        {issue.service ? <Link className="text-link" to={servicePath(issue.service as never)}>Ver el servicio relacionado <span aria-hidden="true">→</span></Link> : null}
      </p>
    </li>
  );
}

function ResultView({
  headingRef,
  onRestart,
  result,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
  result: DiagnosticResult;
}) {
  const contactHref = buildContactMailto(result);
  const contextChips = [
    { label: "Perfil", value: getProfile(result.profile).label },
    { label: "Momento", value: result.context.stage ? optionLabel("stage", result.context.stage) : "Sin definir" },
    { label: "Equipo", value: result.context.team ? optionLabel("team", result.context.team) : "No aplica" },
    { label: "Objetivo", value: result.context.goal ? optionLabel("goal", result.context.goal) : "Sin definir" },
  ];
  const { license, services, addons, learn } = result.recommendation;
  const licenseHref = license.level === "none" ? "/licencias" : `/licencias#${license.level}`;

  return (
    <article className="diagnostic-result">
      <p className="eyebrow">TU DIAGNÓSTICO</p>
      <h2 id="diagnostic-title" ref={headingRef} tabIndex={-1}>{result.state.label}</h2>
      <p>{result.state.summary}</p>
      <p className="diagnostic-confidence-line">
        Confianza del resultado: <strong>{confidenceCopy[result.confidence.level].toLowerCase()}</strong>. {result.confidence.reasons[0]}
      </p>

      {result.goalNote ? (
        <aside className="diagnostic-goal-note" aria-label="Sobre tu objetivo">
          <p className="eyebrow">SOBRE TU OBJETIVO</p>
          <p>{result.goalNote}</p>
        </aside>
      ) : null}

      <section className="diagnostic-priorities" aria-labelledby="diagnostic-priorities-title">
        <div className="diagnostic-section-heading">
          <p className="eyebrow">QUÉ TE FRENA PRIMERO</p>
          <h3 id="diagnostic-priorities-title">Prioridades</h3>
        </div>
        {result.priorities.length ? (
          <ol>
            {result.priorities.map((issue, index) => <PriorityCard issue={issue} key={issue.id} primary={index === 0} />)}
          </ol>
        ) : (
          <p>Tus respuestas no muestran una brecha que priorizar ahora. Mantén lo que funciona y revisa el diagnóstico cuando cambie tu momento.</p>
        )}
      </section>

      <section className="diagnostic-path" aria-labelledby="diagnostic-path-title">
        <div>
          <p className="eyebrow">EN ORDEN</p>
          <h3 id="diagnostic-path-title">Siguientes pasos</h3>
          <p>Cada paso prepara el siguiente; ninguno depende de contratar algo.</p>
        </div>
        <ol>{result.nextActions.map((action) => <li key={action.step}>{action.text}</li>)}</ol>
      </section>

      <section className="diagnostic-state" aria-labelledby="diagnostic-state-title">
        <div>
          <p className="eyebrow">CÓMO LLEGAMOS AQUÍ</p>
          <h3 id="diagnostic-state-title">Cómo llegamos a este resultado</h3>
          <ul className="diagnostic-chips" aria-label="Contexto que indicaste">
            {contextChips.map((chip) => <li key={chip.label}><span>{chip.label}</span><strong>{chip.value}</strong></li>)}
          </ul>
          <ul>{result.state.because.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={`diagnostic-confidence diagnostic-confidence--${result.confidence.level}`}>
          <p className="eyebrow">CONFIANZA DEL RESULTADO</p>
          <h3>Confianza {confidenceCopy[result.confidence.level].toLowerCase()}</h3>
          <p>Refleja cuántas preguntas aplicables respondiste, cuántas dudas quedaron abiertas y si hubo respuestas contradictorias; no mide tu negocio.</p>
          <ul>{result.confidence.reasons.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <div className="diagnostic-result-grid">
        <section className="diagnostic-result-card diagnostic-result-card--dimensions" aria-labelledby="diagnostic-dimensions-title">
          <h3 id="diagnostic-dimensions-title">Tus dimensiones</h3>
          <dl className="diagnostic-dimensions">
            {result.dimensions.map((dimension) => (
              <div key={dimension.id}>
                <dt title={dimensionDescriptions[dimension.id]}>{dimension.label}</dt>
                <dd>
                  {dimension.score === null || dimension.level === null ? (
                    <em>Sin evaluar en tu recorrido</em>
                  ) : (
                    <>
                      <span
                        aria-label={`${dimension.label}: ${levelLabels[dimension.level]}`}
                        className={`diagnostic-dimensions__bar diagnostic-dimensions__bar--${dimension.level}`}
                        role="img"
                        style={{ width: `${dimension.score}%` }}
                      />
                      <small>{levelLabels[dimension.level]}{dimension.unknown ? " · con dudas" : ""}</small>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="diagnostic-dimensions__note">Cada nivel resume tus respuestas aplicables. «No lo sé» y «no aplica» no puntúan; «con dudas» marca dimensiones con alguna respuesta «no lo sé».</p>
        </section>
        <section className="diagnostic-result-card diagnostic-result-card--strengths" aria-labelledby="diagnostic-strengths-title">
          <h3 id="diagnostic-strengths-title">Fortalezas</h3>
          <ul>{result.strengths.map((item) => <li key={item.text}>{item.text}</li>)}</ul>
        </section>
        <section className="diagnostic-result-card diagnostic-result-card--opportunities" aria-labelledby="diagnostic-gaps-title">
          <h3 id="diagnostic-gaps-title">Brechas y riesgos</h3>
          {result.gaps.length ? (
            <ul>{result.gaps.map((issue) => <li key={issue.id}>{issue.title}{issue.tentative ? <em className="diagnostic-tag"> por confirmar</em> : null}</li>)}</ul>
          ) : (
            <p>No detectamos brechas adicionales más allá de las prioridades.</p>
          )}
        </section>
      </div>

      <section className="diagnostic-commercial" aria-labelledby="diagnostic-commercial-title">
        <div className="diagnostic-commercial__heading">
          <p className="eyebrow">SI QUIERES APOYO</p>
          <h3 id="diagnostic-commercial-title">Encaje con Vecidya</h3>
          <p>Una orientación, no una obligación. Se deriva de tus prioridades; puede decir que todavía no necesitas nada.</p>
        </div>
        <div className="diagnostic-commercial__grid">
          <article>
            <span>LICENCIA</span>
            <strong>{license.name}</strong>
            <p>{license.reason}</p>
            {license.notYet ? <p className="diagnostic-commercial__note">{license.notYet}</p> : null}
            <Link className="text-link" to={licenseHref}>{license.level === "none" ? "Conocer las licencias" : `Ver ${license.name} en Licencias`} <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <span>SERVICIOS</span>
            <strong>{services.length ? services.map((service) => service.title).join(" · ") : "Ninguno necesario ahora"}</strong>
            {services.length ? (
              <ul>{services.map((service) => <li key={service.id}><Link to={servicePath(service.id as never)}>{service.title}</Link>: {service.reason}</li>)}</ul>
            ) : (
              <p>Tus prioridades no requieren trabajo personalizado por ahora.</p>
            )}
            <Link className="text-link" to="/servicios">Ver todos los servicios <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <span>ADDONS</span>
            <strong>{addons.length ? addons.map((addon) => addon.name).join(" · ") : "Ninguno todavía"}</strong>
            {addons.length ? (
              <ul>{addons.map((addon) => <li key={addon.id}><Link to={`/addons#${addon.id}`}>{addon.name}</Link>: {addon.reason}</li>)}</ul>
            ) : (
              <p>No necesitas una capacidad adicional antes de resolver las prioridades.</p>
            )}
            <Link className="text-link" to="/addons">{addons.length ? "Ver addons" : "Conocer los addons para más adelante"} <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <span>APRENDE</span>
            <strong>Antes de decidir</strong>
            <ul>{learn.map((item) => <li key={item.slug}><Link to={`/aprende/${item.slug}`}>{item.title}</Link></li>)}</ul>
            <Link className="text-link" to="/aprende">Explorar Aprende <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <p className="diagnostic-limits">
        Este diagnóstico es una orientación inicial basada en tus respuestas: no es una auditoría, una certificación ni una evaluación garantizada.
        Es anónimo y efímero; al cerrar la página, las respuestas desaparecen. Puedes rehacerlo cuando cambie tu situación.
      </p>

      <div className="diagnostic-result__cta">
        <a className="button button--primary" href={contactHref}>Revisar este resultado con Vecidya</a>
        <Link className="button button--secondary" to="/contacto">Ir a Contacto</Link>
        <button className="button button--secondary" onClick={onRestart} type="button">Rehacer diagnóstico</button>
      </div>
    </article>
  );
}
