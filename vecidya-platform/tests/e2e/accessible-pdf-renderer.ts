import PDFDocument, { registerStdFonts } from "pdfkit";
import Helvetica from "pdfkit/standard-fonts/Helvetica";
import type { CandidateDiagnosticReportV1 } from "../../app/components/diagnostic-report/report-model";

export type PdfRenderInput = {
  report: CandidateDiagnosticReportV1;
  paper: "a4" | "letter";
  fontRegular: Uint8Array;
  fontBold: Uint8Array;
};

const BODY = 8.5;
const SMALL = 8.5;
const BLUE = "#005E8A";

export async function renderAccessiblePdf(input: PdfRenderInput): Promise<Uint8Array> {
  registerStdFonts(Helvetica);
  const doc = new PDFDocument({
    size: input.paper === "a4" ? "A4" : "LETTER",
    margins: { top: 30, bottom: 26, left: 48, right: 48 },
    pdfVersion: "1.7",
    subset: "PDF/UA",
    tagged: true,
    displayTitle: true,
    lang: "es",
    info: { Title: input.report.identity.title, Author: "Vecidya", Subject: "Informe de diagnóstico" },
  });
  doc.registerFont("Arimo", input.fontRegular).registerFont("Arimo-Bold", input.fontBold);
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const done = new Promise<Uint8Array>((resolve, reject) => {
    doc.on("end", () => {
      const result = new Uint8Array(chunks.reduce((sum, part) => sum + part.length, 0));
      let offset = 0;
      for (const part of chunks) { result.set(part, offset); offset += part.length; }
      resolve(result);
    });
    doc.on("error", reject);
  });

  const group = (tag: string, write: () => void) => {
    const element = doc.struct(tag);
    if (doc._currentStructureElement) doc._currentStructureElement.add(element);
    else doc.addStructure(element);
    const previous = doc._currentStructureElement;
    doc._currentStructureElement = element;
    try { write(); }
    finally { doc._currentStructureElement = previous; element.end(); }
    return element;
  };
  const structure = (tag: string, write: () => void) => {
    const element = doc.struct(tag, write);
    if (doc._currentStructureElement) {
      doc._currentStructureElement.add(element);
      if (!element._attached) element.setAttached();
    } else doc.addStructure(element);
    return element;
  };
  const text = (value: string, options: Record<string, unknown> = {}) => doc.text(value, {
    width: doc.page.width - doc.page.margins.right - doc.x,
    paragraphGap: 2,
    ...options,
  });
  const p = (value: string, size = BODY) => {
    if (!value) return;
    structure("P", () => { doc.font("Arimo").fontSize(size).fillColor("#202B33"); text(value); });
  };
  const pair = (label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return;
    structure("P", () => {
      doc.font("Arimo-Bold").fontSize(BODY).fillColor("#202B33");
      text(`${label}: `, { continued: true });
      doc.font("Arimo").fontSize(BODY);
      text(String(value));
    });
  };
  const heading = (value: string, level: 1 | 2 | 3 = 2) => {
    structure(`H${level}`, () => {
      doc.font("Arimo-Bold").fontSize(level === 1 ? 20 : level === 2 ? 12.5 : 10.5).fillColor(level === 1 ? "#123C52" : BLUE);
      text(value, { paragraphGap: level === 1 ? 5 : 3, keepWithNext: true });
    });
  };
  const section = (title: string, write: () => void) => {
    if (doc.y > doc.page.maxY() - 30) doc.addPage();
    group("Sect", () => { heading(title); write(); });
  };
  const list = (items: readonly unknown[], writeItem: (item: any) => void, minimumSpace = 24) => {
    if (!items.length) return;
    group("L", () => items.forEach((item) => {
      if (doc.y > doc.page.maxY() - minimumSpace) doc.addPage();
      group("LI", () => {
        const startX = doc.x;
        const startY = doc.y;
        structure("Lbl", () => { doc.font("Arimo").fontSize(BODY).fillColor("#202B33"); text("•", { lineBreak: false }); });
        doc.x = startX + 12;
        doc.y = startY;
        group("LBody", () => writeItem(item));
        doc.x = startX;
      });
    }));
  };
  const labeledList = (items: readonly { label: string; text: string }[]) => list(items, (item) => {
    pair(item.label, item.text);
  });
  const externalLink = (name: string, url: string) => structure("Link", () => {
    doc.font("Arimo").fontSize(SMALL).fillColor(BLUE);
    const x = doc.x;
    const y = doc.y;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const height = doc.heightOfString(name, { width });
    text(name, { underline: true, paragraphGap: 2 });
    doc.link(x, y, width, height, url, {
      structParent: doc._currentStructureElement,
      Contents: new String(`Abrir fuente: ${name}`),
    });
    doc.fillColor("#202B33");
  });

  const report = input.report;
  group("Document", () => {
    heading(report.identity.title, 1);
    if (report.identity.businessName) p(report.identity.businessName);
    pair("Perfil", report.identity.profileLabel);
    pair("Etapa", report.identity.lifecycleLabel);
    pair(report.identity.dateLabel, report.completedLabel);
    pair("Fecha de generación del informe", report.generatedLabel);

    section("Resultado general", () => {
      pair("Resultado", report.overallPresence.publicLabel ?? report.overallPresence.label);
      pair("Puntuación", report.overallPresence.percent);
      p(report.overallPresence.explanation);
      pair("Confianza", report.overallPresence.confidence.label);
      p(report.overallPresence.coverage);
      if (report.overallPresence.warning) p(report.overallPresence.warning);
    });

    section("Resumen ejecutivo", () => {
      if (report.executiveSummary.headline) p(report.executiveSummary.headline);
      report.executiveSummary.lead.forEach((value) => p(value));
      p(report.executiveSummary.currentState);
    });

    if (report.primaryConstraint.text) section("Freno principal", () => {
      pair("Lectura", report.primaryConstraint.kicker);
      pair("Área", report.primaryConstraint.title);
      p(report.primaryConstraint.text);
      pair("Certeza", report.primaryConstraint.certaintyLabel);
      pair("Confianza", report.primaryConstraint.confidenceLabel);
    });

    if (report.priorities.length) section("Prioridades", () => list(report.priorities, (item) => {
      pair(item.slotLabel, item.area ? `${item.area}: ${item.statement}` : item.statement);
      p(item.why);
      pair("Certeza", item.certaintyLabel);
    }));
    if (report.nextFocus) section("Siguiente foco", () => p(report.nextFocus!));

    if (report.actionPath.steps.length || report.actionPath.emptyNote) section("Ruta de acción", () => {
      if (report.actionPath.emptyNote) p(report.actionPath.emptyNote);
      list(report.actionPath.steps, (step) => {
        pair(`Paso ${step.step}`, step.title);
        pair("Enfoque", step.tag);
        if (step.area) pair("Área", step.area);
        if (step.after.length) pair("Después de", step.after.join(", "));
      });
    });

    if (report.strengths.length) section("Fortalezas", () => labeledList(report.strengths));
    if (report.areasToStrengthen.length) section("Áreas por fortalecer", () => labeledList(report.areasToStrengthen));
    if (report.risks.length) section("Dependencias por confirmar", () => labeledList(report.risks));
    if (report.mixedSignals.length) section("Señales que requieren contexto", () => list(report.mixedSignals, p));
    if (report.uncertainties.length) section("Aspectos por confirmar", () => list(report.uncertainties, (item) => {
      heading(item.title, 3);
      list(item.items, p);
    }));

    if (report.dimensions.length) section("Dimensiones evaluadas", () => {
      const distinctNotes = report.dimensionNotes.filter((value) => value !== report.overallPresence.coverage);
      if (distinctNotes.length) distinctNotes.forEach((value) => p(value));
      if (report.dimensions.some((dimension) => !dimension.percent)) {
        p("Una dimensión sin preguntas pertinentes queda sin evaluar; no se interpreta como resultado negativo.");
      }
      list(report.dimensions, (dimension) => {
        heading(dimension.label, 3);
        const reading = [dimension.statusLabel, dimension.percent, dimension.confidence?.label ? `confianza ${dimension.confidence.label}` : null].filter(Boolean).join(" · ");
        pair("Lectura", reading);
        if (dimension.preliminary) p("Lectura preliminar.");
        p(dimension.interpretation);
        const evidence = dimension.evidenceTopics.length ? dimension.evidenceTopics.join("; ") : dimension.evidenceLead;
        if (evidence) pair("Evidencia", evidence);
        if (dimension.context && !dimension.percent) {
          pair("Contexto", `${dimension.context.applicability} · ${dimension.context.observability} · ${dimension.context.directEvidence}`);
        }
      });
    });

    if (report.recommendations.length) section("Recomendaciones", () => list(report.recommendations, (item) => {
      heading(item.title, 3);
      if (item.area) pair("Área", item.area);
      pair("Enfoque", item.tag);
      p(item.whatToImprove);
      p(item.whyItMatters);
      p(item.expectedOutcome);
      if (item.conditions?.length) {
        pair("Antes de empezar", item.conditions.join(" "));
      }
      if (item.solution) pair(item.solution.label, item.solution.description);
    }, 110));

    const commercial = report.candidateCommercial;
    if (commercial) section("Compatibilidad comercial", () => {
      pair("Licencia sugerida", commercial.licenseName);
      pair("Certeza", commercial.certainty);
      p(commercial.rationale);
      p(commercial.whyNotLower);
      p(commercial.whyNotHigher);
      if (commercial.unresolvedSignals.length) list(commercial.unresolvedSignals, p);
      const offerings = (title: string, items: typeof commercial.now) => {
        if (!items.length) return;
        heading(title, 3);
        list(items, (item) => {
          pair(item.name, item.rationale);
          pair("Tipo", item.kind);
          pair("Precio", item.priceLabel);
        });
      };
      offerings("Aplicable ahora", commercial.now);
      offerings("Para una etapa posterior", commercial.later);
      pair("Licencia mensual (USD)", commercial.monthlyLicenseUsd);
      pair("Activación (USD)", commercial.activationUsd);
      if (commercial.externalUsageCategories.length) pair("Costos de terceros", commercial.externalUsageCategories.join(", "));
    });

    section("Metodología y límites", () => {
      pair("Versión metodológica", report.methodologySummary.version);
      report.methodologySummary.notes.forEach((value) => p(value));
      p(report.methodologySummary.sourcesNote);
      p(report.methodologySummary.formulaDistinction);
      list(report.limitations, p);
      p(report.disclaimer);
    });

    if (report.sources.length) {
      const sourcesBlockSpace = Math.min(220, report.sources.length * 20 + 30);
      if (doc.y > doc.page.maxY() - sourcesBlockSpace) doc.addPage();
      section("Fuentes", () => list(report.sources, (source) => {
        const publisher = `${source.organization}${source.year ? ` · ${source.year}` : ""}`;
        externalLink(`Fuente ${source.number}: ${source.title} — ${publisher}`, source.url);
      }));
    }

    structure("P", () => {
      doc.font("Arimo").fontSize(SMALL).fillColor("#677780");
      text(`Vecidya · Diagnóstico de Presencia Digital · Modelo candidato V3 · Informe ${report.reportVersion} · Método ${report.methodologySummary.version}`);
    });
  });

  // PDFKit 0.20.2 reuses the numeric PDF/UA identifier as a condition for writing a CIDSet.
  // veraPDF detects that generated CIDSet as incomplete. Preserve PDF/UA metadata and font
  // subsetting while skipping only this optional entry; pinning and regression-checking are required.
  for (const font of Object.values(doc._fontFamilies) as Array<{ finalize: () => void }>) {
    const finalize = font.finalize;
    font.finalize = function () {
      const subset = doc.subset;
      doc.subset = false;
      try { return finalize.call(this); }
      finally { doc.subset = subset; }
    };
  }
  doc.end();
  return done;
}
