import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { PublicLayout } from "../components/public-layout";
import {
  Qa03bV9ClassificationStep,
  type ClassificationDraftV9,
} from "../components/diagnostic-flow/qa03b-v9-classification-step";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../features/diagnostic/qa03b/specialty-branches-wave1";
import { QA03B_V9_CLASSIFICATION_INTERACTION_ID, type ClassificationSelectionV9 } from "../features/diagnostic/qa03b/v9-classification-bundle";
import {
  isV9PublicRuntimeAvailable,
  type V9PublicRuntimeConfig,
} from "../features/diagnostic/qa03b/v9-public-availability.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/diagnostic-v9-run";

export function meta() {
  return [
    { title: "Continuar diagnóstico V9 | Vecidya" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return {
    enabled: isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig),
    runId: params.runId,
  };
}

type RunState = {
  ok: true;
  runId: string;
  status: "active" | "completed";
  lastSeq: number;
  nextQuestionId: string | null;
  readyToFinalize: boolean;
  interactionCount: number;
  answers: Record<string, string | string[]>;
  terminalReason: string | null;
};

type CompletedResult = {
  status: "completed";
  resultVersion: number;
  score: unknown;
  evidence: unknown;
  recommendations: unknown;
};

const questionById = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((item) => [item.id, item] as const));

function recommendationItems(value: unknown): readonly { title: string; whatToImprove: string; expectedOutcome: string }[] {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) return [];
  return value.items.filter((item): item is { title: string; whatToImprove: string; expectedOutcome: string } =>
    typeof item === "object" && item !== null &&
    typeof item.title === "string" &&
    typeof item.whatToImprove === "string" &&
    typeof item.expectedOutcome === "string",
  ).slice(0, 3);
}


async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // The server may have returned a gateway or non-JSON error.
  }
  return "La solicitud no pudo completarse. Inténtalo de nuevo.";
}

export default function DiagnosticV9Run({ loaderData }: Route.ComponentProps) {
  const { enabled, runId } = loaderData;
  const [state, setState] = useState<RunState | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClassificationDraftV9>({});
  const [single, setSingle] = useState("");
  const [multiple, setMultiple] = useState<string[]>([]);
  const [result, setResult] = useState<CompletedResult | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/diagnostic/v9/runs/${encodeURIComponent(runId)}`, {
      cache: "no-store", credentials: "same-origin", signal,
    });
    if (!response.ok) throw new Error(await readError(response));
    const next = await response.json() as RunState;
    if (!next.ok || next.runId !== runId) throw new Error("El servidor devolvió un diagnóstico diferente.");
    setState(next);
    return next;
  }, [runId]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    void refresh(controller.signal).then(() => {
      setError(null);
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "No pudimos recuperar tu diagnóstico.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [enabled, refresh]);

  useEffect(() => {
    setSingle("");
    setMultiple([]);
    setDraft({});
  }, [state?.nextQuestionId]);

  const question = useMemo(
    () => state?.nextQuestionId ? questionById.get(state.nextQuestionId) : undefined,
    [state?.nextQuestionId],
  );

  async function sendEvent(kind: "answer" | "classification", payload: unknown) {
    if (!state || busy || !state.nextQuestionId || state.status !== "active") return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/diagnostic/v9/runs/${encodeURIComponent(runId)}/events`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: crypto.randomUUID(),
          expectedSeq: state.lastSeq,
          kind,
          payload,
          occurredAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos guardar la respuesta.");
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    if (!state || busy || !state.readyToFinalize) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/diagnostic/v9/runs/${encodeURIComponent(runId)}/finalize`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error(await readError(response));
      const completed = await response.json() as { ok?: boolean } & CompletedResult;
      if (!completed.ok || completed.status !== "completed") throw new Error("El resultado del diagnóstico no es válido.");
      setResult(completed);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos finalizar el diagnóstico.");
    } finally {
      setBusy(false);
    }
  }

  function submitClassification(selection: ClassificationSelectionV9) {
    const classification = {
      kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
      sector: selection.sector,
      ...(selection.niche === undefined ? {} : { niche: selection.niche }),
      sectorQuestionId: "q2_sector",
      ...(selection.niche === undefined ? {} : { nicheQuestionId: `q2_niche_${selection.sector}` }),
    };
    void sendEvent("classification", { classification, mode: "answer" });
  }

  function submitAnswer() {
    if (!question) return;
    const value = question.type === "multi" ? multiple : single;
    void sendEvent("answer", {
      questionId: question.id,
      value,
      mode: "answer",
    });
  }

  return (
    <PublicLayout>
      <main className="df-page">
        <section className="df-screen v9-diagnostic-screen" aria-labelledby="v9-run-heading">
          <div className="df-screen__header">
            <p className="df-screen__eyebrow">Vecidya · Diagnóstico V9</p>
            <h1 className="df-screen__title" id="v9-run-heading">Tu diagnóstico digital</h1>
            <p className="df-screen__lead">Tus respuestas se guardan en Vecidya y puedes recuperar este recorrido desde el mismo navegador o tu cuenta.</p>
          </div>
          {!enabled ? (
            <p role="status">V9 todavía no está habilitado. <Link to="/diagnostico">Usar el diagnóstico disponible</Link>.</p>
          ) : loading ? (
            <p role="status">Recuperando el historial…</p>
          ) : !state ? (
            <p role="alert">{error ?? "No se pudo recuperar el diagnóstico."} <Link to="/diagnostico/v9">Volver al inicio</Link>.</p>
          ) : (
            <>
              <p role="status">Interacciones completadas: {state.interactionCount} · Eventos guardados: {state.lastSeq}</p>
              {error ? <p role="alert" className="df-screen__note">{error}</p> : null}
              {state.status === "completed" ? (
                <div className="df-screen__note">
                  <h2>Diagnóstico completado</h2>
                  <p>El resultado está guardado y asociado a tu identidad.</p>
                  {result ? (
                    <>
                      <p>Versión del resultado: {result.resultVersion}</p>
                      <h3>Prioridades recomendadas</h3>
                      {recommendationItems(result.recommendations).length ? (
                        <ol className="v9-recommendations">
                          {recommendationItems(result.recommendations).map((item, index) => (
                            <li key={index}>
                              <strong>{item.title}</strong>
                              <p>{item.whatToImprove}</p>
                              <p>{item.expectedOutcome}</p>
                            </li>
                          ))}
                        </ol>
                      ) : <p>El resultado está guardado. Puedes revisarlo en tu historial personal.</p>}
                    </>
                  ) : null}
                  <p><Link to="/app/diagnosticos">Consultar mis diagnósticos</Link> o <Link to="/login?redirectTo=%2Fapp%2Fdiagnosticos">iniciar sesión para recuperar tu historial</Link>.</p>
                </div>
              ) : state.readyToFinalize ? (
                <div>
                  <h2>Ya tenemos información para tu diagnóstico</h2>
                  <p>Hemos terminado el recorrido. Puedes generar el resultado a partir de tus respuestas verificadas.</p>
                  <button className="button button--primary" type="button" disabled={busy} onClick={() => void finalize()}>
                    {busy ? "Preparando resultado…" : "Finalizar y ver resultado"}
                  </button>
                </div>
              ) : state.nextQuestionId === "q2_sector" ? (
                <Qa03bV9ClassificationStep
                  value={draft}
                  progress={{ stage: "context", stageIndex: 0, answered: state.interactionCount }}
                  error={error}
                  reviewing={false}
                  canGoBack={false}
                  entityType={typeof state.answers.q2_entity === "string" ? state.answers.q2_entity : "business"}
                  onChange={setDraft}
                  onSubmit={submitClassification}
                  onBack={() => {}}
                />
              ) : question ? (
                <form onSubmit={(event) => { event.preventDefault(); submitAnswer(); }}>
                  <fieldset disabled={busy}>
                    <legend><h2>{question.prompt}</h2></legend>
                    {question.hint ? <p>{question.hint}</p> : null}
                    <div className="v9-question-options">
                      {question.options.map((option) => (
                        <label key={option.value} className="v9-question-option">
                          <input
                            type={question.type === "multi" ? "checkbox" : "radio"}
                            name={question.id}
                            value={option.value}
                            checked={question.type === "multi" ? multiple.includes(option.value) : single === option.value}
                            onChange={() => {
                              if (question.type !== "multi") {
                                setSingle(option.value);
                                return;
                              }
                              const exclusive = option.kind === "unknown" || option.kind === "not_applicable";
                              setMultiple((previous) => {
                                if (previous.includes(option.value)) return previous.filter((value) => value !== option.value);
                                return exclusive ? [option.value] : [
                                  ...previous.filter((value) => !question.options.some((item) => item.value === value &&
                                    (item.kind === "unknown" || item.kind === "not_applicable"))),
                                  option.value,
                                ];
                              });
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button type="submit" className="button button--primary"
                    disabled={busy || (question.type === "multi" ? multiple.length === 0 : !single)}>
                    {busy ? "Guardando…" : "Guardar y continuar"}
                  </button>
                </form>
              ) : (
                <p role="alert">No encontramos una pregunta válida para este punto del recorrido.</p>
              )}
            </>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
