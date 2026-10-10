import arimoRegularUrl from "@fontsource/arimo/files/arimo-latin-400-normal.woff?url";
import arimoBoldUrl from "@fontsource/arimo/files/arimo-latin-700-normal.woff?url";

import { renderAccessiblePdf } from "./accessible-pdf-renderer.client";
import type { CandidateDiagnosticReportV1, ReportPaper } from "../../components/diagnostic-report/report-model";

export type AccessiblePdfMetrics = {
  readonly fontLoadMs: number;
  readonly renderMs: number;
  readonly bytes: number;
  readonly heapBeforeBytes: number | null;
  readonly heapAfterBytes: number | null;
};

export async function createCandidateAccessiblePdf(
  report: CandidateDiagnosticReportV1,
  paper: ReportPaper,
  signal: AbortSignal,
): Promise<{ readonly bytes: Uint8Array; readonly metrics: AccessiblePdfMetrics }> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("La generación del PDF solo está disponible en el navegador.");
  }

  const fontOrigin = window.location.origin;
  const regularUrl = new URL(arimoRegularUrl, window.location.href);
  const boldUrl = new URL(arimoBoldUrl, window.location.href);
  if (regularUrl.origin !== fontOrigin || boldUrl.origin !== fontOrigin) {
    throw new Error("Las fuentes del informe deben cargarse desde este mismo origen.");
  }

  const fontStartedAt = performance.now();
  performance.mark("vecidya-candidate-pdf-font-start");
  const [regularResponse, boldResponse] = await Promise.all([
    fetch(regularUrl, { signal, credentials: "same-origin" }),
    fetch(boldUrl, { signal, credentials: "same-origin" }),
  ]);
  if (!regularResponse.ok || !boldResponse.ok) {
    throw new Error("No se pudieron cargar las fuentes necesarias para el PDF.");
  }
  const [regularBuffer, boldBuffer] = await Promise.all([
    regularResponse.arrayBuffer(),
    boldResponse.arrayBuffer(),
  ]);
  if (signal.aborted) throw new DOMException("La generación se canceló.", "AbortError");
  const fontLoadMs = performance.now() - fontStartedAt;
  performance.mark("vecidya-candidate-pdf-font-end");
  performance.clearMeasures("vecidya-candidate-pdf-font-load");
  performance.measure("vecidya-candidate-pdf-font-load", "vecidya-candidate-pdf-font-start", "vecidya-candidate-pdf-font-end");

  const browserPerformance = performance as Performance & { memory?: { usedJSHeapSize: number } };
  const heapBeforeBytes = browserPerformance.memory?.usedJSHeapSize ?? null;
  const renderStartedAt = performance.now();
  performance.mark("vecidya-candidate-pdf-render-start");
  const bytes = await renderAccessiblePdf({
    report,
    paper,
    fontRegular: new Uint8Array(regularBuffer),
    fontBold: new Uint8Array(boldBuffer),
  });
  const renderMs = performance.now() - renderStartedAt;
  performance.mark("vecidya-candidate-pdf-render-end");
  performance.clearMeasures("vecidya-candidate-pdf-render");
  performance.measure("vecidya-candidate-pdf-render", "vecidya-candidate-pdf-render-start", "vecidya-candidate-pdf-render-end");
  const heapAfterBytes = browserPerformance.memory?.usedJSHeapSize ?? null;

  return {
    bytes,
    metrics: { fontLoadMs, renderMs, bytes: bytes.byteLength, heapBeforeBytes, heapAfterBytes },
  };
}
