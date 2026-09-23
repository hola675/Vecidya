import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addonCatalog,
  getApplicableQuestions,
  goalIds,
  learnCatalog,
  PRIORITY_LIMIT,
  profileIds,
  runDiagnostic,
  serviceCatalog,
  stageIds,
  teamIds,
  type DiagnosticResult,
} from "../../../app/features/diagnostic/index.ts";
import { personas } from "./personas.ts";

const run = (answers: Record<string, string | string[]>): DiagnosticResult => {
  const result = runDiagnostic(answers);
  assert.ok(result);
  return result;
};

const ids = (issues: { id: string }[]) => issues.map((issue) => issue.id);

function assertWellFormed(result: DiagnosticResult, label: string) {
  const json = JSON.stringify(result);
  assert.ok(!json.includes("NaN") && !json.includes("undefined"), `${label}: resultado con NaN/undefined`);
  assert.ok(result.priorities.length <= PRIORITY_LIMIT, `${label}: más de ${PRIORITY_LIMIT} prioridades`);
  assert.ok(result.nextActions.length >= 1, `${label}: sin acciones`);
  assert.ok(result.strengths.length >= 1, `${label}: sin fortalezas`);
  assert.ok(result.state.because.length >= 1, `${label}: estado sin explicación`);
  for (const issue of result.priorities.concat(result.gaps)) {
    assert.ok(issue.title && issue.why && issue.action, `${label}: hallazgo ${issue.id} incompleto`);
    if (issue.service) assert.ok(issue.service in serviceCatalog, `${label}: servicio inexistente ${issue.service}`);
    if (issue.learn) assert.ok(issue.learn in learnCatalog, `${label}: artículo inexistente ${issue.learn}`);
  }
  for (const service of result.recommendation.services) assert.ok(service.id in serviceCatalog, `${label}: servicio ${service.id}`);
  for (const addon of result.recommendation.addons) assert.ok(addon.id in addonCatalog, `${label}: addon ${addon.id}`);
  for (const item of result.recommendation.learn) assert.ok(Object.values(learnCatalog).some((article) => article.slug === item.slug), `${label}: slug ${item.slug}`);
  assert.ok(["none", "cuadra", "barrio", "ciudad"].includes(result.recommendation.license.level));
  assert.ok(result.recommendation.learn.length >= 1);
  if (result.priorities.length) assert.ok(result.recommendation.services.length >= 1, `${label}: prioridades sin servicio relacionado`);
  else assert.ok(result.recommendation.services.length === 0 || result.state.id === "inicio", `${label}: servicio de relleno sin prioridades`);
}

test("escenario A — profesional con reputación pero poca descubribilidad", () => {
  const result = run(personas.professionalReputation);
  const top = ids(result.priorities);
  assert.ok(top.includes("improve_discoverability"), `prioridades: ${top}`);
  assert.ok(top.includes("capture_inquiries") || top.includes("define_contact_path"), `prioridades: ${top}`);
  assert.ok(!top.includes("automate_repetitive"));
  assert.notEqual(result.recommendation.license.level, "ciudad");
  assert.equal(result.recommendation.addons.length, 0);
  assert.ok(result.recommendation.services.some((service) => service.id === "visibilidad" || service.id === "presencia-digital"));
  assert.ok(!getApplicableQuestions(personas.professionalReputation).some((question) => question.id === "proof_business"));
});

test("escenario B — negocio local con consultas y sin seguimiento: captura antes que web", () => {
  const result = run(personas.localBusinessLeaks);
  const top = ids(result.priorities);
  assert.equal(top[0], "capture_inquiries", `prioridades: ${top}`);
  assert.ok(top.includes("structure_follow_up") || top.includes("define_contact_path"));
  assert.ok(!top.includes("build_presence"));
  assert.equal(result.state.id, "fugas");
  assert.equal(result.recommendation.license.level, "barrio");
  assert.ok(result.priorities[0].why.includes("«No; queda en el chat o en la memoria»"), "la explicación cita la respuesta");
  assert.ok(result.recommendation.learn.some((item) => item.slug === learnCatalog.crm.slug));
});

test("escenario C — negocio con proceso definido y trabajo repetitivo: automatizar y controlar", () => {
  const result = run(personas.growingBusinessManual);
  assert.equal(result.state.id, "sistema");
  assert.equal(result.recommendation.license.level, "ciudad");
  assert.equal(ids(result.priorities)[0], "automate_repetitive");
  assert.ok(result.recommendation.addons.some((addon) => addon.id === "automatizaciones"));
  assert.ok(result.recommendation.services.some((service) => service.id === "automatizacion"));
  assert.ok(result.strengths.length >= 3);
});

test("escenario D — idea sin clientes: definir y validar, ninguna licencia todavía", () => {
  const result = run(personas.ideaStage);
  assert.equal(result.state.id, "inicio");
  assert.equal(result.recommendation.license.level, "none");
  const top = ids(result.priorities);
  assert.ok(top.includes("define_offer") && top.includes("validate_offer"), `prioridades: ${top}`);
  assert.ok(!top.some((id) => ["automate_repetitive", "capture_inquiries", "track_pipeline"].includes(id)));
  assert.equal(result.recommendation.addons.length, 0);
});

test("escenario E — creador con audiencia y oferta poco clara no se evalúa como un local", () => {
  const result = run(personas.creatorAudience);
  const top = ids(result.priorities);
  assert.equal(top[0], "define_offer", `prioridades: ${top}`);
  assert.ok(!top.includes("improve_discoverability"), "la audiencia establecida no es un problema de alcance");
  assert.ok(!getApplicableQuestions(personas.creatorAudience).some((question) => question.id === "discoverability"));
  assert.ok(result.priorities.every((issue) => !issue.title.includes("zona")));
});

test("patrón generalizado: varias fuentes + sin registro + seguimiento débil + equipo = brecha comercial, no Ciudad", () => {
  const result = run(personas.multiSourceTeam);
  assert.equal(result.state.id, "fugas");
  assert.equal(result.recommendation.license.level, "barrio");
  assert.ok(result.recommendation.license.notYet?.includes("Ciudad todavía no"));
  const top = ids(result.priorities);
  assert.ok(top.includes("capture_inquiries") || top.includes("structure_follow_up") || top.includes("speed_up_response"), `prioridades: ${top}`);
  const wantsAutomation = run({ ...personas.multiSourceTeam, goal: "automate" });
  const automation = wantsAutomation.priorities.concat(wantsAutomation.gaps).find((issue) => issue.id === "automate_repetitive");
  assert.ok(automation && automation.why.includes("Antes conviene resolver"), "la automatización queda condicionada a la captura y al seguimiento");
  assert.ok(!ids(wantsAutomation.priorities).includes("automate_repetitive"), "aunque el objetivo sea automatizar, no encabeza las prioridades");
  assert.equal(wantsAutomation.recommendation.license.level, "barrio");
});

test("el tamaño del equipo es contexto: una persona sola puede necesitar Barrio y un equipo puede necesitar Cuadra", () => {
  const solo = run({ ...personas.localBusinessLeaks, team: "only_me", responsibilities: undefined as never });
  assert.equal(solo.recommendation.license.level, "barrio");

  const bigTeamNoInquiries = run({
    profile: "business",
    goal: "organize",
    stage: "occasional",
    team: "large",
    assets: ["website", "social"],
    clarity_presence: "yes",
    proof_business: ["info"],
    control: "yes",
    sources: ["none"],
    discoverability: "no",
    contact_path: "one",
    responsibilities: "yes",
    measurement: ["none"],
  });
  assert.notEqual(bigTeamNoInquiries.recommendation.license.level, "ciudad");
  assert.ok(bigTeamNoInquiries.recommendation.license.level === "cuadra" || bigTeamNoInquiries.recommendation.license.level === "none");
});

test("la incertidumbre en Google genera una comprobación, no una penalización", () => {
  const result = run(personas.organizationCommunity);
  const issues = result.priorities.concat(result.gaps);
  const check = issues.find((issue) => issue.id === "check_discoverability");
  assert.ok(check && check.tentative);
  assert.ok(!issues.some((issue) => issue.id === "improve_discoverability"));
});

test("invariantes sobre un barrido determinista de combinaciones", () => {
  let seed = 20260923;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let runs = 0;
  for (const profile of profileIds) {
    for (const stage of stageIds) {
      for (const team of teamIds) {
        for (const goal of goalIds) {
          const answers: Record<string, string | string[]> = { profile, stage, team, goal };
          for (let iteration = 0; iteration < 8; iteration += 1) {
            for (const question of getApplicableQuestions(answers)) {
              if (answers[question.id] !== undefined) continue;
              const options = question.options;
              if (question.type === "single") {
                answers[question.id] = options[Math.floor(random() * options.length)].value;
              } else {
                const picked = options.filter(() => random() < 0.4).map((option) => option.value);
                const exclusive = picked.find((value) => options.find((option) => option.value === value)?.exclusive);
                answers[question.id] = exclusive ? [exclusive] : picked.length ? picked.filter((value) => !options.find((option) => option.value === value)?.exclusive) : [options[0].value];
              }
            }
          }
          const result = run(answers);
          assertWellFormed(result, `${profile}/${stage}/${team}/${goal}`);
          assert.deepEqual(run(answers), result);
          runs += 1;
        }
      }
    }
  }
  assert.equal(runs, profileIds.length * stageIds.length * teamIds.length * goalIds.length);
});

test("una recomendación de Ciudad exige captura y seguimiento definidos", () => {
  for (const answers of Object.values(personas)) {
    const result = run(answers);
    if (result.recommendation.license.level === "ciudad") {
      assert.equal(answers.capture, "always");
      assert.equal(answers.follow_up, "system");
    }
  }
  const forced = run({ ...personas.localBusinessLeaks, goal: "automate", repetitive: "a_lot" });
  assert.notEqual(forced.recommendation.license.level, "ciudad");
});

test("el resumen de contacto no incluye respuestas crudas ni puntuaciones", async () => {
  const { buildContactMailto } = await import("../../../app/features/diagnostic/index.ts");
  const mailto = buildContactMailto(run(personas.localBusinessLeaks));
  const body = decodeURIComponent(mailto.split("body=")[1] ?? "");
  assert.ok(mailto.startsWith("mailto:hola@vecidya.com?subject="));
  assert.ok(body.includes("Estado: Operación activa con fugas"));
  assert.ok(!body.includes("assets") && !body.includes("[") && !/\d{2} de 100/.test(body));
});
