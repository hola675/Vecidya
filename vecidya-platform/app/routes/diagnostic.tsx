import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import {
  applyAnswer,
  buildContactMailto,
  canOfferSaveForLater,
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
  recoverSession,
  runDiagnostic,
  saveSessionForLater,
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
    "Entiende dónde estás, qué funciona, qué te frena y qué conviene hacer primero. Diagnóstico anónimo, adaptado a tu perfil y sin necesidad de crear una cuenta.",
    DIAGNOSTIC_PATH,
  );
}

export default function Diagnostic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const browserStore = useMemo(() => new DiagnosticBrowserStore(), []);
  // El estado inicial de render (servidor Y primer render de cliente, antes de hidratar) usa
  // ÚNICAMENTE el deep link de la URL — nunca `localStorage`. Leer el Browser Store en el cálculo de
  // este estado inicial rompía la hidratación: el servidor nunca ve `window`, así que produciría un
  // primer HTML distinto al que el cliente esperaría reconstruir, y React descartaría el árbol
  // servido (visto en vivo: "Hydration failed", con recarga completa cliente-side). La restauración
  // real ocurre después, en un efecto que solo corre en el cliente (ver más abajo).
  const initialAnswers = useMemo(() => entryToAnswers(parseDiagnosticEntry(searchParams)), [searchParams]);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(() => getInitialStep(initialAnswers));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sessionRef = useRef<{ sessionId: string; writeToken: string } | null>(null);
  // Coalesce concurrent session-creation attempts (snapshot effect and completion effect can both
  // need a session in the same tick) into a single request, in-flight promise shared between them.
  const sessionCreationRef = useRef<Promise<{ sessionId: string; writeToken: string } | null> | null>(null);
  const syncMetaRef = useRef({ lastSnapshotAt: 0, answeredSinceLastSnapshot: 0, lastSectionIndex: -1 });
  const hasCheckedResumeRef = useRef(false);

  // DIAG-V3-07: estado de "Guardar para después" y de recuperación por código. Ninguno de los dos se
  // persiste en `localStorage` (spec §29/§33: el recovery code nunca vive en el Browser Store, solo
  // en memoria de React mientras la persona lo copia); una recarga de página lo descarta, como
  // corresponde a un secreto de exposición única.
  const [saveState, setSaveState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "saved"; recoveryCode: string; expiresAt: string }
    | { status: "already_saved"; expiresAt: string }
    | { status: "error"; error: string }
  >({ status: "idle" });
  const [showRecoverForm, setShowRecoverForm] = useState(false);
  const [recoverInput, setRecoverInput] = useState("");
  const [recoverState, setRecoverState] = useState<{ status: "idle" | "recovering" | "error"; error?: string }>({ status: "idle" });

  async function ensureServerSession(): Promise<{ sessionId: string; writeToken: string } | null> {
    if (sessionRef.current) return sessionRef.current;
    if (!sessionCreationRef.current) {
      sessionCreationRef.current = createServerSession().then((created) => {
        sessionCreationRef.current = null;
        if (!created) return null;
        const session = { sessionId: created.sessionId, writeToken: created.writeToken };
        sessionRef.current = session;
        return session;
      });
    }
    return sessionCreationRef.current;
  }

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
  const saveEligible = !complete && canOfferSaveForLater(answers);

  const answer = (question: Question, value: string) => {
    const next = applyAnswer(answers, question, value);
    setAnswers(next);
    if (question.id === "profile" && next.profile !== answers.profile && typeof next.profile === "string") {
      setSearchParams(new URLSearchParams({ [PROFILE_PARAM]: next.profile }), { replace: true, preventScrollReset: true });
    }
    // Hallazgo de la revisión independiente de DIAG-V3-07: sin esto, la tarjeta/nota de un SAVE
    // anterior seguía mostrándose (y el botón "Guardar para después" desaparecía) aunque la persona
    // ya hubiera respondido preguntas nuevas que ESE código/checkpoint no cubre — la copy prometía
    // continuar exactamente donde se guardó, no donde se guardó más lo respondido después.
    if (saveState.status !== "idle") setSaveState({ status: "idle" });
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
    sessionCreationRef.current = null;
    syncMetaRef.current = { lastSnapshotAt: 0, answeredSinceLastSnapshot: 0, lastSectionIndex: -1 };
    setSaveState({ status: "idle" });
    setShowRecoverForm(false);
    setRecoverInput("");
    setRecoverState({ status: "idle" });
    navigate(DIAGNOSTIC_PATH, { replace: true, preventScrollReset: true });
  };

  /**
   * DIAG-V3-07 §27/§36: acción explícita, distinta del autosave silencioso — sí informa el resultado.
   * `regenerateCode` es la salida explícita cuando la persona perdió el código de un SAVE anterior sin
   * haber cambiado ninguna respuesta desde entonces (retry idéntico → normalmente no vuelve a
   * exponerlo, spec §11); nunca se dispara automáticamente, solo desde el botón dedicado.
   */
  const handleSaveForLater = async (options: { regenerate?: boolean } = {}) => {
    setSaveState({ status: "saving" });
    const session = await ensureServerSession();
    if (!session) {
      setSaveState({ status: "error", error: "No se pudo conectar con el servidor. Intenta de nuevo en un momento." });
      return;
    }
    const questionsAnsweredNow = applicable.filter((question) => isAnswered(question, answers)).length;
    const outcome = await saveSessionForLater(session.sessionId, {
      writeToken: session.writeToken,
      answers,
      currentQuestionId: currentQuestion?.id ?? null,
      questionsSeen: applicable.length,
      questionsAnswered: questionsAnsweredNow,
      regenerateCode: options.regenerate,
    });
    if (!outcome.ok) {
      setSaveState({ status: "error", error: outcome.error });
      return;
    }
    setSaveState(outcome.status === "saved" ? { status: "saved", recoveryCode: outcome.recoveryCode, expiresAt: outcome.expiresAt } : { status: "already_saved", expiresAt: outcome.expiresAt });
  };

  /**
   * DIAG-V3-07 §18/§19/§33: adopta la sesión recuperada (nuevo `writeToken`, respuestas canónicas del
   * servidor) igual que el auto-resume same-browser, pero disparado por una persona, no por leer el
   * Browser Store. `hasCheckedResumeRef` se marca para que el efecto de restauración no compita con
   * este resultado en la misma pasada.
   */
  const handleRecover = async () => {
    setRecoverState({ status: "recovering" });
    const outcome = await recoverSession(recoverInput);
    if (!outcome.ok) {
      setRecoverState({ status: "error", error: outcome.error });
      return;
    }
    hasCheckedResumeRef.current = true;
    sessionCreationRef.current = null;
    sessionRef.current = { sessionId: outcome.sessionId, writeToken: outcome.writeToken };
    const now = Date.now();
    browserStore.write({
      sessionId: outcome.sessionId as DiagnosticSessionId,
      writeToken: outcome.writeToken,
      versions: outcome.versions,
      status: outcome.snapshot.status,
      startedAt: now,
      lastActivityAt: now,
      revision: outcome.snapshot.revision,
      currentQuestionId: outcome.snapshot.currentQuestionId,
      answers: outcome.snapshot.answers,
      questionsSeen: outcome.snapshot.questionsSeen,
      questionsAnswered: outcome.snapshot.questionsAnswered,
      serverCompleted: false,
    });
    setAnswers(outcome.snapshot.answers);
    setStep(getInitialStep(outcome.snapshot.answers));
    setShowRecoverForm(false);
    setRecoverInput("");
    setRecoverState({ status: "idle" });
    setSaveState({ status: "idle" });
    navigate(DIAGNOSTIC_PATH, { replace: true, preventScrollReset: true });
  };

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [complete, currentQuestion?.id]);

  // DIAG-V3-06 §10/§11/§16/§37: un único efecto de sincronización, no dos. La restauración
  // (same-browser auto-resume) y el guardado local/red viven en el MISMO efecto para que la primera
  // pasada (con el estado inicial "de servidor", antes de resumir) nunca alcance a escribir un
  // registro incompleto en `localStorage` que una segunda pasada (con las respuestas ya resumidas)
  // no llegue a corregir a tiempo. Repartirlo en dos efectos separados es exactamente lo que producía
  // el hallazgo empírico más grave de esta fase: en desarrollo, React invoca los efectos dos veces por
  // montaje (StrictMode); la restauración corría primero y programaba `setAnswers(merged)`, pero el
  // efecto de guardado, declarado después, corría en la MISMA pasada todavía con las respuestas del
  // deep link nada más y sobrescribía el registro completo con uno de una sola respuesta — verificado
  // en vivo con logging temporal contra el Worker local antes de esta corrección.
  //
  // Restaurar solo puede pasar en el cliente (nunca durante SSR ni en el primer render de hidratación,
  // ver el comentario de `initialAnswers` arriba) y solo una vez por montaje real — nunca cuando
  // `searchParams` cambia dentro de la misma sesión (cambiar de perfil no es una recarga), de ahí
  // `hasCheckedResumeRef`. `answer()` fija `?perfil=` en la URL en cuanto se elige un perfil (para que
  // el enlace sea compartible) y esa marca sobrevive el resto del recorrido — así que la URL de una
  // recarga a mitad de diagnóstico normalmente SIGUE teniendo el mismo `?perfil=` que ya se había
  // resuelto. Tratar cualquier `?perfil=` como "deep link nuevo" descartaría el resto de las
  // respuestas en cada recarga real. La regla real: un deep link "gana" únicamente cuando CONTRADICE
  // lo que ya había en el snapshot (perfil u objetivo distintos al guardado); si coincide o el
  // snapshot no tiene ese campo todavía, se resume con todo lo demás, combinando el deep link sobre lo
  // resumido (nunca reemplazándolo entero). Si no se resume, se limpia cualquier registro viejo
  // (hallazgo I1 de la revisión independiente): nunca debe sobrevivir un `serverCompleted`/`sessionId`
  // de un intento anterior hacia uno nuevo.
  useEffect(() => {
    if (!hasCheckedResumeRef.current) {
      hasCheckedResumeRef.current = true;
      const resumable = browserStore.canAutoResume() ? browserStore.read() : null;
      const storedAnswers = resumable?.answers as Record<string, unknown> | undefined;
      const deepLinkConflicts = storedAnswers
        ? Object.entries(initialAnswers as Record<string, unknown>).some(([key, value]) => storedAnswers[key] !== undefined && storedAnswers[key] !== value)
        : false;
      const resumed = resumable && !deepLinkConflicts ? resumable : null;

      if (resumed) {
        const merged = { ...resumed.answers, ...initialAnswers };
        // Hallazgo I2: adoptar la sesión resumida aquí, o cada recarga con auto-resume crearía una
        // sesión de servidor nueva y dejaría huérfana la anterior en D1.
        if (resumed.sessionId && resumed.writeToken) sessionRef.current = { sessionId: resumed.sessionId, writeToken: resumed.writeToken };
        setAnswers(merged);
        setStep(getInitialStep(merged));
        // Esta pasada no escribe nada: `answers` todavía es el estado previo a resumir. La próxima
        // ejecución de este mismo efecto, disparada por el cambio de estado de arriba, ya verá
        // `merged` y seguirá el camino normal de guardado más abajo.
        return;
      }

      browserStore.clear();
    }

    // Nada que persistir todavía (ni siquiera un perfil elegido): no escribir un registro vacío.
    if (Object.keys(answers).length === 0) return;

    const now = Date.now();
    const previous = browserStore.read();
    const questionsAnswered = applicable.filter((question) => isAnswered(question, answers)).length;

    const record: DiagnosticBrowserRecord = {
      sessionId: (sessionRef.current?.sessionId ?? null) as DiagnosticSessionId | null,
      writeToken: sessionRef.current?.writeToken ?? null,
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

    // Hallazgo C1 de la revisión independiente: nunca enviar un snapshot de red al mismo tiempo que
    // se completa. Antes, ambas llamadas competían y una `snapshotDiagnosticSession` en vuelo podía
    // llegar después de `completeDiagnosticSession` y devolver la sesión a IN_PROGRESS, rompiendo la
    // idempotencia y el orden de borrado de KV. La finalización ya envía las respuestas completas: no
    // hace falta un snapshot final adicional (spec §16 se cumple igual, con una sola escritura).
    if (questionsAnswered === 0 || complete) return;

    const meta = syncMetaRef.current;
    const crossedSectionBoundary = meta.lastSectionIndex !== -1 && meta.lastSectionIndex !== progress.sectionIndex;
    meta.lastSectionIndex = progress.sectionIndex;
    meta.answeredSinceLastSnapshot += 1;

    let cancelled = false;
    (async () => {
      // Hallazgo I3: la sesión ya existe en D1 en cuanto el servidor responde, aunque este efecto se
      // haya cancelado mientras tanto (por ejemplo, varias respuestas seguidas en menos de un RTT).
      // `ensureServerSession` la adopta siempre (vía `sessionRef.current`, compartido con el efecto de
      // finalización); solo el envío del snapshot en sí se cancela.
      const session = await ensureServerSession();
      if (!session || cancelled) return;
      if (session.sessionId !== record.sessionId) {
        browserStore.write({ ...record, sessionId: session.sessionId as DiagnosticSessionId, writeToken: session.writeToken });
      }

      const shouldFlush = shouldFlushSnapshot({
        answeredSinceLastSnapshot: meta.answeredSinceLastSnapshot,
        msSinceLastSnapshot: now - meta.lastSnapshotAt,
        crossedSectionBoundary,
        isBeforeCompletion: false,
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
  // rediseño). Un fallo de red deja el resultado local visible igual, sin fingir que se guardó. Es la
  // ÚNICA llamada de red que se hace mientras `complete` es verdadero (ver hallazgo C1 arriba).
  useEffect(() => {
    if (!complete) return;
    if (browserStore.read()?.serverCompleted) return;

    let cancelled = false;
    (async () => {
      // Comparte `ensureServerSession` con el efecto de snapshot (arriba): si ambos se disparan en el
      // mismo tick (una sesión típica de pocas preguntas puede completarse antes de que termine su
      // propia creación), coalescen en la misma petición de creación en vez de competir o de que la
      // finalización se quede sin sesión y nunca se envíe.
      const session = await ensureServerSession();
      if (!session || cancelled) return;
      const outcome = await sendCompletion(session.sessionId, session.writeToken, answers);
      if (cancelled || !outcome) return;
      const latest = browserStore.read();
      if (latest) browserStore.write({ ...latest, sessionId: session.sessionId as DiagnosticSessionId, writeToken: session.writeToken, serverCompleted: true });
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
              tu correo ni crear una cuenta: usamos un identificador aleatorio para que puedas
              continuar si recargas la página.
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

          {!complete ? (
            <div className="diagnostic-recover">
              {showRecoverForm ? (
                <form
                  className="diagnostic-recover__form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (recoverState.status !== "recovering") void handleRecover();
                  }}
                >
                  <label htmlFor="diagnostic-recover-code">Código de recuperación</label>
                  <div className="diagnostic-recover__row">
                    <input
                      autoComplete="off"
                      id="diagnostic-recover-code"
                      onChange={(event) => setRecoverInput(event.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      value={recoverInput}
                    />
                    <button className="button button--secondary" disabled={recoverState.status === "recovering" || !recoverInput.trim()} type="submit">
                      {recoverState.status === "recovering" ? "Buscando…" : "Continuar"}
                    </button>
                    <button
                      className="button button--secondary"
                      onClick={() => {
                        setShowRecoverForm(false);
                        setRecoverState({ status: "idle" });
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>
                  {recoverState.status === "error" ? <p className="diagnostic-recover__error" role="alert">{recoverState.error}</p> : null}
                </form>
              ) : (
                <button className="text-link diagnostic-recover__toggle" onClick={() => setShowRecoverForm(true)} type="button">
                  ¿Ya tienes un código? Continuar diagnóstico
                </button>
              )}
            </div>
          ) : null}

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
              {saveEligible ? (
                <div className="diagnostic-save-for-later">
                  {saveState.status === "saved" ? (
                    <SaveForLaterCard expiresAt={saveState.expiresAt} recoveryCode={saveState.recoveryCode} />
                  ) : saveState.status === "already_saved" ? (
                    <div className="diagnostic-save-for-later__note">
                      <p>Ya guardamos este diagnóstico antes; tu código de recuperación sigue siendo el mismo que copiaste.</p>
                      <button className="text-link" onClick={() => void handleSaveForLater({ regenerate: true })} type="button">
                        ¿Perdiste tu código? Generar uno nuevo <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="button button--secondary diagnostic-save-for-later__button"
                      disabled={saveState.status === "saving"}
                      onClick={() => void handleSaveForLater()}
                      type="button"
                    >
                      {saveState.status === "saving" ? "Guardando…" : "Guardar para después"}
                    </button>
                  )}
                  {saveState.status === "error" ? <p className="diagnostic-save-for-later__error" role="alert">{saveState.error}</p> : null}
                </div>
              ) : null}
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

/**
 * DIAG-V3-07 §27/§32: muestra el código UNA sola vez (nunca vuelve a pedirse al servidor). Aclara
 * explícitamente que no es cifrado y que quien lo tenga puede recuperar este diagnóstico concreto,
 * sin prometer anonimato absoluto ni identidad (spec §31/§32).
 */
function SaveForLaterCard({ expiresAt, recoveryCode }: { expiresAt: string; recoveryCode: string }) {
  const [copied, setCopied] = useState(false);
  const expiresLabel = new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date(expiresAt));

  return (
    <aside aria-label="Código para continuar más tarde" className="diagnostic-save-for-later__card" role="status">
      <p className="eyebrow">GUARDA ESTE CÓDIGO</p>
      <p className="diagnostic-save-for-later__code" aria-label={`Tu código: ${recoveryCode}`}>{recoveryCode}</p>
      <button
        className="button button--secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(recoveryCode);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
        type="button"
      >
        {copied ? "Copiado" : "Copiar código"}
      </button>
      <p>
        Con este código puedes continuar el diagnóstico desde otro dispositivo o navegador, sin cuenta
        ni correo. No es un cifrado de tus respuestas: quien lo tenga puede continuar este diagnóstico.
        Guárdalo en un lugar seguro — no podremos volver a mostrártelo.
      </p>
      <p className="diagnostic-save-for-later__expiry">Disponible hasta el {expiresLabel}.</p>
    </aside>
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
        Es anónimo: no necesitas cuenta ni datos de identidad. Si recargas la página en este mismo navegador puedes continuar donde quedaste; puedes rehacerlo cuando cambie tu situación.
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
