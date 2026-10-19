import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { evaluateRuleV2, type AnswersV2 } from "../qbv2-rules";
import { foldSignalProductions, type SignalOrigin, type SignalProduction } from "../qbv2-signals";
import { lookupNicheArchetypeHints } from "../taxonomy";
import { toNicheId } from "../contracts";
import { deriveContractSignals, resolveContractContext, type ContextResolutionTrace, type ResolvedDomainContext } from "./context";

export type QuestionBankV2 = readonly QuestionDefinitionV2[];
export type ResolveEligibleQuestionsResult = { readonly activeAnswers: AnswersV2; readonly context: ResolvedDomainContext; readonly trace: ContextResolutionTrace; readonly eligibleQuestionIds: readonly string[]; readonly iterations: number };

function validAnswer(question: QuestionDefinitionV2, answer: string | readonly string[]): boolean {
  if (question.type === "single" && typeof answer !== "string") return false;
  if (question.type === "multi" && !Array.isArray(answer)) return false;
  const values = typeof answer === "string" ? [answer] : answer;
  return values.length > 0 && new Set(values).size === values.length && values.every(value => question.options.some(option => option.value === value))
    && (values.length === 1 || !values.some(value => question.options.find(option => option.value === value)?.exclusive));
}
function resolve(answers: AnswersV2, bank: QuestionBankV2) {
  const entries: { origin: SignalOrigin; production: SignalProduction }[] = [];
  for (const question of bank) {
    if (question.contradictionRole?.type === "confirms") continue;
    const answer = answers[question.id];
    const selected = typeof answer === "string" ? [answer] : answer ?? [];
    for (const option of question.options.filter(item => selected.includes(item.value))) {
      for (const production of option.produces ?? []) entries.push({ origin: { questionId: question.id, optionId: option.value }, production });
    }
  }
  const signals = foldSignalProductions(entries);
  const niche = signals.declaredNicheId ? toNicheId(signals.declaredNicheId.value) : undefined;
  return resolveContractContext(signals, deriveContractSignals(answers), niche ? lookupNicheArchetypeHints(niche) : undefined);
}
function eligible(question: QuestionDefinitionV2, answers: AnswersV2, context: ResolvedDomainContext): boolean {
  return (question.appliesWhen ? evaluateRuleV2(question.appliesWhen, answers, context) : !question.materialAppliesWhen)
    || (question.materialAppliesWhen !== undefined && evaluateRuleV2(question.materialAppliesWhen, answers, context));
}
/** Convergencia decreciente y fail-closed; nunca reutiliza el resolver de elegibilidad del banco anterior. */
export function resolveEligibleQuestionsV2(rawAnswers: AnswersV2, bank: QuestionBankV2): ResolveEligibleQuestionsResult {
  const byId = new Map(bank.map(question => [question.id, question]));
  // A duplicate ID would silently overwrite a question and corrupt routing/results.
  if (byId.size !== bank.length) {
    throw new Error("El banco QA-03B contiene identificadores de preguntas duplicados.");
  }
  let current: AnswersV2 = Object.fromEntries(Object.entries(rawAnswers).filter(([id, answer]) => byId.has(id) && validAnswer(byId.get(id)!, answer)));
  for (let iteration = 1; iteration <= bank.length + 1; iteration++) {
    const { context, trace } = resolve(current, bank);
    const next: AnswersV2 = Object.fromEntries(Object.entries(current).filter(([id]) => eligible(byId.get(id)!, current, context)));
    if (Object.keys(next).length === Object.keys(current).length) return {
      activeAnswers: next, context, trace, iterations: iteration,
      eligibleQuestionIds: bank.filter(question => next[question.id] === undefined && eligible(question, next, context)).map(question => question.id),
    };
    current = next;
  }
  throw new Error("El routing QA-03B no convergió dentro del límite del banco.");
}
