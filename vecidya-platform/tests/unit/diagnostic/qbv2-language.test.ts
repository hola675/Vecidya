import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  ANSWER_SEMANTICS, AUDIT_CLASSES, DIGITAL_DIMENSION_IDS, DIMENSION_RESULT_CONCEPT, GOLDEN_PERSONAS, HARSH_RESULT_PHRASES, LIVE_ONLY_STAGES, QUESTION_BANK_V2, QUESTION_LANGUAGE,
  RESULT_CATEGORIES, RESULT_CERTAINTY_LEVELS, RESULT_VOCABULARY, ROUTE_HARD_CAP, SEMANTIC_FACT_TYPES, TERMINOLOGY, TERMINOLOGY_PROFILE_IDS, TERM_ROLES,
  buildQuestionPlan, canClaimStage, deriveConstraintsAndPriorities, deriveContextualEvidence, deriveSemanticFacts, renderQuestionV2, resolveEligibleQuestionsV2,
  resolveTerm, resolveTerminologyProfile, resultCategory, resultCertainty, resultSubject, runGoldenPersonaPipeline, scoreContextualDimensions, validateQuestionCopyV2, visibleCopyOf,
  type AnswersV2, type QuestionDefinitionV2, type RenderedQuestionV2, type SemanticFact, type TerminologyProfileId,
} from "../../../app/features/diagnostic/index.ts";

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const context = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2).context;
const render = (id: string, answers: AnswersV2) => renderQuestionV2(byId.get(id)!, { context: context(answers), answers });
const live = { q2_has_customers: "yes", q2_regularity: "regular" } as const;

/** Un contexto real (resuelto por el motor) por perfil de lenguaje. */
const PROFILE_SEEDS: Readonly<Record<TerminologyProfileId, AnswersV2>> = {
  generic: {},
  prelaunch: { q2_entity: "project", q2_has_customers: "no" },
  local: { ...live, q2_delivery: "fixed_no_inventory", q2_monetization: "time_or_project" },
  local_service: { ...live, q2_delivery: "travels", q2_monetization: "time_or_project" },
  appointments: { ...live, q2_delivery: "scheduled", q2_sector: "beauty_personal_care", q2_monetization: "time_or_project" },
  clinical: { ...live, q2_delivery: "scheduled", q2_sector: "health_wellness", q2_monetization: "licensed" },
  professional: { ...live, q2_delivery: "solo_practice", q2_monetization: "time_or_project" },
  retail: { ...live, q2_delivery: "fixed_with_inventory", q2_monetization: "goods" },
  ecommerce: { ...live, q2_delivery: "online_checkout", q2_monetization: "goods" },
  hospitality: { ...live, q2_delivery: "onsite", q2_monetization: "goods" },
  b2b: { ...live, q2_delivery: "b2b_pipeline", q2_customer_buyer: "b2b", q2_monetization: "time_or_project" },
  creator: { ...live, q2_delivery: "audience_content", q2_monetization: "audience" },
  nonprofit: { ...live, q2_entity: "organization", q2_delivery: "fixed_no_inventory", q2_monetization: "mission" },
};

// ── Rutas generadas: render en el momento de preguntar ──────────────────────

type AskedRender = { readonly route: string; readonly rendered: RenderedQuestionV2; readonly prelaunch: boolean };
const pick = (question: QuestionDefinitionV2, policy: "first" | "last") => {
  const options = question.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable" && !option.exclusive);
  const option = (policy === "first" ? options[0] : options[options.length - 1]) ?? question.options[0]!;
  return question.type === "multi" ? [option.value] : option.value;
};
const ASKED: readonly AskedRender[] = (() => {
  const stages = { idea: { q2_entity: "project", q2_has_customers: "no" }, starting: { q2_has_customers: "yes", q2_regularity: "irregular" }, operating: { ...live } };
  const deliveries = byId.get("q2_delivery")!.options.map((option) => ({ q2_delivery: option.value }));
  const seeds = [...deliveries, { q2_delivery: "fixed_no_inventory", q2_monetization: "mission" }, { q2_delivery: "scheduled", q2_sector: "health_wellness", q2_monetization: "licensed" }, { q2_delivery: "solo_practice", q2_sector: "health_wellness", q2_monetization: "licensed" }];
  const asked: AskedRender[] = [];
  for (const policy of ["first", "last"] as const) for (const [stage, stageSeed] of Object.entries(stages)) for (const seed of seeds) for (const goal of ["opportunities", "measure", "organize", "trust"]) for (const friction of ["visibility", "conversion", "follow_up", "operations", "scale", "trust"]) {
    const answers: Record<string, string | readonly string[]> = { ...stageSeed, ...seed, q2_goal: goal, q2_friction: friction };
    const route = JSON.stringify({ policy, stage, ...seed, goal, friction });
    for (const id of Object.keys(answers)) asked.push({ route, rendered: render(id, answers), prelaunch: stage === "idea" });
    for (let batch = 0; batch <= ROUTE_HARD_CAP; batch += 1) {
      const plan = buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 });
      const fresh = plan.selectedQuestionIds.filter((id) => answers[id] === undefined);
      if (fresh.length === 0) break;
      const askedContext = context(answers);
      for (const id of fresh) asked.push({ route, rendered: renderQuestionV2(byId.get(id)!, { context: askedContext, answers }), prelaunch: stage === "idea" });
      for (const id of fresh) answers[id] = pick(byId.get(id)!, policy);
    }
  }
  return asked;
})();

const containsTerm = (text: string, term: string) => new RegExp(`(^|[^\\p{L}])${term.toLowerCase()}`, "u").test(text.toLowerCase());

// ── Terminología ─────────────────────────────────────────────────────────────

test("08F terminology: every profile resolves from a real engine context and defines every role", () => {
  for (const profile of TERMINOLOGY_PROFILE_IDS) {
    const answers = PROFILE_SEEDS[profile];
    assert.equal(resolveTerminologyProfile(context(answers), answers), profile, profile);
    for (const role of TERM_ROLES) assert.ok(resolveTerm(role, profile).trim().length > 0, `${profile}.${role}`);
    assert.equal(TERMINOLOGY[profile].id, profile);
  }
  // Bienestar sin práctica con licencia no es clínico; un proyecto sin etapa resuelta ya habla en pre-lanzamiento.
  const spa = { ...live, q2_delivery: "scheduled", q2_sector: "health_wellness", q2_monetization: "time_or_project" } as const;
  assert.equal(resolveTerminologyProfile(context(spa), spa), "appointments");
  assert.equal(resolveTerminologyProfile(context({ q2_entity: "project" }), { q2_entity: "project" }), "prelaunch");
  // Un archetype híbrido usa el perfil neutral; una organización antes del lanzamiento habla en pre-lanzamiento.
  const hybrid = { ...live, q2_delivery: "fixed_with_inventory", q2_monetization: ["goods", "audience"] } as unknown as AnswersV2;
  assert.ok(["generic", "retail"].includes(resolveTerminologyProfile(context(hybrid), hybrid)));
  const prelaunchOrganization = { q2_entity: "organization", q2_has_customers: "no", q2_monetization: "mission" } as const;
  assert.equal(resolveTerminologyProfile(context(prelaunchOrganization), prelaunchOrganization), "prelaunch");
  // Los roles distinguen las etapas: interés, primer contacto y cliente nunca comparten el mismo sustantivo.
  for (const profile of TERMINOLOGY_PROFILE_IDS) {
    const terms = TERMINOLOGY[profile].terms;
    assert.equal(new Set([terms.audience, terms.interested, terms.customer, terms.repeat_customer]).size, 4, `${profile}: stages collapsed`);
  }
});

// ── Contrato de copy ─────────────────────────────────────────────────────────

test("08F copy contract: hints, variants, help and labels are valid; no placeholders or internal markers", () => {
  assert.deepEqual(validateQuestionCopyV2(QUESTION_BANK_V2), []);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(Object.keys(QUESTION_LANGUAGE).sort(), QUESTION_BANK_V2.map((question) => question.id).sort());
  for (const question of QUESTION_BANK_V2) {
    const entry = QUESTION_LANGUAGE[question.id]!;
    assert.equal(entry.copy === "variant", (question.variants?.length ?? 0) > 0, `${question.id}: copy mode`);
    assert.equal(entry.audit === "keep", entry.finding === undefined, `${question.id}: every non-keep class records its finding`);
    if (entry.help !== "not_needed") assert.ok(question.helpIntent?.understand && question.helpIntent.distinction && question.helpIntent.why, `${question.id}: ${entry.help} help needs what/how/why`);
    if (question.helpIntent) assert.ok(question.helpIntent.why, `${question.id}: help explains why it matters`);
  }
});

test("08F canonical contract: display copy never changes values, kinds, signals, rules or ANSWER_SEMANTICS (frozen at 0bd6a73, except the two 08F.1 answer scales)", () => {
  // DIAG-V3-08F.1 cambia intencionalmente el espacio de respuestas de dos preguntas (verificado en qbv2-answer-scale.test.ts);
  // todo lo demás conserva la huella del motor congelado.
  const CHANGED = new Set(["q2_reputation_flow", "q2_ecommerce_traffic_sources"]);
  const canonical = QUESTION_BANK_V2.filter((q) => !CHANGED.has(q.id)).map((q) => ({
    id: q.id, version: q.version, module: q.module, type: q.type, purpose: q.purpose, priority: q.priority, appliesWhen: q.appliesWhen ?? null, materialAppliesWhen: q.materialAppliesWhen ?? null,
    scoringReadiness: q.scoringReadiness ?? null, contradictionRole: q.contradictionRole ?? null,
    options: q.options.map((o) => ({ value: o.value, kind: o.kind ?? null, exclusive: o.exclusive ?? false, produces: o.produces ?? [] })),
  }));
  const semantics = Object.fromEntries(Object.entries(ANSWER_SEMANTICS).filter(([id]) => !CHANGED.has(id)));
  const fingerprint = createHash("sha256").update(JSON.stringify({ canonical, semantics })).digest("hex");
  assert.equal(fingerprint, "ab46c7f1ef618bfb987e6f3b54a52ae4522e37e751b459a5e5ddacbb8caa611c");
});

test("08F variants: every variant resolves in a real context and keeps the canonical options", () => {
  const used = new Set<string>();
  for (const profile of TERMINOLOGY_PROFILE_IDS) for (const question of QUESTION_BANK_V2) {
    const rendered = renderQuestionV2(question, { context: context(PROFILE_SEEDS[profile]), answers: PROFILE_SEEDS[profile] });
    assert.deepEqual(rendered.options.map((option) => [option.value, option.kind ?? null]), question.options.map((option) => [option.value, option.kind ?? null]), `${question.id}@${profile}`);
    assert.ok(rendered.prompt.trim() && rendered.options.every((option) => option.label.trim()), `${question.id}@${profile}: empty copy`);
    assert.equal(new Set(rendered.options.map((option) => option.label)).size, rendered.options.length, `${question.id}@${profile}: duplicate labels`);
    if (rendered.variant !== null) used.add(`${question.id}#${rendered.variant}`);
  }
  const declared = QUESTION_BANK_V2.flatMap((question) => (question.variants ?? []).map((_, index) => `${question.id}#${index}`));
  assert.deepEqual(declared.filter((key) => !used.has(key)), [], "dead variants");
  // Render determinista y serializable.
  const first = ASKED.slice(0, 400).map((item) => item.rendered);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
});

// ── Terminología por contexto sobre rutas reales ────────────────────────────

test("08F terminology in context: asked questions avoid each profile's wrong terms, including help", () => {
  assert.ok(ASKED.length > 10_000);
  const offenders = new Map<string, string>();
  for (const { rendered, route } of ASKED) {
    if (QUESTION_LANGUAGE[rendered.id]!.copy === "static") continue;
    const text = visibleCopyOf(rendered);
    for (const term of TERMINOLOGY[rendered.profile].avoid) if (containsTerm(text, term)) offenders.set(`${rendered.id}@${rendered.profile}: «${term}»`, route);
  }
  assert.deepEqual([...offenders.keys()], [], JSON.stringify([...offenders].slice(0, 3)));
});

test("08F plain language: no marketing jargon in any rendered question, hint, option or help", () => {
  const JARGON = ["lead", "leads", "funnel", "embudo", "crm", "pipeline", "conversión", "retención", "adquisición", "tráfico", "engagement", "kpi", "roi", "cuello de botella", "inventario de reventa", "monetizo"];
  const offenders = new Set<string>();
  for (const { rendered } of ASKED) for (const word of JARGON) if (containsTerm(visibleCopyOf(rendered), word)) offenders.add(`${rendered.id}@${rendered.profile}: ${word}`);
  assert.deepEqual([...offenders], []);
});

// ── Ciclo de vida ────────────────────────────────────────────────────────────

test("08F lifecycle: pre-launch routes speak in pre-launch language and never ask about inquiries, opportunities or customers", () => {
  for (const { rendered, prelaunch, route } of ASKED.filter((item) => item.prelaunch)) {
    const stage = QUESTION_LANGUAGE[rendered.id]!.stage;
    assert.ok(!LIVE_ONLY_STAGES.includes(stage), `${route}: ${rendered.id} (${stage}) asked before launch`);
    if (!["q2_entity", "q2_has_customers"].includes(rendered.id) && prelaunch) assert.equal(rendered.profile, "prelaunch", `${route}: ${rendered.id}`);
  }
  // Etapas solo-operación: inelegibles en pre-lanzamiento declarado para cualquier entrega.
  for (const { q2_delivery } of byId.get("q2_delivery")!.options.map((option) => ({ q2_delivery: option.value }))) {
    const eligible = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no", q2_delivery }, QUESTION_BANK_V2).eligibleQuestionIds;
    assert.deepEqual(eligible.filter((id) => LIVE_ONLY_STAGES.includes(QUESTION_LANGUAGE[id]!.stage)), [], q2_delivery);
  }
  // Una tienda que todavía no existe es incertidumbre legítima, no una tienda difícil de navegar.
  const idea = { q2_entity: "project", q2_has_customers: "no", q2_delivery: "online_checkout" } as const;
  const discovery = render("q2_ecommerce_product_discovery", idea);
  assert.equal(discovery.profile, "prelaunch");
  assert.match(discovery.options.find((option) => option.value === "unknown")!.label, /Todavía no tengo tienda/);
  assert.deepEqual(deriveContextualEvidence({ q2_ecommerce_product_discovery: "unknown" }).map((evidence) => evidence.state), ["uncertainty", "uncertainty", "uncertainty"]);
});

// ── Meta y fricción ──────────────────────────────────────────────────────────

test("08F goal and friction: canonical values intact; context labels stay plain, distinct and in the right voice", () => {
  assert.deepEqual(byId.get("q2_goal")!.options.map((option) => option.value), ["be_found", "opportunities", "explain", "trust", "stop_losing", "organize", "automate", "measure", "unsure"]);
  assert.deepEqual(byId.get("q2_friction")!.options.map((option) => option.value), ["visibility", "trust", "conversion", "follow_up", "operations", "scale"]);
  const nonprofitGoal = render("q2_goal", PROFILE_SEEDS.nonprofit);
  assert.match(nonprofitGoal.options.find((option) => option.value === "opportunities")!.label, /apoyo/);
  const nonprofitFriction = render("q2_friction", PROFILE_SEEDS.nonprofit);
  assert.ok(nonprofitFriction.options.filter((option) => /\bme\b|\bmi\b/i.test(option.label)).length === 0, "an organization speaks as «nos», not «me»");
  const prelaunchGoal = render("q2_goal", PROFILE_SEEDS.prelaunch);
  assert.match(prelaunchGoal.options.find((option) => option.value === "opportunities")!.label, /primer/);
  // "consultas" significa otra cosa en salud: la fricción no la usa en ningún contexto.
  for (const profile of TERMINOLOGY_PROFILE_IDS) assert.ok(!/consulta|cierro|nadie/i.test(visibleCopyOf(render("q2_friction", PROFILE_SEEDS[profile]), { includeHelp: false })), profile);
});

// ── Comparación entre perfiles: cambia el wording, no lo que se mide ────────

test("08F cross-profile: the conversion question changes its wording but never its stage, options or semantics", () => {
  const prompts = new Map<TerminologyProfileId, string>();
  for (const profile of ["professional", "ecommerce", "b2b", "nonprofit", "local_service", "hospitality", "clinical"] as const) {
    const rendered = render("q2_conversion_interest_to_action", PROFILE_SEEDS[profile]);
    prompts.set(profile, rendered.prompt);
    assert.deepEqual(rendered.options.map((option) => option.value), ["most", "about_half", "few", "unknown"]);
    assert.match(rendered.prompt, /interés|preguntan|solicitan/, `${profile}: still measures interested people`);
    assert.ok(!/clientes perdidos|pierdes clientes/.test(rendered.prompt));
  }
  assert.match(prompts.get("ecommerce")!, /comprando/);
  assert.match(prompts.get("b2b")!, /empresas/);
  assert.match(prompts.get("nonprofit")!, /apoyar o participar/);
  assert.match(prompts.get("clinical")!, /cita/);
  assert.ok(!/cotización/.test(prompts.get("ecommerce")!) && !/cotización/.test(prompts.get("hospitality")!));
  assert.equal(new Set(prompts.values()).size, 6, "professional and local_service share the neutral base");
  assert.deepEqual(QUESTION_LANGUAGE.q2_conversion_interest_to_action!.stage, "interested");
});

// ── Trazas pregunta → resultado ─────────────────────────────────────────────

function personaChain(id: string) {
  const persona = GOLDEN_PERSONAS.find((item) => item.id === id)!;
  const answers = runGoldenPersonaPipeline(persona).answers;
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const facts = deriveSemanticFacts({ answers, scoring, priorities }).facts;
  return { answers, scoring, facts, profile: resolveTerminologyProfile(context(answers), answers) };
}
const factFor = (facts: readonly SemanticFact[], questionId: string, dimension: string) => facts.find((fact) => fact.dimension === dimension && ["strength", "partial", "weakness"].includes(fact.type) && fact.provenance.questionIds.includes(questionId));

test("08F trace: displayed question → canonical answer → evidence → state → fact → result concept keeps its stage", () => {
  const cases = [
    { persona: "ecommerce", question: "q2_conversion_interest_to_action", prompt: /comprando/, label: "Pocas", value: "few", dimension: "conversion_access", state: "weak", stage: "interested", forbidden: "customer" as const },
    { persona: "nonprofit_community", question: "q2_conversion_interest_to_action", prompt: /apoyar o participar/, label: "Pocas", value: "few", dimension: "conversion_access", state: "weak", stage: "interested", forbidden: "customer" as const },
    { persona: "appointment_business", question: "q2_appointments_confirmation_reminders", prompt: /pacientes/, label: "Sí, de forma automática", value: "automatic", dimension: "relationship_recurrence", state: "strong", stage: "customer", forbidden: undefined },
    { persona: "local_service_business", question: "q2_presence_digital_base", prompt: /lugar propio/, label: "Solo perfiles en redes o plataformas que no controlo", value: "third_party_only", dimension: "digital_foundation", state: "dependency", stage: "audience", forbidden: "customer" as const },
    // Antes del lanzamiento: respuesta fuerte, pero una sola lectura de apoyo → el resultado solo puede decir «hay señales».
    { persona: "idea_early_stage", question: "q2_startup_problem_clarity", prompt: /problema concreto/, label: "Sí, puedo describir ambos con claridad", value: "clear_audience_problem", dimension: "clarity_positioning", state: "strong", stage: "business", forbidden: "customer" as const, certainty: "probable" as const },
  ];
  for (const item of cases) {
    const chain = personaChain(item.persona);
    const rendered = renderQuestionV2(byId.get(item.question)!, { context: context(chain.answers), answers: chain.answers });
    assert.match(rendered.prompt, item.prompt, `${item.persona}: displayed question`);
    assert.equal(chain.answers[item.question], item.value, `${item.persona}: canonical answer`);
    assert.equal(rendered.options.find((option) => option.value === item.value)!.label, item.label, `${item.persona}: displayed answer`);
    const evidence = deriveContextualEvidence({ [item.question]: item.value }).find((entry) => entry.dimension === item.dimension)!;
    assert.equal(evidence.state, item.state, `${item.persona}: semantic state`);
    const dimension = chain.scoring.dimensions.find((entry) => entry.id === item.dimension)!;
    assert.ok(dimension.evidence.some((entry) => entry.questionId === item.question && entry.state === item.state), `${item.persona}: score input`);
    const fact = factFor(chain.facts, item.question, item.dimension)!;
    assert.ok(fact, `${item.persona}: semantic fact keeps provenance`);
    assert.ok(RESULT_CATEGORIES.includes(resultCategory(fact)) && RESULT_CERTAINTY_LEVELS.includes(resultCertainty(fact)));
    assert.equal(QUESTION_LANGUAGE[item.question]!.stage, item.stage);
    if ("certainty" in item) assert.equal(resultCertainty(fact), item.certainty, `${item.persona}: certainty`);
    if (item.forbidden) assert.equal(canClaimStage(fact, item.forbidden), false, `${item.persona}: result cannot jump to «${item.forbidden}»`);
    else assert.equal(canClaimStage(fact, "customer"), true);
    assert.ok(resultSubject(fact, chain.profile)!.term.length > 0);
  }
  // Antes del lanzamiento la demanda declarada solo apoya: no hay lectura de conversión que el resultado pueda afirmar.
  const idea = personaChain("idea_early_stage");
  assert.equal(idea.answers.q2_startup_demand_signal, "interest");
  assert.equal(idea.facts.some((fact) => fact.dimension === "conversion_access"), false);
  // Una sola fuente de pedidos se lee como dependencia; el copy pide marcar todas para que esa lectura sea cierta.
  assert.match(byId.get("q2_ecommerce_traffic_sources")!.hint!, /todas/);
  const sources = (values: readonly string[]) => deriveContextualEvidence({ q2_ecommerce_traffic_sources: values } as AnswersV2).find((entry) => entry.dimension === "discovery")!.state;
  assert.deepEqual([sources(["social"]), sources(["social", "search"]), sources(["social", "search", "ads", "referral"])], ["dependency", "partial", "established"]);
});

test("08F trace: the clinical result subject is the patient, the nonprofit one the supporter; certainty never upgrades", () => {
  const clinical = personaChain("appointment_business");
  assert.equal(clinical.profile, "clinical");
  const reminders = factFor(clinical.facts, "q2_appointments_confirmation_reminders", "relationship_recurrence")!;
  assert.deepEqual(resultSubject(reminders, clinical.profile), { stage: "customer", term: "tus pacientes" });
  const nonprofit = personaChain("nonprofit_community");
  const conversion = factFor(nonprofit.facts, "q2_conversion_interest_to_action", "conversion_access")!;
  assert.equal(resultSubject(conversion, nonprofit.profile)!.term, "las personas interesadas en apoyar o participar");
  for (const persona of GOLDEN_PERSONAS) for (const fact of personaChain(persona.id).facts) {
    const certainty = resultCertainty(fact);
    if (fact.type === "evidence_gap" || fact.type === "uncertainty") assert.equal(certainty, "unknown", fact.id);
    if (fact.certainty === "likely" || fact.certainty === "signal") assert.equal(certainty, "probable", fact.id);
    if (fact.type === "priority" && fact.priority!.actionability === "verify_first") assert.equal(certainty, "unknown", fact.id);
    // Interés que no avanza nunca se nombra como clientes perdidos.
    const stages = fact.provenance.questionIds.map((id) => QUESTION_LANGUAGE[id]?.stage);
    if (stages.length > 0 && stages.every((stage) => stage !== "customer" && stage !== "repeat_customer")) assert.equal(canClaimStage(fact, "customer"), false, fact.id);
  }
});

// ── Vocabulario de resultados ────────────────────────────────────────────────

test("08F result vocabulary: every fact type maps to a category; phrases respect certainty and stay non-judgmental", () => {
  const asFact = (type: string, semanticCode = "") => ({ type, semanticCode, provenance: { questionIds: [] } }) as unknown as SemanticFact;
  const categories = new Set([...SEMANTIC_FACT_TYPES.map((type) => resultCategory(asFact(type))), resultCategory(asFact("weakness", "interest_not_converting"))]);
  assert.deepEqual(categories, new Set(RESULT_CATEGORIES));
  assert.equal(resultCategory(asFact("weakness", "follow_up_leakage")), "leakage");
  assert.equal(resultCategory(asFact("weakness", "unclear_offer")), "constraint");
  for (const category of RESULT_CATEGORIES) for (const certainty of RESULT_CERTAINTY_LEVELS) {
    const phrases = RESULT_VOCABULARY[category][certainty];
    assert.ok(phrases.length > 0, `${category}/${certainty}`);
    for (const phrase of phrases) {
      for (const harsh of HARSH_RESULT_PHRASES) assert.ok(!phrase.includes(harsh), `${category}/${certainty}: ${phrase}`);
      if (certainty === "unknown" && category !== "uncertainty") assert.match(phrase, /no hay|insuficiente|verificar|falta/, `${category}: unknown must not affirm`);
      if (certainty === "probable") assert.match(phrase, /señal|parece|probablemente|insuficiente/, `${category}: probable must signal provisional evidence`);
      if (certainty === "confirmed") assert.ok(!/señal|parece|probablemente/.test(phrase), `${category}: confirmed phrase hedges`);
    }
  }
  assert.deepEqual(Object.keys(DIMENSION_RESULT_CONCEPT).sort(), [...DIGITAL_DIMENSION_IDS].sort());
  // Ruptura del vocabulario: los conceptos de resultado no usan jerga.
  for (const concept of Object.values(DIMENSION_RESULT_CONCEPT)) assert.ok(!/conversión|retención|adquisición|funnel|lead/i.test(concept), concept);
});

test("08F audit record: classification counts are explicit and the bank stays at 85", () => {
  const counts = Object.fromEntries(AUDIT_CLASSES.map((audit) => [audit, Object.values(QUESTION_LANGUAGE).filter((entry) => entry.audit === audit).length]));
  assert.deepEqual(counts, { keep: 28, copy_refinement: 31, context_variant_needed: 13, answer_refinement: 7, semantic_mismatch: 1, help_needed: 5 });
  assert.equal(Object.values(QUESTION_LANGUAGE).filter((entry) => entry.deferred).length, 0, "08F.1 closed both deferred answer scales");
  const help = Object.fromEntries(["required", "recommended", "not_needed"].map((level) => [level, Object.values(QUESTION_LANGUAGE).filter((entry) => entry.help === level).length]));
  assert.deepEqual(help, { required: 18, recommended: 25, not_needed: 42 });
});
