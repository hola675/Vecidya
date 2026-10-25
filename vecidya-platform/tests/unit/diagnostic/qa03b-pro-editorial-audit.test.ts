import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

const FIELDS = ["title", "whatToImprove", "whyItMatters", "evidence", "expectedOutcome"] as const;
const wordCount = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;
const normalized = (value: string) => value.toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

test("DIAG-PRO-14: concise professional recommendation copy inventory and editorial review flags", () => {
  const rows = QA03B_PROFILE_KNOWLEDGE_VARIANTS.flatMap((variant) => {
    let result = runCandidateDiagnosticPipelineV3({});
    const visited = new Set<string>();
    for (let turn = 0; result.plan.nextQuestionId && turn < 30; turn++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!visited.has(id), `${variant.id}: repeated ${id}`);
      visited.add(id);
      const answer = variant.answerScript[id];
      assert.notEqual(answer, undefined, `${variant.id}: missing ${id}`);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: answer });
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: unfinished`);
    return result.recommendations.items.map((item) => {
      const texts = { title: item.title, whatToImprove: item.whatToImprove, whyItMatters: item.whyItMatters,
        evidence: item.evidence.text, expectedOutcome: item.expectedOutcome };
      const fullText = [texts.whatToImprove, texts.whyItMatters, texts.expectedOutcome].join(" ");
      const flags = {
        lengthyCore: wordCount(fullText) > 70,
        veryShortCore: wordCount(fullText) < 20,
        longSentence: Object.values(texts).some((value) => value.split(/[.!?]+/u).some((sentence) => wordCount(sentence) > 35)),
        duplicateCore: normalized(texts.whatToImprove) === normalized(texts.expectedOutcome),
        missingText: Object.values(texts).some((value) => value.trim().length === 0),
        uncertainWithImprovement: item.mode === "verify" && !/confirmar|verificar|revisar|comprobar|identificar|registrar|medir|conocer/i.test(texts.whatToImprove),
      };
      return { profile: variant.id, id: item.id, mode: item.mode, dimension: item.dimension, framing: item.framing,
        texts, words: Object.fromEntries(FIELDS.map((field) => [field, wordCount(texts[field])])),
        coreWords: wordCount(fullText), flags };
    });
  });
  const flagNames = ["lengthyCore", "veryShortCore", "longSentence", "duplicateCore", "missingText", "uncertainWithImprovement"] as const;
  const flagged = Object.fromEntries(flagNames.map((name) => [name, rows.filter((row) => row.flags[name]).map((row) => ({ profile: row.profile, id: row.id }))]));
  const uniqueCopy = new Map<string, { occurrences: number; example: (typeof rows)[number] }>();
  for (const row of rows) {
    const key = JSON.stringify({ mode: row.mode, dimension: row.dimension, texts: row.texts });
    const previous = uniqueCopy.get(key);
    uniqueCopy.set(key, { occurrences: (previous?.occurrences ?? 0) + 1, example: previous?.example ?? row });
  }
  console.log("DIAG_PRO_14_EDITORIAL_AUDIT=" + JSON.stringify({
    scope: "synthetic journeys; automated length/repetition checks are review cues, not editorial verdicts",
    totals: { profiles: QA03B_PROFILE_KNOWLEDGE_VARIANTS.length, recommendations: rows.length, uniqueCopy: uniqueCopy.size },
    flagged, copySamples: [...uniqueCopy.values()], rows,
  }));
});
