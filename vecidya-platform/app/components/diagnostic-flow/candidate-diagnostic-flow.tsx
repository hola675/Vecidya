import { useCallback, useEffect, useMemo, useState } from "react";

import { FlowErrorScreen, PreparingScreen, ResetConfirm, ResumeScreen, StartScreen } from "./flow-screens";
import { QuestionStep } from "./question-step";
import { CandidateDiagnosticResult } from "./candidate-result";
import {
  CANDIDATE_SESSION_STORAGE_KEY_V3,
  CandidateSessionStoreV3,
  completeCandidateSessionV3,
  createCandidateSessionV3,
  currentCandidateQuestionIdV3,
  goBackCandidateV3,
  submitCandidateAnswerV3,
  toggleCandidateMultiAnswerV3,
  type CandidateSessionV3,
} from "../../features/diagnostic/qbv2-candidate-session";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../features/diagnostic/qbv2-reviewed-evidence";
import { renderQuestionV2 } from "../../features/diagnostic/qbv2-copy";
import { buildCandidateQuestionPlanV3 } from "../../features/diagnostic/qbv2-candidate-planner";
import type { CandidatePipelineResultV3 } from "../../features/diagnostic/qbv2-candidate-pipeline";
import type { ProgressV3, PresentedQuestionV3 } from "../../features/diagnostic/qbv2-session";

type View = "start" | "resume" | "flow" | "preparing" | "result" | "error" | "conflict";
const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
const definitions = new Map(bank.map((question) => [question.id, question]));
const sessionId = () => globalThis.crypto?.randomUUID?.() ?? `candidate-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const tabId = () => globalThis.crypto?.randomUUID?.() ?? `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function CandidateDiagnosticFlow() {
  const store = useMemo(() => new CandidateSessionStoreV3(), []);
  const [ownerId] = useState(tabId);
  const [session, setSession] = useState<CandidateSessionV3 | null>(null);
  const [storedSession, setStoredSession] = useState<CandidateSessionV3 | null>(null);
  const [view, setView] = useState<View>("start");
  const [draft, setDraft] = useState<{ key: string; value: string | readonly string[] | undefined }>({ key: "", value: undefined });
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [candidateResult, setCandidateResult] = useState<CandidatePipelineResultV3 | null>(null);

  useEffect(() => {
    const stored = store.read(Date.now());
    if (stored) { setStoredSession(stored); setView("resume"); }
  }, [store]);
  useEffect(() => {
    if (!session || view === "resume" || view === "conflict") return;
    const outcome = store.write(session);
    if (outcome === "conflict") setView("conflict");
  }, [session, store, view]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CANDIDATE_SESSION_STORAGE_KEY_V3 || !session || !event.newValue) return;
      try {
        const remote = JSON.parse(event.newValue) as Partial<CandidateSessionV3>;
        if (remote.sessionId === session.sessionId && remote.writerId !== ownerId && Number(remote.revision) >= session.revision) setView("conflict");
      } catch { setView("conflict"); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ownerId, session]);

  const reset = useCallback(() => {
    store.clear(); setSession(null); setStoredSession(null); setCandidateResult(null); setView("start"); setError(null); setConfirmReset(false);
  }, [store]);
  const requestReset = () => {
    const progress = session ?? storedSession;
    if (progress && progress.answeredQuestionIds.length > 0) setConfirmReset(true); else reset();
  };
  const start = () => {
    const next = createCandidateSessionV3({ sessionId: sessionId(), writerId: ownerId, now: Date.now() });
    setSession(next); setStoredSession(null); setCandidateResult(null); setView("flow"); setError(null);
  };
  const resume = (stored: CandidateSessionV3) => {
    // Resume claims this tab with a new revision; any other tab holding the old revision fails closed.
    const claimed = { ...stored, writerId: ownerId, revision: stored.revision + 1, updatedAt: Date.now() };
    setSession(claimed); setStoredSession(null); setView(claimed.status === "completed" ? "preparing" : "flow");
    if (claimed.status === "completed") finish(claimed);
  };
  const finish = (current: CandidateSessionV3) => {
    setView("preparing");
    window.setTimeout(() => {
      const completed = completeCandidateSessionV3(current, ownerId, Date.now());
      if (!completed) { setView("error"); return; }
      setSession(completed.session); setCandidateResult(completed.result); setView("result");
    }, 0);
  };
  const questionId = session ? currentCandidateQuestionIdV3(session) : null;
  const plan = session ? buildCandidateQuestionPlanV3({ answers: session.answers }) : null;
  const definition = questionId ? definitions.get(questionId) : undefined;
  const rendered = definition && plan ? renderQuestionV2(definition, { context: plan.context, answers: plan.activeAnswers }) : null;
  const presented: PresentedQuestionV3 | null = rendered && questionId ? {
    question: rendered,
    savedValue: session?.answers[questionId],
    aboutPreparation: rendered.profile === "prelaunch",
    foundational: !!definition && !definition.purpose.includes("diagnostic") && definition.purpose.some((purpose) => ["anchor", "classification", "maturity", "goal", "friction"].includes(purpose)),
  } : null;
  const draftKey = session ? `${questionId}:${session.reviewIndex ?? "live"}:${session.answeredQuestionIds.length}` : "";
  const value = draft.key === draftKey ? draft.value : presented?.savedValue;
  const progress: ProgressV3 = (() => {
    const context = !!presented?.foundational;
    const stageIndex = view === "preparing" || view === "result" ? 3 : context ? 0 : 1;
    const stages = ["context", "deepening", "final_checks", "preparing"] as const;
    return { stage: stages[stageIndex]!, stageIndex, answered: session?.answeredQuestionIds.length ?? 0 };
  })();

  const select = (option: string) => {
    if (!definition || !presented) return;
    const next = definition.type === "multi" ? toggleCandidateMultiAnswerV3(definition, Array.isArray(value) ? value : [], option) : option;
    setDraft({ key: draftKey, value: next }); setError(null);
  };
  const submit = () => {
    if (!session || !questionId || !presented) return;
    const outcome = submitCandidateAnswerV3(session, questionId, value, ownerId, Date.now());
    if (!outcome.ok) { setError(outcome.reason === "required" ? "Elige al menos una opción para continuar." : "La respuesta no coincide con las opciones disponibles. Vuelve a elegir."); return; }
    setSession(outcome.session); setError(null); setDraft({ key: "", value: undefined });
  };
  const back = () => { if (session) { setSession(goBackCandidateV3(session, ownerId, Date.now())); setError(null); } };

  let content;
  if (view === "start") content = <StartScreen onStart={start} />;
  else if (view === "resume" && storedSession) content = <ResumeScreen answered={storedSession.answeredQuestionIds.length} completed={storedSession.status === "completed"} onContinue={() => resume(storedSession)} onRestart={requestReset} />;
  else if (view === "preparing") content = <PreparingScreen />;
  else if (view === "conflict") content = <section aria-labelledby="candidate-conflict-title" className="df-screen" role="alert"><h1 className="df-screen__title" id="candidate-conflict-title">Esta sesión se está editando en otra pestaña</h1><p className="df-screen__lead">Para conservar las respuestas más recientes, esta pestaña quedó en pausa. Recarga la página para continuar con la versión guardada.</p><button className="button button--primary" onClick={() => window.location.reload()} type="button">Recargar sesión</button></section>;
  else if (view === "error") content = <FlowErrorScreen message="No pudimos reconstruir el resultado candidato. Tus respuestas siguen guardadas." onRetry={() => session && finish(session)} onRestart={requestReset} title="No pudimos preparar el resultado de prueba" />;
  else if (view === "result" && candidateResult && session) content = <CandidateDiagnosticResult result={candidateResult} onEdit={() => { setDraft({ key: "", value: undefined }); setSession(goBackCandidateV3(session, ownerId, Date.now())); setCandidateResult(null); setView("flow"); }} />;
  else if (session?.status === "completing") content = <section aria-labelledby="candidate-ready-title" className="df-screen df-ready"><p className="df-screen__kicker">Candidata de prueba</p><h1 className="df-screen__title" id="candidate-ready-title">Terminó la ruta adaptativa</h1><p className="df-screen__lead">La ruta se cierra con el motivo definido por el planner. El resultado se reconstruirá desde las respuestas al continuar.</p><p>Motivo terminal: <code>{session.terminalReason}</code></p><div className="df-screen__actions"><button className="button button--primary" onClick={() => finish(session)} type="button">Reconstruir resultado candidato</button><button className="button button--secondary" onClick={back} type="button">Revisar última respuesta</button></div></section>;
  else if (session && presented) content = <><QuestionStep canGoBack={session.answeredQuestionIds.length > 0 && session.reviewIndex !== 0} error={error} onBack={back} onSelect={select} onSubmit={submit} presented={presented} progress={progress} reviewing={session.reviewIndex !== null} value={value} /><p className="df-restart"><button className="df-link-button" onClick={requestReset} type="button">Empezar de nuevo</button></p></>;
  else content = <FlowErrorScreen message="El planner no produjo una pregunta utilizable. La sesión se conserva para reanudar o reiniciar." onRetry={() => session && setSession({ ...session })} onRestart={requestReset} title="No encontramos la siguiente pregunta" />;

  return <div className={`df-flow df-flow--${view}`}><div className="df-screen__kicker" role="note">Entorno local de prueba · Motor candidato inactivo en producción</div>{confirmReset ? <ResetConfirm onCancel={() => setConfirmReset(false)} onConfirm={reset} /> : null}{content}</div>;
}
