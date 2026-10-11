import { useCallback, useEffect, useRef, useState } from "react";
import { Link, isRouteErrorResponse, useRouteError, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { buildCandidateDiagnosticReportV1 } from "../components/diagnostic-flow/qa03b-presentation";
import { DiagnosticReport, REPORT_PAPERS, reportFileName, type ReportFit, type CandidateDiagnosticReportV1 } from "../components/diagnostic-report";
import { CANDIDATE_SESSION_STORAGE_KEY_V3, CANDIDATE_SESSION_TTL_MS_V3, CandidateSessionStoreV3, parseCandidateSessionV3, rebuildCompletedCandidateResultV3, type CandidateSessionV3 } from "../features/diagnostic/qa03b/qbv2-candidate-session";

export const meta: MetaFunction = () => [{ title: "Informe candidato (prueba local)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader({ request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  const url = new URL(request.url);
  return { paper: url.searchParams.get("paper") === "letter" ? "letter" as const : "a4" as const };
}

type ReportState = { readonly kind: "loading" } | { readonly kind: "unavailable" } | { readonly kind: "stale" } | { readonly kind: "expired" } | { readonly kind: "error" } | { readonly kind: "ready"; readonly session: CandidateSessionV3; readonly report: CandidateDiagnosticReportV1; readonly snapshot: string };
type PdfState =
  | { readonly kind: "idle" }
  | { readonly kind: "generating" }
  | { readonly kind: "complete"; readonly bytes: number; readonly elapsedMs: number; readonly heapDeltaBytes: number | null }
  | { readonly kind: "error" }
  | { readonly kind: "stale" }
  | { readonly kind: "expired" };

type SnapshotValidity = "valid" | "modified" | "expired" | "unavailable";

function isExpiredSnapshot(snapshot: string, now: number): boolean {
  try {
    const value: unknown = JSON.parse(snapshot);
    if (typeof value !== "object" || value === null || !("updatedAt" in value)) return false;
    const updatedAt = value.updatedAt;
    return typeof updatedAt === "number" && Number.isFinite(updatedAt) && now - updatedAt > CANDIDATE_SESSION_TTL_MS_V3;
  } catch { return false; }
}

function checkSnapshot(snapshot: string, session: CandidateSessionV3): SnapshotValidity {
  let current: string | null;
  try { current = window.localStorage.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3); }
  catch { return "unavailable"; }
  if (current === null || current !== snapshot) return "modified";
  const now = Date.now();
  if (now - session.updatedAt > CANDIDATE_SESSION_TTL_MS_V3) return "expired";
  const parsed = parseCandidateSessionV3(current, now);
  if (!parsed) return isExpiredSnapshot(current, now) ? "expired" : "modified";
  return parsed.sessionId === session.sessionId
    && parsed.revision === session.revision
    && parsed.writerId === session.writerId
    && parsed.updatedAt === session.updatedAt
    && parsed.completedAt === session.completedAt
    && parsed.status === "completed"
    ? "valid"
    : "modified";
}

export default function DevDiagnosticCandidateReport() {
  const { paper: initialPaper } = useLoaderData<typeof loader>();
  const [paper, setPaper] = useState(initialPaper);
  const [source, setSource] = useState<ReportState>({ kind: "loading" });
  const [fit, setFit] = useState<ReportFit | null>(null);
  const [pdfState, setPdfState] = useState<PdfState>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const generationController = useRef<AbortController | null>(null);
  const generationInProgress = useRef(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    try {
      const initialSnapshot = window.localStorage.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3);
      const session = new CandidateSessionStoreV3(window.localStorage).read(Date.now());
      if (!session || session.status !== "completed" || session.terminalReason === null || session.reviewIndex !== null || session.queue.length !== 0) {
        setSource(initialSnapshot && isExpiredSnapshot(initialSnapshot, Date.now()) ? { kind: "expired" } : { kind: "unavailable" });
        return;
      }
      const result = rebuildCompletedCandidateResultV3(session);
      if (!result || session.completedAt === null) { setSource({ kind: "unavailable" }); return; }
      const snapshot = window.localStorage.getItem(CANDIDATE_SESSION_STORAGE_KEY_V3);
      if (!snapshot) { setSource({ kind: "unavailable" }); return; }
      setSource({ kind: "ready", session, report: buildCandidateDiagnosticReportV1(result, new Date(session.completedAt), new Date()), snapshot });
    } catch (error) {
      console.error("[informe candidato] no se pudo reconstruir desde la sesión", error);
      setSource({ kind: "error" });
    }
  }, [attempt]);

  useEffect(() => {
    setPaper(initialPaper);
    setFit(null);
    setPdfState({ kind: "idle" });
  }, [initialPaper]);

  useEffect(() => {
    if (source.kind !== "ready") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CANDIDATE_SESSION_STORAGE_KEY_V3) return;
      if (event.newValue !== source.snapshot) {
        generationController.current?.abort();
        setFit(null);
        setPdfState({ kind: "stale" });
        setSource({ kind: "stale" });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [source]);

  const report = source.kind === "ready" ? source.report : null;
  const fileName = report ? reportFileName(report.identity.businessName, report.generatedAt) : null;
  const generationLocked = pdfState.kind === "generating";
  const onFit = useCallback((result: ReportFit) => setFit(result), []);
  useEffect(() => {
    if (fileName) document.title = fileName.replace(/\.pdf$/, "");
  }, [fileName]);

  useEffect(() => () => {
    generationController.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const downloadPdf = async () => {
    if (source.kind !== "ready" || !report || !fit || fit.overflow || generationInProgress.current) return;
    const captured = source;
    const capturedPaper = paper;
    const capturedFileName = fileName ?? "informe-diagnostico.pdf";
    const before = checkSnapshot(captured.snapshot, captured.session);
    if (before !== "valid") {
      setPdfState({ kind: before === "expired" ? "expired" : "stale" });
      setSource(before === "expired" ? { kind: "expired" } : { kind: "stale" });
      return;
    }

    generationInProgress.current = true;
    const controller = new AbortController();
    generationController.current = controller;
    setPdfState({ kind: "generating" });
    const startedAt = performance.now();
    const heapBefore = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null;
    try {
      performance.clearMarks("vecidya-candidate-pdf-import-start");
      performance.clearMeasures("vecidya-candidate-pdf-dynamic-import");
      performance.mark("vecidya-candidate-pdf-import-start");
      const { createCandidateAccessiblePdf } = await import("../features/diagnostic/accessible-pdf-export.client");
      performance.mark("vecidya-candidate-pdf-import-end");
      performance.measure("vecidya-candidate-pdf-dynamic-import", "vecidya-candidate-pdf-import-start", "vecidya-candidate-pdf-import-end");
      if (controller.signal.aborted) return;
      const generated = await createCandidateAccessiblePdf(report, capturedPaper, controller.signal);
      if (controller.signal.aborted) return;

      const after = checkSnapshot(captured.snapshot, captured.session);
      if (after !== "valid") {
        setPdfState({ kind: after === "expired" ? "expired" : "stale" });
        setSource(after === "expired" ? { kind: "expired" } : { kind: "stale" });
        return;
      }

      const pdfBuffer = generated.bytes.buffer.slice(
        generated.bytes.byteOffset,
        generated.bytes.byteOffset + generated.bytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const href = URL.createObjectURL(blob);
      objectUrl.current = href;
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = capturedFileName;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      const heapAfter = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null;
      const heapDeltaBytes = heapBefore === null || heapAfter === null ? null : heapAfter - heapBefore;
      setPdfState({ kind: "complete", bytes: blob.size, elapsedMs: Math.round(performance.now() - startedAt), heapDeltaBytes });
      window.setTimeout(() => {
        URL.revokeObjectURL(href);
        if (objectUrl.current === href) objectUrl.current = null;
      }, 1000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[informe candidato] no se pudo generar el PDF", error);
      setPdfState({ kind: "error" });
    } finally {
      if (generationController.current === controller) generationController.current = null;
      generationInProgress.current = false;
    }
  };

  return (
    <main className="rp-page rp-page--candidate">
      <div className="rp-toolbar" role="region" aria-label="Acciones del informe candidato">
        <Link to="/__dev/diagnostico/qa03b">Volver a la sesión candidata</Link>
        <Link to="/__dev/diagnostico/qa03b/metodologia">Metodología candidata</Link>
        {source.kind === "unavailable" ? <p role="alert">No hay una sesión candidata completada y válida en este navegador. Una sesión incompleta o editada no genera un informe final.</p> : null}
        {source.kind === "expired" ? <p role="alert">La sesión candidata caducó antes de preparar el informe. Vuelve a completar el diagnóstico para generar un PDF actualizado.</p> : null}
        {source.kind === "stale" ? <p role="alert">La sesión cambió o se borró durante la generación. Descartamos el PDF. Si la sesión cambió en otra pestaña, vuelve a cargar el informe. <button className="button button--secondary" onClick={() => { setFit(null); setPdfState({ kind: "idle" }); setSource({ kind: "loading" }); setAttempt((value) => value + 1); }} type="button">Volver a cargar el informe</button></p> : null}
        {source.kind === "error" ? <p role="alert">No pudimos reconstruir el informe desde las respuestas guardadas. <button className="button button--secondary" onClick={() => { setFit(null); setSource({ kind: "loading" }); setAttempt((value) => value + 1); }} type="button">Reintentar</button></p> : null}
        {source.kind === "loading" || (report && !fit) ? <p aria-live="polite">Preparando el informe desde la sesión candidata…</p> : null}
        {report && fit ? <>
          <label className="rp-paper-control">Tamaño de página
            <select aria-label="Tamaño de página" disabled={generationLocked} onChange={(event) => { setPaper(event.currentTarget.value as typeof paper); setFit(null); setPdfState({ kind: "idle" }); }} value={paper}>
              <option value="a4">A4</option>
              <option value="letter">Carta (US Letter)</option>
            </select>
          </label>
          {generationLocked
            ? <span aria-disabled="true" className="rp-toolbar__meta">Cambiar tamaño estará disponible al terminar la generación</span>
            : <Link to={paper === "a4" ? "?paper=letter" : "/__dev/diagnostico/qa03b/informe"}>Ver en {paper === "a4" ? "Carta" : "A4"}</Link>}
          <button className="button button--primary" disabled={fit.overflow || pdfState.kind === "generating"} onClick={downloadPdf} type="button">{pdfState.kind === "generating" ? "Generando informe PDF…" : "Descargar informe PDF"}</button>
          <button className="button button--secondary" disabled={fit.overflow || pdfState.kind === "generating"} onClick={() => window.print()} type="button">Imprimir o guardar PDF</button>
          <span className="rp-toolbar__meta">{fileName} · {REPORT_PAPERS[paper].label}</span>
          <span className="rp-toolbar__meta">{fit.pages} páginas · tipografía mínima disponible 8,5 pt{fit.overflow ? " · el contenido no cabe sin recortar" : ""}</span>
        </> : null}
      </div>
      <div aria-live="polite" className="rp-export-status" role={pdfState.kind === "error" || pdfState.kind === "expired" ? "alert" : "status"}>
        {pdfState.kind === "generating" ? "Generando el informe en este navegador. No se envían tus respuestas." : null}
        {pdfState.kind === "complete" ? `Descarga iniciada; no podemos confirmar que se guardó el archivo. ${Math.ceil(pdfState.bytes / 1024)} KB · ${pdfState.elapsedMs} ms${pdfState.heapDeltaBytes === null ? "" : ` · memoria aproximada ${pdfState.heapDeltaBytes} bytes`}.` : null}
        {pdfState.kind === "error" ? <>No pudimos generar el PDF. Comprueba tu conexión local y vuelve a intentarlo. <button className="button button--secondary" onClick={() => { setPdfState({ kind: "idle" }); void downloadPdf(); }} type="button">Reintentar descarga</button></> : null}
        {pdfState.kind === "expired" ? "La sesión caducó durante la generación. Descartamos el PDF; vuelve a completar el diagnóstico." : null}
      </div>
      {report ? <DiagnosticReport onFit={onFit} paper={paper} report={report} /> : null}
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="rp-page"><div className="rp-toolbar" role="alert"><p>{notFound ? "Esta prueba solo está disponible en desarrollo local." : "No pudimos preparar el informe candidato."}</p></div></main>;
}
