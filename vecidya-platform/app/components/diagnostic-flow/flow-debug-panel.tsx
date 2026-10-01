import { buildQuestionPlan, currentQuestionIdV3, QUESTION_BANK_V2, resolveEligibleQuestionsV2, sessionProfileV3, type DiagnosticSessionV3 } from "../../features/diagnostic";

/**
 * Solo desarrollo: contexto resuelto, respuestas activas, lote pendiente, necesidades materiales y traza de la ruta.
 * Lo monta únicamente la ruta privada de desarrollo; nunca forma parte de `DiagnosticFlow` en producción.
 */
export function FlowDebugPanel({ session }: { session: DiagnosticSessionV3 | null }) {
  if (!session) return <details className="df-debug"><summary>Depuración (solo desarrollo)</summary><p>Sin sesión.</p></details>;
  const resolution = resolveEligibleQuestionsV2(session.answers, QUESTION_BANK_V2);
  const plan = buildQuestionPlan({ answers: session.answers, bank: QUESTION_BANK_V2 });
  const current = currentQuestionIdV3(session);
  const fields = ["entity", "businessModel", "archetype", "growthStage", "primaryGoal", "primaryFriction"] as const;
  return (
    <details className="df-debug" open>
      <summary>Depuración (solo desarrollo)</summary>
      <dl>
        <dt>Estado</dt><dd>{session.status} · revisión {session.reviewIndex ?? "—"} · perfil {sessionProfileV3(session)}</dd>
        <dt>Pregunta actual</dt><dd>{current ?? "—"} ({QUESTION_BANK_V2.find((question) => question.id === current)?.module ?? "—"})</dd>
        <dt>Contexto</dt><dd>{fields.map((field) => { const value = resolution.context[field] as { status: string; value?: unknown }; return `${field}=${value.status === "resolved" ? String(value.value) : "?"}`; }).join(" · ")}</dd>
        <dt>Respuestas activas ({Object.keys(session.answers).length})</dt><dd>{Object.entries(session.answers).map(([id, value]) => `${id}=${Array.isArray(value) ? value.join("+") : value}`).join(" · ")}</dd>
        <dt>Lote pendiente</dt><dd>{session.queue.map((item) => `${item.questionId} [${item.phase}/${item.reason}]`).join(" · ") || "—"}</dd>
        <dt>Necesidades materiales</dt><dd>{plan.materialEvidence.map((need) => `${need.dimension}:${need.source} ${need.observed}/${need.target}`).join(" · ") || "—"}</dd>
        <dt>Traza</dt><dd><ol>{session.routeTrace.map((entry, index) => <li key={index}>{JSON.stringify(entry)}</li>)}</ol></dd>
      </dl>
    </details>
  );
}
