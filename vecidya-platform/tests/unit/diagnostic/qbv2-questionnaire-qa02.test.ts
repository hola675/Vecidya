import assert from "node:assert/strict";
import test from "node:test";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as bank } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as evidenceBank } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { buildCandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_ROUTE_HARD_CAP_V3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { QA02_DIRECTED_PROFILES } from "./qbv2-questionnaire-qa02-cases";

const byId = new Map(bank.map((question) => [question.id, question]));

test("DIAG-V3-QA-02: los nueve perfiles dirigidos recorren el planner candidato con respuestas declaradas", () => {
  assert.equal(bank.length, 38);
  assert.equal(evidenceBank.length, bank.length);
  const visited = new Set<string>();
  for (const profile of QA02_DIRECTED_PROFILES) {
    const route = runCanonicalRouteV3(profile);
    assert.equal(route.plan.nextQuestionId, undefined, `${profile.id}: terminación natural`);
    assert.ok(route.asked.length <= CANDIDATE_ROUTE_HARD_CAP_V3, `${profile.id}: límite máximo conservado`);
    assert.equal(route.plan.completion.hardCapReached, false, `${profile.id}: no alcanza el límite`);
    assert.equal(route.plan.evidenceSufficiency.terminalReason, "no_useful_questions", `${profile.id}: finaliza por evidencia suficiente`);
    assert.equal(route.finalAnswers.q2_entity, profile.answerScript.q2_entity);
    assert.equal(route.finalAnswers.q2_delivery, profile.answerScript.q2_delivery);
    for (const item of route.asked) visited.add(item.id);
    const outcome = buildCandidateCommercialBoundaryV3({ answers: route.finalAnswers });
    assert.ok(outcome.scoring.dimensions.every((dimension) => dimension.score === null || (dimension.score >= 0 && dimension.score <= 100)));
    assert.ok(outcome.commercial.licenseFit.recommendedLicense !== undefined);
  }
  assert.ok(visited.has("q2_customer_buyer"));
  assert.equal(byId.get("q2_customer_buyer")?.options.length, 3, "la respuesta actual no separa beneficiario, comprador y financiador");
});
test("DIAG-V3-QA-02: se conservan exclusividad y contratos de modalidades, y se registran sus límites", () => {
  const delivery = byId.get("q2_delivery")!;
  assert.equal(delivery.type, "multi");
  assert.deepEqual(delivery.options.filter((option) => option.exclusive).map((option) => option.value), ["other", "unsure"]);
  assert.deepEqual(delivery.options.map((option) => option.value), ["physical_location", "appointments", "travels", "online_checkout", "retail", "onsite", "other", "unsure"]);

  const nonprofit = runCanonicalRouteV3(QA02_DIRECTED_PROFILES.find(({ id }) => id === "QA02-NONPROFIT-FUNDER")!);
  assert.equal(nonprofit.finalAnswers.q2_customer_buyer, "b2b");
  assert.ok(nonprofit.asked.some(({ id }) => id === "q2_b2b_pipeline"), "el financiador institucional puede abrir la ruta de seguimiento B2B");
  assert.equal(nonprofit.finalAnswers.q2_has_customers, "yes", "la actividad de beneficiarios permanece separada de comprador/financiador");
  assert.ok(!delivery.options.some(({ label }) => /servicio remoto|atención a distancia|en línea sin compra/i.test(label)), "no existe una opción específica para prestar servicios remotos sin checkout");
  assert.ok(delivery.options.find(({ value }) => value === "other")?.exclusive, "una modalidad no listada no puede combinarse con una conocida");
});

test("DIAG-V3-QA-02: el copy refinado conserva valores, señales, aplicabilidad y metadatos de evidencia", () => {
  const pending = evidenceBank.filter((question) => question.evidenceMigration === "pending");
  assert.equal(pending.length, 17);
  for (const question of pending) assert.equal(question.evidenceV3, undefined, `${question.id}: pending remains non-scoring`);
  for (const id of ["q2_capacity_signal", "q2_b2b_pipeline", "q2_appointments_lead_to_booking", "q2_appointments_rebooking"]) {
    const question = byId.get(id)!;
    const evidence = evidenceBank.find((item) => item.id === id)!;
    assert.deepEqual(question.options.map(({ value, kind, exclusive, produces }) => ({ value, kind, exclusive, produces })),
      evidence.options.map(({ value, kind, exclusive, produces }) => ({ value, kind, exclusive, produces })), id);
    assert.equal(question.type, evidence.type, id);
    assert.deepEqual(question.appliesWhen, evidence.appliesWhen, id);
    assert.deepEqual(question.materialAppliesWhen, evidence.materialAppliesWhen, id);
    assert.ok(["pending", "migrated"].includes(evidence.evidenceMigration!), id);
    if (evidence.evidenceMigration === "migrated") assert.equal(evidence.evidenceV3?.questionVersion, question.version, id);
    else assert.equal(evidence.evidenceV3, undefined, id);
  }
  assert.match(byId.get("q2_capacity_signal")!.options[0]!.label, /A veces hay/);
  assert.match(byId.get("q2_b2b_pipeline")!.hint!, /una herramienta/);
  assert.ok(byId.get("q2_appointments_lead_to_booking")!.hint);
  assert.ok(byId.get("q2_appointments_rebooking")!.hint);
});
