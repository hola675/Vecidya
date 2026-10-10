import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { publicAssets } from "../../assets/public-assets";
import { ConfidenceIndicator, StatusAsset, StatusIndicator } from "../diagnostic-result";
import { modifier } from "../diagnostic-result/indicators";
import { REPORT_MAX_PAGE_COUNT, REPORT_PAGE_COUNT, REPORT_PAPERS, type DiagnosticReportDocumentV1, type ReportDimension, type ReportPaper } from "./report-model";

/**
 * DIAG-V3-12 — informe paginado en hojas fijas del tamaño del papel. El contenido es una secuencia ordenada de
 * bloques cohesivos (cabecera, estado, cada prioridad, cada par de áreas, cada recomendación…) que se reparte en
 * orden entre las hojas: un título nunca queda solo al final de una hoja y ningún bloque se parte. Se mide en el
 * navegador y se elige la mayor densidad tipográfica con la que todo cabe, sin bajar nunca del piso legible
 * (`REPORT_DENSITY_LEVELS`). Tres hojas (`REPORT_PAGE_COUNT`) es el objetivo editorial, no un techo que valga más que
 * la legibilidad: si el contenido no cabe en tres hojas ni en el piso tipográfico, se repite el reparto en el piso
 * permitiendo una cuarta hoja (`REPORT_MAX_PAGE_COUNT`) antes que encoger más la letra. Nunca recorta texto: si
 * tampoco cabe así, el informe pasa a flujo normal y la QA lo marca como fallo. Solo presenta el view model; no
 * calcula nada del diagnóstico.
 */

/** Niveles de densidad (tamaño base en pt): 9,5 → 8,5. El piso (8,5 pt) es el mínimo legible para un informe profesional. */
export const REPORT_DENSITY_LEVELS = [9.5, 9, 8.5] as const;
const FLOOR_LEVEL = REPORT_DENSITY_LEVELS.length - 1;

export type ReportFit = { readonly density: number; readonly pages: number; readonly overflow: boolean };

type Block = { readonly key: string; readonly node: ReactNode; /** Título: va en la misma hoja que el bloque siguiente. */ readonly keepWithNext?: boolean };

function List({ items }: { items: readonly ReactNode[] }) {
  return items.length > 0 ? <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : null;
}

const Labelled = ({ label, text }: { label: string; text: string }) => <><span className="rp-label">{label}.</span> {text}</>;
const h2 = (key: string, text: string): Block => ({ key: `h2:${key}`, keepWithNext: true, node: <h2 className="rp-h2">{text}</h2> });
const candidateIdentityLabel = (key: string) => {
  const labels: Readonly<Record<string, string>> = {
    engine: "Motor",
    questionBank: "Banco de preguntas",
    planner: "Planificador",
    evidence: "Modelo de evidencia",
    applicability: "Aplicabilidad R4",
    calibration: "Calibración",
    siblingAggregation: "Agregación de áreas O4",
    observability: "Observabilidad O6",
    methodology: "Metodología",
    report: "Informe",
  };
  return labels[key] ?? key;
};

function Dimension({ dimension }: { dimension: ReportDimension }) {
  return (
    <div className={`rp-dim rp-dim--${modifier(dimension.status)}`}>
      <div className="rp-dim__head">
        <img alt="" className="rp-dim__icon" height={40} src={dimension.icon} width={40} />
        <h3 className="rp-h3">{dimension.label}</h3>
        {dimension.percent && dimension.score !== null ? (
          <span className="rp-meter">
            <strong>{dimension.percent}</strong>
            <span aria-hidden="true" className="rp-meter__track"><span className={`rp-meter__fill rp-meter__fill--${modifier(dimension.status)}${dimension.preliminary ? " rp-meter__fill--preliminary" : ""}`} style={{ width: `${dimension.score}%` }} /></span>
          </span>
        ) : null}
      </div>
      <p className="rp-dim__status">
        <StatusIndicator label={dimension.statusLabel} status={dimension.status} />
        {dimension.confidence ? <ConfidenceIndicator confidence={dimension.confidence} /> : null}
        {dimension.preliminary ? <span className="rp-muted">Lectura preliminar</span> : null}
      </p>
      <p>{dimension.interpretation}</p>
      {dimension.evidenceTopics.length > 0 ? <p className="rp-evidence"><span className="rp-label">{dimension.evidenceLead}</span> {dimension.evidenceTopics.join("; ")}.</p> : null}
    </div>
  );
}

/** El informe como secuencia de bloques, en el orden canónico de lectura (que es también el orden del PDF etiquetado). */
function reportBlocks(report: DiagnosticReportDocumentV1): readonly Block[] {
  const presence = report.overallPresence;
  const blocks: Block[] = [];
  blocks.push({
    key: "cover",
    node: (
      <header className="rp-cover">
        <p className="rp-brand"><img alt="" className="rp-brand__mark" height={28} src={publicAssets.brand.symbolPrint} width={28} /><span>Vecidya</span></p>
        <h1 className="rp-title" id="rp-title">{report.identity.title}</h1>
        {report.identity.businessName ? <p className="rp-business">{report.identity.businessName}</p> : null}
        <dl className="rp-cover__meta">
          <div><dt>Tipo</dt><dd>{report.identity.profileLabel}</dd></div>
          <div><dt>Etapa</dt><dd>{report.identity.lifecycleLabel}</dd></div>
          <div><dt>{"dateLabel" in report.identity ? report.identity.dateLabel : "Fecha del informe"}</dt><dd>{"completedLabel" in report ? report.completedLabel : report.generatedLabel}</dd></div>
          {"completedLabel" in report ? <div><dt>Fecha de generación del informe</dt><dd>{report.generatedLabel}</dd></div> : null}
          <div><dt>Metodología</dt><dd>{report.methodologyVersion}</dd></div>
          <div><dt>Informe</dt><dd>{report.reportVersion}</dd></div>
        </dl>
      </header>
    ),
  });
  blocks.push({
    key: "presence",
    node: (
      <div className={`rp-presence rp-presence--${modifier(presence.state)}`} data-state={presence.state}>
        <div className="rp-presence__main">
          {presence.state !== "insufficient" ? <StatusAsset state={presence.state} /> : null}
          <div>
            <h2 className="rp-presence__kicker">Estado Actual:</h2>
            {presence.percent ? <p className="rp-presence__value">{presence.percent}</p> : null}
            {presence.publicLabel ? <p className="rp-presence__code">{presence.publicLabel}</p> : null}
            {!presence.percent ? <p className="rp-presence__label">{presence.label}</p> : null}
          </div>
        </div>
        <div className="rp-presence__side">
          <p>{presence.explanation}</p>
          <p className="rp-presence__meta">
            {presence.percent ? <ConfidenceIndicator confidence={presence.confidence} label={`Confianza general: ${presence.confidence.label}`} /> : null}
            <span>{presence.coverage}</span>
          </p>
        </div>
      </div>
    ),
  });

  blocks.push(h2("summary", "Lo que encontró el diagnóstico"));
  blocks.push({
    key: "summary",
    node: (
      <div className="rp-stack">
        {report.executiveSummary.headline ? <p className="rp-headline">{report.executiveSummary.headline}</p> : null}
        {report.executiveSummary.lead.map((text) => <p key={text}>{text}</p>)}
        <p className="rp-state"><span className="rp-label">Dónde estás hoy.</span> {report.executiveSummary.currentState}</p>
      </div>
    ),
  });

  blocks.push(h2("focus", "Lo que más importa ahora"));
  blocks.push({
    key: "constraint",
    node: (
      <div className="rp-constraint">
        <p className="rp-kicker">{report.primaryConstraint.kicker}</p>
        <h3 className="rp-h3">{report.primaryConstraint.title}</h3>
        <p>{report.primaryConstraint.text}</p>
        {report.primaryConstraint.certaintyLabel ? <p className="rp-meta">{[report.primaryConstraint.certaintyLabel, report.primaryConstraint.confidenceLabel].filter(Boolean).join(" · ")}</p> : null}
      </div>
    ),
  });
  if (report.priorities.length > 0) {
    blocks.push({ key: "h3:priorities", keepWithNext: true, node: <h3 className="rp-h3">Por dónde empezar</h3> });
    for (const priority of report.priorities) {
      blocks.push({
        key: `priority:${priority.rank}`,
        node: (
          <div className="rp-priority">
            <p className="rp-kicker">{priority.slotLabel}{priority.area ? ` · ${priority.area}` : ""} · {priority.certaintyLabel}</p>
            <p className="rp-priority__statement">{priority.statement}</p>
            <p className="rp-muted">{priority.why}</p>
          </div>
        ),
      });
    }
  }
  if (report.nextFocus) blocks.push({ key: "next-focus", node: <p className="rp-muted">{report.nextFocus}</p> });

  blocks.push(h2("plan", "Plan de acción recomendado"));
  blocks.push({
    key: "plan",
    node: report.actionPath.emptyNote ? <p>{report.actionPath.emptyNote}</p> : (
      <ol className="rp-steps">
        {report.actionPath.steps.map((step) => (
          <li key={step.step}>
            <span className="rp-label">{step.title}</span>
            <span className="rp-meta"> · {[step.tag, step.area, step.after.length > 0 ? `Después del paso ${step.after.join(" y ")}` : null].filter(Boolean).join(" · ")}</span>
          </li>
        ))}
      </ol>
    ),
  });

  if (report.strengths.length + report.areasToStrengthen.length + report.mixedSignals.length > 0) {
    blocks.push(h2("evidence", "Cómo llegamos a este resultado"));
    blocks.push({
      key: "evidence",
      node: (
        <div className="rp-columns">
          {report.strengths.length > 0 ? <div><h3 className="rp-h3">Lo que funciona</h3><List items={report.strengths.map((item) => <Labelled key={item.text} label={item.label} text={item.text} />)} /></div> : null}
          {report.areasToStrengthen.length > 0 ? <div><h3 className="rp-h3">Áreas para fortalecer</h3><List items={report.areasToStrengthen.map((item) => <Labelled key={item.text} label={item.label} text={item.text} />)} /></div> : null}
          {report.mixedSignals.length > 0 ? <div><h3 className="rp-h3">Lo que encontramos al cruzar tus respuestas</h3><List items={report.mixedSignals} /></div> : null}
        </div>
      ),
    });
  }

  if (report.risks.length + report.uncertainties.length > 0) {
    blocks.push(h2("uncertain", report.risks.length > 0 ? "Riesgos y lo que falta confirmar" : "Lo que todavía no podemos confirmar"));
    blocks.push({
      key: "uncertain",
      node: (
        <div className="rp-columns">
          {report.risks.length > 0 ? <div><h3 className="rp-h3">Riesgos observados</h3><List items={report.risks.map((item) => <Labelled key={item.text} label={item.label} text={item.text} />)} /></div> : null}
          {report.uncertainties.map((group) => (
            <div key={group.title}>
              {report.uncertainties.length > 1 || report.risks.length > 0 ? <h3 className="rp-h3">{group.title}</h3> : null}
              <List items={group.items} />
            </div>
          ))}
        </div>
      ),
    });
  }

  blocks.push(h2("dimensions", "Las ocho áreas del diagnóstico"));
  if (report.dimensionNotes.length > 0) blocks.push({ key: "dimension-notes", keepWithNext: true, node: <div className="rp-stack">{report.dimensionNotes.map((note) => <p className="rp-muted" key={note}>{note}</p>)}</div> });
  // Dos áreas por fila, en el orden canónico (1-2, 3-4…): cada fila es un bloque que no se parte.
  for (let index = 0; index < report.dimensions.length; index += 2) {
    blocks.push({ key: `dimensions:${index}`, node: <div className="rp-dims">{report.dimensions.slice(index, index + 2).map((dimension) => <Dimension dimension={dimension} key={dimension.key} />)}</div> });
  }

  blocks.push(h2("recommendations", "Recomendaciones"));
  if (report.recommendations.length === 0) blocks.push({ key: "recommendations-empty", node: <p>{report.actionPath.emptyNote}</p> });
  for (const item of report.recommendations) {
    blocks.push({
      key: `recommendation:${item.step}`,
      node: (
        <div className="rp-rec">
          <h3 className="rp-h3">Paso {item.step}. {item.title}</h3>
          <p className="rp-meta">{[item.tag, item.area].filter(Boolean).join(" · ")}</p>
          <dl className="rp-rec__facts">
            <div><dt>Qué mejorar</dt><dd>{item.whatToImprove}</dd></div>
            <div><dt>Por qué importa</dt><dd>{item.whyItMatters}</dd></div>
            <div><dt>Resultado esperado</dt><dd>{item.expectedOutcome}</dd></div>
            {item.conditions?.length ? <div><dt>Condiciones necesarias</dt><dd><List items={item.conditions} /></dd></div> : null}
            {item.solution ? <div><dt>Tipo de solución</dt><dd>{item.solution.label}: {item.solution.description}</dd></div> : null}
          </dl>
        </div>
      ),
    });
  }

  if ("candidateCommercial" in report) {
    const commercial = report.candidateCommercial;
    blocks.push(h2("vecidya", "Recomendación para Vecidya"));
    blocks.push({ key: "candidate-commercial-note", keepWithNext: true, node: <p className="rp-muted">La recomendación comercial se calcula después de la evaluación y no cambia las capacidades ni sus prioridades.</p> });
    blocks.push({ key: "candidate-license-now", node: <div className="rp-help"><p className="rp-label">{commercial.licenseName ? `LICENCIA RECOMENDADA: ${commercial.licenseName}` : "NINGUNA LICENCIA RECOMENDADA POR AHORA"}</p><p><strong>Certeza de encaje:</strong> {commercial.certainty}</p><p>{commercial.rationale}</p>{commercial.licenseName ? <><p>{commercial.whyNotLower}</p><p>{commercial.whyNotHigher}</p></> : null}{commercial.unresolvedSignals.length ? <p><strong>Pendiente:</strong> {commercial.unresolvedSignals.join("; ")}</p> : null}{commercial.monthlyLicenseUsd !== null ? <p>{`Licencia · $${commercial.monthlyLicenseUsd}/mes`}{commercial.activationUsd !== null ? ` · puesta en marcha $${commercial.activationUsd} una vez` : ""}</p> : null}<h3 className="rp-h3">Compatibles ahora</h3>{commercial.now.length ? <ul>{commercial.now.map((item) => <li className="rp-offer" key={`${item.kind}:${item.name}`}><strong>{item.name}</strong> · {item.kind}{item.priceLabel ? ` · ${item.priceLabel}` : ""}<p>{item.rationale}</p></li>)}</ul> : <p className="rp-muted">No hay ofertas justificadas para este momento.</p>}</div> });
    blocks.push({ key: "candidate-later", keepWithNext: commercial.later.length > 0, node: <><h3 className="rp-h3">Compatibles después</h3>{commercial.later.length ? <ul>{commercial.later.map((item) => <li className="rp-offer" key={`${item.kind}:${item.name}`}><strong>{item.name}</strong> · {item.kind}{item.priceLabel ? ` · ${item.priceLabel}` : ""}<p>{item.rationale}</p></li>)}</ul> : <p className="rp-muted">No hay ofertas justificadas para este momento.</p>}</> });
    if (commercial.externalUsageCategories.length) blocks.push({ key: "candidate-external-costs", node: <p className="rp-muted">Algunas ofertas pueden tener costes externos de uso según los canales que indiquen sus condiciones.</p> });
  } else {
    blocks.push(h2("vecidya", "Tu configuración Vecidya"));
    const commercial = report.commercialRecommendation;
    const nowItems = [...commercial.now.complements, ...commercial.now.services].slice(0, 2);
    const laterItems = [...commercial.later.complements, ...commercial.later.services].slice(0, 2);
    blocks.push({ key: "vecidya-note", node: <p className="rp-muted">La selección se basa en la necesidad operacional demostrada, no en el porcentaje digital.</p> });
    blocks.push({ key: "commercial-license", node: <div className="rp-help"><p className="rp-label">TU MEJOR ENCAJE</p><p className="rp-offer"><span className="rp-label">Vecidya {commercial.now.license}</span> · ${commercial.cost.monthlyLicenseUsd}/mes · puesta en marcha ${commercial.cost.activationUsd} una vez.</p><p>{commercial.licenseFit.rationale}</p><p className="rp-muted">{commercial.licenseFit.whyNotHigher}</p></div> });
    if (nowItems.length > 0) blocks.push({ key: "commercial-now", node: <div className="rp-help"><p className="rp-label">TE RECOMENDAMOS AHORA</p><ul>{nowItems.map((item) => <li className="rp-offer" key={item.id}><span className="rp-label">{item.name}</span>{item.priceLabel === null ? " · Propuesta personalizada" : ` · ${item.priceLabel}`}</li>)}</ul></div> });
    if (laterItems.length > 0) blocks.push({ key: "commercial-later", node: <div className="rp-help"><p className="rp-label">PUEDE TENER SENTIDO DESPUÉS</p><p className="rp-muted">{laterItems.map((item) => item.name).join(" · ")}</p></div> });
    blocks.push({ key: "commercial-cost", node: <div className="rp-help"><p className="rp-label">COSTE</p><p className="rp-offer">Vecidya mensual · ${commercial.cost.monthlyLicenseUsd + nowItems.reduce((sum, item) => sum + (item.priceMonthlyUsd ?? 0), 0)}/mes · puesta en marcha ${commercial.cost.activationUsd} una vez.</p>{commercial.cost.externalUsage.length > 0 ? <p className="rp-muted">Los proveedores pueden sumar costes de uso según mensajes, llamadas, IA o APIs.</p> : null}</div> });
    blocks.push({ key: "cta", node: <p className="rp-cta">Siguiente paso: revisa tu configuración con Vecidya en <a href="mailto:hola@vecidya.com">hola@vecidya.com</a>.</p> });
  }

  blocks.push({
    key: "method",
    node: (
      <div className="rp-method">
        <div className="rp-method__evaluated">
          <h2 className="rp-h2">Cómo se evaluó</h2>
          <List items={report.methodologySummary.notes} />
        </div>
        <div className="rp-method__sources">
          <h2 className="rp-h2">Metodología y fuentes</h2>
          <p className="rp-muted">{report.methodologySummary.sourcesNote} {report.methodologySummary.formulaDistinction}</p>
          <ol className="rp-sources">
            {report.sources.map((source) => <li key={source.number}>{source.organization}: <a href={source.url}>{source.title}</a>{source.year ? ` (${source.year})` : ""}.</li>)}
          </ol>
        </div>
        <div className="rp-method__limits">
          <h2 className="rp-h2">Lo que el diagnóstico no puede afirmar</h2>
          <List items={report.limitations} />
        </div>
      </div>
    ),
  });
  if ("candidateEngineIdentity" in report) {
    blocks.push({
      key: "candidate-technical-appendix",
      node: <section className="rp-technical"><h2 className="rp-h2">Anexo técnico: trazabilidad de la versión</h2><dl>{Object.entries(report.candidateEngineIdentity).map(([key, value]) => <div key={key}><dt>{candidateIdentityLabel(key)}</dt><dd><code>{String(value)}</code></dd></div>)}</dl></section>,
    });
  }
  blocks.push({
    key: "info",
    node: (
      <div className="rp-info">
        <p>{report.disclaimer}</p>
      </div>
    ),
  });
  return blocks;
}

/**
 * Reparto en orden: cada bloque va en la hoja actual si cabe; si no, empieza la siguiente. Un título (o una cadena de
 * títulos y notas encadenados) solo se queda si cabe junto con el primer bloque de contenido que lo sigue. Devuelve la
 * hoja de cada bloque, o `null` si hacen falta más hojas.
 */
export function packBlocks(heights: readonly number[], keepWithNext: readonly boolean[], capacity: number, gap: number, maxSheets: number): number[] | null {
  const sheetOf: number[] = [];
  let sheet = 0;
  let used = 0;
  for (let index = 0; index < heights.length; index += 1) {
    const height = heights[index]!;
    const after = (base: number, extra: number) => (base === 0 ? extra : base + gap + extra);
    let next = 0;
    for (let ahead = index; keepWithNext[ahead] && ahead + 1 < heights.length; ahead += 1) next += gap + heights[ahead + 1]!;
    if (used > 0 && after(used, height) + next > capacity) { sheet += 1; used = 0; }
    if (sheet >= maxSheets || height > capacity) return null;
    used = after(used, height);
    sheetOf.push(sheet);
  }
  return sheetOf;
}

/** `fallback`: reparto ya válido que se conserva mientras se prueba una densidad menor para quitar una última hoja casi vacía. */
type Layout = { readonly level: number; readonly maxSheets: number; readonly phase: "measure" | "packed" | "flow"; readonly sheetOf: readonly number[]; readonly fallback?: { readonly level: number; readonly sheetOf: readonly number[] } };

/** Una última hoja con menos de este uso es un «desborde de una línea»: se intenta absorber con una densidad menor. */
const MIN_LAST_SHEET_FILL = 0.2;

const INITIAL_LAYOUT: Layout = { level: 0, maxSheets: REPORT_PAGE_COUNT, phase: "measure", sheetOf: [] };

export function DiagnosticReport({ report, paper, debug = false, onFit }: { report: DiagnosticReportDocumentV1; paper: ReportPaper; debug?: boolean; onFit?: (fit: ReportFit) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const size = REPORT_PAPERS[paper];
  const blocks = useMemo(() => reportBlocks(report), [report]);
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
  useLayoutEffect(() => setLayout(INITIAL_LAYOUT), [blocks, paper]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    let cancelled = false;
    void (async () => {
      // Fuentes e imágenes listas antes de medir: se mide lo que se va a imprimir.
      await document.fonts?.ready;
      await Promise.all([...node.querySelectorAll("img")].map((image) => (image.complete ? Promise.resolve() : image.decode().catch(() => undefined))));
      if (cancelled) return;
      // Agotada la densidad dentro del objetivo de tres hojas: se repite una vez en el piso tipográfico permitiendo
      // una cuarta hoja, nunca una letra más pequeña. Agotado también eso, el informe no cabe: flujo normal (fallo).
      const next = (level: number, maxSheets: number): Layout => {
        if (level < FLOOR_LEVEL) return { level: level + 1, maxSheets, phase: "measure", sheetOf: [] };
        if (maxSheets === REPORT_PAGE_COUNT) return { level: FLOOR_LEVEL, maxSheets: REPORT_MAX_PAGE_COUNT, phase: "measure", sheetOf: [] };
        return { level, maxSheets, phase: "flow", sheetOf: [] };
      };
      if (layout.phase === "measure") {
        const body = node.querySelector<HTMLElement>(".rp-sheet--measure .rp-sheet__body")!;
        const items = [...body.querySelectorAll<HTMLElement>(":scope > .rp-block")];
        const gap = parseFloat(getComputedStyle(body).rowGap) || 0;
        const heights = items.map((item) => item.getBoundingClientRect().height);
        const sheetOf = packBlocks(heights, blocks.map((block) => block.keepWithNext === true), body.clientHeight, gap, layout.maxSheets);
        if (layout.fallback) {
          // Solo se acepta la densidad menor si de verdad elimina la última hoja.
          const better = sheetOf !== null && Math.max(...sheetOf) < Math.max(...layout.fallback.sheetOf);
          setLayout(better ? { level: layout.level, maxSheets: layout.maxSheets, phase: "packed", sheetOf } : { level: layout.fallback.level, maxSheets: layout.maxSheets, phase: "packed", sheetOf: layout.fallback.sheetOf });
          return;
        }
        if (!sheetOf) { setLayout(next(layout.level, layout.maxSheets)); return; }
        const last = Math.max(...sheetOf);
        const lastHeights = heights.filter((_, index) => sheetOf[index] === last);
        const lastFill = (lastHeights.reduce((sum, height) => sum + height, 0) + gap * (lastHeights.length - 1)) / body.clientHeight;
        if (last > 0 && lastFill < MIN_LAST_SHEET_FILL && layout.level < FLOOR_LEVEL) {
          setLayout({ level: layout.level + 1, maxSheets: layout.maxSheets, phase: "measure", sheetOf: [], fallback: { level: layout.level, sheetOf } });
          return;
        }
        setLayout({ level: layout.level, maxSheets: layout.maxSheets, phase: "packed", sheetOf });
        return;
      }
      const sheets = [...node.querySelectorAll<HTMLElement>(".rp-sheet:not(.rp-sheet--measure)")];
      const overflow = layout.phase === "flow" || sheets.some((sheet) => { const body = sheet.querySelector<HTMLElement>(".rp-sheet__body")!; return body.scrollHeight > body.clientHeight + 1; });
      // Verificación real tras repartir: si alguna hoja desborda (redondeos de medida), se reintenta.
      if (overflow && layout.phase === "packed") { setLayout(next(layout.level, layout.maxSheets)); return; }
      node.dataset.density = String(REPORT_DENSITY_LEVELS[layout.level]);
      node.dataset.pages = layout.phase === "flow" ? "flow" : String(sheets.length);
      node.dataset.overflow = String(overflow);
      node.dataset.ready = "true";
      onFit?.({ density: REPORT_DENSITY_LEVELS[layout.level]!, pages: layout.phase === "flow" ? Number.NaN : sheets.length, overflow });
    })();
    return () => { cancelled = true; };
  }, [layout, blocks, onFit]);

  const density = String(layout.level);
  const sheetCount = layout.phase === "packed" ? Math.max(...layout.sheetOf) + 1 : 1;
  const footer = (page: number, total: number) => (
    // Pie decorativo: fuera del orden de lectura (el número de página no es contenido).
    <p aria-hidden="true" className="rp-sheet__footer">
      <span>Vecidya · Diagnóstico de Presencia Digital · Metodología {report.methodologyVersion}</span>
      <span>{debug ? `${REPORT_DENSITY_LEVELS[layout.level]} pt · ` : ""}Página {page} de {total}</span>
    </p>
  );

  return (
    <div className={`rp${debug ? " rp--debug" : ""}${"candidateCommercial" in report ? " rp--candidate" : ""}`} data-paper={paper} data-ready={layout.phase === "packed" ? "true" : "false"} data-density={REPORT_DENSITY_LEVELS[layout.level]} data-pages={layout.phase === "packed" ? sheetCount : ""} lang="es" ref={root} style={{ "--rp-w": `${size.widthMm}mm`, "--rp-h": `${size.heightMm}mm` } as React.CSSProperties}>
      <style>{`@page { size: ${size.cssSize}; margin: 0; }`}</style>
      {layout.phase === "measure" ? (
        // Hoja de medida: mismo ancho y tipografía que una hoja real; no se imprime ni se lee.
        <div aria-hidden="true" className="rp-sheet rp-sheet--measure" data-density={density}>
          <div className="rp-sheet__body">{blocks.map((block) => <div className="rp-block" key={block.key}>{block.node}</div>)}</div>
          {footer(1, 1)}
        </div>
      ) : null}
      {layout.phase === "packed" ? (
        <article aria-labelledby="rp-title" className="rp-doc">
          {Array.from({ length: sheetCount }, (_, sheet) => (
            <div className="rp-sheet" data-density={density} data-page={sheet + 1} key={sheet}>
              <div className="rp-sheet__body">{blocks.filter((_, index) => layout.sheetOf[index] === sheet).map((block) => <div className="rp-block" key={block.key}>{block.node}</div>)}</div>
              {footer(sheet + 1, sheetCount)}
            </div>
          ))}
        </article>
      ) : null}
      {layout.phase === "flow" ? (
        // No cabe ni en la densidad mínima: flujo normal, sin recortes (la QA lo marca como fallo del límite de páginas).
        <article aria-labelledby="rp-title" className="rp-doc rp-doc--flow" data-density={density}>
          {blocks.map((block) => <div className="rp-block" key={block.key}>{block.node}</div>)}
        </article>
      ) : null}
    </div>
  );
}
