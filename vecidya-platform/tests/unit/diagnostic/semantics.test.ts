import assert from "node:assert/strict";
import { test } from "node:test";

import {
  deriveActiveAnswers,
  getApplicableQuestions,
  getQuestion,
  questions,
  runDiagnostic,
  type Answers,
  type DiagnosticResult,
  type DimensionId,
} from "../../../app/features/diagnostic/index.ts";
import { adversarial } from "./adversarial-personas.ts";
import { personas } from "./personas.ts";

/**
 * DIAG-002B — pruebas semánticas: monotonía, pares, metamórficas, irrelevancia
 * sistemática, contradicciones, estados límite y reglas de licencia.
 * Aseveran propiedades (ids, niveles, licencia), no texto.
 */

const run = (answers: Answers): DiagnosticResult => {
  const result = runDiagnostic(answers);
  assert.ok(result, "resultado nulo");
  return result;
};

const score = (result: DiagnosticResult, dimension: DimensionId) => result.dimensions.find((item) => item.id === dimension)?.score ?? null;
const ids = (issues: { id: string }[]) => issues.map((issue) => issue.id);
const allIssues = (result: DiagnosticResult) => result.priorities.concat(result.gaps);
const licenseRank: Record<string, number> = { none: 0, cuadra: 1, barrio: 2, ciudad: 3 };

/** Orden semántico declarado de forma independiente de la implementación (débil → fuerte). */
const ordinal: Record<string, { order: string[]; dims: DimensionId[]; base: Answers }> = {
  clarity_presence: { order: ["no", "partly", "yes"], dims: ["claridad"], base: personas.localBusinessLeaks },
  offer_clarity: { order: ["no", "partly", "yes"], dims: ["claridad"], base: adversarial.creatorNoOffer },
  validation: { order: ["none", "talked", "interest", "first"], dims: ["alcance"], base: { ...personas.ideaStage, stage: "launching" } },
  control: { order: ["no", "partly", "yes"], dims: ["presencia"], base: personas.growingBusinessManual },
  discoverability: { order: ["no", "some", "top"], dims: ["alcance"], base: personas.localBusinessLeaks },
  audience: { order: ["none", "small", "growing", "established"], dims: ["alcance"], base: adversarial.creatorNoOffer },
  reach: { order: ["nobody", "circle", "first", "community"], dims: ["alcance"], base: { ...adversarial.ideaWithFollowing, stage: "occasional", team: "only_me", proof_org: ["who"], sources: ["social"], contact_path: "one", capture: "always", response: "day", follow_up: "manual", measurement: ["none"] } },
  contact_path: { order: ["none", "unclear", "many", "one"], dims: ["contacto"], base: personas.localBusinessLeaks },
  capture: { order: ["no", "sometimes", "always"], dims: ["contacto", "seguimiento"], base: personas.localBusinessLeaks },
  response: { order: ["varies", "days", "day", "hour"], dims: ["seguimiento"], base: personas.localBusinessLeaks },
  follow_up: { order: ["none", "manual", "system"], dims: ["seguimiento"], base: personas.localBusinessLeaks },
  pipeline: { order: ["no", "partial", "tool"], dims: ["seguimiento"], base: personas.growingBusinessManual },
  responsibilities: { order: ["no", "partly", "yes"], dims: ["seguimiento"], base: personas.localBusinessLeaks },
  post_sale: { order: ["no", "sometimes", "regular"], dims: ["confianza", "seguimiento"], base: personas.growingBusinessManual },
};

test("monotonía: una respuesta más fuerte nunca empeora la dimensión que mide", () => {
  for (const [questionId, spec] of Object.entries(ordinal)) {
    const question = getQuestion(questionId);
    assert.ok(question, questionId);
    assert.ok(getApplicableQuestions(spec.base).some((item) => item.id === questionId), `${questionId} debe aplicar en su base`);
    for (const dimension of spec.dims) {
      let previous = -1;
      for (const value of spec.order) {
        const result = run({ ...spec.base, [questionId]: value });
        const current = score(result, dimension);
        assert.ok(current !== null, `${questionId}=${value} deja ${dimension} sin evidencia`);
        assert.ok(current >= previous, `${questionId}: ${dimension} baja de ${previous} a ${current} al pasar a «${value}»`);
        previous = current;
      }
    }
  }
});

test("aislamiento por pregunta: cambiar una respuesta no altera las dimensiones que no mide", () => {
  for (const [questionId, spec] of Object.entries(ordinal)) {
    const question = getQuestion(questionId)!;
    const results = spec.order.map((value) => run({ ...spec.base, [questionId]: value }));
    for (const dimension of results[0].dimensions.map((item) => item.id)) {
      if (question.dimensions.includes(dimension)) continue;
      const values = new Set(results.map((result) => score(result, dimension)));
      assert.equal(values.size, 1, `${questionId} contamina ${dimension}: ${[...values].join(",")}`);
    }
  }
});

test("multiselección: marcar una opción adicional nunca reduce una dimensión", () => {
  const cases: [string, Answers][] = [
    ["assets", personas.localBusinessLeaks],
    ["proof_business", personas.localBusinessLeaks],
    ["proof_professional", personas.professionalReputation],
    ["proof_creator", personas.creatorAudience],
    ["proof_org", personas.organizationCommunity],
    ["sources", personas.localBusinessLeaks],
    ["measurement", personas.localBusinessLeaks],
  ];
  for (const [questionId, base] of cases) {
    const question = getQuestion(questionId)!;
    const values = question.options.filter((option) => !option.kind || option.kind === "value").filter((option) => !option.exclusive).map((option) => option.value);
    let selected: string[] = [];
    let previous = run({ ...base, [questionId]: [values[0]] });
    selected = [values[0]];
    for (const value of values.slice(1)) {
      selected = [...selected, value];
      const next = run({ ...base, [questionId]: selected });
      for (const dimension of question.dimensions) {
        assert.ok((score(next, dimension) ?? 0) >= (score(previous, dimension) ?? 0), `${questionId}+${value} reduce ${dimension}`);
      }
      previous = next;
    }
  }
});

test("irrelevancia sistemática: toda opción de toda pregunta no aplicable deja el resultado idéntico", () => {
  for (const [name, answers] of Object.entries({ ...personas, ...adversarial })) {
    const base = run(answers);
    const applicable = new Set(getApplicableQuestions(deriveActiveAnswers(answers)).map((question) => question.id));
    for (const question of questions) {
      if (applicable.has(question.id)) continue;
      for (const option of question.options) {
        const polluted = { ...answers, [question.id]: question.type === "multi" ? [option.value] : option.value };
        assert.deepEqual(run(polluted), base, `${name}: ${question.id}=${option.value} alteró el resultado`);
      }
    }
  }
});

test("metamórfica: sustituir «no lo sé» por evidencia sube la confianza; fuerte sube la dimensión, débil la baja", () => {
  const unknown = run({ ...personas.localBusinessLeaks, follow_up: "unknown" });
  const strong = run({ ...personas.localBusinessLeaks, follow_up: "system" });
  const weak = run({ ...personas.localBusinessLeaks, follow_up: "none" });
  assert.ok(unknown.confidence.unknown > strong.confidence.unknown);
  assert.ok(unknown.confidence.unknown > weak.confidence.unknown);
  assert.ok((score(strong, "seguimiento") ?? 0) > (score(unknown, "seguimiento") ?? 0));
  assert.ok((score(weak, "seguimiento") ?? 0) < (score(unknown, "seguimiento") ?? 0), "más confianza no significa mejor estado");
  assert.ok(allIssues(unknown).find((issue) => issue.id === "structure_follow_up")?.tentative);
  assert.ok(!allIssues(strong).some((issue) => issue.id === "structure_follow_up"));
  assert.ok(allIssues(weak).find((issue) => issue.id === "structure_follow_up")?.tentative === false);
});

test("par: seguimiento manual → definido mejora seguimiento, retira la brecha y no toca lo demás", () => {
  const before = run(personas.localBusinessLeaks);
  const after = run({ ...personas.localBusinessLeaks, follow_up: "system" });
  assert.ok((score(after, "seguimiento") ?? 0) > (score(before, "seguimiento") ?? 0));
  assert.ok(ids(allIssues(before)).includes("structure_follow_up"));
  assert.ok(!ids(allIssues(after)).includes("structure_follow_up"));
  for (const dimension of ["claridad", "presencia", "alcance", "confianza", "contacto", "medicion"] as DimensionId[]) {
    assert.equal(score(after, dimension), score(before, dimension), `${dimension} cambió sin motivo`);
  }
  assert.ok(licenseRank[after.recommendation.license.level] <= licenseRank[before.recommendation.license.level], "la recomendación no debe empeorar");
  assert.equal(after.confidence.level, before.confidence.level);
});

test("par: registro «no» → «siempre» con seguimiento definido baja la licencia a Cuadra y el estado deja de ser fuga", () => {
  const leaking = run({ ...adversarial.strongPresenceNoFollowUp, follow_up: "system" });
  const solid = run({ ...adversarial.strongPresenceNoFollowUp, follow_up: "system", capture: "always" });
  assert.equal(leaking.recommendation.license.level, "cuadra", "una brecha solo de registro la cubre Cuadra (contactos, oportunidades, pipeline)");
  assert.notEqual(solid.state.id, "fugas");
  assert.ok(!ids(allIssues(solid)).includes("capture_inquiries"));
});

test("«varios canales» solo es una brecha cuando las consultas no quedan registradas", () => {
  const dispersed = run({ ...personas.localBusinessLeaks, contact_path: "many", capture: "no" });
  const centralized = run({ ...personas.localBusinessLeaks, contact_path: "many", capture: "always", follow_up: "system" });
  assert.ok(ids(allIssues(dispersed)).includes("define_contact_path"));
  assert.ok(!ids(allIssues(centralized)).includes("define_contact_path"));
});

test("WhatsApp Business como activo no puede fabricar «contacto» cuando no hay canal definido", () => {
  const noPath = run({ ...personas.localBusinessLeaks, assets: ["social", "whatsapp_business"], contact_path: "none", capture: "no" });
  const noPathNoWa = run({ ...personas.localBusinessLeaks, assets: ["social"], contact_path: "none", capture: "no" });
  assert.equal(score(noPath, "contacto"), score(noPathNoWa, "contacto"), "tener la cuenta no es tener una vía atendida");
  assert.equal(score(noPath, "contacto"), 0);
});

test("una web o un perfil de Google no son prueba de confianza; la prueba la miden las reseñas, fotos y datos", () => {
  const withSite = run({ ...personas.localBusinessLeaks, assets: ["website", "google", "social"], proof_business: ["none"] });
  const withoutSite = run({ ...personas.localBusinessLeaks, assets: ["social"], proof_business: ["none"] });
  assert.equal(score(withSite, "confianza"), score(withoutSite, "confianza"));
});

test("aparecer primero en Google sin tener perfil de Google no genera una brecha de descubribilidad", () => {
  const top = run({ ...personas.localBusinessLeaks, assets: ["website", "social"], discoverability: "top" });
  assert.ok(!ids(allIssues(top)).includes("improve_discoverability"), ids(allIssues(top)).join(","));
  const na = run({ ...personas.localBusinessLeaks, assets: ["website", "social"], discoverability: "na" });
  assert.ok(!ids(allIssues(na)).includes("improve_discoverability"));
  assert.ok(!ids(allIssues(na)).includes("check_discoverability"));
});

test("ramificación: sin consultas no se pregunta por medición ni responsabilidades; en lanzamiento tampoco", () => {
  const noInquiries = getApplicableQuestions({ profile: "business", goal: "organize", stage: "occasional", team: "small", assets: ["social"], sources: ["none"] }).map((question) => question.id);
  assert.ok(!noInquiries.includes("measurement"), "medir consultas que no llegan es una contradicción");
  assert.ok(!noInquiries.includes("responsibilities"));
  const launching = getApplicableQuestions({ profile: "business", goal: "organize", stage: "launching", team: "small", assets: ["social"] }).map((question) => question.id);
  assert.ok(!launching.includes("responsibilities"), "sin consultas no hay quién responda");
  assert.ok(!launching.includes("post_sale"));
});

test("contradicciones declaradas bajan la confianza y quedan explicadas", () => {
  const ideaWithSale = run({ ...personas.ideaStage, validation: "first" });
  assert.notEqual(ideaWithSale.confidence.level, "alta");
  assert.ok(ideaWithSale.confidence.reasons.some((reason) => /primera venta|momento/i.test(reason)));

  const growingNoInquiries = run({ profile: "business", goal: "organize", stage: "growing", team: "small", assets: ["website", "google"], clarity_presence: "yes", proof_business: ["reviews"], control: "yes", sources: ["none"], discoverability: "top", contact_path: "one", post_sale: "regular" });
  assert.notEqual(growingNoInquiries.confidence.level, "alta");
  assert.ok(growingNoInquiries.confidence.reasons.some((reason) => /consultas/i.test(reason)));
});

test("estado: presencia excelente con seguimiento inexistente es una operación con fugas, no un sistema avanzado", () => {
  const result = run(adversarial.strongPresenceNoFollowUp);
  assert.equal(result.state.id, "fugas");
  assert.ok(["capture_inquiries", "structure_follow_up"].includes(ids(result.priorities)[0]), ids(result.priorities).join(","));
  assert.ok(result.strengths.some((strength) => strength.dimension === "presencia"));
  assert.ok(!ids(allIssues(result)).includes("build_presence"));
  assert.equal(result.recommendation.license.level, "barrio");
  assert.ok(result.state.because.some((line) => /registr|seguimiento/i.test(line)), "el estado debe citar la evidencia comercial");
});

test("estado: operación sólida con presencia débil no es una operación con fugas ni un sistema inmaduro por lo social", () => {
  const result = run(adversarial.weakPresenceStrongProcess);
  assert.notEqual(result.state.id, "fugas");
  assert.notEqual(result.state.id, "inicio");
  assert.ok(result.strengths.some((strength) => strength.dimension === "seguimiento"));
  assert.equal(ids(result.priorities)[0], "improve_discoverability");
  assert.ok(!ids(allIssues(result)).includes("structure_follow_up"));
  assert.equal(result.recommendation.license.level, "cuadra", "la necesidad es base pública y perfil, no seguimiento");
});

test("estado: sin consultas no puede afirmarse que «captas y das seguimiento»", () => {
  const result = run({ profile: "business", goal: "be_found", stage: "occasional", team: "only_me", assets: ["website", "google", "social"], clarity_presence: "yes", proof_business: ["info", "photos"], control: "yes", sources: ["none"], discoverability: "no", contact_path: "one" });
  assert.notEqual(result.state.id, "sistema");
  assert.notEqual(result.state.id, "consolidado");
  assert.equal(result.state.id, "base");
  assert.ok(/consultas/i.test(result.state.summary));
  assert.equal(score(result, "seguimiento"), null);
});

test("estado: consultas que llegan pero nadie sabe qué pasa con ellas es un estado incierto, no una fuga confirmada", () => {
  const result = run(adversarial.mostlyUnknown);
  assert.equal(result.state.id, "incierto");
  assert.equal(result.confidence.level, "baja");
  const tentative = result.priorities.filter((issue) => issue.tentative);
  assert.ok(tentative.length >= 1);
  for (const issue of tentative) {
    // Un hallazgo derivado de «no lo sé» no puede afirmar la ausencia: no usa los títulos de brecha confirmada.
    assert.ok(!/^(Registrar cada consulta|Definir el seguimiento|Responder antes|Acordar quién|Asegurar el control|Mostrar (señales|evidencia)|Aclarar la propuesta)/.test(issue.title), `lenguaje presuntivo en hallazgo tentativo: ${issue.title}`);
    assert.ok(/confirmar|comprobar|averigua|pregunta|inventari|medir|revisa/i.test(issue.title + issue.action), `el hallazgo tentativo no pide comprobar: ${issue.title}`);
  }
  assert.notEqual(result.recommendation.license.level, "barrio", "no se recomienda seguimiento estructurado sobre dudas");
  assert.notEqual(result.recommendation.license.level, "ciudad");
});

test("fortalezas exigen evidencia suficiente y sin dudas: la confianza no es fortaleza si la prueba pública es «no estoy seguro»", () => {
  const result = run({ ...personas.growingBusinessManual, proof_business: ["unknown"], post_sale: "regular" });
  assert.ok(!result.strengths.some((strength) => strength.dimension === "confianza"));
  const weakAll = run(adversarial.weakExceptResponse);
  assert.ok(weakAll.strengths.some((strength) => /menos de una hora/.test(strength.text)));
  assert.ok(!weakAll.strengths.some((strength) => /activos digitales|encuentran por más de un canal|señales públicas/.test(strength.text)));
});

test("licencia: Cuadra cubre registro básico; Barrio exige brecha de seguimiento; Ciudad exige proceso sólido", () => {
  const captureOnly = run({ ...personas.growingBusinessManual, capture: "sometimes" });
  assert.equal(captureOnly.recommendation.license.level, "cuadra", "registro parcial con seguimiento definido = ordenar, no Barrio");
  const followGap = run({ ...personas.growingBusinessManual, follow_up: "manual" });
  assert.equal(followGap.recommendation.license.level, "barrio");
  assert.equal(run(adversarial.soloProSophisticated).recommendation.license.level, "ciudad", "una persona sola puede necesitar Ciudad");
  assert.notEqual(run(adversarial.bigTeamDisorganized).recommendation.license.level, "ciudad", "un equipo grande desorganizado no es Ciudad");
  assert.equal(run(adversarial.bigTeamDisorganized).recommendation.license.level, "barrio");
});

test("licencia: una prioridad fundacional (aclarar la propuesta) no convive con Barrio", () => {
  const result = run(adversarial.creatorNoOffer);
  assert.equal(ids(result.priorities)[0], "define_offer");
  assert.ok(licenseRank[result.recommendation.license.level] <= licenseRank.cuadra, `licencia ${result.recommendation.license.level} contradice la prioridad fundacional`);
  assert.ok(result.recommendation.license.notYet, "debe explicar qué no conviene todavía");
});

test("objetivo «automatizar» sin proceso: se explican los prerrequisitos y no se recomienda automatizar", () => {
  const result = run(adversarial.wantsAutomationNoProcess);
  assert.ok(!ids(result.priorities).includes("automate_repetitive"));
  assert.equal(result.recommendation.license.level, "barrio");
  assert.ok(result.recommendation.license.notYet?.includes("Ciudad todavía no"));
  assert.ok(result.goalNote && /automatiz/i.test(result.goalNote) && /registr|seguimiento/i.test(result.goalNote), "el resultado debe explicar por qué automatizar no va primero");
  assert.ok(!result.recommendation.addons.length);
});

test("negocio local con Google, buen proceso y sin reseñas: la brecha principal es pedir reseñas", () => {
  const result = run(adversarial.localNoReviewsGoodProcess);
  assert.ok(["sistema", "consolidado"].includes(result.state.id), result.state.id);
  assert.ok(ids(allIssues(result)).includes("ask_reviews"), ids(allIssues(result)).join(","));
  assert.equal(ids(result.priorities)[0], "ask_reviews");
  assert.ok(!ids(allIssues(result)).includes("structure_follow_up"));
  assert.notEqual(result.recommendation.license.level, "ciudad");
});

test("muchos «no aplica»: confianza alta, sin brechas fabricadas y alcance no penalizado", () => {
  const result = run(adversarial.manyNotApplicable);
  assert.equal(result.confidence.level, "alta");
  assert.equal(result.confidence.unknown, 0);
  for (const id of ["track_pipeline", "post_sale_loop", "check_discoverability", "improve_discoverability"]) assert.ok(!ids(allIssues(result)).includes(id), id);
  assert.ok(["sistema", "consolidado"].includes(result.state.id));
});

test("fuerte en todo salvo el seguimiento: la fuga encabeza y Ciudad no procede", () => {
  const result = run(adversarial.strongExceptFollowUp);
  assert.equal(result.state.id, "fugas");
  assert.equal(ids(result.priorities)[0], "structure_follow_up");
  assert.equal(result.recommendation.license.level, "barrio");
  assert.ok(result.strengths.length >= 3);
});

test("idea con audiencia: sin licencia, sin proceso, y la audiencia no sustituye la validación", () => {
  const result = run(adversarial.ideaWithFollowing);
  assert.equal(result.state.id, "inicio");
  assert.equal(result.recommendation.license.level, "none");
  assert.ok(ids(result.priorities).includes("validate_offer"));
  assert.ok(!ids(allIssues(result)).some((id) => ["capture_inquiries", "structure_follow_up", "automate_repetitive"].includes(id)));
});

test("equipo grande desorganizado: la prioridad es fundacional/comercial y el tamaño no sube la licencia", () => {
  const result = run(adversarial.bigTeamDisorganized);
  assert.equal(result.state.id, "fugas");
  assert.ok(["capture_inquiries", "structure_follow_up", "speed_up_response", "assign_responsibilities", "define_offer"].includes(ids(result.priorities)[0]));
  assert.ok(!ids(result.priorities).includes("automate_repetitive"));
});

test("coherencia interna: ninguna fortaleza y brecha contradictorias sobre la misma dimensión con evidencia confirmada", () => {
  for (const [name, answers] of Object.entries({ ...personas, ...adversarial })) {
    const result = run(answers);
    for (const strength of result.strengths.filter((item) => item.kind === "dimension")) {
      const conflicting = allIssues(result).filter((issue) => issue.dimension === strength.dimension && !issue.tentative && issue.severity >= 0.8);
      assert.equal(conflicting.length, 0, `${name}: fortaleza de dimensión en ${strength.dimension} convive con brecha grave ${ids(conflicting).join(",")}`);
    }
    for (const strength of result.strengths) {
      assert.ok(["dimension", "answer"].includes(strength.kind));
    }
    if (result.recommendation.license.level === "none") {
      assert.ok(!result.recommendation.addons.length, `${name}: addon sin licencia`);
    }
    if (result.recommendation.addons.length) {
      assert.ok(licenseRank[result.recommendation.license.level] >= licenseRank.barrio, `${name}: addon con licencia ${result.recommendation.license.level}`);
    }
  }
});

// ── DIAG-002C — decisiones de producto cerradas ─────────────────────────────

test("DIAG-002C: una operación comercial sana sin necesidad recurrente no recibe Barrio «opcional»", () => {
  const g = run(adversarial.localNoReviewsGoodProcess);
  assert.equal(g.recommendation.license.level, "none", "G: reseñas no justifican una licencia");
  assert.ok(g.recommendation.services.some((service) => service.id === "presencia-digital"), "G: el servicio sí ayuda con las reseñas");
  assert.equal(ids(g.priorities)[0], "ask_reviews");
  assert.equal(g.recommendation.addons.length, 0);

  const i = run(adversarial.manyNotApplicable);
  assert.equal(i.state.id, "consolidado");
  assert.equal(i.confidence.level, "alta");
  assert.equal(i.recommendation.license.level, "none", "I: consolidado sin prioridades = ninguna licencia");
  assert.equal(i.recommendation.services.length, 0);
});

test("DIAG-002C: servicio recomendado no implica licencia, y los servicios nunca se derivan de la licencia", () => {
  for (const [name, answers] of Object.entries({ ...personas, ...adversarial })) {
    const result = run(answers);
    for (const service of result.recommendation.services) {
      assert.ok(result.priorities.some((issue) => issue.service === service.id) || result.state.id === "inicio", `${name}: servicio ${service.id} sin prioridad que lo justifique`);
    }
  }
  const serviceWithoutLicense = run(adversarial.localNoReviewsGoodProcess);
  assert.ok(serviceWithoutLicense.recommendation.services.length >= 1 && serviceWithoutLicense.recommendation.license.level === "none");
  const licenseFromNeed = run({ ...personas.growingBusinessManual, capture: "sometimes" });
  assert.equal(licenseFromNeed.recommendation.license.level, "cuadra");
  assert.ok(licenseFromNeed.recommendation.services.every((service) => licenseFromNeed.priorities.some((issue) => issue.service === service.id)));
});

test("DIAG-002C: Barrio y Ciudad siguen saliendo cuando la necesidad es real, y nunca sobre dudas ni sin consultas", () => {
  assert.equal(run(personas.localBusinessLeaks).recommendation.license.level, "barrio");
  assert.equal(run(adversarial.strongExceptFollowUp).recommendation.license.level, "barrio");
  assert.equal(run(adversarial.wantsAutomationNoProcess).recommendation.license.level, "barrio");
  assert.equal(run(adversarial.soloProSophisticated).recommendation.license.level, "ciudad");
  assert.equal(run(personas.growingBusinessManual).recommendation.license.level, "ciudad");
  assert.notEqual(run({ ...adversarial.soloProSophisticated, follow_up: "manual" }).recommendation.license.level, "ciudad");
  // H responde «de memoria o en notas sueltas» al estado de oportunidades: esa sí es una brecha sustantiva de registro (Cuadra).
  assert.equal(run(adversarial.mostlyUnknown).recommendation.license.level, "cuadra");
  assert.equal(run({ ...adversarial.mostlyUnknown, pipeline: "na" }).recommendation.license.level, "none", "las dudas no deciden licencia");
  assert.equal(run({ ...personas.localBusinessLeaks, sources: ["none"] }).recommendation.license.level, "none", "sin consultas no hay nada que ordenar");
  for (const [name, answers] of Object.entries({ ...personas, ...adversarial })) {
    const result = run(answers);
    assert.ok(!/opcional|no es una necesidad urgente/i.test(result.recommendation.license.reason), `${name}: licencia presentada como opcional`);
  }
});

test("DIAG-002C: vocabulario público de addons único (IA conversacional, Automatizaciones)", async () => {
  const { addonCatalog } = await import("../../../app/features/diagnostic/index.ts");
  assert.deepEqual(Object.values(addonCatalog).map((addon) => addon.name).sort(), ["Automatizaciones", "IA conversacional", "WhatsApp"]);
  for (const answers of Object.values({ ...personas, ...adversarial })) {
    const json = JSON.stringify(run(answers));
    assert.ok(!/AI Chat|AI Conversacional|Automatización inteligente/.test(json), "nombre obsoleto en un resultado");
  }
});

test("DIAG-002C: «organización» sigue siendo perfil y deep link válidos; Home mantiene cuatro puertas", async () => {
  const { buildDiagnosticPath, parseDiagnosticEntry, profileIds } = await import("../../../app/features/diagnostic/index.ts");
  const { readFileSync } = await import("node:fs");
  assert.ok(profileIds.includes("organization"));
  assert.equal(parseDiagnosticEntry("?perfil=organization").profile, "organization");
  assert.equal(buildDiagnosticPath({ profile: "organization" }), "/diagnostico?perfil=organization");
  assert.ok(run(personas.organizationCommunity).profile === "organization");
  const home = readFileSync(new URL("../../../app/routes/home.tsx", import.meta.url), "utf8");
  const doors = [...home.matchAll(/profile: "([a-z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(doors, ["business", "professional", "project", "creator"], "Home debe exponer exactamente cuatro puertas");
});
