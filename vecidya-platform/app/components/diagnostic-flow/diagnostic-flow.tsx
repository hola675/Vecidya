import { Component, useCallback, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from "react";

import {
  canGoBackV3, completeSessionV3, createSessionV3, currentQuestionIdV3, DiagnosticSessionStoreV3, goBackV3, presentQuestionV3, progressV3,
  QUESTION_BANK_V2, resolveCommercialRecommendationAfterClarification, submitAnswerV3, toggleMultiValueV3, type AnswerValueV3, type CommercialClarificationAnswer, type DiagnosticResultV3, type DiagnosticSessionV3,
} from "../../features/diagnostic";
import { DiagnosticResult } from "../diagnostic-result";
import { REPORT_PATH } from "../diagnostic-report/report-path";

import { ERROR_COPY, REQUIRED_MULTI } from "./flow-copy";
import { FlowErrorScreen, PreparingScreen, ReadyScreen, ResetConfirm, ResumeScreen, StartScreen } from "./flow-screens";
import { QuestionStep } from "./question-step";

type View =
  | { readonly kind: "start" }
  | { readonly kind: "resume"; readonly stored: DiagnosticSessionV3 }
  | { readonly kind: "flow" }
  | { readonly kind: "preparing" }
  | { readonly kind: "result"; readonly result: DiagnosticResultV3 }
  | { readonly kind: "error" };

const newSessionId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `v3-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Si algo falla al dibujar, la sesión sigue guardada: se ofrece reintentar o empezar de nuevo, nunca una página en blanco. */
class FlowErrorBoundary extends Component<{ children: ReactNode; onRestart: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { if (import.meta.env.DEV) console.error("DiagnosticFlow", error, info.componentStack); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <FlowErrorScreen
        message="Tus respuestas siguen guardadas en este navegador. Puedes intentarlo de nuevo o empezar otra vez."
        onRestart={() => { this.setState({ failed: false }); this.props.onRestart(); }}
        onRetry={() => this.setState({ failed: false })}
        title="Algo salió mal al mostrar esta pantalla"
      />
    );
  }
}

export type DiagnosticFlowProps = {
  /** Solo la vista de desarrollo: panel de depuración con la sesión actual. */
  readonly renderDebug?: (session: DiagnosticSessionV3 | null) => ReactNode;
};

function resultWithCommercialClarification(result: DiagnosticResultV3, answers: DiagnosticSessionV3["answers"], clarificationAnswer?: CommercialClarificationAnswer): DiagnosticResultV3 {
  if (!clarificationAnswer) return result;
  return {
    ...result,
    outcome: {
      ...result.outcome,
      commercialRecommendation: resolveCommercialRecommendationAfterClarification({
        answers,
        digitalResult: result.outcome.commercialRecommendation.digitalResult,
        clarificationAnswer,
      }),
    },
  };
}

/**
 * DIAG-V3-10B — experiencia del diagnóstico adaptativo. Consume la sesión V3 (`qbv2-session.ts`), que a su vez
 * solo usa el planner, el resolver, el render de copy y el pipeline congelados. Sin reglas de ruteo propias, sin
 * historial del navegador por pregunta y sin datos en la URL: el progreso vive solo en este navegador.
 */
export function DiagnosticFlow({ renderDebug }: DiagnosticFlowProps) {
  const store = useMemo(() => new DiagnosticSessionStoreV3(), []);
  const [session, setSession] = useState<DiagnosticSessionV3 | null>(null);
  const [view, setView] = useState<View>({ kind: "start" });
  const [draft, setDraft] = useState<{ readonly key: string; readonly value: AnswerValueV3 | undefined }>({ key: "", value: undefined });
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Se lee después de montar: el HTML del servidor siempre es la pantalla de inicio (sin desajuste de hidratación).
  useEffect(() => {
    const stored = store.read(Date.now());
    if (stored) setView({ kind: "resume", stored });
  }, [store]);
  useEffect(() => { if (session) store.write(session); }, [session, store]);
  useEffect(() => { if (view.kind === "result") document.getElementById("dr-title")?.focus(); }, [view.kind]);

  const reset = useCallback(() => {
    store.clear();
    setSession(null);
    setView({ kind: "start" });
    setError(null);
    setConfirmReset(false);
  }, [store]);
  const requestReset = () => {
    const progress = session ?? (view.kind === "resume" ? view.stored : null);
    if (progress && progress.answeredQuestionIds.length > 0) setConfirmReset(true);
    else reset();
  };

  const finish = (current: DiagnosticSessionV3) => {
    setView({ kind: "preparing" });
    // Un cuadro para pintar «Preparando…»; el cálculo es local y rápido, sin esperas simuladas.
    window.setTimeout(() => {
      const completion = completeSessionV3(current, Date.now());
      setSession(completion.session);
      setView(completion.ok ? { kind: "result", result: completion.result } : { kind: "error" });
    }, 0);
  };

  const start = () => { setSession(createSessionV3({ sessionId: newSessionId(), now: Date.now() })); setView({ kind: "flow" }); setError(null); };
  const resume = (stored: DiagnosticSessionV3) => {
    setSession(stored);
    if (stored.status === "completed") finish(stored);
    else setView({ kind: "flow" });
  };

  const questionId = session ? currentQuestionIdV3(session) : null;
  const presented = session && view.kind === "flow" ? presentQuestionV3(session) : null;
  const draftKey = session ? `${questionId}:${session.reviewIndex ?? "live"}:${session.answeredQuestionIds.length}` : "";
  const value = draft.key === draftKey ? draft.value : presented?.savedValue;

  const select = (option: string) => {
    if (!presented) return;
    const definition = QUESTION_BANK_V2.find((question) => question.id === presented.question.id)!;
    const next = definition.type === "multi" ? toggleMultiValueV3(definition, Array.isArray(value) ? value : [], option) : option;
    setDraft({ key: draftKey, value: next });
    setError(null);
  };
  const submit = () => {
    if (!session || !questionId || !presented) return;
    const result = submitAnswerV3(session, questionId, value, Date.now());
    if (!result.ok) { setError(result.error === "required" && presented.question.type === "multi" ? REQUIRED_MULTI : ERROR_COPY[result.error]); return; }
    setSession(result.session);
    setError(null);
  };
  const back = () => { if (session) { setSession(goBackV3(session, Date.now())); setError(null); } };

  let content: ReactNode;
  if (view.kind === "start") content = <StartScreen onStart={start} />;
  else if (view.kind === "resume") content = <ResumeScreen answered={view.stored.answeredQuestionIds.length} completed={view.stored.status === "completed"} onContinue={() => resume(view.stored)} onRestart={requestReset} />;
  else if (view.kind === "preparing") content = <PreparingScreen />;
  else if (view.kind === "error") content = <FlowErrorScreen message="Tus respuestas están a salvo. Puedes volver a intentarlo." onRestart={requestReset} onRetry={() => session && finish(session)} title="No pudimos preparar tu resultado" />;
  else if (view.kind === "result") {
    content = (
      <>
       <DiagnosticResult
         narrative={view.result.narrative}
         onCommercialClarification={(answer) => setSession((current) => current ? { ...current, commercialClarificationAnswer: answer } : current)}
         outcome={resultWithCommercialClarification(view.result, session?.answers ?? {}, session?.commercialClarificationAnswer).outcome}
       />
        <div className="df-result-actions">
          {/* DIAG-V3-12: el informe se arma en su propia página, con el mismo resultado, y abre el diálogo para guardar PDF. */}
          <a className="button" href={`${REPORT_PATH}?print=1`} rel="noopener" target="_blank">Descargar informe PDF<span className="dr-sr-only"> (se abre en una pestaña nueva)</span></a>
          <button className="button button--secondary" onClick={requestReset} type="button">Empezar un diagnóstico nuevo</button>
        </div>
      </>
    );
  } else if (session && session.status === "completing" && session.reviewIndex === null) {
    content = (
      <>
        <ReadyScreen onReview={back} onShowResult={() => finish(session)} terminalReason={session.terminalReason} />
        <p className="df-restart"><button className="df-link-button" onClick={requestReset} type="button">Empezar de nuevo</button></p>
      </>
    );
  } else if (session && session.status === "deepening_required") {
    content = (
      <FlowErrorScreen
        message="Aún necesitamos confirmar algunas áreas aplicables antes de mostrar un resultado defendible."
        onRestart={requestReset}
        onRetry={requestReset}
        title="Necesitamos profundizar un poco más"
      />
    );
  } else if (session && presented) {
    content = (
      <>
        <QuestionStep
          canGoBack={canGoBackV3(session)}
          error={error}
          onBack={back}
          onSelect={select}
          onSubmit={submit}
          presented={presented}
          progress={progressV3(session)}
          reviewing={session.reviewIndex !== null}
          value={value}
        />
        <p className="df-restart"><button className="df-link-button" onClick={requestReset} type="button">Empezar de nuevo</button></p>
      </>
    );
  } else {
    content = <FlowErrorScreen message="No encontramos la siguiente pregunta. Tus respuestas siguen guardadas." onRestart={requestReset} onRetry={() => session && setSession({ ...session })} title="Algo no salió como esperábamos" />;
  }

  return (
    <div className={`df-flow df-flow--${view.kind}`}>
      <FlowErrorBoundary onRestart={reset}>
        {confirmReset ? <ResetConfirm onCancel={() => setConfirmReset(false)} onConfirm={reset} /> : null}
        {content}
      </FlowErrorBoundary>
      {renderDebug ? renderDebug(session) : null}
    </div>
  );
}
