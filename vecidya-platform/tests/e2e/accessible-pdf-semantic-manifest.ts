import type { CandidateDiagnosticReportV1 } from "../../app/components/diagnostic-report/report-model";

export type CandidatePdfSemanticManifest = {
  readonly scenario: string;
  readonly mandatoryText: readonly { path: string; value: string }[];
  readonly links: readonly { path: string; text: string; url: string }[];
  readonly headingOrder: readonly string[];
  readonly classifiedDifferences: readonly { path: string; category: string; reason: string }[];
};

/**
 * Proyección explícita de los campos públicos del modelo Candidate V1 al PDF.
 * Los valores técnicos que no se imprimen se clasifican aquí para que una futura
 * ampliación del modelo falle hasta decidir si el nuevo campo es público.
 */
export function buildCandidatePdfSemanticManifest(
  report: CandidateDiagnosticReportV1,
  scenario: string,
): CandidatePdfSemanticManifest {
  const mandatoryText: { path: string; value: string }[] = [];
  const add = (path: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return;
    mandatoryText.push({ path, value: String(value) });
  };

  add("identity.title", report.identity.title);
  add("identity.businessName", report.identity.businessName);
  add("identity.profileLabel", report.identity.profileLabel);
  add("identity.lifecycleLabel", report.identity.lifecycleLabel);
  add("identity.dateLabel", report.identity.dateLabel);
  add("completedLabel", report.completedLabel);
  add("generatedLabel", report.generatedLabel);
  add("reportVersion", report.reportVersion);
  add("methodologyVersion", report.methodologyVersion);
  add("footer", `Vecidya · Diagnóstico de Presencia Digital · Modelo candidato V3 · Informe ${report.reportVersion} · Método ${report.methodologySummary.version}`);

  add("overallPresence.publicLabelOrLabel", report.overallPresence.publicLabel ?? report.overallPresence.label);
  add("overallPresence.percent", report.overallPresence.percent);
  add("overallPresence.explanation", report.overallPresence.explanation);
  add("overallPresence.confidence.label", report.overallPresence.percent ? report.overallPresence.confidence.label : null);
  add("overallPresence.coverage", report.overallPresence.coverage);

  add("executiveSummary.headline", report.executiveSummary.headline);
  report.executiveSummary.lead.forEach((value, index) => add(`executiveSummary.lead[${index}]`, value));
  add("executiveSummary.currentState", report.executiveSummary.currentState);
  add("primaryConstraint.kicker", report.primaryConstraint.kicker);
  add("primaryConstraint.title", report.primaryConstraint.title);
  add("primaryConstraint.text", report.primaryConstraint.text);
  add("primaryConstraint.certaintyLabel", report.primaryConstraint.certaintyLabel);
  add("primaryConstraint.confidenceLabel", report.primaryConstraint.confidenceLabel);

  report.priorities.forEach((item, index) => {
    add(`priorities[${index}].slotLabel`, item.slotLabel);
    add(`priorities[${index}].area`, item.area);
    add(`priorities[${index}].statement`, item.statement);
    add(`priorities[${index}].why`, item.why);
    add(`priorities[${index}].certaintyLabel`, item.certaintyLabel);
  });
  add("nextFocus", report.nextFocus);
  add("actionPath.emptyNote", report.actionPath.emptyNote);
  report.actionPath.steps.forEach((step, index) => {
    add(`actionPath.steps[${index}].step`, step.step);
    add(`actionPath.steps[${index}].title`, step.title);
    add(`actionPath.steps[${index}].tag`, step.tag);
    add(`actionPath.steps[${index}].area`, step.area);
    step.after.forEach((after, afterIndex) => add(`actionPath.steps[${index}].after[${afterIndex}]`, after));
  });

  for (const group of ["strengths", "areasToStrengthen", "risks"] as const) {
    report[group].forEach((item, index) => {
      add(`${group}[${index}].label`, item.label);
      add(`${group}[${index}].text`, item.text);
    });
  }
  report.mixedSignals.forEach((value, index) => add(`mixedSignals[${index}]`, value));
  report.uncertainties.forEach((group, index) => {
    add(`uncertainties[${index}].title`, group.title);
    group.items.forEach((value, itemIndex) => add(`uncertainties[${index}].items[${itemIndex}]`, value));
  });
  report.dimensionNotes.forEach((value, index) => {
    if (value !== report.overallPresence.coverage) add(`dimensionNotes[${index}]`, value);
  });
  report.dimensions.forEach((dimension, index) => {
    const path = `dimensions[${index}]`;
    add(`${path}.label`, dimension.label);
    add(`${path}.statusLabel`, dimension.statusLabel);
    add(`${path}.percent`, dimension.percent);
    add(`${path}.confidence.label`, dimension.confidence?.label);
    add(`${path}.preliminary`, dimension.preliminary ? "Lectura preliminar" : null);
    add(`${path}.interpretation`, dimension.interpretation);
    const evidence = dimension.evidenceTopics.length ? dimension.evidenceTopics : [dimension.evidenceLead];
    evidence.forEach((value, evidenceIndex) => add(`${path}.evidence[${evidenceIndex}]`, value));
    if (!dimension.percent && dimension.context) {
      add(`${path}.context.applicability`, dimension.context.applicability);
      add(`${path}.context.observability`, dimension.context.observability);
      add(`${path}.context.directEvidence`, dimension.context.directEvidence);
    }
  });

  report.recommendations.forEach((item, index) => {
    const path = `recommendations[${index}]`;
    add(`${path}.step`, item.step);
    add(`${path}.title`, item.title);
    add(`${path}.area`, item.area);
    add(`${path}.tag`, item.tag);
    add(`${path}.whatToImprove`, item.whatToImprove);
    add(`${path}.whyItMatters`, item.whyItMatters);
    add(`${path}.expectedOutcome`, item.expectedOutcome);
    item.conditions?.forEach((value, conditionIndex) => add(`${path}.conditions[${conditionIndex}]`, value));
    add(`${path}.solution.label`, item.solution?.label);
    add(`${path}.solution.description`, item.solution?.description);
  });

  const commercial = report.candidateCommercial;
  add("candidateCommercial.licenseName", commercial.licenseName);
  add("candidateCommercial.certainty", commercial.certainty);
  add("candidateCommercial.rationale", commercial.rationale);
  if (commercial.licenseName) {
    add("candidateCommercial.whyNotLower", commercial.whyNotLower);
    add("candidateCommercial.whyNotHigher", commercial.whyNotHigher);
  }
  commercial.unresolvedSignals.forEach((value, index) => add(`candidateCommercial.unresolvedSignals[${index}]`, value));
  for (const group of ["now", "later"] as const) {
    commercial[group].forEach((item, index) => {
      add(`candidateCommercial.${group}[${index}].name`, item.name);
      add(`candidateCommercial.${group}[${index}].kind`, item.kind);
      add(`candidateCommercial.${group}[${index}].rationale`, item.rationale);
      add(`candidateCommercial.${group}[${index}].priceLabel`, item.priceLabel);
    });
  }
  add("candidateCommercial.monthlyLicenseUsd", commercial.monthlyLicenseUsd);
  add("candidateCommercial.activationUsd", commercial.activationUsd);
  commercial.externalUsageCategories.forEach((value, index) => add(`candidateCommercial.externalUsageCategories[${index}]`, value));

  add("methodologySummary.version", report.methodologySummary.version);
  report.methodologySummary.notes.forEach((value, index) => add(`methodologySummary.notes[${index}]`, value));
  add("methodologySummary.sourcesNote", report.methodologySummary.sourcesNote);
  add("methodologySummary.formulaDistinction", report.methodologySummary.formulaDistinction);
  report.sources.forEach((source, index) => {
    add(`sources[${index}].title`, source.title);
    add(`sources[${index}].organization`, source.organization);
    add(`sources[${index}].year`, source.year);
  });
  report.limitations.forEach((value, index) => add(`limitations[${index}]`, value));
  add("disclaimer", report.disclaimer);

  const links = report.sources.map((source, index) => ({
    path: `sources[${index}].url`,
    text: `Fuente ${source.number}: ${source.title} — ${source.organization}${source.year ? ` · ${source.year}` : ""}`,
    url: source.url,
  }));
  const headingOrder = [
    report.identity.title,
    "Resultado general",
    "Resumen ejecutivo",
    ...(report.primaryConstraint.text ? ["Freno principal"] : []),
    ...(report.priorities.length ? ["Prioridades"] : []),
    ...(report.nextFocus ? ["Siguiente foco"] : []),
    ...(report.actionPath.steps.length || report.actionPath.emptyNote ? ["Ruta de acción"] : []),
    ...(report.strengths.length ? ["Fortalezas"] : []),
    ...(report.areasToStrengthen.length ? ["Áreas por fortalecer"] : []),
    ...(report.risks.length ? ["Dependencias por confirmar"] : []),
    ...(report.mixedSignals.length ? ["Señales que requieren contexto"] : []),
    ...(report.uncertainties.length ? ["Aspectos por confirmar"] : []),
    ...(report.dimensions.length ? ["Dimensiones evaluadas"] : []),
    ...(report.recommendations.length ? ["Recomendaciones"] : []),
    ...(commercial ? ["Compatibilidad comercial"] : []),
    "Metodología y límites",
    ...(report.sources.length ? ["Fuentes"] : []),
  ];

  const classifiedDifferences = [
    { path: "generatedAt", category: "timestamp-internal-alias", reason: "La fecha legible generatedLabel es el texto público obligatorio." },
    { path: "completedAt", category: "timestamp-internal-alias", reason: "La fecha legible completedLabel es el texto público obligatorio." },
    { path: "overallPresence.state", category: "enum-alias", reason: "Se presenta mediante publicLabel o label, sin el enum interno." },
    { path: "overallPresence.label", category: "conditional-alias", reason: "Solo se muestra cuando no existe publicLabel; el HTML aplica la misma condición." },
    { path: "dimensions[*].key", category: "technical-identifier", reason: "La etiqueta humana identifica el área en el informe." },
    { path: "dimensions[*].icon", category: "asset-path", reason: "Los iconos del informe HTML son decorativos (alt vacío); el PDF conserva el nombre del área." },
    { path: "dimensions[*].status", category: "enum-alias", reason: "Se presenta mediante statusLabel." },
    { path: "dimensions[*].evidenceLead", category: "format-alias", reason: "Cuando hay temas, el PDF los presenta bajo Evidencia sin repetir el encabezado genérico." },
    { path: "dimensions[*].context.* where percent is present", category: "non-applicable-detail", reason: "El contexto ampliado solo se presenta en áreas sin porcentaje; el HTML también lo omite." },
    { path: "sources[*].url", category: "link-annotation", reason: "La URL queda en la anotación Link asociada al texto legible de la fuente." },
    { path: "candidateEngineIdentity.*", category: "technical-metadata", reason: "La identidad interna no es copy del cliente ni requisito de literalidad del PDF." },
  ];

  return { scenario, mandatoryText, links, headingOrder, classifiedDifferences };
}
