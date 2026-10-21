import { useCallback, useEffect, useMemo, useState } from "react";

import {
  canGoBackV3,
  createSessionV3,
  currentQuestionIdV3,
  DiagnosticSessionStoreV3,
  goBackV3,
  presentQuestionV3,
  progressV3,
  QUESTION_BANK_V2,
  submitAnswerV3,
  toggleMultiValueV3,
  type AnswerValueV3,
  type DiagnosticSessionV3,
} from "../../features/diagnostic";
import { isAnonymousDiagnosticResponseV1, isAnonymousDiagnosticSummaryV1, type AnonymousDiagnosticSummaryV1 } from "../../features/diagnostic/anonymous-summary";
import type { PublicDiagnosticEngineIdentityV1 } from "../../features/diagnostic/public-diagnostic-engine-identity";
import { IdentifiedDiagnosticRequestForm, DiagnosticVerificationPending } from "./identified-diagnostic-request-form";

import { ANONYMOUS_START_COPY, ERROR_COPY, REQUIRED_MULTI } from "./flow-copy";
import { AnonymousSummaryScreen } from "./anonymous-summary-screen";
import { FlowErrorScreen, PreparingScreen, ReadyScreen, ResetConfirm, ResumeScreen, StartScreen } from "./flow-screens";
import { QuestionStep } from "./question-step";

type View =
  | { readonly kind: "start" }
  | { readonly kind: "resume"; readonly stored: DiagnosticSessionV3 }
  | { readonly kind: "flow" }
  | { readonly kind: "preparing" }
  | { readonly kind: "result"; readonly summary: AnonymousDiagnosticSummaryV1; readonly engineIdentity: PublicDiagnosticEngineIdentityV1 | null }
  | { readonly kind: "identify" }
  | { readonly kind: "verification-pending"; readonly requestId: string }
  | { readonly kind: "legacy" }
  | { readonly kind: "error" };

type StoredSummaryV1 = { readonly version: 1; readonly status: "pending" } | { readonly version: 1; readonly status: "ready"; readonly summary: AnonymousDiagnosticSummaryV1; readonly engineIdentity?: PublicDiagnosticEngineIdentityV1 };
const summaryKey = (sessionId: string) => "vecidya.diagnostic.v3.anonymous-summary.1." + encodeURIComponent(sessionId);
const sendFunnelEvent = (event: "diagnostic_started" | "detailed_report_cta_clicked") => {
  if (!import.meta.env.DEV) return;
  void fetch("/api/diagnostic/funnel-analytics", {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => undefined);
};

function readStoredSummary(sessionId: string): StoredSummaryV1 | null {
  try {
    const raw = window.localStorage.getItem(summaryKey(sessionId));
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return null;
    const value = stored as Record<string, unknown>;
    if (value.version !== 1) return null;
    if (value.status === "pending") return { version: 1, status: "pending" };
    if (value.status === "ready" && isAnonymousDiagnosticSummaryV1(value.summary)) return { version: 1, status: "ready", summary: value.summary, ...(typeof value.engineIdentity === "object" && value.engineIdentity !== null ? { engineIdentity: value.engineIdentity as PublicDiagnosticEngineIdentityV1 } : {}) };
    return null;
  } catch {
    return null;
  }
}

function writeStoredSummary(sessionId: string, stored: StoredSummaryV1) {
  window.localStorage.setItem(summaryKey(sessionId), JSON.stringify(stored));
}

function clearStoredSummary(sessionId: string | null | undefined) {
  if (!sessionId) return;
  try { window.localStorage.removeItem(summaryKey(sessionId)); } catch { /* best-effort cleanup */ }
}

const newSessionId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : "v3-" + Date.now() + "-" + Math.random().toString(36).slice(2);

/** Flujo público anónimo: las respuestas van al Worker solo para calcular la proyección permitida. */
export function AnonymousDiagnosticFlow() {
  const store = useMemo(() => new DiagnosticSessionStoreV3(), []);
  const [session, setSession] = useState<DiagnosticSessionV3 | null>(null);
  const [view, setView] = useState<View>({ kind: "start" });
  const [draft, setDraft] = useState<{ readonly key: string; readonly value: AnswerValueV3 | undefined }>({ key: "", value: undefined });
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resultIdentity, setResultIdentity] = useState<PublicDiagnosticEngineIdentityV1 | null>(null);
  const [activeSummary, setActiveSummary] = useState<AnonymousDiagnosticSummaryV1 | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  useEffect(() => {
    const stored = store.read(Date.now());
    if (stored) setView({ kind: "resume", stored });
  }, [store]);
  useEffect(() => { if (session) store.write(session); }, [session, store]);

  const reset = useCallback(() => {
    clearStoredSummary(session?.sessionId);
    store.clear();
    setSession(null);
    setResultIdentity(null);
    setActiveSummary(null);
    setPendingRequestId(null);
    setView({ kind: "start" });
    setError(null);
    setConfirmReset(false);
  }, [session, store]);
  const requestReset = () => {
    const progress = session ?? (view.kind === "resume" ? view.stored : null);
    if (progress && progress.answeredQuestionIds.length > 0) setConfirmReset(true);
    else reset();
  };

  const finish = useCallback(async (current: DiagnosticSessionV3) => {
    setView({ kind: "preparing" });
    try {
      writeStoredSummary(current.sessionId, { version: 1, status: "pending" });
      const answers = current.answeredQuestionIds.map((questionId) => ({
        questionId,
        value: current.answers[questionId],
      }));
      if (answers.some((entry) => entry.value === undefined)) throw new Error("Incomplete answers");
      const response = await fetch("/api/diagnostic/anonymous-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error("Summary request failed");
      const payload: unknown = await response.json();
      if (!isAnonymousDiagnosticResponseV1(payload)) throw new Error("Invalid summary response");
      const { summary, engineIdentity } = payload;
      writeStoredSummary(current.sessionId, { version: 1, status: "ready", summary, engineIdentity });
      setSession({ ...current, status: "completed" });
      setResultIdentity(engineIdentity);
      setActiveSummary(summary);
      setView({ kind: "result", summary, engineIdentity });
    } catch {
      setSession(current);
      setView({ kind: "error" });
    }
  }, []);

  const start = () => {
    sendFunnelEvent("diagnostic_started");
    setSession(createSessionV3({ sessionId: newSessionId(), now: Date.now() }));
    setResultIdentity(null);
    setActiveSummary(null);
    setView({ kind: "flow" });
    setError(null);
  };
  const resume = (stored: DiagnosticSessionV3) => {
    setSession(stored);
    if (stored.status === "completing" || stored.status === "completed" || stored.status === "error") {
      const priorSummary = readStoredSummary(stored.sessionId);
      if (priorSummary?.status === "ready") { const engineIdentity = priorSummary.engineIdentity ?? null; setResultIdentity(engineIdentity); setActiveSummary(priorSummary.summary); setView({ kind: "result", summary: priorSummary.summary, engineIdentity }); }
      else if (priorSummary?.status === "pending") void finish(stored);
      else setView({ kind: "legacy" });
    } else setView({ kind: "flow" });
  };

  const questionId = session ? currentQuestionIdV3(session) : null;
  const presented = session && view.kind === "flow" ? presentQuestionV3(session) : null;
  const draftKey = (questionId ?? "") + ":" + (session?.reviewIndex ?? "live") + ":" + (session?.answeredQuestionIds.length ?? 0);
  const value = draft.key === draftKey ? draft.value : presented?.savedValue;
  const select = (option: string) => {
    if (!presented) return;
    const definition = QUESTION_BANK_V2.find((question) => question.id === presented.question.id);
    if (!definition) return;
    const next = definition.type === "multi" ? toggleMultiValueV3(definition, Array.isArray(value) ? value : [], option) : option;
    setDraft({ key: draftKey, value: next });
    setError(null);
  };
  const submit = () => {
    if (!session || !questionId || !presented) return;
    const result = submitAnswerV3(session, questionId, value, Date.now());
    if (!result.ok) {
      setError(result.error === "required" && presented.question.type === "multi" ? REQUIRED_MULTI : ERROR_COPY[result.error]);
      return;
    }
    setSession(result.session);
    setError(null);
  };
  const back = () => { if (session) { setSession(goBackV3(session, Date.now())); setError(null); } };

  let content;
  if (view.kind === "start") content = <StartScreen copy={ANONYMOUS_START_COPY} onStart={start} />;
  else if (view.kind === "resume") {
    const completed = view.stored.status === "completed" || view.stored.status === "completing" || view.stored.status === "error";
    content = <ResumeScreen answered={view.stored.answeredQuestionIds.length} completed={completed} onContinue={() => resume(view.stored)} onRestart={requestReset} />;
  } else if (view.kind === "preparing") content = <PreparingScreen />;
  else if (view.kind === "legacy") content = <FlowErrorScreen
    message="Este diagnóstico se completó antes de habilitar el resumen anónimo. Conservamos sus respuestas en este navegador; empieza uno nuevo si quieres recibir el resumen, sin cambiar el resultado guardado."
    onRestart={requestReset}
    onRetry={requestReset}
    title="Tienes un resultado guardado anterior"
  />;
  else if (view.kind === "error") content = <FlowErrorScreen
    message="Tus respuestas siguen guardadas en este navegador. Revisa tu conexión y vuelve a intentarlo; el resultado no se guardó en el servidor."
    onRestart={requestReset}
    onRetry={() => session && void finish(session)}
    title="No pudimos preparar tu resumen"
  />;
  else if (view.kind === "result") content = <AnonymousSummaryScreen onRestart={requestReset} onRequestReport={() => { if (import.meta.env.DEV && view.engineIdentity && session) { sendFunnelEvent("detailed_report_cta_clicked"); setView({ kind: "identify" }); } }} reportRequestEnabled={Boolean(import.meta.env.DEV && view.engineIdentity && session)} summary={view.summary} />;
  else if (view.kind === "identify" && session && resultIdentity && activeSummary) content = <IdentifiedDiagnosticRequestForm source={{ payload: { engineIdentity: resultIdentity, answers: session.answeredQuestionIds.map((questionId) => ({ questionId, value: session.answers[questionId] })) } }} onCancel={() => setView({ kind: "result", summary: activeSummary, engineIdentity: resultIdentity })} onSubmitted={(requestId) => { setPendingRequestId(requestId); setView({ kind: "verification-pending", requestId }); }} />;
  else if (view.kind === "verification-pending" && pendingRequestId === view.requestId && activeSummary) content = <DiagnosticVerificationPending onBack={() => setView({ kind: "result", summary: activeSummary, engineIdentity: resultIdentity })} requestId={view.requestId} />;
  else if (session && session.status === "completing" && session.reviewIndex === null) {
    content = <>
      <ReadyScreen anonymousSummary onReview={back} onShowResult={() => void finish(session)} terminalReason={session.terminalReason} />
      <p className="df-restart"><button className="df-link-button" onClick={requestReset} type="button">Empezar de nuevo</button></p>
    </>;
  } else if (session && session.status === "deepening_required") {
    content = <FlowErrorScreen
      message="Aún necesitamos confirmar algunas áreas aplicables antes de mostrar una lectura que se pueda sostener."
      onRestart={requestReset}
      onRetry={requestReset}
      title="Necesitamos profundizar un poco más"
    />;
  } else if (session && presented) {
    content = <>
      <QuestionStep canGoBack={canGoBackV3(session)} error={error} onBack={back} onSelect={select} onSubmit={submit} presented={presented} progress={progressV3(session)} reviewing={session.reviewIndex !== null} value={value} />
      <p className="df-restart"><button className="df-link-button" onClick={requestReset} type="button">Empezar de nuevo</button></p>
    </>;
  } else {
    content = <FlowErrorScreen message="No encontramos la siguiente pregunta. Tus respuestas siguen guardadas." onRestart={requestReset} onRetry={() => session && setSession({ ...session })} title="Algo no salió como esperábamos" />;
  }

  return (
    <div className={"df-flow df-flow--" + view.kind}>
      {confirmReset ? <ResetConfirm onCancel={() => setConfirmReset(false)} onConfirm={reset} /> : null}
      {content}
    </div>
  );
}
