import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import type { CanonicalCaseV3 } from "./qbv2-candidate-case-runner";

const canonical = new Map(CANONICAL_CASES_V3.map((scenario) => [scenario.id, scenario]));
const scenario = (id: string, baseId: string, description: string, overrides: CanonicalCaseV3["answerScript"]): CanonicalCaseV3 => ({
  id,
  description,
  answerScript: { ...canonical.get(baseId)!.answerScript, ...overrides },
});

export const QA02_DIRECTED_PROFILES = [
  scenario("QA02-SALON", "C14", "Peluquería con atención en el establecimiento y citas.", {
    q2_entity: "business", q2_monetization: "services", q2_delivery: ["physical_location", "appointments"], q2_sector: "beauty_personal_care", q2_customer_buyer: "b2c", q2_local_presence_consistency: "consistent",
  }),
  scenario("QA02-RESTAURANT", "C13", "Restaurante/cafetería con consumo en el local; las respuestas describen la operación observada.", {
    q2_entity: "business", q2_monetization: "goods", q2_delivery: ["onsite"], q2_sector: "food_hospitality", q2_customer_buyer: "b2c", q2_local_presence_consistency: "consistent",
  }),
  scenario("QA02-CLINIC", "C04", "Clínica activa con pacientes y citas presenciales.", {
    q2_entity: "business", q2_monetization: "services", q2_delivery: ["physical_location", "appointments"], q2_sector: "health_wellness", q2_customer_buyer: "b2c", q2_local_presence_consistency: "consistent",
  }),
  scenario("QA02-PROFESSIONAL", "C02", "Profesional independiente activo con clientela y agenda.", {
    q2_entity: "individual", q2_other_staff: "no", q2_delivery: ["appointments"], q2_sector: "professional_services", q2_customer_buyer: "b2c",
  }),
  scenario("QA02-PRELAUNCH", "C01", "Proyecto sin lanzamiento ni clientes reales.", {
    q2_entity: "project", q2_has_customers: "no", q2_delivery: ["other"],
  }),
  scenario("QA02-HYBRID", "C13", "Comercio activo con venta presencial y tienda online.", {
    q2_entity: "business", q2_monetization: "goods", q2_delivery: ["retail", "online_checkout"], q2_sector: "retail", q2_customer_buyer: "b2c",
  }),
  scenario("QA02-HOME-SERVICE", "C06", "Servicio a domicilio: se desplaza al cliente y no recibe público en un local.", {
    q2_entity: "individual", q2_other_staff: "no", q2_delivery: ["travels"], q2_sector: "home_services", q2_customer_buyer: "b2c",
  }),
  scenario("QA02-DIGITAL-SERVICE", "C09", "Servicio digital remoto sin pago directo en línea; se declara como modalidad no listada.", {
    q2_entity: "business", q2_monetization: "services", q2_delivery: ["other"], q2_sector: "technology_software", q2_customer_buyer: "b2c",
  }),
  scenario("QA02-NONPROFIT-FUNDER", "C11", "Organización que atiende beneficiarios y recibe fondos de instituciones; la respuesta declara quién financia/compraría el servicio.", {
    q2_entity: "organization", q2_monetization: "mission", q2_delivery: ["other"], q2_sector: "community_social", q2_has_customers: "yes", q2_customer_buyer: "b2b", q2_b2b_pipeline: "unknown",
  }),
] as const;
