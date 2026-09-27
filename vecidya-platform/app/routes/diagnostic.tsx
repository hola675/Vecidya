import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import {
  applyAnswer,
  buildContactMailto,
  createServerSession,
  CURRENT_PERSISTED_VERSIONS,
  DIAGNOSTIC_PATH,
  DiagnosticBrowserStore,
  dimensionDescriptions,
  dimensionLabels,
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
  sendCompletion,
  sendSnapshot,
  servicePath,
  shouldFlushSnapshot,
  visualStatusFor,
  visualStatusLabels,
  type Answers,
  type DiagnosticBrowserRecord,
  type DiagnosticResult,
  type DiagnosticSessionId,
  type Issue,
  type ProfileId,
  type Question,
  type VisualStatus,
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
  const browserStore = useMemo(() => new DiagnosticBrowserStore(), []);
  // DIAG-V3-06 §11: restauración automática en el mismo navegador. Un deep link explícito
  // (`?perfil=`) siempre gana sobre un snapshot local; sin deep link, se restaura si hay un
  // snapshot válido, de versión compatible y sin completar.
  const restoredAnswers = useMemo(() => {
    if (Object.keys(initialAnswers).length > 0) return initialAnswers;
    return browserStore.canAutoResume() ? (browserStore.read()?.answers ?? initialAnswers) : initialAnswers;
  }, [browserStore, initialAnswers]);
  const [answers, setAnswers] = useState<Answers>(restoredAnswers);
  const [step, setStep] = useState(() => getInitialStep(restoredAnswers));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sessionRef = useRef<{ sessionId: string; writeToken: string } | null>(null);
  const syncMetaRef = useRef({ lastSnapshotAt: 0, answeredSinceLastSnapshot: 0, lastSectionIndex: -1, creatingSession: false });

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
    browserStore.clear();
    sessionRef.current = null;
    syncMetaRef.current = { lastSnapshotAt: 0, answeredSinceLastSnapshot: 0, lastSectionIndex: -1, creatingSession: false };
    navigate(DIAGNOSTIC_PATH, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [complete, currentQuestion?.id]);

  // DIAG-V3-06 §10/§16/§37: cada respuesta se guarda localmente sin red (Browser Store); la red solo
  // se usa para snapshots espaciados (`shouldFlushSnapshot`), best-effort. Una caída de red o de KV
  // nunca bloquea la siguiente pregunta: el estado en memoria de React ya es la fuente de verdad de
  // lo que se renderiza.
  useEffect(() => {
    const now = Date.now();
    const previous = browserStore.read();
    const questionsAnswered = applicable.filter((question) => isAnswered(question, answers)).length;
    const sessionFromStore = sessionRef.current ?? (previous?.sessionId && previous.writeToken ? { sessionId: previous.sessionId, writeToken: previous.writeToken } : null);

    const record: DiagnosticBrowserRecord = {
      sessionId: (sessionFromStore?.sessionId ?? null) as DiagnosticSessionId | null,
      writeToken: sessionFromStore?.writeToken ?? null,
      versions: CURRENT_PERSISTED_VERSIONS,
      status: previous?.status ?? "STARTED",
      startedAt: previous?.startedAt ?? now,
      lastActivityAt: now,
      revision: previous?.revision ?? 0,
      currentQuestionId: currentQuestion?.id ?? null,
      answers,
      questionsSeen: applicable.length,
      questionsAnswered,
      serverCompleted: previous?.serverCompleted ?? false,
    };
    browserStore.write(record);

    if (questionsAnswered === 0) return;

    const meta = syncMetaRef.current;
    const crossedSectionBoundary = meta.lastSectionIndex !== -1 && meta.lastSectionIndex !== progress.sectionIndex;
    meta.lastSectionIndex = progress.sectionIndex;
    meta.answeredSinceLastSnapshot += 1;

    let cancelled = false;
    (async () => {
      let session = sessionRef.current;
      if (!session && !meta.creatingSession) {
        meta.creatingSession = true;
        const created = await createServerSession();
        meta.creatingSession = false;
        if (cancelled) return;
        if (created) {
          session = { sessionId: created.sessionId, writeToken: created.writeToken };
          sessionRef.current = session;
          browserStore.write({ ...record, sessionId: created.sessionId as DiagnosticSessionId, writeToken: created.writeToken });
        }
      }
      if (!session) return;

      const shouldFlush = shouldFlushSnapshot({
        answeredSinceLastSnapshot: meta.answeredSinceLastSnapshot,
        msSinceLastSnapshot: now - meta.lastSnapshotAt,
        crossedSectionBoundary,
        isBeforeCompletion: complete,
      });
      if (!shouldFlush) return;

      const outcome = await sendSnapshot(session.sessionId, {
        writeToken: session.writeToken,
        answers,
        currentQuestionId: currentQuestion?.id ?? null,
        questionsSeen: applicable.length,
        questionsAnswered,
      });
      if (cancelled || !outcome) return;
      meta.lastSnapshotAt = Date.now();
      meta.answeredSinceLastSnapshot = 0;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, complete]);

  // DIAG-V3-06 §26/§27: la finalización siempre la recalcula el servidor a partir de las respuestas;
  // esta llamada es informativa para persistencia y nunca cambia lo que ya se renderiza (§59: cero
  // rediseño). Un fallo de red deja el resultado local visible igual, sin fingir que se guardó.
  useEffect(() => {
    if (!complete) return;
    const record = browserStore.read();
    const session = sessionRef.current ?? (record?.sessionId && record.writeToken ? { sessionId: record.sessionId, writeToken: record.writeToken } : null);
    if (!session || record?.serverCompleted) return;

    let cancelled = false;
    (async () => {
      const outcome = await sendCompletion(session.sessionId, session.writeToken, answers);
      if (cancelled || !outcome) return;
      const latest = browserStore.read();
      if (latest) browserStore.write({ ...latest, serverCompleted: true });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

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

const visualStatusTone: Record<VisualStatus, "danger" | "warning" | "success"> = {
  priority: "danger",
  developing: "warning",
  healthy: "success",
};

const visualStatusIcons: Record<VisualStatus, string> = {
  priority: publicAssets.icons.diagnosticStatusPriority,
  developing: publicAssets.icons.diagnosticStatusDeveloping,
  healthy: publicAssets.icons.diagnosticStatusHealthy,
};

/** Porcentaje + icono + estado. El porcentaje es el dato principal: color e icono ayudan a leerlo, nunca lo sustituyen (DIAG-003). */
function StatusBadge({ label, score }: { label?: string; score: number }) {
  const status = visualStatusFor(score);
  return (
    <span className="diagnostic-status" role="img" aria-label={`${label ? `${label}: ` : ""}${score} por ciento, ${visualStatusLabels[status]}`}>
      <img alt="" aria-hidden="true" className="diagnostic-status__icon" height={20} src={visualStatusIcons[status]} width={20} />
      <strong className="diagnostic-status__score">{score}%</strong>
      <span aria-hidden="true" className={`badge badge--${visualStatusTone[status]}`}>{visualStatusLabels[status]}</span>
    </span>
  );
}

function PriorityCard({ dimensionScore, issue, primary }: { dimensionScore: number | null; issue: Issue; primary: boolean }) {
  return (
    <li className={`diagnostic-priority${primary ? " diagnostic-priority--primary" : ""}`}>
      <div className="diagnostic-priority__heading">
        <h4>{issue.title}{issue.tentative ? <em className="diagnostic-tag"> por confirmar</em> : null}</h4>
        {dimensionScore !== null ? <StatusBadge label={dimensionLabels[issue.dimension]} score={dimensionScore} /> : null}
      </div>
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
  const overallStatus = visualStatusFor(result.overallScore);
  const printDate = new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date());
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
      <div className="diagnostic-print-header">
        <img alt="Vecidya" height={28} src={publicAssets.brand.wordmark} width={84} />
        <span>Diagnóstico generado el {printDate}</span>
      </div>
      <p className="eyebrow">TU DIAGNÓSTICO</p>
      <h2 id="diagnostic-title" ref={headingRef} tabIndex={-1}>{result.state.label}</h2>
      <p>{result.state.summary}</p>

      <div
        aria-label={`Tu diagnóstico: ${result.overallScore} por ciento, ${visualStatusLabels[overallStatus]}`}
        className="diagnostic-overall-score"
        role="img"
      >
        <img alt="" aria-hidden="true" className="diagnostic-overall-score__icon" height={56} src={visualStatusIcons[overallStatus]} width={56} />
        <div className="diagnostic-overall-score__body">
          <p className="diagnostic-overall-score__label">Tu diagnóstico</p>
          <p className="diagnostic-overall-score__value">{result.overallScore}%</p>
        </div>
        <span aria-hidden="true" className={`badge badge--${visualStatusTone[overallStatus]}`}>{visualStatusLabels[overallStatus]}</span>
      </div>

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
            {result.priorities.map((issue, index) => (
              <PriorityCard
                dimensionScore={result.dimensions.find((dimension) => dimension.id === issue.dimension)?.score ?? null}
                issue={issue}
                key={issue.id}
                primary={index === 0}
              />
            ))}
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
                        aria-hidden="true"
                        className={`diagnostic-dimensions__bar diagnostic-dimensions__bar--${dimension.level}`}
                        style={{ width: `${dimension.score}%` }}
                      />
                      <span
                        aria-label={`${dimension.label}: ${dimension.score} por ciento, ${levelLabels[dimension.level]}`}
                        className="diagnostic-dimensions__value"
                        role="img"
                      >
                        <img alt="" aria-hidden="true" className="diagnostic-dimensions__icon" height={16} src={visualStatusIcons[visualStatusFor(dimension.score)]} width={16} />
                        <strong>{dimension.score}%</strong>
                      </span>
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

      <p className="diagnostic-limits">
        Este diagnóstico es una orientación inicial basada en tus respuestas: no es una auditoría, una certificación ni una evaluación garantizada.
        Es anónimo y efímero; al cerrar la página, las respuestas desaparecen. Puedes rehacerlo cuando cambie tu situación.
      </p>

      <div className="diagnostic-result__cta">
        <a className="button button--primary" href={contactHref}>Revisar este resultado con Vecidya</a>
        <Link className="button button--secondary" to="/contacto">Ir a Contacto</Link>
        <button className="button button--secondary" onClick={() => window.print()} type="button">Descargar mi diagnóstico (PDF)</button>
        <button className="button button--secondary" onClick={onRestart} type="button">Rehacer diagnóstico</button>
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
    </article>
  );
}
