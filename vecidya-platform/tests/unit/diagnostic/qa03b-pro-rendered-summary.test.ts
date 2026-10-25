import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { CandidateDiagnosticResult } from "../../../app/components/diagnostic-flow/qa03b-result";
import { buildAnonymousDiagnosticSummaryV2 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

test("DIAG-PRO-18: rendered anonymous summary preserves content and report-request gate", () => {
  const issues: string[] = [];
  let renders = 0;
  for (const variant of QA03B_PROFILE_KNOWLEDGE_VARIANTS) {
    let result = runCandidateDiagnosticPipelineV3({});
    const visited = new Set<string>();
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!visited.has(id), `${variant.id}: repeated ${id}`);
      visited.add(id);
      assert.notEqual(variant.answerScript[id], undefined);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: variant.answerScript[id] });
    }
    assert.equal(result.plan.nextQuestionId, undefined);
    const summary = buildAnonymousDiagnosticSummaryV2(result);
    for (const enabled of [true, false]) {
      const html = renderToStaticMarkup(createElement(MemoryRouter, null,
        createElement(CandidateDiagnosticResult, {
          summary, publicMode: true, reportRequestEnabled: enabled,
          onEdit: () => {}, onRequestReport: () => {},
        })));
      renders++;
      const check = (ok: boolean, label: string) => { if (!ok) issues.push(`${variant.id} / ${enabled}: ${label}`); };
      check(html.includes('aria-labelledby="candidate-result-title"'), "accessible title");
      check(html.includes("Tu resumen del diagnóstico"), "main heading");
      check(html.includes(summary.overallStatus), "overall status");
      check(html.includes(summary.confidence) && html.includes(summary.coverage), "confidence/coverage");
      check(summary.score === null || html.includes(`${summary.score}%`), "score");
      check(summary.dimensions.every((d) => html.includes(d.label)), "dimension labels");
      check(summary.firstRecommendedAction === null || html.includes(summary.firstRecommendedAction.title), "recommended action");
      check(html.includes("Solicitar informe completo") === enabled, "report request gating");
      check(html.includes("no está disponible") === !enabled, "unavailable note");
      check(html.includes("Consultar metodología") && html.includes("Editar respuestas"), "navigation");
    }
  }
  console.log("DIAG_PRO_18_RENDERED_SUMMARY=" + JSON.stringify({
    scope: "SSR anonymous result only; not browser/CSS/mobile or identified report",
    profiles: QA03B_PROFILE_KNOWLEDGE_VARIANTS.length, renders, issues,
  }));
  assert.deepEqual(issues, []);
});
