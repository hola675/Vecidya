import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { PublicLayout } from "../components/public-layout";
import {
  Qa03bV9ClassificationStep,
  type ClassificationDraftV9,
} from "../components/diagnostic-flow/qa03b-v9-classification-step";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../features/diagnostic/qa03b/specialty-branches-wave1";
import {
  QA03B_V9_CLASSIFICATION_INTERACTION_ID,
  type ClassificationSelectionV9,
} from "../features/diagnostic/qa03b/v9-classification-bundle";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  editCandidateAnswerV9Prototype,
  editClassificationV9Prototype,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
  submitExtensionConsentV9Prototype,
  type CandidateSessionV9Prototype,
} from "../features/diagnostic/qa03b/v9-session-prototype";
import {
  createBrowserDiagnosticV9LocalDraftStore,
  type DiagnosticV9LocalDraftStore,
} from "../features/diagnostic/v9/local-draft.client";
import { createBrowserDiagnosticV9FinalResultStore, type DiagnosticV9FinalResultStore } from "../features/diagnostic/v9/final-result.client";
import { buildDiagnosticV9FinalResultEnvelope, parseDiagnosticV9FinalResult, type DiagnosticV9FinalResultEnvelope } from "../features/diagnostic/v9/final-result";
import { verifyDiagnosticV9Attestation } from "../features/diagnostic/v9/attestation-verify";
import { DIAGNOSTIC_V9_ATTESTATION_PUBLIC_KEYS, DIAGNOSTIC_V9_REVOKED_ATTESTATION_KEY_IDS } from "../features/diagnostic/v9/attestation-key-registry";
import { V9_ABSOLUTE_INTERACTION_LIMIT } from "../features/diagnostic/v9/route-budget";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";
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

const questionById = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((item) => [item.id, item] as const));

export default function DiagnosticV9Run({ loaderData }: Route.ComponentProps) {
  const { enabled, runId } = loaderData;
  const store = useMemo<DiagnosticV9LocalDraftStore | null>(
    () => typeof window === "undefined" ? null : createBrowserDiagnosticV9LocalDraftStore(),
    [],
  );
  const resultStore = useMemo<DiagnosticV9FinalResultStore | null>(
    () => typeof window === "undefined" ? null : createBrowserDiagnosticV9FinalResultStore(),
    [],
  );
  const [session, setSession] = useState<CandidateSessionV9Prototype | null>(null);
  const [finalResult, setFinalResult] = useState<DiagnosticV9FinalResultEnvelope | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<"local" | "memory">("local");
  const [draft, setDraft] = useState<ClassificationDraftV9>({});
  const [single, setSingle] = useState("");
  const [multiple, setMultiple] = useState<string[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const restore = useCallback(async () => {
    if (!store) return;
    const savedResult = resultStore?.read(Date.now());
    if (savedResult?.status === "found") {
      const valid = await verifyDiagnosticV9Attestation({
        result: savedResult.envelope.result,
        attestation: savedResult.envelope.attestation,
        publicKeys: DIAGNOSTIC_V9_ATTESTATION_PUBLIC_KEYS,
        revokedKeyIds: DIAGNOSTIC_V9_REVOKED_ATTESTATION_KEY_IDS,
      });
      if (valid) {
        void store.clear();
        setFinalResult(savedResult.envelope);
        return;
      }
      void resultStore?.clear();
      setError("El resultado guardado no tiene un comprobante válido. Inicia un diagnóstico nuevo.");
    } else if (savedResult?.status === "expired") {
      void resultStore?.clear();
      void store.clear();
      setError("El resultado expiró después de 24 horas. Inicia un diagnóstico nuevo.");
      setSession(null);
      return;
    }
    setStorageMode(store.persistenceMode);
    const result = store.readResult(Date.now());
    if (result.status === "found" && result.envelope.session.sessionId === runId) {
      setSession(result.envelope.session);
      return;
    }
    setSession(null);
    if (result.status === "expired") setError("El borrador local expiró después de 7 días. Puedes iniciar un diagnóstico nuevo.");
    else if (result.status === "invalid") setError("El borrador local no es compatible o se modificó. Inicia un diagnóstico nuevo.");
    else if (result.status === "unavailable") {
      setStorageMode("memory");
      setError("El almacenamiento local no está disponible. El recorrido puede continuar en memoria, pero no podrá recuperarse al cerrar esta página.");
    } else setError("No encontramos este borrador en el almacenamiento local. Inicia un diagnóstico nuevo.");
  }, [resultStore, runId, store]);

  useEffect(() => {
    if (!enabled) return;
    void restore().finally(() => setLoading(false));
  }, [enabled, restore]);

  useEffect(() => {
    if (!store) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "vecidya.diagnostic.v9.local-draft.1") return;
      if (!event.newValue) {
        void store.clear();
        setError("El borrador se eliminó en otra pestaña.");
        setSession(null);
        return;
      }
      const result = store.readResult(Date.now());
      if (result.status === "found" && result.envelope.session.sessionId === runId) {
        setSession((current) => {
          if (current && result.envelope.session.revision > current.revision) {
            setError("Este borrador cambió en otra pestaña; mostramos la revisión más reciente.");
            return result.envelope.session;
          }
          return current;
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [runId, store]);

  useEffect(() => {
    setSingle("");
    setMultiple([]);
    setDraft({});
  }, [session?.queue[0]]);

  const questionId = session ? editingQuestionId ?? currentCandidateQuestionIdV9(session) : null;
  const question = questionId ? questionById.get(questionId) : undefined;

  async function save(next: CandidateSessionV9Prototype) {
    if (!store) return;
    const result = await store.write(next);
    if (result.status === "conflict") {
      setSession(result.latest.session);
      setError("Otra pestaña guardó una revisión más reciente. Se restauró esa revisión; vuelve a intentarlo.");
      return;
    }
    if (result.status === "invalid" || result.status === "unavailable") {
      setSession(next);
      setStorageMode("memory");
      setError("El almacenamiento local no está disponible. El recorrido continúa en memoria y no podrá recuperarse al cerrar esta página.");
      return;
    }
    setSession(result.envelope.session);
    setStorageMode(result.persistence);
    setError(result.persistence === "memory"
      ? "El almacenamiento local no está disponible. El recorrido continúa en memoria y no podrá recuperarse al cerrar esta página."
      : null);
  }

  function sendAnswer() {
    if (!session || !question || busy) return;
    setBusy(true);
    const value = question.type === "multi" ? multiple : single;
    const next = editingQuestionId
      ? editCandidateAnswerV9Prototype(session, editingQuestionId, value, session.writerId, Math.max(Date.now(), session.updatedAt + 1))
      : submitCandidateAnswerV9Prototype(session, question.id, value, session.writerId, Math.max(Date.now(), session.updatedAt + 1));
    if (!next.ok) {
      setError("No pudimos validar esta respuesta. Vuelve a intentarlo.");
      setBusy(false);
      return;
    }
    void save(next.session).finally(() => { setBusy(false); setEditingQuestionId(null); });
  }

  function sendClassification(selection: ClassificationSelectionV9) {
    if (!session || busy) return;
    setBusy(true);
    // The prototype accepts the domain selection and rebuilds the canonical transcript entry.
    const next = editingQuestionId
      ? editClassificationV9Prototype(session, selection, session.writerId, Math.max(Date.now(), session.updatedAt + 1))
      : submitClassificationV9Prototype(session, selection, session.writerId, Math.max(Date.now(), session.updatedAt + 1));
    if (!next.ok) {
      setError("No pudimos validar la clasificación. Vuelve a intentarlo.");
      setBusy(false);
      return;
    }
    void save(next.session).finally(() => { setBusy(false); setEditingQuestionId(null); });
  }

  function sendConsent(decision: "accepted" | "rejected") {
    if (!session || busy) return;
    setBusy(true);
    const next = submitExtensionConsentV9Prototype(session, decision, session.writerId, Math.max(Date.now(), session.updatedAt + 1));
    if (!next.ok) {
      setError("No pudimos guardar tu decisión de extensión.");
      setBusy(false);
      return;
    }
    void save(next.session).finally(() => setBusy(false));
  }

  async function finalize() {
    if (!session || session.status !== "completing" || !store || !resultStore || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnostic/v9/finalize-transient", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });
      if (!response.ok) throw new Error("finalize_failed");
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("result" in payload) || !("attestation" in payload)) throw new Error("invalid_response");
      const envelope = buildDiagnosticV9FinalResultEnvelope(payload.result as DiagnosticV9FinalResultEnvelope["result"], payload.attestation as DiagnosticV9FinalResultEnvelope["attestation"]);
      const parsed = parseDiagnosticV9FinalResult(JSON.stringify(envelope), Date.now());
      if (parsed.status !== "found" || !await verifyDiagnosticV9Attestation({
        result: envelope.result,
        attestation: envelope.attestation,
        publicKeys: DIAGNOSTIC_V9_ATTESTATION_PUBLIC_KEYS,
        revokedKeyIds: DIAGNOSTIC_V9_REVOKED_ATTESTATION_KEY_IDS,
      })) throw new Error("invalid_attestation");
      const resultPersistence = resultStore.write(envelope);
      const cleared = await store.clear();
      if (resultPersistence === "memory") setError("El resultado está abierto, pero el almacenamiento local no está disponible y no podrá recuperarse al volver.");
      else if (cleared === "unavailable") setError("El resultado está abierto, pero no pudimos eliminar el borrador guardado en este navegador.");
      setFinalResult(envelope);
      setSession(null);
    } catch {
      setError("No pudimos finalizar el diagnóstico de forma segura. El borrador permanece en este navegador; vuelve a intentarlo más tarde.");
    } finally { setBusy(false); }
  }

  return (
    <PublicLayout>
      <main className="df-page">
        <section className="df-screen v9-diagnostic-screen" aria-labelledby="v9-run-heading">
          <div className="df-screen__header">
            <p className="df-screen__eyebrow">Vecidya · Diagnóstico V9</p>
            <h1 className="df-screen__title" id="v9-run-heading">Tu diagnóstico digital</h1>
            <p className="df-screen__lead">Tus respuestas se conservan localmente en este navegador. Una escritura válida extiende el plazo; leer el borrador no lo renueva.</p>
          </div>
          {!enabled ? (
            <p role="status">V9 todavía no está habilitado. <Link to="/diagnostico">Usar el diagnóstico disponible</Link>.</p>
          ) : loading ? (
            <p role="status">Recuperando el borrador local…</p>
          ) : finalResult ? (
            <div className="df-screen__note" aria-live="polite">
              <h2>Resultado del diagnóstico</h2>
              {error ? <p role="status">{error}</p> : null}
              {finalResult.result.core.overall.displayScore === null ? (
                <p>No hay evidencia suficiente para mostrar un índice general. Las dimensiones con información disponible se conservan en el resultado.</p>
              ) : <p>Índice general: <strong>{finalResult.result.core.overall.displayScore}</strong> sobre 100.</p>}
              <p>{finalResult.result.core.overall.assessed} de {finalResult.result.core.overall.applicable} dimensiones aplicables cuentan con lectura. Este resultado refleja evidencia autodeclarada y no constituye una auditoría independiente.</p>
              <p>Comprobante verificable: <code>{finalResult.attestation.attestationId}</code></p>
              <p>Disponible en este navegador hasta {new Date(finalResult.attestation.expiresAt).toLocaleString()}.</p>
              <button className="button" type="button" onClick={() => {
                void resultStore?.clear();
                setFinalResult(null);
                setError("El resultado local se eliminó.");
              }}>Eliminar resultado local</button>
            </div>
          ) : !session ? (
            <p role="alert">{error ?? "No se pudo recuperar el borrador."} <Link to="/diagnostico/v9">Volver al inicio</Link></p>
          ) : (
            <>
              <p role="status">Interacciones completadas: {session.interactionCount} de {V9_ABSOLUTE_INTERACTION_LIMIT}</p>
              {storageMode === "memory" ? <p role="status" className="df-screen__note">El progreso se mantiene solo mientras esta página siga abierta; no podrá recuperarse al volver.</p> : null}
              {error ? <p role="alert" className="df-screen__note">{error}</p> : null}
              {session.answeredQuestionIds.length ? (
                <details>
                  <summary>Revisar respuestas guardadas</summary>
                  <ul>
                    {session.answeredQuestionIds.map((id) => (
                      <li key={id}>
                        <code>{id}</code>{" "}
                        <button type="button" className="button" disabled={busy} onClick={() => {
                          setEditingQuestionId(id.startsWith("q2_niche_") ? "q2_sector" : id);
                          if (id === "q2_sector" || id.startsWith("q2_niche_")) {
                            setDraft({ sector: String(session.answers.q2_sector ?? ""), niche: String(session.answers[id] ?? "") });
                          } else {
                            const answer = session.answers[id];
                            if (Array.isArray(answer)) setMultiple([...answer]);
                            else setSingle(typeof answer === "string" ? answer : "");
                          }
                        }}>Editar</button>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {session.extensionConsent === "pending" ? (
                <div className="df-screen__note">
                  <h2>¿Quieres responder hasta 5 preguntas más?</h2>
                  <p>Ya completaste 24 interacciones. La extensión solo se ofrece cuando queda evidencia crítica. El consentimiento no cuenta como interacción.</p>
                  <div className="df-actions">
                    <button className="button button--primary" type="button" disabled={busy} onClick={() => sendConsent("accepted")}>Sí, continuar</button>
                    <button className="button" type="button" disabled={busy} onClick={() => sendConsent("rejected")}>Finalizar sin preguntas extra</button>
                  </div>
                </div>
              ) : session.status === "completing" && !editingQuestionId ? (
                <div className="df-screen__note">
                  <h2>Respuestas listas para finalizar</h2>
                  <p>Para generar el resultado, el servidor reconstruye el diagnóstico y devuelve un comprobante firmado. Las respuestas no se guardan en D1.</p>
                  <button className="button button--primary" type="button" disabled={busy} onClick={() => void finalize()}>
                    {busy ? "Generando el resultado…" : "Finalizar diagnóstico"}
                  </button>
                </div>
              ) : questionId === "q2_sector" || questionId?.startsWith("q2_niche_") ? (
                <Qa03bV9ClassificationStep
                  value={draft}
                  progress={{ stage: "context", stageIndex: 0, answered: session.interactionCount }}
                  error={error}
                  reviewing={false}
                  canGoBack={false}
                  entityType={typeof session.answers.q2_entity === "string" ? session.answers.q2_entity : "business"}
                  onChange={setDraft}
                  onSubmit={sendClassification}
                  onBack={() => {}}
                />
              ) : question ? (
                <form onSubmit={(event) => { event.preventDefault(); sendAnswer(); }}>
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
                    {busy ? "Guardando en este navegador…" : editingQuestionId ? "Guardar cambio" : "Guardar y continuar"}
                  </button>
                </form>
              ) : (
                <p role="alert">No encontramos una pregunta válida para este punto del recorrido.</p>
              )}
              <button className="button" type="button" disabled={busy} onClick={() => {
                void store?.clear();
                setSession(null);
                setEditingQuestionId(null);
                setError("Borrador local eliminado.");
              }}>Eliminar borrador</button>
            </>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
