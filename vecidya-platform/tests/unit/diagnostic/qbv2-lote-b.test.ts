import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateRuleV2,
  GOLDEN_QUESTIONS_V2,
  LOTE_A_QUESTIONS_V2,
  LOTE_B_QUESTIONS_V2,
  MODULE_IDS,
  QUESTION_BANK_V2,
  resolveDiagnosticContext,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

const SPECIALIZED_MODULES = new Set(["local", "local_service", "appointments", "professional"]);
// "reputation" es el módulo cross-cutting nuevo de C1 (§19-21): comparte q2_reputation_flow entre los 3 archetypes de arriba.
const LOTE_B_MODULES = new Set([...SPECIALIZED_MODULES, "reputation"]);

// ── DIAG-V3-08B.3, Lote B: local/local_service/appointments/professional ───

test("Lote B: el banco combinado (golden + Lote A + Lote B) pasa TODOS los validadores estáticos sin issues", () => {
  const issues = validateQuestionBankV2(QUESTION_BANK_V2);
  assert.deepEqual(issues, [], `banco combinado no debería tener issues: ${JSON.stringify(issues)}`);
});

test("Lote B: sin IDs duplicados contra golden ni Lote A", () => {
  const priorIds = new Set([...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2].map((q) => q.id));
  const overlap = LOTE_B_QUESTIONS_V2.filter((q) => priorIds.has(q.id));
  assert.deepEqual(overlap, [], `Lote B no debería reusar ningún QuestionId previo: ${JSON.stringify(overlap.map((q) => q.id))}`);
});

test("Lote B: cada pregunta usa un módulo real de local/local_service/appointments/professional/reputation", () => {
  for (const question of LOTE_B_QUESTIONS_V2) {
    assert.ok((MODULE_IDS as readonly string[]).includes(question.module), `${question.id}: módulo inválido`);
    assert.ok(LOTE_B_MODULES.has(question.module), `${question.id}: módulo fuera de alcance de Lote B (${question.module})`);
  }
});

test("q2_reputation_flow vive en su propio módulo cross-cutting \"reputation\", no en \"local\" (C1 §19-21: module=local habría sido semánticamente engañoso)", () => {
  const question = LOTE_B_QUESTIONS_V2.find((q) => q.id === "q2_reputation_flow")!;
  assert.equal(question.module, "reputation");
});

test("Lote B: ninguna pregunta gatea en NicheId/NicheGroup como condición de activación (sector-first, §1)", () => {
  const serialized = JSON.stringify(LOTE_B_QUESTIONS_V2);
  assert.ok(!serialized.includes('"field":"niche"'), "Lote B no debe gatear en niche");
  assert.ok(!serialized.includes('"op":"contextResolvedEquals","field":"nicheGroup"'), "Lote B no debe gatear en nicheGroup como condición de elegibilidad (solo como copy variant)");
});

test("mutación I: ningún sector específico es requisito para activar una pregunta especializada — todo el gating es por archetype/respuesta previa", () => {
  for (const question of LOTE_B_QUESTIONS_V2) {
    if (!question.appliesWhen) continue;
    const serialized = JSON.stringify(question.appliesWhen);
    assert.ok(!serialized.includes("nicheGroup") && !serialized.includes("niche"), `${question.id}: applicability no debe depender de sector/nicho`);
  }
});

test("mutación J: ninguna pregunta menciona una herramienta/proveedor específico (GoHighLevel, Calendly, Google Business Profile, etc.) como requisito de diagnóstico", () => {
  const serialized = JSON.stringify(LOTE_B_QUESTIONS_V2).toLowerCase();
  for (const banned of ["gohighlevel", "calendly", "google business profile", "whatsapp business", "squarespace", "wix", "shopify"]) {
    assert.ok(!serialized.includes(banned), `Lote B no debe mencionar la herramienta/proveedor "${banned}"`);
  }
});

test("§45: sin jerga de marketing en el copy visible (prompt/label/hint) — funnel/CRM/attribution/nurture/pipeline", () => {
  for (const question of LOTE_B_QUESTIONS_V2) {
    const visibleCopy = [question.prompt, question.hint, ...question.options.map((o) => o.label)].filter(Boolean).join(" ").toLowerCase();
    for (const jargon of ["funnel", "crm", "attribution", "nurture", "pipeline"]) {
      assert.ok(!visibleCopy.includes(jargon), `${question.id}: usa jerga de marketing "${jargon}" en copy visible`);
    }
  }
});

// ── Reviews compartidas, no duplicadas por módulo (§23, mutación E) ─────────

test("mutación E: reviews/reputación es UNA sola pregunta compartida (q2_reputation_flow), no local_reviews/appointment_reviews/professional_reviews duplicadas", () => {
  // "reputation"/"reseña" en vez de un match de "review" demasiado amplio: Lote E introduce
  // q2_measurement_decision_review, que contiene la palabra "review" sin ser una pregunta de reputación.
  const reputationQuestions = QUESTION_BANK_V2.filter((q) => q.id.includes("reputation") || q.id.includes("resena"));
  assert.equal(reputationQuestions.length, 1, `debería existir exactamente 1 pregunta de reputación, hay ${reputationQuestions.length}: ${reputationQuestions.map((q) => q.id)}`);
});

test("q2_reputation_flow es elegible bajo local, appointments Y professional (compartida real, no un archetype a la vez)", () => {
  const local = resolveEligibleQuestionsV2({ q2_delivery: "fixed_no_inventory" }, QUESTION_BANK_V2);
  const appointments = resolveEligibleQuestionsV2({ q2_delivery: "scheduled" }, QUESTION_BANK_V2);
  const professional = resolveEligibleQuestionsV2({ q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  assert.ok(local.eligibleQuestionIds.includes("q2_reputation_flow"));
  assert.ok(appointments.eligibleQuestionIds.includes("q2_reputation_flow"));
  assert.ok(professional.eligibleQuestionIds.includes("q2_reputation_flow"));
});

// ── mutación F: referral dependency nunca se interpreta automáticamente como mala ──

test("mutación F: q2_professional_referral_dependency no produce ninguna señal (diagnóstica pura, sin clasificar mostly_referrals como friction)", () => {
  const question = LOTE_B_QUESTIONS_V2.find((q) => q.id === "q2_professional_referral_dependency")!;
  for (const option of question.options) assert.deepEqual(option.produces ?? [], [], `${option.value}: no debería producir señal`);
});

// ── mutación G: no-show/friction solo con evidencia suficiente, nunca automático ──

test("mutación G: la fricción solo se produce sobre EXACTAMENTE el hecho más severo/inequívoco declarado de cada pregunta, nunca sobre una respuesta intermedia/ambigua", () => {
  // Únicas combinaciones (pregunta, opción) autorizadas a producir friction — cada una es el extremo más
  // severo/inequívoco de su pregunta (mismo criterio que el "often" ya aceptado en q2_appointments_noshow).
  const ALLOWED_FRICTION_SOURCES = new Set([
    "q2_service_response_speed.some_lost",
    "q2_service_quote_followup.rarely",
    "q2_appointments_booking_method.informal",
    "q2_appointments_booking_friction.often",
    "q2_appointments_confirmation_reminders.none",
    "q2_appointments_lead_to_booking.few",
    "q2_professional_followup_after_consult.rarely_never",
  ]);
  for (const question of LOTE_B_QUESTIONS_V2) {
    for (const option of question.options) {
      const hasFriction = (option.produces ?? []).some((p) => p.kind === "friction");
      const key = `${question.id}.${option.value}`;
      if (hasFriction) {
        assert.ok(ALLOWED_FRICTION_SOURCES.has(key), `${key}: produce friction pero no está en la lista de hechos severos/inequívocos autorizados — revisar si la evidencia es realmente suficiente`);
      }
    }
  }
  for (const key of ALLOWED_FRICTION_SOURCES) {
    const [questionId, value] = key.split(".");
    const question = LOTE_B_QUESTIONS_V2.find((q) => q.id === questionId)!;
    const option = question.options.find((o) => o.value === value)!;
    assert.ok((option.produces ?? []).some((p) => p.kind === "friction"), `${key}: se esperaba que produjera friction`);
  }
});

// ── Fixtures (§39): al menos 10, sin usar profesión para routing ────────────

test("fixture 1: profesional solo (individual, sin colega) → módulo professional elegible, appointments/local/local_service NO", () => {
  const result = resolveEligibleQuestionsV2({ q2_entity: "individual", q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  for (const id of ["q2_professional_authority_signals", "q2_professional_intake_flow", "q2_reputation_flow"]) {
    assert.ok(result.eligibleQuestionIds.includes(id), `${id} debería ser elegible`);
  }
  for (const id of ["q2_appointments_booking_method", "q2_local_discovery", "q2_service_area_clarity"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id), `${id} NO debería ser elegible`);
  }
});

test("fixture 2 / mutación H / §11 (C1 de Lote B): profesional + appointments como dos mecanismos de entrega independientes resuelve archetype=hybrid, y CONSERVA AMBAS familias de preguntas especializadas — DIAG-V3-08B2-HYBRID-ARCHETYPE-MODULE-001 queda resuelto para el gating de contenido (el ORDEN/budget de cuáles se muestran sigue siendo DIAG-V3-08B.4)", () => {
  // Ninguna pregunta REAL del banco produce dos deliveryMode independientes a la vez (q2_delivery es de
  // opción única); se construye la señal directamente sobre el Context Resolver, igual que hace
  // context-resolver.test.ts, para probar el estado real del sistema ante esa composición.
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "specialized_individual_practice", provenance: "explicit_declaration" },
    secondaryDeliveryMode: { value: "scheduled_time_blocks", provenance: "explicit_declaration" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["appointments", "professional"]);

  const professionalQuestions = LOTE_B_QUESTIONS_V2.filter((q) => q.module === "professional");
  const appointmentsQuestions = [...GOLDEN_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2].filter((q) => q.module === "appointments");
  assert.ok(professionalQuestions.length > 0 && appointmentsQuestions.length > 0, "sanity: ambas familias existen en el banco");
  for (const q of [...professionalQuestions, ...appointmentsQuestions]) {
    const eligible = !q.appliesWhen || evaluateRuleV2(q.appliesWhen, {}, context);
    assert.ok(eligible, `${q.id}: debería seguir elegible bajo archetype=hybrid (professional+appointments) — perderla sería el bug de C1`);
  }
});

test("mutación (C1 §14): local + appointments con evidencia independiente real también conserva ambas familias, sin depender del sector", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "fixed_location_no_inventory", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "scheduled_time_blocks", provenance: "observed_fact" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["appointments", "local"]);

  // q2_local_repeat_customers también depende de q2_has_customers=yes (encadenada, no solo de archetype).
  const answers = { q2_has_customers: "yes" };
  const localQuestions = LOTE_B_QUESTIONS_V2.filter((q) => q.module === "local");
  const appointmentsQuestions = [...GOLDEN_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2].filter((q) => q.module === "appointments");
  for (const q of [...localQuestions, ...appointmentsQuestions]) {
    const eligible = !q.appliesWhen || evaluateRuleV2(q.appliesWhen, answers, context);
    assert.ok(eligible, `${q.id}: debería seguir elegible bajo archetype=hybrid (local+appointments)`);
  }
});

test("§12/§13 (C1 de Lote B): un archetype NO-hybrid sigue activando SOLO su propia familia — la corrección de C1 no abre las compuertas de más", () => {
  const professionalOnly = resolveDiagnosticContext({ deliveryMode: { value: "specialized_individual_practice", provenance: "explicit_declaration" } }).context;
  const appointmentsOnly = resolveDiagnosticContext({ deliveryMode: { value: "scheduled_time_blocks", provenance: "explicit_declaration" } }).context;

  const appointmentsQuestions = [...GOLDEN_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2].filter((q) => q.module === "appointments");
  for (const q of appointmentsQuestions) {
    const eligible = !q.appliesWhen || evaluateRuleV2(q.appliesWhen, {}, professionalOnly);
    assert.ok(!eligible, `${q.id}: professional puro NO debería activar preguntas de appointments`);
  }
  const professionalQuestions = LOTE_B_QUESTIONS_V2.filter((q) => q.module === "professional");
  for (const q of professionalQuestions) {
    const eligible = !q.appliesWhen || evaluateRuleV2(q.appliesWhen, {}, appointmentsOnly);
    assert.ok(!eligible, `${q.id}: appointments puro NO debería activar preguntas de professional`);
  }
});

test("§15 (fixture contractual futuro para Lote C): retail + ecommerce con evidencia independiente ya resuelve hybrid con ambos componentes HOY, sin necesitar contenido de Lote C todavía — protege la arquitectura antes de escribir esas preguntas", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "fixed_location_with_inventory", provenance: "observed_fact" },
    secondaryDeliveryMode: { value: "online_checkout", provenance: "observed_fact" },
  }).context;
  assert.deepEqual(context.archetype, { status: "resolved", value: "hybrid", source: "signal" });
  assert.deepEqual([...context.archetypeComponents].sort(), ["ecommerce", "retail"]);
});

test("fixture 3: sector health_wellness + delivery por citas de varios proveedores → archetype=appointments, SIN usar ningún NicheId (\"dentist\")", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "health_wellness", q2_delivery: "scheduled" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "appointments");
  assert.equal(result.context.niche.status, "unresolved");
  assert.ok(result.eligibleQuestionIds.includes("q2_appointments_booking_method"));
});

test("fixture 4: sector health_wellness + delivery de profesional solo → archetype=professional, NO appointments (mismo sector, archetype distinto por respuesta, no por nicho)", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "health_wellness", q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "professional");
  assert.ok(!result.eligibleQuestionIds.includes("q2_appointments_booking_method"));
});

test("fixture 5: multi-provider appointment business con sector NO relacionado a salud (beauty_personal_care) → archetype=appointments igual (el archetype no depende del sector)", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "beauty_personal_care", q2_delivery: "scheduled" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "appointments");
});

test("fixture 6: servicio a domicilio local (home_services + se desplaza al cliente) → archetype=local_service", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "home_services", q2_delivery: "travels" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "local_service");
  assert.ok(result.eligibleQuestionIds.includes("q2_service_area_clarity"));
});

test("fixture 7: taller mecánico (automotive + se desplaza al cliente) → archetype=local_service, mismo módulo que fixture 6 con sector distinto", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "automotive", q2_delivery: "travels" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "local_service");
});

test("fixture 8: agente inmobiliario (real_estate + profesional solo) → archetype=professional; NO se asume local_service solo por la profesión", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "real_estate", q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "professional");
});

test("fixture 9: abogado por consulta/proyecto (legal + profesional solo) → archetype=professional, mismo módulo que fixture 8 con sector distinto", () => {
  const result = resolveEligibleQuestionsV2({ q2_sector: "legal", q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  assert.equal(result.context.archetype.status === "resolved" ? result.context.archetype.value : undefined, "professional");
});

test("fixture 10: negocio sin relevancia local (ecommerce puro) → NINGUNA pregunta de local/local_service/appointments/professional es elegible", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  const leaked = result.eligibleQuestionIds.filter((id) => LOTE_B_QUESTIONS_V2.some((q) => q.id === id));
  assert.deepEqual(leaked, [], `ecommerce puro no debería activar ninguna pregunta especializada de Lote B: ${leaked}`);
});

// ── mutación A/B/C: irrelevancia entre archetypes (§32, §40) ────────────────

test("mutación A: ecommerce puro nunca recibe preguntas de appointments", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "online_checkout" }, QUESTION_BANK_V2);
  for (const id of ["q2_appointments_booking_method", "q2_appointments_confirmation_reminders", "q2_appointments_rebooking"]) {
    assert.ok(!result.eligibleQuestionIds.includes(id));
  }
});

test("mutación B: professional basado en proyecto/consulta nunca recibe la pregunta de no-show (es de appointments)", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "solo_practice" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_appointments_noshow"));
});

test("mutación C: local_service nunca recibe preguntas de foot traffic (son de local, mecanismo de entrega distinto)", () => {
  const result = resolveEligibleQuestionsV2({ q2_delivery: "travels" }, QUESTION_BANK_V2);
  assert.ok(!result.eligibleQuestionIds.includes("q2_local_foot_traffic"));
  // 08E.1: local discovery may still enter as material evidence (tail), never through the native gate.
  const discovery = QUESTION_BANK_V2.find((question) => question.id === "q2_local_discovery")!;
  assert.equal(evaluateRuleV2(discovery.appliesWhen!, result.activeAnswers, result.context), false);
});

// ── mutación D: rebooking nunca es obligatorio cuando el servicio no lo requiere ──

test("mutación D: q2_appointments_rebooking tiene una opción not_applicable legítima — un negocio sin modelo de recurrencia puede declararlo sin quedar bloqueado", () => {
  const question = LOTE_B_QUESTIONS_V2.find((q) => q.id === "q2_appointments_rebooking")!;
  assert.ok(question.options.some((o) => o.kind === "not_applicable"));
  assert.equal(question.scoringReadiness?.allowsNotApplicable, true);
});

// ── Applicability protegida para preguntas condicionales (§11) ──────────────

test("q2_service_quote_followup solo es elegible si q2_service_quote_practice YA se respondió yes/varies (routing protegido, no N/A universal)", () => {
  const withQuote = resolveEligibleQuestionsV2({ q2_delivery: "travels", q2_service_quote_practice: "yes" }, QUESTION_BANK_V2);
  const withoutQuote = resolveEligibleQuestionsV2({ q2_delivery: "travels", q2_service_quote_practice: "no" }, QUESTION_BANK_V2);
  const unanswered = resolveEligibleQuestionsV2({ q2_delivery: "travels" }, QUESTION_BANK_V2);
  assert.ok(withQuote.eligibleQuestionIds.includes("q2_service_quote_followup"));
  assert.ok(!withoutQuote.eligibleQuestionIds.includes("q2_service_quote_followup"));
  // Regresión real encontrada durante Lote B: notEqV2 trataba una respuesta AUSENTE como "!= no" y hacía
  // la pregunta elegible antes de que existiera la respuesta que la habilita. Corregido con inV2.
  assert.ok(!unanswered.eligibleQuestionIds.includes("q2_service_quote_followup"), "sin responder q2_service_quote_practice todavía, NO debería ser elegible");
});

// ── Route pressure (§37): presión de elegibles especializados por contexto A-G ──

function specializedEligibleCount(answers: Record<string, string | readonly string[]>): number {
  const result = resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2);
  return result.eligibleQuestionIds.filter((id) => {
    const q = QUESTION_BANK_V2.find((question) => question.id === id);
    return q !== undefined && SPECIALIZED_MODULES.has(q.module);
  }).length;
}

test("route pressure A-D: un solo archetype (local/local_service/appointments/professional) sin componer con otro mantiene la presión especializada acotada", () => {
  const pressureA = specializedEligibleCount({ q2_delivery: "fixed_no_inventory" }); // local
  const pressureB = specializedEligibleCount({ q2_delivery: "travels" }); // local_service
  const pressureC = specializedEligibleCount({ q2_delivery: "scheduled" }); // appointments
  const pressureD = specializedEligibleCount({ q2_delivery: "solo_practice" }); // professional
  for (const [label, pressure] of [
    ["local", pressureA],
    ["local_service", pressureB],
    ["appointments", pressureC],
    ["professional", pressureD],
  ] as const) {
    assert.ok(pressure > 0, `${label}: debería haber al menos 1 pregunta especializada elegible`);
    assert.ok(pressure <= 10, `${label}: presión especializada demasiado alta para un solo archetype (${pressure})`);
  }
});

// ── Duplicate audit: Lote B nunca reintroduce señales de fundación ──────────

test("§23 (route pressure, hybrid): professional + appointments compuestos elevan la presión especializada elegible por encima de un solo archetype — registrado como dato, no resuelto aquí (08B.4 debe demostrar selección)", () => {
  const context = resolveDiagnosticContext({
    deliveryMode: { value: "specialized_individual_practice", provenance: "explicit_declaration" },
    secondaryDeliveryMode: { value: "scheduled_time_blocks", provenance: "explicit_declaration" },
  }).context;
  const bank = [...GOLDEN_QUESTIONS_V2, ...LOTE_A_QUESTIONS_V2, ...LOTE_B_QUESTIONS_V2];
  const eligibleSpecialized = bank.filter((q) => {
    if (!SPECIALIZED_MODULES.has(q.module) && q.module !== "reputation") return false;
    return !q.appliesWhen || evaluateRuleV2(q.appliesWhen, {}, context);
  });
  // Single-archetype pressure máxima observada (appointments) era 7; hybrid debe ser mayor o igual a la
  // suma de ambas familias que compone (professional 5 + appointments 7 + reputation compartida, sin duplicar).
  assert.ok(eligibleSpecialized.length >= 10, `presión especializada bajo hybrid demasiado baja para representar ambas familias: ${eligibleSpecialized.length}`);
});

test("Lote B no vuelve a preguntar sector/reach/buyer/growth-stage general/goal/friction general (§3): ninguna pregunta produce esas señales de nuevo", () => {
  const serialized = JSON.stringify(LOTE_B_QUESTIONS_V2);
  for (const foundationKind of ["nicheGroup", "customerReach", "customerBuyer", "hasRealCustomers", "operatingRegularity", "goal", "systemization"]) {
    assert.ok(!serialized.includes(`"kind":"${foundationKind}"`), `Lote B no debería volver a producir la señal de fundación "${foundationKind}"`);
  }
});

// ── QBV2 sigue inactivo ──────────────────────────────────────────────────────

test("Lote B: aporta exactamente 18 preguntas nuevas (el tamaño del banco COMBINADO crece con cada lote y se prueba en el test file del lote más reciente)", () => {
  assert.equal(LOTE_B_QUESTIONS_V2.length, 18);
});
