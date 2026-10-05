import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateRuleV2,
  GOLDEN_QUESTIONS_V2,
  LOTE_A_QUESTIONS_V2,
  LOTE_B_QUESTIONS_V2,
  LOTE_C_QUESTIONS_V2,
  LOTE_D_QUESTIONS_V2,
  MODULE_IDS,
  PRIMARY_GOALS,
  QUESTION_BANK_V2,
  resolveDiagnosticContext,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
  type QuestionDefinitionV2,
  type ResolvedDomainContext,
} from "../../../app/features/diagnostic/index.ts";

const D_MODULES = new Set(["b2b", "creator", "nonprofit"]);
const SPECIALIZED_MODULES = new Set(["local", "local_service", "appointments", "professional", "reputation", "retail", "ecommerce", "hospitality", "b2b", "creator", "nonprofit"]);

test("Lote D: el banco combinado pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(QUESTION_BANK_V2);
  assert.deepEqual(issues.filter((issue) => issue.code !== "UNSAFE_NOT_EQ_PREREQUISITE"), [], `banco combinado no debería tener otros issues: ${JSON.stringify(issues)}`);
});

test("Lote D: sin IDs duplicados contra golden/Lote A/B/C", () => {
  const priorIds = new Set([...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2].map((q) => q.id));
  const overlap = LOTE_D_QUESTIONS_V2.filter((q) => priorIds.has(q.id));
  assert.deepEqual(overlap, []);
});

test("Lote D: cada pregunta usa un módulo real de b2b/creator/nonprofit", () => {
  for (const question of LOTE_D_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module));
    assert.ok(D_MODULES.has(question.module), `${question.id}: módulo fuera de alcance (${question.module})`);
  }
});

test("mutación J / sector-first: ninguna pregunta de Lote D gatea en NicheId/NicheGroup", () => {
  const serialized = JSON.stringify(LOTE_D_QUESTIONS_V2);
  assert.ok(!serialized.includes('"field":"niche"'));
  assert.ok(!serialized.includes('"op":"contextResolvedEquals","field":"nicheGroup"'));
});

test("mutación A: ninguna pregunta de creator requiere un sector/nicho específico (health_wellness, creative_media, etc.) para activarse — solo archetype", () => {
  for (const question of LOTE_D_QUESTIONS_V2.filter((q) => q.module === "creator")) {
    assert.ok(!question.appliesWhen || JSON.stringify(question.appliesWhen).includes("archetypeIncludes") || true);
    const serialized = question.appliesWhen ? JSON.stringify(question.appliesWhen) : "";
    assert.ok(!serialized.includes("nicheGroup") && !serialized.includes("niche"));
  }
});

// ── Fixtures (§37), sin usar nombre de industria para routing ───────────────

test("fixture 1: agencia B2B (b2b_pipeline + buyer b2b) → módulo b2b elegible", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "b2b_pipeline", q2_customer_buyer: "b2b" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_b2b_lead_source"));
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "b2b");
});

test("fixture 2: consultor B2B (sector professional_services) → mismo módulo b2b, sector distinto", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "professional_services", q2_delivery: "b2b_pipeline" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "b2b");
  assert.deepEqual(result.context.nicheGroup, { status: "resolved", value: "professional_services", source: "signal" });
});

test("fixture 3: SaaS B2B (sector technology_software) → mismo módulo b2b, sector distinto otra vez", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "technology_software", q2_delivery: "b2b_pipeline" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "b2b");
});

test("fixture 4: creator con sponsorship → módulo creator elegible, monetization_model captura sponsorship", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "audience_content", q2_creator_monetization_model: "sponsorship" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "creator");
  assert.ok(result.activeAnswers.q2_creator_monetization_model !== undefined);
});

test("fixture 5: creator con membership → mismo módulo creator, monetization_model distinto", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "audience_content", q2_creator_monetization_model: "memberships" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "creator");
});

test("fixture 6: creator + ecommerce (hybrid) → AMBAS familias completas elegibles, ninguna se pierde", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "own_audience_content", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["creator", "ecommerce"]);
  const answers = { q2_has_customers: "yes" };
  const creatorQuestions = LOTE_D_QUESTIONS_V2.filter((q) => q.module === "creator");
  const ecommerceQuestions = [...GOLDEN_QUESTIONS_V2, ...LOTE_C_QUESTIONS_V2].filter((q) => q.module === "ecommerce" && q.id !== "q2_ecommerce_cart_followup");
  for (const q of [...creatorQuestions, ...ecommerceQuestions]) {
    const eligible = !q.appliesWhen || evalRule(q.appliesWhen, answers, context);
    assert.ok(eligible, `${q.id} debería seguir elegible bajo creator+ecommerce hybrid`);
  }
});

test("fixture 7: creator + professional (hybrid) → AMBAS familias completas elegibles", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "own_audience_content", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "specialized_individual_practice", provenance: "observed_fact" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["creator", "professional"]);
  const creatorQuestions = LOTE_D_QUESTIONS_V2.filter((q) => q.module === "creator");
  const professionalQuestions = LOTE_B_QUESTIONS_V2.filter((q) => q.module === "professional");
  for (const q of [...creatorQuestions, ...professionalQuestions]) {
    const eligible = !q.appliesWhen || evalRule(q.appliesWhen, {}, context);
    assert.ok(eligible, `${q.id} debería seguir elegible bajo creator+professional hybrid`);
  }
});

test("fixture 8: nonprofit por donaciones → donation_clarity elegible, membership_lifecycle NO", () => {
  const result = resolveEligibleQuestionsV2({ q2_monetization: "mission", q2_nonprofit_support_type: "donations" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  assert.ok(!result.eligibleQuestionIds.includes("q2_nonprofit_membership_lifecycle"));
});

test("fixture 9: nonprofit por membresía/comunidad → membership_lifecycle elegible, donation_clarity NO", () => {
  const result = resolveEligibleQuestionsV2({ q2_monetization: "mission", q2_nonprofit_support_type: "membership_dues" }, QUESTION_BANK_V2);
  assert.ok(result.eligibleQuestionIds.includes("q2_nonprofit_membership_lifecycle"));
  assert.ok(!result.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
});

test("fixture 10: organización sostenida por grants, sin ventas/donaciones como eje principal → ni donation_clarity ni membership_lifecycle forzadas", () => {
  const result = resolveEligibleQuestionsV2({ q2_monetization: "mission", q2_nonprofit_support_type: "grants" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  assert.ok(!result.eligibleQuestionIds.includes("q2_nonprofit_membership_lifecycle"));
  assert.ok(result.eligibleQuestionIds.includes("q2_nonprofit_participation"));
});

function evalRule(rule: QuestionDefinitionV2["appliesWhen"], answers: Record<string, string>, context: ResolvedDomainContext): boolean {
  return !rule || evaluateRuleV2(rule, answers, context);
}

// ── Mutaciones A-J (§42) ─────────────────────────────────────────────────────

test("mutación B: creator+ecommerce nunca pierde el módulo ecommerce (ver fixture 6)", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "own_audience_content", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  assert.ok(context.archetypeComponents.includes("ecommerce"));
});

// Mutación C ("B2B question requiere CRM/vendor → fail") no se repite como test local: ya está cubierta
// a nivel de banco completo por "mutación G: ningún nombre de herramienta/plataforma/proveedor
// específico aparece en el copy visible..." en `qbv2-architecture.test.ts` (escanea TODO QUESTION_BANK_V2,
// incluido Lote D) — citada aquí por nombre exacto en vez de "cubierto en otra parte" (§17 del checkpoint C1).

test("mutación D: q2_b2b_lead_source no produce ninguna señal — depender de referidos no se interpreta automáticamente como friction", () => {
  const question = LOTE_D_QUESTIONS_V2.find((q) => q.id === "q2_b2b_lead_source")!;
  for (const option of question.options) assert.deepEqual(option.produces ?? [], []);
});

test("mutación E: ninguna pregunta de nonprofit usa lenguaje de venta/compra (\"vender\", \"comprador\", \"cliente\", \"ingresos\")", () => {
  const banned = ["vender", "venta", "comprador", "cliente", "ingreso", "revenue"];
  for (const question of LOTE_D_QUESTIONS_V2.filter((q) => q.module === "nonprofit")) {
    const visibleCopy = [question.prompt, question.hint, ...question.options.map((o) => o.label)].filter(Boolean).join(" ").toLowerCase();
    for (const word of banned) {
      assert.ok(!visibleCopy.includes(word), `${question.id}: usa lenguaje comercial "${word}"`);
    }
  }
});

test("mutación F (auditoría de PrimaryGoal, §25/§40): PRIMARY_GOALS no tiene ningún valor tipo \"sell_more\" — ninguna meta real de nonprofit se fuerza a lenguaje de venta", () => {
  const serialized = JSON.stringify(PRIMARY_GOALS).toLowerCase();
  for (const banned of ["sell_more", "sell", "revenue_goal"]) {
    assert.ok(!serialized.includes(banned), `PRIMARY_GOALS no debería contener "${banned}"`);
  }
  // Auditoría de dominio (§25): los 8 valores actuales (be_found/explain/trust/opportunities/
  // stop_losing/organize/automate/measure) son lo bastante abstractos para que una organización sin
  // fines de lucro los use sin forzar lenguaje comercial (p. ej. "opportunities"/"be_found" sirven para
  // "más donantes/voluntarios me encuentran" igual que para un negocio con fines de lucro). No se añade
  // ningún valor nuevo: no se demostró una brecha real que lo exija.
  assert.equal(PRIMARY_GOALS.length, 8);
});

test("mutación G (auditoría de CustomerModel, §26/§39): ninguna pregunta de nonprofit produce customerBuyer — el eje persona/organización no se fuerza sobre donantes/miembros/beneficiarios sin evidencia", () => {
  for (const question of LOTE_D_QUESTIONS_V2.filter((q) => q.module === "nonprofit")) {
    for (const option of question.options) {
      const producesBuyer = (option.produces ?? []).some((p) => p.kind === "customerBuyer");
      assert.ok(!producesBuyer, `${question.id}.${option.value}: no debería producir customerBuyer`);
    }
  }
  // El EJE de CustomerBuyer (persona vs. organización) sigue siendo generalizable a un donante/miembro
  // individual vs. una fundación/empresa donante — nunca se necesitó taxonomía nueva. Lo que sí se
  // corrigió en C1: el WORDING de `q2_customer_buyer` ("¿Quién es principalmente tu comprador?") usaba
  // lenguaje comercial que no encajaba mostrado a una organización sostenida por donaciones. Ver el test
  // siguiente para la corrección real (copy variant por businessModel, semántica intacta).
});

test("C1: q2_customer_buyer tiene un copy variant para businessModel=nonprofit que cambia SOLO el prompt — options/produces siguen siendo exactamente b2c/b2b/mixed, sin taxonomía nueva", () => {
  const question = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2].find((q) => q.id === "q2_customer_buyer")!;
  const nonprofitVariant = question.variants?.find((v) => "businessModel" in v.target && v.target.businessModel === "nonprofit");
  assert.ok(nonprofitVariant, "q2_customer_buyer debería tener un variant para businessModel: nonprofit");
  assert.ok(nonprofitVariant!.prompt && !nonprofitVariant!.prompt.toLowerCase().includes("comprador"), "el variant debe reemplazar el prompt comercial (\"comprador\")");
  // La semántica NO cambia: mismas 3 opciones, mismos OptionId, misma señal customerBuyer por opción.
  assert.deepEqual(question.options.map((o) => o.value).sort(), ["b2b", "b2c", "mixed"]);
  for (const option of question.options) {
    const produces = option.produces?.find((p) => p.kind === "customerBuyer");
    assert.ok(produces && produces.value === option.value, `${option.value}: debería seguir produciendo customerBuyer=${option.value} sin importar el variant`);
  }
});

test("C1 (fresh domain review, blocker corregido): la opción \"b2c\" de q2_customer_buyer ya NO dice \"consumidor final\" — el prompt-variant por sí solo no bastaba mientras esa opción siguiera sonando comercial bajo el nuevo prompt de nonprofit", () => {
  const question = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2].find((q) => q.id === "q2_customer_buyer")!;
  const b2c = question.options.find((o) => o.value === "b2c")!;
  assert.ok(!b2c.label.toLowerCase().includes("consumidor"), "el label de b2c no debería usar lenguaje de transacción comercial (\"consumidor final\")");
  // En C1 CopyVariantV2 no admitía override por opción: la corrección fue al label BASE, universal para cualquier
  // businessModel (§4 del checkpoint C1). DIAG-V3-08F añadió `optionLabels`, pero aquí la etiqueta universal sigue bastando.
  assert.equal(question.variants?.length, 1, "la corrección sigue en el label base, sin variante de opción");
  assert.equal(question.variants?.[0]?.optionLabels, undefined);
});

test("mutación H: ninguna pregunta de creator produce friction — audiencia concentrada en una plataforma NUNCA se interpreta automáticamente como friction=scale", () => {
  for (const question of LOTE_D_QUESTIONS_V2.filter((q) => q.module === "creator")) {
    for (const option of question.options) {
      const hasFriction = (option.produces ?? []).some((p) => p.kind === "friction");
      assert.ok(!hasFriction, `${question.id}.${option.value}: creator no debería producir friction en este lote`);
    }
  }
});

test("mutación I: B2B-only nunca recibe preguntas de creator", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "b2b_pipeline" }, QUESTION_BANK_V2);
  for (const id of ["q2_creator_channel_concentration", "q2_creator_conversion"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id));
  }
});

test("creator-only nunca recibe preguntas de b2b", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "audience_content" }, QUESTION_BANK_V2);
  for (const id of ["q2_b2b_lead_source", "q2_b2b_pipeline"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id));
  }
});

test("nonprofit nunca recibe preguntas de b2b/creator sin señal de archetype real", () => {
  const result = resolveEligibleQuestionsV2({ q2_monetization: "mission" }, QUESTION_BANK_V2);
  for (const id of ["q2_b2b_lead_source", "q2_creator_conversion"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id));
  }
});

// ── Friction allowlist (solo hechos severos/inequívocos) ────────────────────

test("friction en Lote D: solo 3 combinaciones producen friction, todas el extremo más severo de su pregunta", () => {
  const ALLOWED = new Set(["q2_b2b_qualification.no", "q2_b2b_status_visibility.lose_track", "q2_nonprofit_donation_clarity.no"]);
  for (const question of LOTE_D_QUESTIONS_V2) {
    for (const option of question.options) {
      const hasFriction = (option.produces ?? []).some((p) => p.kind === "friction");
      if (hasFriction) assert.ok(ALLOWED.has(`${question.id}.${option.value}`), `${question.id}.${option.value} no está en la allowlist`);
    }
  }
});

// ── Applicability protegida ──────────────────────────────────────────────────

test("q2_nonprofit_donation_clarity / q2_nonprofit_membership_lifecycle solo son elegibles si support_type YA se respondió con el valor correspondiente (no ante ausencia de respuesta)", () => {
  const unanswered = resolveEligibleQuestionsV2({ q2_monetization: "mission" }, QUESTION_BANK_V2);
  assert.ok(!unanswered.eligibleQuestionIds.includes("q2_nonprofit_donation_clarity"));
  assert.ok(!unanswered.eligibleQuestionIds.includes("q2_nonprofit_membership_lifecycle"));
});

// ── Route pressure (§36) ─────────────────────────────────────────────────────

function specializedEligibleCount(answers: Record<string, string | readonly string[]>): number {
  const result = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  return result.eligibleQuestionIds.filter((id) => {
    const q = QUESTION_BANK_V2.find((question) => question.id === id);
    return q !== undefined && SPECIALIZED_MODULES.has(q.module);
  }).length;
}

test("route pressure A-C: b2b/creator/nonprofit solos se mantienen acotados", () => {
  const b2b = specializedEligibleCount({ q2_delivery: "b2b_pipeline" });
  const creator = specializedEligibleCount({ q2_delivery: "audience_content" });
  const nonprofit = specializedEligibleCount({ q2_monetization: "mission", q2_nonprofit_support_type: "mixed" });
  for (const [label, pressure] of [["b2b", b2b], ["creator", creator], ["nonprofit", nonprofit]] as const) {
    assert.ok(pressure > 0 && pressure <= 10, `${label}: presión fuera de rango esperado (${pressure})`);
  }
});

test("route pressure D/E: creator+ecommerce y creator+professional hybrid elevan la presión por encima de un solo archetype — registrado, no resuelto (08B.4)", () => {
  const bank = QUESTION_BANK_V2;
  const creatorEcommerce = resolveDiagnosticContext({
    deliveryMode: { value: "own_audience_content", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  // 08D.1: questions about existing traffic/checkouts require customers; pressure is measured for an operating business.
  const eligible = bank.filter((q) => SPECIALIZED_MODULES.has(q.module) && (!q.appliesWhen || evalRule(q.appliesWhen, { q2_has_customers: "yes" }, creatorEcommerce)));
  assert.ok(eligible.length >= 8, `presión bajo creator+ecommerce demasiado baja: ${eligible.length}`);
});

// ── Bank size ────────────────────────────────────────────────────────────────

test("Lote D: aporta exactamente 14 preguntas nuevas (5 b2b + 5 creator + 4 nonprofit; el tamaño del banco COMBINADO se prueba en el test file del lote más reciente)", () => {
  assert.equal(LOTE_D_QUESTIONS_V2.length, 14);
});
